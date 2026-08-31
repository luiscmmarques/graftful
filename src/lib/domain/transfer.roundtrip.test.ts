import { test } from 'vitest';
import assert from 'node:assert/strict';

import { buildExport, parseImport, type Preferences } from './transfer.ts';
import type {
	DoseItem,
	DoseSlot,
	DoseVersion,
	OrderLine,
	Product,
	RegimenState,
	Settings,
	StockEvent,
	Therapy
} from './types.ts';

/**
 * Backup completeness, enforced rather than remembered.
 *
 * The export file is the only copy of a regimen that exists outside one browser profile.
 * A field added to the model and forgotten here does not fail loudly — it exports fine and
 * silently disappears on restore, which is exactly what happened to the usual dose times,
 * the language override and the collection note.
 *
 * The `Record<keyof X, true>` maps below are the forcing function. Adding a field to any
 * of these types makes this file stop compiling until the field is listed, and listing it
 * makes the round-trip assertion check it survives. So the failure arrives at the moment
 * the model changes, in a file that explains why, rather than months later in someone's
 * lost backup.
 *
 * If a field genuinely should not be persisted, list it here and add it to
 * `DELIBERATELY_DROPPED` with a reason.
 */

const PRODUCT_FIELDS: Record<keyof Product, true> = {
	id: true,
	brandName: true,
	strength: true,
	strengthUnit: true,
	form: true,
	packageSize: true,
	minDays: true,
	maxOrderUnits: true,
	retired: true
};

const THERAPY_FIELDS: Record<keyof Therapy, true> = {
	id: true,
	name: true,
	activeIngredient: true,
	category: true,
	isPrn: true,
	startedOn: true,
	stoppedOn: true
};

const DOSE_VERSION_FIELDS: Record<keyof DoseVersion, true> = {
	id: true,
	therapyId: true,
	slots: true,
	activeFrom: true,
	activeTo: true,
	declaredTotalDose: true,
	declaredUnit: true
};

const DOSE_SLOT_FIELDS: Record<keyof DoseSlot, true> = { time: true, items: true };
const DOSE_ITEM_FIELDS: Record<keyof DoseItem, true> = { productId: true, units: true };

const STOCK_EVENT_FIELDS: Record<keyof StockEvent, true> = {
	id: true,
	productId: true,
	kind: true,
	units: true,
	occurredOn: true,
	recordedAt: true,
	note: true
};

const ORDER_LINE_FIELDS: Record<keyof OrderLine, true> = {
	id: true,
	productId: true,
	unitsOrdered: true,
	orderedOn: true,
	unitsReceived: true,
	receivedOn: true
};

const SETTINGS_FIELDS: Record<keyof Settings, true> = {
	targetHorizonDays: true,
	transplantDate: true
};

const PREFERENCE_FIELDS: Record<keyof Preferences, true> = {
	locale: true,
	collectionNote: true,
	defaultDoseTimes: true,
	lastIcsFingerprint: true
};

/** Fields intentionally not carried across a backup, and why. */
const DELIBERATELY_DROPPED: Record<string, string> = {};

/**
 * Every entity with every optional field populated.
 *
 * Optional fields are the ones that get lost, because a fixture that leaves them undefined
 * cannot tell "preserved" from "dropped".
 */
const FULL_STATE: RegimenState = {
	settings: { targetHorizonDays: 45, transplantDate: '2016-01-11' },
	products: [
		{
			id: 'p1',
			brandName: 'Alfabine',
			strength: 4,
			strengthUnit: 'mg',
			form: 'capsule',
			packageSize: 50,
			minDays: 4,
			maxOrderUnits: 400,
			retired: true
		}
	],
	therapies: [
		{
			id: 't1',
			name: 'Alfabine (maintenance)',
			activeIngredient: 'alfa',
			category: 'Maintenance A',
			isPrn: false,
			startedOn: '2016-01-11',
			stoppedOn: '2026-01-11'
		}
	],
	doseVersions: [
		{
			id: 'v1',
			therapyId: 't1',
			slots: [{ time: '06:15', items: [{ productId: 'p1', units: 0.5 }] }],
			activeFrom: '2016-01-11',
			activeTo: '2026-01-11',
			declaredTotalDose: 2.5,
			declaredUnit: 'mg'
		}
	],
	stockEvents: [
		{
			id: 's1',
			productId: 'p1',
			kind: 'recount',
			units: 120,
			occurredOn: '2026-08-31',
			recordedAt: '2026-08-31T17:24:00.000Z',
			note: 'Counted by hand'
		}
	],
	orderLines: [
		{
			id: 'o1',
			productId: 'p1',
			unitsOrdered: 200,
			orderedOn: '2026-08-01',
			unitsReceived: 150,
			receivedOn: '2026-08-05'
		}
	]
};

const FULL_PREFERENCES: Preferences = {
	locale: 'pt',
	collectionNote: 'sexta-feira de manhã',
	defaultDoseTimes: ['06:15', '18:15'],
	lastIcsFingerprint: 'fingerprint-1'
};

function keysOf(map: Record<string, true>): string[] {
	return Object.keys(map)
		.filter((key) => !(key in DELIBERATELY_DROPPED))
		.sort();
}

function assertSurvives(
	label: string,
	fields: Record<string, true>,
	before: object,
	after: object
) {
	for (const key of keysOf(fields)) {
		const original = (before as Record<string, unknown>)[key];
		const restored = (after as Record<string, unknown>)[key];
		assert.deepEqual(
			restored,
			original,
			`${label}.${key} did not survive a backup. Handle it in transfer.ts, or record it ` +
				'in DELIBERATELY_DROPPED with a reason.'
		);
	}
}

test('every field of every entity survives a backup', () => {
	const { state, preferences } = parseImport(
		JSON.stringify(buildExport(FULL_STATE, FULL_PREFERENCES, '2026-08-31T00:00:00Z'))
	);

	assertSurvives('Settings', SETTINGS_FIELDS, FULL_STATE.settings, state.settings);
	assertSurvives('Preferences', PREFERENCE_FIELDS, FULL_PREFERENCES, preferences);
	assertSurvives('Product', PRODUCT_FIELDS, FULL_STATE.products[0], state.products[0]);
	assertSurvives('Therapy', THERAPY_FIELDS, FULL_STATE.therapies[0], state.therapies[0]);
	assertSurvives('StockEvent', STOCK_EVENT_FIELDS, FULL_STATE.stockEvents[0], state.stockEvents[0]);
	assertSurvives('OrderLine', ORDER_LINE_FIELDS, FULL_STATE.orderLines[0], state.orderLines[0]);
	assertSurvives(
		'DoseVersion',
		DOSE_VERSION_FIELDS,
		FULL_STATE.doseVersions[0],
		state.doseVersions[0]
	);
	assertSurvives(
		'DoseSlot',
		DOSE_SLOT_FIELDS,
		FULL_STATE.doseVersions[0].slots[0],
		state.doseVersions[0].slots[0]
	);
	assertSurvives(
		'DoseItem',
		DOSE_ITEM_FIELDS,
		FULL_STATE.doseVersions[0].slots[0].items[0],
		state.doseVersions[0].slots[0].items[0]
	);
});

test('the fixture populates every field, so nothing is untested by omission', () => {
	/*
	 * Guards the guard. A fixture leaving an optional field undefined cannot distinguish
	 * "preserved" from "silently dropped", so the test above would pass vacuously.
	 */
	const cases: Array<[string, Record<string, true>, object]> = [
		['Settings', SETTINGS_FIELDS, FULL_STATE.settings],
		['Preferences', PREFERENCE_FIELDS, FULL_PREFERENCES],
		['Product', PRODUCT_FIELDS, FULL_STATE.products[0]],
		['Therapy', THERAPY_FIELDS, FULL_STATE.therapies[0]],
		['DoseVersion', DOSE_VERSION_FIELDS, FULL_STATE.doseVersions[0]],
		['DoseSlot', DOSE_SLOT_FIELDS, FULL_STATE.doseVersions[0].slots[0]],
		['DoseItem', DOSE_ITEM_FIELDS, FULL_STATE.doseVersions[0].slots[0].items[0]],
		['StockEvent', STOCK_EVENT_FIELDS, FULL_STATE.stockEvents[0]],
		['OrderLine', ORDER_LINE_FIELDS, FULL_STATE.orderLines[0]]
	];

	for (const [label, fields, fixture] of cases) {
		for (const key of keysOf(fields)) {
			assert.notEqual(
				(fixture as Record<string, unknown>)[key],
				undefined,
				`${label}.${key} is missing from FULL_STATE, so the round-trip test cannot see it.`
			);
		}
	}
});
