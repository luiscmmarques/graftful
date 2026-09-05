import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { msUntilNextLocalMidnight } from './lifecycle.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

test('the midnight timer is always in the future and never more than a day away', () => {
	// Including the awkward ones: a second before midnight, and midnight exactly.
	for (const iso of [
		'2026-03-31T00:00:00',
		'2026-03-31T23:59:59',
		'2026-03-31T12:00:00',
		'2026-12-31T23:59:59'
	]) {
		const ms = msUntilNextLocalMidnight(new Date(iso));
		assert.ok(ms > 0, `${iso} produced a non-positive delay of ${ms}`);
		// 25 hours, because a local day can be longer than 24 across a DST change.
		assert.ok(ms <= 25 * 60 * 60 * 1000, `${iso} produced an implausible delay of ${ms}`);
	}
});

test('midnight exactly schedules a full day ahead, not zero', () => {
	// A zero delay would spin the timer: fire, recompute the same instant, fire again.
	const ms = msUntilNextLocalMidnight(new Date('2026-06-15T00:00:00'));
	assert.ok(ms > DAY_MS - 1000, `expected roughly a full day, got ${ms}`);
});

test('the delay lands on the following local midnight', () => {
	const now = new Date('2026-06-15T14:30:00');
	const landed = new Date(now.getTime() + msUntilNextLocalMidnight(now));

	assert.equal(landed.getHours(), 0);
	assert.equal(landed.getMinutes(), 0);
	assert.equal(landed.getDate(), 16);
});

/*
 * An architectural constraint, enforced rather than documented.
 *
 * An `unload` listener disqualifies a page from the back/forward cache outright, and
 * `beforeunload` does the same in Firefox. Nothing warns you: back navigation just
 * stops being instant. The obvious future feature that would introduce one is
 * "warn about unsaved changes", so this test exists to fail at that moment and point
 * at the reason.
 */
function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(ts|svelte|js)$/.test(entry) ? [path] : [];
	});
}

test('nothing registers an unload or beforeunload listener', () => {
	const offenders = sourceFiles('src')
		.filter((path) => !path.endsWith('lifecycle.test.ts') && !path.endsWith('lifecycle.ts'))
		.filter((path) => /['"](before)?unload['"]|onbeforeunload/.test(readFileSync(path, 'utf8')));

	assert.deepEqual(
		offenders,
		[],
		'These files would disqualify the app from bfcache. Use pagehide or ' +
			'visibilitychange for teardown instead — see src/lib/lifecycle.ts.'
	);
});
