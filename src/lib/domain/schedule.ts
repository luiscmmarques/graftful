/**
 * What to take, and when.
 *
 * Derives the day's slots from the active dose versions. Units are the primary
 * value — the milligrams are computed for display only, never the other way
 * round, so a dose is always physically achievable.
 */

import type { DoseSlot, Product, RegimenState, Therapy, Unit } from './types.ts';
import { daysBetween } from './dates.ts';
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
	return items;
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

	return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time));
}

/** As-needed therapies, which never appear on a schedule. */
export function prnTherapies(state: RegimenState, asOf: string): Therapy[] {
	return state.therapies.filter((t) => t.isPrn && isActive(t, asOf));
}

/** Total pills across the whole day. The "how many do I swallow" number. */
export function pillsPerDay(state: RegimenState, asOf: string): number {
	return scheduleForDay(state, asOf).reduce(
		(dayTotal, slot) =>
			dayTotal +
			slot.entries.reduce(
				(slotTotal, entry) => slotTotal + entry.items.reduce((sum, item) => sum + item.units, 0),
				0
			),
		0
	);
}
