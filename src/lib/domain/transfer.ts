/**
 * Backup and restore.
 *
 * The export file is the only copy of someone's regimen that exists outside one browser
 * profile. Clearing site data destroys the original, so this file has to be complete and
 * it has to survive being read back.
 *
 * It was neither. Export wrote every preference, but restore rebuilt settings from
 * `DEFAULT_SETTINGS` and copied across only the horizon and the transplant date — so
 * importing a backup silently discarded the usual dose times, the language override and
 * the pharmacy collection note. Nothing reported it: the file was right, the app just
 * ignored most of it.
 *
 * Import also trusted the file completely. A hand-edited or truncated backup went straight
 * into the database, where an invalid time produces a calendar no client can parse and a
 * missing package size divides by zero.
 *
 * So restore validates, and says what it discarded. Kept deliberately pure — no Dexie, no
 * browser — so the part that can lose data is testable.
 *
 * ## Adding a field to the model
 *
 * Handle it in **both** `buildExport` and `parseImport`, validate it here, and list it in
 * `transfer.roundtrip.test.ts`. That test will not compile until you do, and its assertion
 * names any field that fails to survive. See the checklist in AGENTS.md.
 */

import type {
	DoseSlot,
	DoseVersion,
	OrderLine,
	Product,
	RegimenState,
	Settings,
	StockEvent,
	Therapy,
	Unit
} from './types.ts';
import {
	LIMITS,
	normaliseDate,
	normaliseNumber,
	normaliseTime,
	parseTimeList
} from './validate.ts';
import type { Locale } from './locale.ts';

export const EXPORT_VERSION = 1;

/** Everything held in settings that is not part of the domain state. */
export interface Preferences {
	locale?: Locale;
	collectionNote?: string;
	defaultDoseTimes?: string[];
	lastIcsFingerprint?: string;
	/**
	 * Whether the header shows the round-day milestone line.
	 *
	 * Absent means shown, which is what the app has always done. The point of the setting is
	 * that a countdown attached to a transplant is not universally welcome — some people mark
	 * the day, others would rather not be reminded that anything is being counted.
	 */
	showMilestones?: boolean;
}

export interface ExportPayload {
	version: number;
	exportedAt: string;
	settings: Settings & Preferences;
	products: Product[];
	therapies: Therapy[];
	doseVersions: DoseVersion[];
	stockEvents: StockEvent[];
	orderLines: OrderLine[];
}

export function buildExport(
	state: RegimenState,
	preferences: Preferences,
	exportedAt: string
): ExportPayload {
	return {
		version: EXPORT_VERSION,
		exportedAt,
		// Spread order matters: preferences must not be flattened away by the domain
		// settings, which is the bug this module exists to stop happening again.
		settings: { ...state.settings, ...preferences },
		products: state.products,
		therapies: state.therapies,
		doseVersions: state.doseVersions,
		stockEvents: state.stockEvents,
		orderLines: state.orderLines
	};
}

const UNITS = new Set<Unit>(['mg', 'g', 'cp']);
const KINDS = new Set<StockEvent['kind']>(['refill', 'recount', 'adjustment']);
const LOCALE_CODES = new Set<Locale>(['en', 'fr', 'de', 'pt', 'it']);

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export interface ImportResult {
	state: RegimenState;
	preferences: Preferences;
	/** What was dropped and why. Shown to the user rather than swallowed. */
	warnings: string[];
}

export function parseImport(json: string): ImportResult {
	let raw: Record<string, unknown>;
	try {
		raw = JSON.parse(json) as Record<string, unknown>;
	} catch {
		throw new Error('That file is not valid JSON.');
	}

	if (!raw || typeof raw !== 'object' || !Array.isArray(raw.products)) {
		throw new Error('That does not look like a Graftful backup.');
	}

	const version = normaliseNumber(raw.version, { min: 1, integer: true });
	if (version !== null && version > EXPORT_VERSION) {
		throw new Error(
			`That backup was made by a newer version of Graftful (format ${version}). Update the app first.`
		);
	}

	const warnings: string[] = [];
	const settingsIn = (raw.settings ?? {}) as Record<string, unknown>;

	// --- products first: everything else references them ---
	const products: Product[] = [];
	for (const entry of asArray(raw.products)) {
		const p = entry as Record<string, unknown>;
		const id = asString(p.id);
		const brandName = asString(p.brandName).trim();
		const strength = normaliseNumber(p.strength, LIMITS.strength);
		const packageSize = normaliseNumber(p.packageSize, LIMITS.packageSize);
		const minDays = normaliseNumber(p.minDays, LIMITS.minDays);
		const unit = p.strengthUnit as Unit;

		if (!id || !brandName || strength === null || packageSize === null || minDays === null) {
			warnings.push(`Skipped a product with missing or invalid details: ${brandName || id || '?'}`);
			continue;
		}

		products.push({
			id,
			brandName,
			strength,
			strengthUnit: UNITS.has(unit) ? unit : 'mg',
			packageSize,
			minDays,
			form: p.form ? asString(p.form) : undefined,
			maxOrderUnits: normaliseNumber(p.maxOrderUnits, LIMITS.stockUnits) ?? undefined,
			retired: p.retired === true ? true : undefined
		});
	}
	const productIds = new Set(products.map((p) => p.id));

	// --- therapies ---
	const therapies: Therapy[] = [];
	for (const entry of asArray(raw.therapies)) {
		const t = entry as Record<string, unknown>;
		const id = asString(t.id);
		const name = asString(t.name).trim();
		const startedOn = normaliseDate(asString(t.startedOn));

		if (!id || !name || startedOn === null) {
			warnings.push(`Skipped a therapy with missing or invalid details: ${name || id || '?'}`);
			continue;
		}

		const stoppedOn = t.stoppedOn ? normaliseDate(asString(t.stoppedOn)) : null;
		therapies.push({
			id,
			name,
			activeIngredient: t.activeIngredient ? asString(t.activeIngredient) : undefined,
			category: asString(t.category),
			isPrn: t.isPrn === true,
			startedOn,
			stoppedOn: stoppedOn ?? undefined
		});
	}
	const therapyIds = new Set(therapies.map((t) => t.id));

	// --- dose versions ---
	const doseVersions: DoseVersion[] = [];
	for (const entry of asArray(raw.doseVersions)) {
		const v = entry as Record<string, unknown>;
		const id = asString(v.id);
		const therapyId = asString(v.therapyId);
		const activeFrom = normaliseDate(asString(v.activeFrom));

		if (!id || !therapyIds.has(therapyId) || activeFrom === null) {
			warnings.push('Skipped a dose with no matching therapy or an invalid start date.');
			continue;
		}

		const slots: DoseSlot[] = [];
		let slotProblem = false;
		for (const slotEntry of asArray(v.slots)) {
			const slot = slotEntry as Record<string, unknown>;
			const time = normaliseTime(asString(slot.time));
			if (time === null) {
				slotProblem = true;
				break;
			}

			const items = [];
			for (const itemEntry of asArray(slot.items)) {
				const item = itemEntry as Record<string, unknown>;
				const productId = asString(item.productId);
				const units = normaliseNumber(item.units, LIMITS.units);
				if (!productIds.has(productId) || units === null) {
					slotProblem = true;
					break;
				}
				items.push({ productId, units });
			}
			if (slotProblem || items.length === 0) {
				slotProblem = true;
				break;
			}
			slots.push({ time, items });
		}

		if (slotProblem || slots.length === 0) {
			warnings.push(`Skipped a dose with an invalid time or quantity (from ${activeFrom}).`);
			continue;
		}

		const activeTo = v.activeTo ? normaliseDate(asString(v.activeTo)) : null;
		const declaredUnit = v.declaredUnit as Unit;
		doseVersions.push({
			id,
			therapyId,
			slots,
			activeFrom,
			activeTo: activeTo ?? undefined,
			declaredTotalDose: normaliseNumber(v.declaredTotalDose, LIMITS.strength) ?? undefined,
			declaredUnit: UNITS.has(declaredUnit) ? declaredUnit : undefined
		});
	}

	// --- stock events ---
	const stockEvents: StockEvent[] = [];
	for (const entry of asArray(raw.stockEvents)) {
		const e = entry as Record<string, unknown>;
		const id = asString(e.id);
		const productId = asString(e.productId);
		const occurredOn = normaliseDate(asString(e.occurredOn));
		const kind = e.kind as StockEvent['kind'];
		// Adjustments are legitimately negative; a recount or refill is not.
		const units = normaliseNumber(e.units, kind === 'adjustment' ? {} : LIMITS.stockUnits);

		if (
			!id ||
			!productIds.has(productId) ||
			occurredOn === null ||
			!KINDS.has(kind) ||
			units === null
		) {
			warnings.push('Skipped a stock entry with an unknown product or invalid date.');
			continue;
		}

		/*
		 * recordedAt is carried across, and only when it parses as an instant. It orders
		 * events that share a day, so a restored backup that lost it would reopen the bug
		 * where correcting a count on a busy day silently did nothing.
		 */
		const recordedAt = asString(e.recordedAt);
		stockEvents.push({
			id,
			productId,
			kind,
			units,
			occurredOn,
			recordedAt: Number.isFinite(Date.parse(recordedAt)) ? recordedAt : undefined,
			note: e.note ? asString(e.note) : undefined
		});
	}

	// --- order lines ---
	const orderLines: OrderLine[] = [];
	for (const entry of asArray(raw.orderLines)) {
		const l = entry as Record<string, unknown>;
		const id = asString(l.id);
		const productId = asString(l.productId);
		const orderedOn = normaliseDate(asString(l.orderedOn));
		const unitsOrdered = normaliseNumber(l.unitsOrdered, LIMITS.stockUnits);

		if (!id || !productIds.has(productId) || orderedOn === null || unitsOrdered === null) {
			warnings.push('Skipped an order with an unknown product or invalid date.');
			continue;
		}

		const receivedOn = l.receivedOn ? normaliseDate(asString(l.receivedOn)) : null;
		orderLines.push({
			id,
			productId,
			unitsOrdered,
			orderedOn,
			unitsReceived: normaliseNumber(l.unitsReceived, LIMITS.stockUnits) ?? undefined,
			receivedOn: receivedOn ?? undefined
		});
	}

	// --- settings and preferences ---
	const transplantDate = settingsIn.transplantDate
		? normaliseDate(asString(settingsIn.transplantDate))
		: '';
	if (settingsIn.transplantDate && transplantDate === null) {
		warnings.push('The transplant date in the backup was not a real date and was left blank.');
	}

	const state: RegimenState = {
		settings: {
			targetHorizonDays: normaliseNumber(settingsIn.targetHorizonDays, LIMITS.horizonDays) ?? 60,
			transplantDate: transplantDate ?? ''
		},
		products,
		therapies,
		doseVersions,
		stockEvents,
		orderLines
	};

	const locale = settingsIn.locale as Locale;
	const { times, invalid } = parseTimeList(
		asArray(settingsIn.defaultDoseTimes).map(asString).join(',')
	);
	if (invalid.length > 0) {
		warnings.push(`Ignored usual times that were not HH:MM: ${invalid.join(', ')}`);
	}

	const preferences: Preferences = {
		locale: LOCALE_CODES.has(locale) ? locale : undefined,
		collectionNote: settingsIn.collectionNote ? asString(settingsIn.collectionNote) : undefined,
		defaultDoseTimes: times.length > 0 ? times : undefined,
		lastIcsFingerprint: settingsIn.lastIcsFingerprint
			? asString(settingsIn.lastIcsFingerprint)
			: undefined,
		/*
		 * Read with `typeof`, not `=== true`.
		 *
		 * The obvious `settingsIn.showMilestones === true ? true : undefined` discards `false`
		 * — which is the only value anyone ever bothers to set, since absent already means
		 * shown. A restore would then start counting days at somebody who had deliberately
		 * turned that off, from a file that recorded their choice correctly.
		 */
		showMilestones:
			typeof settingsIn.showMilestones === 'boolean' ? settingsIn.showMilestones : undefined
	};

	return { state, preferences, warnings };
}
