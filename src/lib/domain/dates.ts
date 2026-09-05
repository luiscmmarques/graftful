/**
 * Date helpers. Everything is handled as a UTC calendar date ("YYYY-MM-DD") so
 * that day counts never shift with the user's timezone or DST. Reminder *times*
 * are local and belong to the UI layer, not here.
 */

const MS_PER_DAY = 86_400_000;

export function toUtcDate(iso: string): Date {
	const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
	if (!y || !m || !d) throw new Error(`Invalid ISO date: ${iso}`);
	return new Date(Date.UTC(y, m - 1, d));
}

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
	return toIsoDate(new Date(toUtcDate(iso).getTime() + Math.trunc(days) * MS_PER_DAY));
}

/** Whole days from `from` to `to`. Negative when `to` precedes `from`. */
export function daysBetween(from: string, to: string): number {
	return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY);
}

/** True when `iso` falls in [from, to), treating an absent bound as open. */
export function isWithin(iso: string, from?: string, to?: string): boolean {
	if (from && daysBetween(from, iso) < 0) return false;
	if (to && daysBetween(to, iso) >= 0) return false;
	return true;
}
