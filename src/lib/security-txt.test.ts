import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { APP_ORIGIN } from './domain/app-info.ts';

/**
 * `security.txt`, checked against RFC 9116 and against the calendar.
 *
 * The file tells a security researcher where to send a vulnerability report. Its failure mode
 * is not a broken page but a report that never arrives: `Expires` is mandatory, and a file
 * past that date is defined as stale, which is what a researcher's tooling reports rather than
 * the address inside it. Nothing about the site looks wrong when that happens, and the only
 * person who finds out is somebody who decided not to tell us about a hole.
 *
 * So the date is watched here. This is the one guard in the repository that fails because time
 * passed rather than because someone changed a file — which is the point, since renewing it is
 * a task no commit will ever prompt.
 */

const SECURITY_TXT = readFileSync('static/.well-known/security.txt', 'utf8');

/** Field lookup, case-insensitive on the name as RFC 9116 requires. */
function field(name: string): string | null {
	const found = SECURITY_TXT.split('\n')
		.map((line) => line.trim())
		.filter((line) => !line.startsWith('#'))
		.find((line) => line.toLowerCase().startsWith(`${name.toLowerCase()}:`));
	return found ? found.slice(found.indexOf(':') + 1).trim() : null;
}

/*
 * How much warning is useful. Long enough that renewing is never urgent, short enough that a
 * quiet repository still gets told before researchers see a stale file. `npm test` runs on
 * every push and on every pull request, so this surfaces as an ordinary red build.
 */
const RENEW_WITHIN_DAYS = 30;

test('security.txt carries the two fields RFC 9116 makes mandatory', () => {
	assert.ok(
		field('Contact'),
		'security.txt has no Contact field, which is the one thing the file exists to carry.'
	);
	assert.ok(
		field('Expires'),
		'security.txt has no Expires field. RFC 9116 requires it, and tooling treats a file ' +
			'without one as invalid.'
	);
});

test('security.txt has not expired, and is not about to', () => {
	const expires = field('Expires');
	assert.ok(expires, 'no Expires field');

	const when = new Date(expires);
	assert.ok(
		!Number.isNaN(when.getTime()),
		`Expires is not a date RFC 3339 would accept: ${expires}`
	);

	const daysLeft = Math.floor((when.getTime() - Date.now()) / 86_400_000);
	assert.ok(
		daysLeft > RENEW_WITHIN_DAYS,
		`security.txt expires in ${daysLeft} day(s), on ${expires}. Past that date the file is ` +
			'stale and a researcher\u2019s tooling reports it as invalid rather than showing the ' +
			'contact address. Move Expires forward — under a year out, as RFC 9116 asks.'
	);
});

test('the Expires date stays inside the year RFC 9116 allows', () => {
	/*
	 * The other direction, and the tempting way to silence the test above: a date far in the
	 * future removes the reminder and makes the file non-conforming, because the whole purpose
	 * of the field is a promise that somebody still reads the mailbox.
	 */
	const expires = field('Expires');
	assert.ok(expires, 'no Expires field');
	const daysLeft = Math.floor((new Date(expires).getTime() - Date.now()) / 86_400_000);
	assert.ok(
		daysLeft <= 366,
		`security.txt expires in ${daysLeft} days. RFC 9116 asks for less than a year, because ` +
			'the date is a claim that the contact address is still watched.'
	);
});

test('security.txt points at this origin, over https', () => {
	/*
	 * `Canonical` is what stops the file being taken at face value after being copied to
	 * another host — a researcher can check that the file claims the domain they found it on.
	 */
	const canonical = field('Canonical');
	assert.equal(
		canonical,
		`${APP_ORIGIN}/.well-known/security.txt`,
		'Canonical must name this origin, or the file cannot be told apart from a copy ' +
			'republished elsewhere.'
	);

	const contact = field('Contact');
	assert.ok(
		contact?.startsWith('mailto:') || contact?.startsWith('https://'),
		`Contact must be a mailto: or https: URI, not ${contact}. A bare address is not a URI ` +
			'and parsers reject it.'
	);

	for (const name of ['Policy', 'Canonical']) {
		const value = field(name);
		if (value) {
			assert.ok(
				value.startsWith('https://'),
				`${name} must be https, not ${value}. RFC 9116 requires it for every web URI.`
			);
		}
	}
});
