import { test } from 'vitest';
import assert from 'node:assert/strict';

import { buildExport, EXPORT_VERSION, parseImport, type Preferences } from './transfer.ts';
import { exampleRegimen, SNAPSHOT } from './seed.ts';
import { scheduleForDay } from './schedule.ts';
import { productStatuses } from './procurement.ts';

const PREFS: Preferences = {
	locale: 'pt',
	collectionNote: 'sexta-feira de manhã',
	defaultDoseTimes: ['06:15', '18:15'],
	lastIcsFingerprint: 'abc123',
	// `false` on purpose. Absent already means shown, so `true` would pass even if the field
	// were dropped entirely on the way back in.
	showMilestones: false
};

const roundTrip = (prefs: Preferences = PREFS) =>
	parseImport(JSON.stringify(buildExport(exampleRegimen(), prefs, '2026-08-31T00:00:00Z')));

test('a backup restores every preference, not just the domain settings', () => {
	/*
	 * The bug this exists for: export wrote all of these, restore rebuilt settings from
	 * defaults and copied across only the horizon and transplant date. The usual dose
	 * times, the language and the collection note vanished, silently, from a file that
	 * contained them.
	 */
	const { preferences } = roundTrip();

	assert.deepEqual(preferences, PREFS);
});

test('the whole regimen survives a round trip unchanged', () => {
	const original = exampleRegimen();
	const { state, warnings } = roundTrip();

	assert.deepEqual(warnings, [], 'a clean export should import without complaint');
	assert.equal(state.products.length, original.products.length);
	assert.equal(state.therapies.length, original.therapies.length);
	assert.equal(state.doseVersions.length, original.doseVersions.length);
	assert.equal(state.stockEvents.length, original.stockEvents.length);
	assert.deepEqual(state.settings, original.settings);
});

test('dose times survive, including a schedule nobody would have guessed', () => {
	const original = exampleRegimen();
	const version = original.doseVersions.find((v) => v.therapyId === 'therapy-alfa');
	if (!version) throw new Error('expected a dose version');
	version.slots = [
		{ time: '06:15', items: [{ productId: 'alfa-a', units: 3 }] },
		{ time: '14:45', items: [{ productId: 'alfa-b', units: 0.5 }] }
	];

	const { state } = parseImport(JSON.stringify(buildExport(original, {}, '2026-08-31T00:00:00Z')));

	const restored = state.doseVersions.find((v) => v.id === version.id);
	assert.deepEqual(restored?.slots, version.slots);
	// And the times are still the times, on the screen that shows them.
	assert.deepEqual(
		scheduleForDay(state, SNAPSHOT).map((slot) => slot.time),
		['06:15', '07:30', '14:45', '19:30']
	);
});

test('a restored regimen produces the same stock figures', () => {
	// The real test of a backup: the arithmetic still lands in the same place.
	const before = productStatuses(exampleRegimen(), SNAPSHOT);
	const after = productStatuses(roundTrip().state, SNAPSHOT);

	assert.deepEqual(
		after.map((s) => [s.productId, s.onHand, s.daysRemaining]),
		before.map((s) => [s.productId, s.onHand, s.daysRemaining])
	);
});

test('a file that is not a backup is refused clearly', () => {
	assert.throws(() => parseImport('not json'), /not valid JSON/);
	assert.throws(() => parseImport('{"hello":true}'), /does not look like a Graftful backup/);
});

test('a backup from a newer version is refused rather than half-read', () => {
	const payload = buildExport(exampleRegimen(), {}, '2026-08-31T00:00:00Z');
	payload.version = EXPORT_VERSION + 1;

	assert.throws(() => parseImport(JSON.stringify(payload)), /newer version/);
});

test('invalid records are dropped with a warning rather than imported', () => {
	const raw = JSON.parse(JSON.stringify(buildExport(exampleRegimen(), {}, '2026-08-31T00:00:00Z')));

	// A hand-edited or truncated backup. Each of these would break something quietly:
	// a zero box size divides by zero, "25:00" emits an unparsable calendar entry.
	raw.products[0].packageSize = 0;
	raw.doseVersions[1].slots[0].time = '25:00';
	raw.stockEvents[2].occurredOn = '2026-02-30';

	const { state, warnings } = parseImport(JSON.stringify(raw));

	// More warnings than faults, and deliberately so: dropping a product cascades to
	// everything referencing it, which is what keeps the restored ledger consistent.
	assert.ok(
		warnings.some((w) => w.includes('product')),
		warnings.join(' | ')
	);
	assert.ok(
		warnings.some((w) => w.includes('dose')),
		warnings.join(' | ')
	);
	assert.ok(
		warnings.some((w) => w.includes('stock')),
		warnings.join(' | ')
	);

	assert.ok(!state.products.some((p) => p.packageSize === 0));
	assert.ok(state.doseVersions.every((v) => v.slots.every((s) => /^\d\d:\d\d$/.test(s.time))));
	assert.ok(state.stockEvents.every((e) => /^\d{4}-\d\d-\d\d$/.test(e.occurredOn)));

	// Nothing left pointing at the product that failed to import.
	const ids = new Set(state.products.map((p) => p.id));
	assert.ok(state.stockEvents.every((e) => ids.has(e.productId)));
	assert.ok(
		state.doseVersions.every((v) =>
			v.slots.every((s) => s.items.every((i) => ids.has(i.productId)))
		)
	);
});

test('records pointing at a product that failed to import are dropped too', () => {
	// Otherwise the restore leaves dangling references and the stock ledger is wrong.
	const raw = JSON.parse(JSON.stringify(buildExport(exampleRegimen(), {}, '2026-08-31T00:00:00Z')));
	raw.products = raw.products.filter((p: { id: string }) => p.id !== 'alfa-a');

	const { state, warnings } = parseImport(JSON.stringify(raw));

	assert.ok(warnings.length > 0);
	assert.ok(!state.stockEvents.some((e) => e.productId === 'alfa-a'));
	assert.ok(
		!state.doseVersions.some((v) =>
			v.slots.some((s) => s.items.some((i) => i.productId === 'alfa-a'))
		)
	);
});

test('an invalid preference is ignored without failing the whole import', () => {
	const raw = JSON.parse(
		JSON.stringify(buildExport(exampleRegimen(), PREFS, '2026-08-31T00:00:00Z'))
	);
	raw.settings.locale = 'klingon';
	raw.settings.defaultDoseTimes = ['08:00', 'lunchtime'];

	const { preferences, warnings } = parseImport(JSON.stringify(raw));

	assert.equal(preferences.locale, undefined, 'falls back to browser detection');
	assert.deepEqual(preferences.defaultDoseTimes, ['08:00'], 'keeps the valid one');
	assert.ok(warnings.some((w) => w.includes('lunchtime')));
});
