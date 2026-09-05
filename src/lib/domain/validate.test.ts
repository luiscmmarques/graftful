import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
	LIMITS,
	normaliseDate,
	normaliseNumber,
	normaliseTime,
	parseTimeList
} from './validate.ts';

test('times are normalised to HH:MM the way people type them', () => {
	assert.equal(normaliseTime('7:30'), '07:30');
	assert.equal(normaliseTime(' 07:30 '), '07:30');
	assert.equal(normaliseTime('00:00'), '00:00');
	assert.equal(normaliseTime('23:59'), '23:59');
});

test('out-of-range times are rejected, not merely pattern-matched', () => {
	// The reason this function exists rather than a regex: these all match \d{1,2}:\d{2}.
	assert.equal(normaliseTime('25:00'), null);
	assert.equal(normaliseTime('99:99'), null);
	assert.equal(normaliseTime('12:60'), null);
	// A bad time emits a DTSTART no calendar can parse, so reminders silently never fire.
	assert.equal(normaliseTime('abc'), null);
	assert.equal(normaliseTime('7h30'), null);
	assert.equal(normaliseTime(''), null);
	assert.equal(normaliseTime('7:3'), null);
});

test('a time list reports what it could not parse instead of dropping it', () => {
	const result = parseTimeList('7:30, 19:30, abc, 25:00');

	assert.deepEqual(result.times, ['07:30', '19:30']);
	// Silently discarding these would leave someone believing they had set a reminder.
	assert.deepEqual(result.invalid, ['abc', '25:00']);
});

test('a time list is sorted and de-duplicated', () => {
	const result = parseTimeList('19:30, 07:30, 7:30');

	assert.deepEqual(result.times, ['07:30', '19:30']);
	assert.deepEqual(result.invalid, []);
});

test('dates that do not exist are rejected', () => {
	assert.equal(normaliseDate('2026-01-11'), '2026-01-11');
	// 2026 is not a leap year, and this would otherwise behave as 1 March — quietly
	// shifting a transplant anniversary or the day a dose starts.
	assert.equal(normaliseDate('2026-02-29'), null);
	assert.equal(normaliseDate('2026-02-30'), null);
	assert.equal(normaliseDate('2026-13-01'), null);
	assert.equal(normaliseDate('11-01-2026'), null);
	assert.equal(normaliseDate(''), null);
	// A real leap day still passes.
	assert.equal(normaliseDate('2024-02-29'), '2024-02-29');
});

test('empty input is null rather than zero', () => {
	// Coercing '' to 0 is how a blank box size becomes a division by zero.
	assert.equal(normaliseNumber(''), null);
	assert.equal(normaliseNumber(null), null);
	assert.equal(normaliseNumber(undefined), null);
	assert.equal(normaliseNumber('abc'), null);
	assert.equal(normaliseNumber('Infinity'), null);
});

test('bounds and integer rules are enforced', () => {
	assert.equal(normaliseNumber('50', LIMITS.packageSize), 50);
	assert.equal(normaliseNumber('0', LIMITS.packageSize), null, 'zero would divide by zero');
	assert.equal(normaliseNumber('-5', LIMITS.packageSize), null);
	assert.equal(normaliseNumber('1.5', LIMITS.packageSize), null, 'half a box is not a thing');

	// Fractional pill counts are real — half and quarter tablets both exist.
	assert.equal(normaliseNumber('0.5', LIMITS.units), 0.5);
	assert.equal(normaliseNumber('0', LIMITS.units), null, 'a dose of nothing is not a dose');

	// A floor of zero is meaningful: tell me when it actually runs out.
	assert.equal(normaliseNumber('0', LIMITS.minDays), 0);
	// A horizon of zero could never produce an order at all.
	assert.equal(normaliseNumber('0', LIMITS.horizonDays), null);
});

test('a slipped decimal point is caught', () => {
	// The maxima are sanity limits for typos, not clinical judgements.
	assert.equal(normaliseNumber('5', LIMITS.strength), 5);
	assert.equal(normaliseNumber('500000', LIMITS.strength), null);
	assert.equal(normaliseNumber('0764561234', LIMITS.packages), null, 'a pasted phone number');
});
