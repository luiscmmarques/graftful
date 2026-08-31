/**
 * Time since transplant.
 *
 * Derived from a single date, so it costs nothing and works entirely offline.
 * Yearly anniversaries are the "birthday" of the graft; round day counts are a
 * secondary milestone people tend to mark.
 */

import { daysBetween, toIsoDate, toUtcDate } from './dates.ts';

export interface Elapsed {
	days: number;
	calendar: { years: number; months: number; days: number };
}

export interface Milestone {
	kind: 'anniversary' | 'days';
	/** Years for an anniversary, day count for a day milestone. */
	value: number;
	on: string;
	daysUntil: number;
}

/** Round day counts worth marking. Yearly anniversaries are handled separately. */
const DAY_MILESTONES = [100, 500, 1000, 2000, 3000, 4000, 5000, 7500, 10_000];

export function daysSinceTransplant(transplantDate: string, asOf: string): number {
	return daysBetween(transplantDate, asOf);
}

/**
 * Add whole months, clamping the day to the end of the target month, so
 * 31 January + 1 month is 28 February rather than rolling into March.
 */
function addMonthsClamped(date: Date, months: number): Date {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + months;
	const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDayOfTarget)));
}

/** Total days plus a calendar breakdown ("10 years, 7 months, 19 days"). */
export function elapsedSince(transplantDate: string, asOf: string): Elapsed {
	const from = toUtcDate(transplantDate);
	const to = toUtcDate(asOf);

	// Count whole months first, then measure the remainder in days from the
	// resulting anchor. Doing it the other way round -- subtracting day numbers
	// and borrowing -- gives wrong answers across months of unequal length.
	let months =
		(to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());

	if (addMonthsClamped(from, months).getTime() > to.getTime()) months -= 1;

	const anchor = addMonthsClamped(from, Math.max(0, months));

	return {
		days: daysBetween(transplantDate, asOf),
		calendar: {
			years: Math.floor(months / 12),
			months: months % 12,
			days: daysBetween(toIsoDate(anchor), asOf)
		}
	};
}

/**
 * The next yearly anniversary on or after `asOf`.
 *
 * A 29 February transplant date clamps to 28 February in non-leap years, rather
 * than silently rolling into March.
 */
export function nextAnniversary(
	transplantDate: string,
	asOf: string
): { on: string; years: number } {
	const from = toUtcDate(transplantDate);
	const month = from.getUTCMonth();
	const day = from.getUTCDate();
	let year = toUtcDate(asOf).getUTCFullYear();

	const build = (y: number): Date => {
		const candidate = new Date(Date.UTC(y, month, day));
		// Rolled into the next month (29 Feb in a non-leap year): step back.
		if (candidate.getUTCMonth() !== month) {
			return new Date(Date.UTC(y, month + 1, 0));
		}
		return candidate;
	};

	let on = build(year);
	if (daysBetween(toIsoDate(on), asOf) > 0) {
		year += 1;
		on = build(year);
	}

	return { on: toIsoDate(on), years: year - from.getUTCFullYear() };
}

/** Milestones falling within the next `withinDays`, soonest first. */
export function upcomingMilestones(
	transplantDate: string,
	asOf: string,
	withinDays = 30
): Milestone[] {
	const found: Milestone[] = [];

	const anniversary = nextAnniversary(transplantDate, asOf);
	const anniversaryIn = daysBetween(asOf, anniversary.on);
	if (anniversaryIn <= withinDays) {
		found.push({
			kind: 'anniversary',
			value: anniversary.years,
			on: anniversary.on,
			daysUntil: anniversaryIn
		});
	}

	const elapsed = daysSinceTransplant(transplantDate, asOf);
	for (const target of DAY_MILESTONES) {
		const until = target - elapsed;
		if (until >= 0 && until <= withinDays) {
			found.push({
				kind: 'days',
				value: target,
				on: toIsoDate(new Date(toUtcDate(asOf).getTime() + until * 86_400_000)),
				daysUntil: until
			});
		}
	}

	return found.sort((a, b) => a.daysUntil - b.daysUntil);
}
