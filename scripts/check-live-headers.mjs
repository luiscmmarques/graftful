#!/usr/bin/env node
/**
 * What the live domain actually sends.
 *
 * `src/lib/headers.test.ts` checks `static/_headers`, which is the right place for it and
 * cannot see the thing that went wrong here: Cloudflare's "Add security headers" managed
 * transform is enabled on the zone, and it overrides `X-Frame-Options` and `Referrer-Policy`
 * however that file is written. The repository asserted `DENY` for months while production
 * answered `SAMEORIGIN`. No test could have caught it, because the difference exists only in a
 * dashboard.
 *
 * So this checks the response rather than the file. It runs on a schedule rather than in the
 * ordinary gate, because production lags a push and a check that fails for two minutes after
 * every deploy would be ignored within a week.
 *
 * It asserts security *properties*, not exact strings, wherever Cloudflare controls the value —
 * `SAMEORIGIN` and `DENY` both prevent cross-origin framing, and `same-origin` is stricter than
 * the policy the file requests. Pinning the literal would either fail today or enshrine
 * whatever the dashboard happens to do. What it will not tolerate is a value that weakens a
 * protection the app depends on.
 *
 * Run it against production with `node scripts/check-live-headers.mjs`, or against anything
 * else by passing an origin.
 */

import { readFileSync } from 'node:fs';

/** The canonical origin, read from the module that owns it rather than repeated here. */
function appOrigin() {
	const source = readFileSync('src/lib/domain/app-info.ts', 'utf8');
	const found = source.match(/APP_ORIGIN\s*=\s*'([^']+)'/);
	if (!found) {
		console.error(
			'check-live-headers: could not read APP_ORIGIN from src/lib/domain/app-info.ts. If it ' +
				'was renamed, update this script — do not delete the check.'
		);
		process.exit(1);
	}
	return found[1];
}

const origin = process.argv[2] ?? appOrigin();
const failures = [];
const notes = [];

function fail(message) {
	failures.push(message);
}

/*
 * Referrer values that do not leak a URL to another origin. A Graftful URL is not sensitive
 * today — no regimen is ever in a path — but the header is cheap insurance against a future
 * route that carries something, and `unsafe-url` would send the full URL to every origin.
 */
const SAFE_REFERRER = new Set([
	'no-referrer',
	'same-origin',
	'strict-origin',
	'strict-origin-when-cross-origin',
	'no-referrer-when-downgrade'
]);

async function head(path) {
	const response = await fetch(`${origin}${path}`, { redirect: 'follow' });
	// Body drained so the socket closes; only the headers are of interest.
	await response.arrayBuffer();
	return response;
}

async function checkDocument() {
	const response = await head('/');
	if (!response.ok) {
		fail(`GET / returned ${response.status}`);
		return;
	}
	const header = (name) => response.headers.get(name) ?? '';

	const hsts = header('strict-transport-security');
	const maxAge = Number(hsts.match(/max-age=(\d+)/)?.[1] ?? 0);
	if (maxAge < 31_536_000) {
		fail(`Strict-Transport-Security max-age is ${maxAge}, under a year: "${hsts}"`);
	}

	const csp = header('content-security-policy');
	if (!/frame-ancestors\s+'none'/.test(csp)) {
		fail(
			`Content-Security-Policy does not carry frame-ancestors 'none': "${csp}". That is what ` +
				'actually blocks framing — X-Frame-Options is only the fallback.'
		);
	}

	/*
	 * Tolerant on purpose: the managed transform substitutes SAMEORIGIN. Both refuse a
	 * cross-origin frame, and ALLOWALL or a missing value would not.
	 */
	const frameOptions = header('x-frame-options').toUpperCase();
	if (frameOptions && !['DENY', 'SAMEORIGIN'].includes(frameOptions)) {
		fail(`X-Frame-Options is "${frameOptions}", which permits cross-origin framing.`);
	}
	if (frameOptions === 'SAMEORIGIN') {
		notes.push(
			'X-Frame-Options is SAMEORIGIN, not the DENY that static/_headers asks for — ' +
				"Cloudflare's managed transform is still overriding it. Framing is blocked by CSP " +
				'regardless. Recorded in static/_headers.'
		);
	}

	const referrer = header('referrer-policy').toLowerCase();
	if (!SAFE_REFERRER.has(referrer)) {
		fail(`Referrer-Policy is "${referrer}", which is missing or leaks URLs cross-origin.`);
	}

	if (header('x-content-type-options').toLowerCase() !== 'nosniff') {
		fail(`X-Content-Type-Options is "${header('x-content-type-options')}", expected nosniff.`);
	}

	const permissions = header('permissions-policy');
	for (const capability of ['camera', 'microphone', 'geolocation', 'browsing-topics']) {
		if (!new RegExp(`${capability}\\s*=\\s*\\(\\s*\\)`).test(permissions)) {
			fail(`Permissions-Policy does not refuse ${capability}: "${permissions}"`);
		}
	}
	/*
	 * The trap from src/lib/headers.test.ts, re-checked against the response. Refusing this
	 * silently breaks the copy button that puts the pharmacy order on the clipboard.
	 */
	if (/clipboard-write\s*=\s*\(\s*\)/.test(permissions)) {
		fail('Permissions-Policy refuses clipboard-write, which breaks the Order screen copy button.');
	}

	if (header('cross-origin-opener-policy').toLowerCase() !== 'same-origin') {
		fail(
			`Cross-Origin-Opener-Policy is "${header('cross-origin-opener-policy')}", ` +
				'expected same-origin.'
		);
	}

	/*
	 * The bfcache invariant, which is the one a dashboard change is most likely to break by
	 * accident: `no-store` looks safer, disqualifies the page from the back/forward cache, and
	 * reports nothing anywhere. See src/lib/lifecycle.ts.
	 */
	const cacheControl = header('cache-control').toLowerCase();
	if (cacheControl.includes('no-store')) {
		fail(
			`the document is served "${cacheControl}". no-store silently disqualifies it from ` +
				'bfcache, making back navigation slow with nothing logged.'
		);
	}
	if (!cacheControl.includes('no-cache')) {
		fail(
			`the document is served "${cacheControl}", without no-cache. Its shell references ` +
				'hashed filenames, so a cached copy breaks the app after the next deploy.'
		);
	}
	if (!cacheControl.includes('no-transform')) {
		fail(
			`the document is served "${cacheControl}", without no-transform, so Cloudflare may ` +
				'inject a script the Content-Security-Policy then blocks on every page load.'
		);
	}
}

async function checkSecurityTxt() {
	const response = await head('/.well-known/security.txt');
	if (!response.ok) {
		fail(`GET /.well-known/security.txt returned ${response.status}`);
		return;
	}
	const type = response.headers.get('content-type') ?? '';
	if (!type.toLowerCase().startsWith('text/plain')) {
		fail(`security.txt is served as "${type}", but RFC 9116 requires text/plain.`);
	}
	const body = await (await fetch(`${origin}/.well-known/security.txt`)).text();
	const expires = body.match(/^Expires:\s*(.+)$/im)?.[1]?.trim();
	if (!expires) {
		fail('the deployed security.txt has no Expires field, which RFC 9116 requires.');
		return;
	}
	const daysLeft = Math.floor((new Date(expires).getTime() - Date.now()) / 86_400_000);
	if (daysLeft <= 0) {
		fail(
			`the deployed security.txt expired on ${expires}; researchers' tooling reads it as stale.`
		);
	} else if (daysLeft <= 30) {
		notes.push(`the deployed security.txt expires in ${daysLeft} days, on ${expires}.`);
	}
}

async function checkProbePathIsNotFound() {
	/*
	 * A scanner probing for /.env reads 200 as confirmation the file exists, and every probe
	 * would count as a page view in Cloudflare's analytics. This is what the 404.html fallback
	 * is for — see the adapter note in vite.config.ts — and a fallback misconfigured back to
	 * index.html would return 200 here while looking perfectly healthy.
	 */
	const response = await head('/.env');
	if (response.status !== 404) {
		fail(
			`GET /.env returned ${response.status}, not 404. The adapter fallback must be 404.html, ` +
				'or every scanner probe reads as a hit and pollutes the traffic figures.'
		);
	}
}

await Promise.all([checkDocument(), checkSecurityTxt(), checkProbePathIsNotFound()]);

for (const note of notes) console.log(`check-live-headers: note — ${note}`);

if (failures.length > 0) {
	console.error(`\ncheck-live-headers: ${origin} has ${failures.length} problem(s):`);
	for (const failure of failures) console.error(`  - ${failure}`);
	process.exit(1);
}

console.log(`check-live-headers: ${origin} sends every header the app depends on.`);
