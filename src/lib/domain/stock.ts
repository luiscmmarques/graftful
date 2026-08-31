/** Stock ledger and consumption rate. */

import type { DoseVersion, Product, RegimenState, StockEvent, Unit } from './types.ts';
import { addDays, daysBetween, isWithin } from './dates.ts';

/**
 * Current stock as the running total of the ledger.
 *
 * `recount` sets an absolute value (the truth-up after drift); `refill` and
 * `adjustment` are deltas. Events are applied in date order, so a recount
 * discards everything before it.
 */
/**
 * Order stock events oldest first, deterministically.
 *
 * `occurredOn` is only a date, so sorting on it alone leaves events sharing a day in
 * whatever order they arrived — which, with random ids, is arbitrary. `recordedAt` breaks
 * the tie in favour of whatever was entered later, because on any given day the last thing
 * you counted is the thing you believe. `id` is the final tiebreak so the result is stable
 * for older records that predate `recordedAt`.
 */
export function byLedgerOrder(a: StockEvent, b: StockEvent): number {
	return (
		a.occurredOn.localeCompare(b.occurredOn) ||
		(a.recordedAt ?? '').localeCompare(b.recordedAt ?? '') ||
		a.id.localeCompare(b.id)
	);
}

export function stockOnHand(events: StockEvent[], productId: string, asOf?: string): number {
	const relevant = events
		.filter((e) => e.productId === productId)
		.filter((e) => !asOf || daysBetween(e.occurredOn, asOf) >= 0)
		.sort(byLedgerOrder);

	let balance = 0;
	for (const event of relevant) {
		if (event.kind === 'recount') balance = event.units;
		else balance += event.units;
	}
	return Math.max(0, balance);
}

/** The dose version in force for a therapy on a given date, if any. */
export function activeDoseVersion(
	doseVersions: DoseVersion[],
	therapyId: string,
	asOf: string
): DoseVersion | undefined {
	return doseVersions.find(
		(v) => v.therapyId === therapyId && isWithin(asOf, v.activeFrom, v.activeTo)
	);
}

/**
 * Pills of a product consumed per day, summed across every active composition
 * that references it — the same product can appear in more than one therapy.
 *
 * PRN therapies contribute nothing: they have no daily rate, and treating them
 * as zero is what keeps them out of the forecast rather than showing "0 days".
 */
export function unitsPerDay(state: RegimenState, productId: string, asOf: string): number {
	let total = 0;

	for (const therapy of state.therapies) {
		if (therapy.isPrn) continue;
		if (therapy.stoppedOn && daysBetween(therapy.stoppedOn, asOf) >= 0) continue;
		if (daysBetween(therapy.startedOn, asOf) < 0) continue;

		const version = activeDoseVersion(state.doseVersions, therapy.id, asOf);
		if (!version) continue;

		for (const slot of version.slots) {
			for (const item of slot.items) {
				if (item.productId === productId) total += item.units;
			}
		}
	}

	return total;
}

/**
 * Days of cover left. Returns null when nothing consumes this product, which is
 * distinct from zero days: a retired product with residual stock is not urgent.
 */
export function daysRemaining(onHand: number, perDay: number): number | null {
	if (perDay <= 0) return null;
	return onHand / perDay;
}

/**
 * Cross-check only. Compares the prescribed total against what the composition
 * actually adds up to, so a typo is caught before it corrupts the forecast.
 *
 * This compares two numbers the user entered. It never proposes a dose and
 * never alters the composition.
 */
export function checkDoseConsistency(
	version: DoseVersion,
	products: Product[]
): { ok: true } | { ok: false; declared: number; composed: number; unit: Unit } {
	if (version.declaredTotalDose === undefined || !version.declaredUnit) {
		return { ok: true };
	}

	const byId = new Map(products.map((p) => [p.id, p]));
	let composed = 0;

	for (const slot of version.slots) {
		for (const item of slot.items) {
			const product = byId.get(item.productId);
			if (!product) continue;
			// Only comparable when the composition and the declaration share a unit.
			if (product.strengthUnit !== version.declaredUnit) return { ok: true };
			composed += item.units * product.strength;
		}
	}

	const perSlot = composed / Math.max(1, version.slots.length);
	const matchesDaily = Math.abs(composed - version.declaredTotalDose) < 1e-9;
	const matchesPerSlot = Math.abs(perSlot - version.declaredTotalDose) < 1e-9;

	if (matchesDaily || matchesPerSlot) return { ok: true };

	return {
		ok: false,
		declared: version.declaredTotalDose,
		composed,
		unit: version.declaredUnit
	};
}

/**
 * Every date on which this product's consumption rate could change.
 *
 * Deliberately a superset — therapy start and stop dates, plus every dose version
 * boundary. Extra dates cost a little arithmetic; a missing one would silently
 * integrate the wrong rate straight through a dose change, so erring wide is the
 * safe direction.
 */
function rateChangeDates(state: RegimenState, productId: string): string[] {
	const dates = new Set<string>();

	for (const therapy of state.therapies) {
		const versions = state.doseVersions.filter((v) => v.therapyId === therapy.id);
		const touchesProduct = versions.some((v) =>
			v.slots.some((slot) => slot.items.some((item) => item.productId === productId))
		);
		if (!touchesProduct) continue;

		dates.add(therapy.startedOn);
		if (therapy.stoppedOn) dates.add(therapy.stoppedOn);

		for (const version of versions) {
			dates.add(version.activeFrom);
			if (version.activeTo) {
				dates.add(version.activeTo);
				dates.add(addDays(version.activeTo, 1));
			}
		}
	}

	return [...dates].sort();
}

/**
 * Units consumed over `[from, to)`.
 *
 * Half-open on purpose: counting 150 into the box on day D and asking on day D
 * must give 150 back, and asking on D+1 must have one day's worth gone.
 *
 * Integrated piecewise rather than day by day. The rate is a step function, so
 * multiplying across each flat segment is exact, and it stays cheap when the last
 * recount was months ago — which matters, because every product's status is
 * recomputed on every render.
 */
export function consumedBetween(
	state: RegimenState,
	productId: string,
	from: string,
	to: string
): number {
	if (daysBetween(from, to) <= 0) return 0;

	const boundaries = rateChangeDates(state, productId).filter(
		(date) => daysBetween(from, date) > 0 && daysBetween(date, to) > 0
	);

	let total = 0;
	let cursor = from;

	for (const boundary of [...boundaries, to]) {
		const length = daysBetween(cursor, boundary);
		if (length > 0) total += length * unitsPerDay(state, productId, cursor);
		cursor = boundary;
	}

	return total;
}

/**
 * Stock expected to be in the box, as opposed to what was last written down.
 *
 * `stockOnHand` is the ledger: it reports observations and deliberately nothing
 * else. But pills leave the box whether or not anyone records it, so a balance
 * that only moved when an event was written would never fall — and no reorder
 * alert would ever fire, which defeats the entire purpose of the app. Depletion
 * between two observations is therefore derived from the schedule, and a recount
 * is what corrects the drift that accumulates.
 */
export function projectedOnHand(state: RegimenState, productId: string, asOf: string): number {
	const events = state.stockEvents
		.filter((e) => e.productId === productId)
		.filter((e) => daysBetween(e.occurredOn, asOf) >= 0)
		.sort(byLedgerOrder);

	if (events.length === 0) return 0;

	let balance = 0;
	let observedOn = events[0].occurredOn;

	for (const [index, event] of events.entries()) {
		if (index > 0) {
			// Clamped at each step: if the box emptied before the refill arrived, it was
			// empty. Carrying a negative balance forward would quietly swallow part of
			// the next delivery.
			balance = Math.max(
				0,
				balance - consumedBetween(state, productId, observedOn, event.occurredOn)
			);
		}

		if (event.kind === 'recount') balance = event.units;
		else balance += event.units;

		observedOn = event.occurredOn;
	}

	balance = Math.max(0, balance - consumedBetween(state, productId, observedOn, asOf));
	return Math.max(0, balance);
}
