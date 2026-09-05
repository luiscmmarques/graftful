/**
 * Input validation for the values the rest of the domain trusts.
 *
 * These are not cosmetic form checks. Several fields feed arithmetic that decides when
 * somebody is told to reorder medication, and a bad value does not fail loudly — it
 * produces a plausible-looking wrong answer:
 *
 *   - A box size of zero divides by zero and yields `Infinity` boxes to order.
 *   - A dose time of "25:00" or "abc" sorts unpredictably on the Today screen and emits a
 *     `DTSTART` no calendar can parse, so reminders silently never fire.
 *   - A negative strength inverts the derived milligrams, and the dose consistency check
 *     then confirms a total that is wrong.
 *   - A horizon of zero means no order is ever suggested.
 *
 * So validation lives here, next to the code that relies on it, and is tested. Every
 * function returns a normalised value or `null` — never a coerced fallback, because
 * quietly substituting a default is how a typo becomes a wrong dose on screen.
 */

/**
 * A time as `HH:MM`, or null.
 *
 * Accepts `7:30` and normalises it to `07:30`, because that is how people type. Rejects
 * out-of-range values that a regex alone would let through — `99:99` matches
 * `\d{2}:\d{2}` perfectly well.
 */
export function normaliseTime(value: string): string | null {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return null;

	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (hours > 23 || minutes > 59) return null;

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Parse a comma-separated list of times.
 *
 * Reports what failed rather than dropping it. Silently discarding an unparsable time
 * would leave someone believing they had set a reminder they had not.
 */
export function parseTimeList(value: string): { times: string[]; invalid: string[] } {
	const times: string[] = [];
	const invalid: string[] = [];

	for (const part of value.split(',')) {
		const trimmed = part.trim();
		if (trimmed === '') continue;

		const time = normaliseTime(trimmed);
		if (time === null) invalid.push(trimmed);
		else if (!times.includes(time)) times.push(time);
	}

	return { times: times.sort(), invalid };
}

/**
 * A calendar date as `YYYY-MM-DD`, or null.
 *
 * Checks the date exists rather than only that it looks like one: `2026-02-30` passes any
 * reasonable pattern and then behaves as 2 March, which would quietly shift a transplant
 * anniversary or the start of a dose.
 */
export function normaliseDate(value: string): string | null {
	const trimmed = value.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

	const date = new Date(`${trimmed}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	// Round-trip: a rolled-over date will not match what was typed.
	return date.toISOString().slice(0, 10) === trimmed ? trimmed : null;
}

export interface NumberRules {
	min?: number;
	max?: number;
	/** Reject fractions. Box sizes and day counts are whole; pill counts are not. */
	integer?: boolean;
}

/** A finite number within bounds, or null. Empty input is null, never zero. */
export function normaliseNumber(value: unknown, rules: NumberRules = {}): number | null {
	if (value === '' || value === null || value === undefined) return null;

	const parsed = typeof value === 'number' ? value : Number(String(value).trim());
	if (!Number.isFinite(parsed)) return null;
	if (rules.integer && !Number.isInteger(parsed)) return null;
	if (rules.min !== undefined && parsed < rules.min) return null;
	if (rules.max !== undefined && parsed > rules.max) return null;

	return parsed;
}

/**
 * Bounds for the fields that reach the domain.
 *
 * The maxima are sanity limits rather than clinical ones — they exist to catch a slipped
 * decimal point or a pasted phone number, not to express what a plausible dose is. That
 * judgement is not this app's to make.
 */
export const LIMITS = {
	/** A pill count for one product at one time. Quarter tablets exist. */
	units: { min: 0.01, max: 100 } as NumberRules,
	/** Strength as printed on the box. */
	strength: { min: 0.001, max: 100_000 } as NumberRules,
	/** Units per box, as dispensed. */
	packageSize: { min: 1, max: 10_000, integer: true } as NumberRules,
	/** Reorder floor in days. Zero is allowed: it means "tell me when it runs out". */
	minDays: { min: 0, max: 365, integer: true } as NumberRules,
	/** Order-up-to horizon. Below a day, no order could ever be produced. */
	horizonDays: { min: 1, max: 730, integer: true } as NumberRules,
	/** A counted quantity of units in a box. */
	stockUnits: { min: 0, max: 100_000 } as NumberRules,
	/** Whole boxes on one order line. */
	packages: { min: 1, max: 1000, integer: true } as NumberRules
} as const;
