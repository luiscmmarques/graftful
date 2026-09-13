/**
 * What to take, and when.
 *
 * Derives the day's slots from the active dose versions. Units are the primary
 * value — the milligrams are computed for display only, never the other way
 * round, so a dose is always physically achievable.
 */

import type { DoseSlot, Product, RegimenState, Therapy, Unit } from './types.ts';
import { daysBetween } from './dates.ts';
import { compareByProductId, compareNames } from './products.ts';
import { activeDoseVersion } from './stock.ts';

export interface ScheduledItem {
	productId: string;
	brandName: string;
	strength: number;
	strengthUnit: Unit;
	/** Optional visual aid only — see Product.form. */
	form?: string;
	units: number;
	/** units × strength, for display. */
	amount: number;
}

export interface ScheduledSlot {
	time: string;
	entries: Array<{
		therapyId: string;
		therapyName: string;
		category: string;
		items: ScheduledItem[];
		/** Total across items, when they share a unit. Null when mixed. */
		totalAmount: number | null;
		totalUnit: Unit | null;
	}>;
}

/**
 * Which of two therapy entries is read first within one time slot.
 *
 * By the leading product of each, so the card holding the product the user numbered first
 * is the first card under the time. Sorting the pills inside a dose was not enough on its
 * own: at 08:00 a regimen with three therapies showed them in whatever order the therapies
 * were added in Setup, so a product numbered 1 could still be read third.
 *
 * `items` is already sorted, so `items[0]` is the entry's best-placed product — an entry is
 * ranked by its own leading pill rather than by an average, for the same reason the stock
 * indicator takes the worst band: a summary of a group is not what the eye is looking for.
 * Entries with no items are dropped before this runs, so `items[0]` always exists.
 *
 * Therapy name breaks the tie, which happens when two therapies lead with the same product.
 */
function compareEntries(
	products: ReadonlyMap<string, Product>,
	a: ScheduledSlot['entries'][number],
	b: ScheduledSlot['entries'][number]
): number {
	const byProduct = compareByProductId(products, a.items[0].productId, b.items[0].productId);
	if (byProduct !== 0) return byProduct;
	return compareNames(a.therapyName, b.therapyName);
}

function isActive(therapy: Therapy, asOf: string): boolean {
	if (daysBetween(therapy.startedOn, asOf) < 0) return false;
	if (therapy.stoppedOn && daysBetween(therapy.stoppedOn, asOf) >= 0) return false;
	return true;
}

function buildItems(slot: DoseSlot, products: Map<string, Product>): ScheduledItem[] {
	const items: ScheduledItem[] = [];
	for (const item of slot.items) {
		const product = products.get(item.productId);
		if (!product) continue;
		items.push({
			productId: product.id,
			brandName: product.brandName,
			strength: product.strength,
			strengthUnit: product.strengthUnit,
			form: product.form,
			units: item.units,
			amount: item.units * product.strength
		});
	}
	/*
	 * The pills making up one dose, in the user's own reading order rather than the order
	 * the composition happens to be stored in. This is the list somebody checks against
	 * what is in their hand at seven in the morning, so it should read the same way every
	 * screen does — and the storage order is not a choice anybody made, it is whatever
	 * order the rows were added in Setup.
	 */
	return items.sort((a, b) => compareByProductId(products, a.productId, b.productId));
}

/**
 * The day's slots in chronological order. PRN therapies are excluded — they have
 * no scheduled time, and belong on their own list.
 */
export function scheduleForDay(state: RegimenState, asOf: string): ScheduledSlot[] {
	const products = new Map(state.products.map((p) => [p.id, p]));
	const byTime = new Map<string, ScheduledSlot>();

	for (const therapy of state.therapies) {
		if (therapy.isPrn || !isActive(therapy, asOf)) continue;

		const version = activeDoseVersion(state.doseVersions, therapy.id, asOf);
		if (!version) continue;

		for (const slot of version.slots) {
			const items = buildItems(slot, products);
			if (items.length === 0) continue;

			const units = new Set(items.map((i) => i.strengthUnit));
			const sameUnit = units.size === 1;

			const existing = byTime.get(slot.time) ?? { time: slot.time, entries: [] };
			existing.entries.push({
				therapyId: therapy.id,
				therapyName: therapy.name,
				category: therapy.category,
				items,
				totalAmount: sameUnit ? items.reduce((sum, i) => sum + i.amount, 0) : null,
				totalUnit: sameUnit ? items[0].strengthUnit : null
			});
			byTime.set(slot.time, existing);
		}
	}

	const slots = [...byTime.values()];
	for (const slot of slots) slot.entries.sort((a, b) => compareEntries(products, a, b));
	return slots.sort((a, b) => a.time.localeCompare(b.time));
}

/** As-needed therapies, which never appear on a schedule. */
export function prnTherapies(state: RegimenState, asOf: string): Therapy[] {
	return state.therapies.filter((t) => t.isPrn && isActive(t, asOf));
}

/**
 * Total pills across a day already built. The "how many do I swallow" number.
 *
 * Separate from `pillsPerDay` because Today renders the schedule and the count together, and
 * calling both rebuilt the entire day twice per render — every dose version resolved, every
 * item mapped, every sort run, to reach a total the caller was holding the inputs for. It
 * counts a list it is handed and derives nothing new.
 */
export function pillsInSlots(slots: readonly ScheduledSlot[]): number {
	let total = 0;
	for (const slot of slots) {
		for (const entry of slot.entries) {
			for (const item of entry.items) total += item.units;
		}
	}
	return total;
}

/**
 * Total pills across the whole day, built from the state.
 *
 * Kept for callers that hold no schedule; it is `pillsInSlots` over a freshly built day, so
 * the two can never disagree.
 */
export function pillsPerDay(state: RegimenState, asOf: string): number {
	return pillsInSlots(scheduleForDay(state, asOf));
}
