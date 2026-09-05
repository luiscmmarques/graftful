import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Cache headers, checked against the routes that actually exist.
 *
 * Every route is prerendered as its own HTML shell, and each shell references asset filenames
 * containing a content hash. A document served from cache after a deploy therefore does not
 * merely show old content — it asks for files that no longer exist, and the app fails to
 * start. The failure lands on returning visitors only, which is exactly the group least
 * likely to report it and most likely to be relying on the app.
 *
 * `static/_headers` is a static file, so it cannot enumerate routes for itself. This test
 * closes that gap: add a route without a cache rule and it fails by name.
 */

const HEADERS = readFileSync('static/_headers', 'utf8');

/*
 * Comments stripped before anything is asserted. The file explains in prose why `no-store`
 * must not be used, so a naive search for the string finds the warning against it and fails —
 * which is what happened the first time this ran.
 */
const DIRECTIVES = HEADERS.split('\n')
	.filter((line) => !line.trim().startsWith('#'))
	.join('\n');

/** Route paths derived from the filesystem, the same way SvelteKit derives them. */
function routes(dir = 'src/routes', prefix = ''): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (entry === '+page.svelte') found.push(prefix || '/');
		else if (statSync(full).isDirectory() && !entry.startsWith('_')) {
			found.push(...routes(full, `${prefix}/${entry}`));
		}
	}
	return found;
}

/** The rule bodies that apply to a given path, in file order. */
function rulesFor(path: string): string[] {
	const blocks = DIRECTIVES.split(/\n(?=\S)/).filter((b) => b.trim().startsWith('/'));
	return blocks
		.filter((block) => {
			const pattern = block.split('\n')[0].trim();
			if (pattern.endsWith('/*')) return path.startsWith(pattern.slice(0, -1));
			return pattern === path;
		})
		.map((block) => block.toLowerCase());
}

test('every route has a rule that stops its shell being served stale', () => {
	for (const route of routes()) {
		const applying = rulesFor(route);
		assert.ok(
			applying.some((rule) => rule.includes('cache-control: no-cache')),
			`${route} has no no-cache rule in static/_headers. Its prerendered shell references ` +
				'hashed asset filenames, so a cached copy breaks the app after the next deploy.'
		);
	}
});

test('the document is never served no-store, which would disqualify it from bfcache', () => {
	/*
	 * `no-store` looks like the safer choice and is not. It removes the page from the
	 * back/forward cache in Chrome, and the symptom is invisible: back navigation is merely
	 * slow, with nothing logged. `no-cache` revalidates while staying eligible.
	 */
	assert.ok(
		!DIRECTIVES.toLowerCase().includes('no-store'),
		'static/_headers must not use no-store anywhere: it silently disables bfcache.'
	);
});

test('hashed assets are cached hard, and the service worker is not', () => {
	const immutable = rulesFor('/_app/immutable/anything.js').join(' ');
	assert.ok(
		immutable.includes('immutable') && immutable.includes('max-age=31536000'),
		'hashed assets should be immutable for a year, or every deploy refetches the whole app'
	);

	const worker = rulesFor('/service-worker.js').join(' ');
	assert.ok(
		worker.includes('cache-control: no-cache'),
		'the service worker must revalidate, or a new version can never take over'
	);
});

/**
 * The adapter's fallback document, read from the Vite config rather than hardcoded.
 *
 * It is served by Cloudflare for every path the app does not have, so it needs the same cache
 * rule as any other document — but it is not a route, so `routes()` above cannot see it.
 * Reading the filename from the config means renaming the fallback forces `_headers` to be
 * updated too, instead of quietly leaving the busiest document on the host unruled.
 */
function fallbackDocument(): string | null {
	const config = readFileSync('vite.config.ts', 'utf8');
	/*
	 * Matched inside the `adapter(...)` call, not anywhere the string appears. The first
	 * version of this read `/fallback:\s*'([^']+)'/` and matched the comment above that call,
	 * which names `index.html` as the wrong choice — so the guard checked the wrong document,
	 * found the rule that `/index.html` already has, and passed while `/404.html` had none.
	 */
	const match = config.match(/adapter\(\{[^}]*fallback:\s*'([^']+)'/);
	return match ? `/${match[1]}` : null;
}

test('the fallback document has a rule too, even though it is not a route', () => {
	const fallback = fallbackDocument();
	assert.ok(fallback, 'no adapter fallback found in vite.config.ts');
	assert.ok(
		rulesFor(fallback).some((rule) => rule.includes('cache-control: no-cache')),
		`${fallback} has no no-cache rule in static/_headers. Cloudflare serves it for every ` +
			'unmatched path, so a stale copy is the first thing a mistyped link shows.'
	);
});

test('every document is served no-transform, so nothing can be injected into it', () => {
	/*
	 * Not a cache concern. Cloudflare's JavaScript Detections rewrites HTML responses to add an
	 * inline script, which this app's Content-Security-Policy then blocks — the app still works
	 * but logs a violation on every page load, and a fingerprinting bootstrap is shipped into a
	 * medication app that promises nothing leaves the device. Cloudflare documents no way to
	 * disable it on this plan; `no-transform` is the documented way to opt out of the rewrite.
	 * Drop the directive and the injection silently returns. See DECISIONS.md.
	 */
	const documents = [...routes(), fallbackDocument()].filter((d): d is string => Boolean(d));
	for (const document of documents) {
		const applying = rulesFor(document);
		assert.ok(
			applying.some((rule) => rule.includes('no-transform')),
			`${document} is not served no-transform, so Cloudflare will inject a script into it ` +
				'that the Content-Security-Policy blocks on every page load.'
		);
		/*
		 * `no-transform` is inherited from the `/*` rule, because unmatched paths cannot be
		 * enumerated and only the wildcard reaches them. Cloudflare joins repeated values rather
		 * than overriding, so any rule that sets its own Cache-Control must detach first — and a
		 * detach on a document would take the inherited `no-transform` with it.
		 */
		assert.ok(
			!applying.some((rule) => rule.includes('! cache-control')),
			`${document} detaches Cache-Control, which discards the inherited no-transform and ` +
				'lets Cloudflare inject a script into the document again.'
		);
	}
});
