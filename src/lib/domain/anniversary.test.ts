import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
	daysSinceTransplant,
	elapsedSince,
	nextAnniversary,
	upcomingMilestones
} from './anniversary.ts';
import { TRANSPLANT_DATE } from './seed.ts';

test('day count is exact across leap years', () => {
	// 2016 and 2020 are leap years, so a naive 365-day year would drift by two.
	assert.equal(daysSinceTransplant(TRANSPLANT_DATE, '2026-01-11'), 3653);
});

test('day count is zero on the day itself', () => {
	assert.equal(daysSinceTransplant(TRANSPLANT_DATE, TRANSPLANT_DATE), 0);
});

test('elapsed time is broken down as a calendar reads it', () => {
	const { calendar } = elapsedSince(TRANSPLANT_DATE, '2026-08-30');
	assert.deepEqual(calendar, { years: 10, months: 7, days: 19 });
});

test('a borrowed day rolls the month back correctly', () => {
	// 31 January to 1 March: not "one month and one day".
	const { calendar } = elapsedSince('2026-01-31', '2026-03-01');
	assert.deepEqual(calendar, { years: 0, months: 1, days: 1 });
});

test('the anniversary on the day itself is today, not next year', () => {
	const result = nextAnniversary(TRANSPLANT_DATE, '2026-01-11');
	assert.deepEqual(result, { on: '2026-01-11', years: 10 });
});

test('once past, the anniversary rolls to the following year', () => {
	const result = nextAnniversary(TRANSPLANT_DATE, '2026-01-12');
	assert.deepEqual(result, { on: '2027-01-11', years: 11 });
});

test('a 29 February date clamps to 28 February in a non-leap year', () => {
	// Rather than silently becoming 1 March.
	assert.deepEqual(nextAnniversary('2016-02-29', '2026-02-01'), {
		on: '2026-02-28',
		years: 10
	});
	assert.deepEqual(nextAnniversary('2016-02-29', '2028-02-01'), {
		on: '2028-02-29',
		years: 12
	});
});

test('an approaching anniversary is surfaced with days to go', () => {
	const found = upcomingMilestones(TRANSPLANT_DATE, '2026-12-28', 30);
	const anniversary = found.find((m) => m.kind === 'anniversary');
	assert.ok(anniversary);
	assert.equal(anniversary.value, 11);
	assert.equal(anniversary.on, '2027-01-11');
	assert.equal(anniversary.daysUntil, 14);
});

test('a distant anniversary is not surfaced', () => {
	assert.deepEqual(upcomingMilestones(TRANSPLANT_DATE, '2026-06-01', 30), []);
});

test('round day counts are surfaced as their own milestone', () => {
	// Day 4000 falls on 24 December 2026, with the 11th anniversary just after.
	const found = upcomingMilestones(TRANSPLANT_DATE, '2026-12-20', 30);
	const kinds = found.map((m) => `${m.kind}:${m.value}`);
	assert.deepEqual(kinds, ['days:4000', 'anniversary:11']);

	assert.equal(found[0].on, '2026-12-24');
	assert.equal(found[0].daysUntil, 4);
});
