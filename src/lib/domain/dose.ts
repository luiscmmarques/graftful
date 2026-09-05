/**
 * Changing a dose.
 *
 * This is the operation the whole three-level model exists for. When a prescriber
 * says "go to 20 mg", nothing about the past becomes untrue: the old dose was
 * correct until the day it wasn't. So a change closes the current version and opens
 * a new one, and the history survives.
 *
 * Two things are deliberately not done here.
 *
 * It never solves for a composition. Told "20 mg", it will not work out that this
 * means three 4 mg capsules plus a 2 mg plus a 6 mg. The user enters units and the
 * total is derived from them for checking. Deriving a dose from a clinical figure is
 * what turns a tracking app into a medical device, and it is also simply unsafe —
 * only a prescriber knows whether 20 mg should be reached with a 6 mg capsule or by
 * splitting something.
 *
 * It never silently rewrites history. A change effective before the version it
 * would replace is refused rather than reconciled, because guessing at what the
 * user meant would corrupt the record of what they actually took.
 */

import type { DoseSlot, DoseVersion, Product, RegimenState, Unit } from './types.ts';
import { daysBetween } from './dates.ts';

export interface DoseChangeInput {
	therapyId: string;
	/** First day the new dose applies. */
	effectiveFrom: string;
	slots: DoseSlot[];
	/** What the prescriber said, for cross-checking only. */
	declaredTotalDose?: number;
	declaredUnit?: Unit;
	/** Supplied by the caller so this stays pure and testable. */
	newVersionId: string;
}

export type DoseChange =
	/** Same start date: the dose was recorded wrongly, not changed. */
	| { kind: 'correct'; version: DoseVersion }
	/** A genuine change: the old version is closed and a new one begins. */
	| { kind: 'supersede'; closed: DoseVersion | null; created: DoseVersion };

/**
 * Work out the edits a dose change implies, without applying them.
 *
 * Throws when the request cannot be honoured without damaging the record.
 */
export function planDoseChange(state: RegimenState, input: DoseChangeInput): DoseChange {
	const { therapyId, effectiveFrom, slots, newVersionId } = input;

	if (slots.length === 0) throw new Error('A dose needs at least one time.');
	if (slots.some((slot) => slot.items.length === 0)) {
		throw new Error('Every time needs at least one product.');
	}
	if (slots.some((slot) => slot.items.some((item) => item.units <= 0))) {
		throw new Error('Every product in a dose needs a quantity above zero.');
	}

	const versions = state.doseVersions
		.filter((v) => v.therapyId === therapyId)
		.sort((a, b) => a.activeFrom.localeCompare(b.activeFrom));

	// A version starting later would interleave with the one being created, leaving
	// two doses claiming the same days. Refuse rather than guess an ordering.
	const laterVersion = versions.find((v) => daysBetween(effectiveFrom, v.activeFrom) > 0);
	if (laterVersion) {
		throw new Error(
			`A dose is already recorded as starting on ${laterVersion.activeFrom}. ` +
				'Change that one instead, or pick a later date.'
		);
	}

	const declared = {
		declaredTotalDose: input.declaredTotalDose,
		declaredUnit: input.declaredUnit
	};

	const current = versions[versions.length - 1];

	if (!current) {
		return {
			kind: 'supersede',
			closed: null,
			created: { id: newVersionId, therapyId, slots, activeFrom: effectiveFrom, ...declared }
		};
	}

	// Same day: this is a correction to what was entered, so replace it in place
	// rather than leaving a zero-length version behind.
	if (daysBetween(current.activeFrom, effectiveFrom) === 0) {
		return {
			kind: 'correct',
			version: { ...current, slots, ...declared }
		};
	}

	return {
		kind: 'supersede',
		// activeTo is exclusive and equals the new activeFrom, so the two versions meet
		// exactly. Any other value would leave a day consuming nothing.
		closed: { ...current, activeTo: effectiveFrom },
		created: { id: newVersionId, therapyId, slots, activeFrom: effectiveFrom, ...declared }
	};
}

/**
 * Products in a composition that are currently retired.
 *
 * The case this exists for: a dose going back up from 14 mg to 20 mg needs the 6 mg
 * capsule that was retired when the dose came down. A product you are actively
 * dosing cannot be retired, so the caller brings these back into use — but it should
 * say so first, because it affects ordering.
 */
export function retiredProductsIn(products: Product[], slots: DoseSlot[]): Product[] {
	const used = new Set(slots.flatMap((slot) => slot.items.map((item) => item.productId)));
	return products.filter((product) => product.retired && used.has(product.id));
}

/**
 * The total a composition adds up to, derived from the units entered.
 *
 * Returns null for `unit` when the products disagree on it — a dose mixing
 * milligrams and grams has no single total to show, and inventing one by converting
 * would be doing arithmetic the user did not ask for.
 */
export function composedDose(
	products: Product[],
	slots: DoseSlot[]
): { perDay: number; perSlot: number[]; unit: Unit | null } {
	const byId = new Map(products.map((p) => [p.id, p]));
	const units = new Set<Unit>();
	const perSlot: number[] = [];

	for (const slot of slots) {
		let total = 0;
		for (const item of slot.items) {
			const product = byId.get(item.productId);
			if (!product) continue;
			units.add(product.strengthUnit);
			total += item.units * product.strength;
		}
		perSlot.push(total);
	}

	return {
		perDay: perSlot.reduce((sum, value) => sum + value, 0),
		perSlot,
		unit: units.size === 1 ? [...units][0] : null
	};
}

/**
 * Whether a therapy can be removed outright rather than stopped.
 *
 * Stopping is the normal action and keeps the record intact. Deleting is for a
 * therapy entered by mistake: one with no doses recorded, or one that has not yet
 * been in force for a single day, so nothing was taken under it.
 */
export function therapyUsage(
	state: RegimenState,
	therapyId: string,
	asOf: string
): { doseVersions: number; canDelete: boolean } {
	const therapy = state.therapies.find((t) => t.id === therapyId);
	const doseVersions = state.doseVersions.filter((v) => v.therapyId === therapyId).length;

	if (!therapy) return { doseVersions, canDelete: false };

	return {
		doseVersions,
		canDelete: doseVersions === 0 || daysBetween(therapy.startedOn, asOf) <= 0
	};
}
