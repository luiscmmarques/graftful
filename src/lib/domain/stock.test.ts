import { test } from 'vitest';
import assert from 'node:assert/strict';

import type { DoseVersion, Product, RegimenState, StockEvent } from './types.ts';
import {
	checkDoseConsistency,
	consumedBetween,
	projectedOnHand,
	stockOnHand,
	unitsPerDay
} from './stock.ts';
import { productStatuses } from './procurement.ts';
import { exampleRegimen, SHEET_JOURS, SNAPSHOT } from './seed.ts';

const product = (over: Partial<Product> = {}): Product => ({
	id: 'p1',
	brandName: 'Alfabine',
	strength: 5,
	strengthUnit: 'mg',
	form: 'capsule',
	packageSize: 50,
	minDays: 3,
	...over
});

test('refills accumulate as deltas', () => {
	const events: StockEvent[] = [
		{ id: '1', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-01-01' },
		{ id: '2', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-02-01' }
	];
	assert.equal(stockOnHand(events, 'p1'), 100);
});

test('a recount overrides everything before it', () => {
	const events: StockEvent[] = [
		{ id: '1', productId: 'p1', kind: 'refill', units: 300, occurredOn: '2026-01-01' },
		{ id: '2', productId: 'p1', kind: 'recount', units: 247, occurredOn: '2026-02-01' },
		{ id: '3', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-03-01' }
	];
	assert.equal(stockOnHand(events, 'p1'), 297);
});

test('events are applied in date order regardless of array order', () => {
	const events: StockEvent[] = [
		{ id: '3', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-03-01' },
		{ id: '1', productId: 'p1', kind: 'refill', units: 300, occurredOn: '2026-01-01' },
		{ id: '2', productId: 'p1', kind: 'recount', units: 10, occurredOn: '2026-02-01' }
	];
	assert.equal(stockOnHand(events, 'p1'), 60);
});

test('stock can be read as at a past date', () => {
	const events: StockEvent[] = [
		{ id: '1', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-01-01' },
		{ id: '2', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-06-01' }
	];
	assert.equal(stockOnHand(events, 'p1', '2026-03-01'), 50);
});

test('stock never goes negative', () => {
	const events: StockEvent[] = [
		{ id: '1', productId: 'p1', kind: 'refill', units: 10, occurredOn: '2026-01-01' },
		{ id: '2', productId: 'p1', kind: 'adjustment', units: -40, occurredOn: '2026-01-02' }
	];
	assert.equal(stockOnHand(events, 'p1'), 0);
});

test('burn rate sums every slot that uses the product', () => {
	const state = exampleRegimen();
	// Alfabine 4 mg: 3 capsules in a single morning slot.
	assert.equal(unitsPerDay(state, 'alfa-a', SNAPSHOT), 3);
	// Betacor 400 mg: one tablet morning and evening.
	assert.equal(unitsPerDay(state, 'beta-a', SNAPSHOT), 2);
});

test('half tablets are supported', () => {
	const state = exampleRegimen();
	// 15 mg prescribed from a 30 mg tablet.
	assert.equal(unitsPerDay(state, 'epsilon-a', SNAPSHOT), 0.5);
});

test('as-needed therapies contribute no daily rate', () => {
	const state = exampleRegimen();
	assert.equal(unitsPerDay(state, 'eta-a', SNAPSHOT), 0);
});

test('retired products are consumed by nothing', () => {
	const state = exampleRegimen();
	assert.equal(unitsPerDay(state, 'alfa-c', SNAPSHOT), 0);
	assert.equal(unitsPerDay(state, 'zeta-b', SNAPSHOT), 0);
});

test('dose versions are time-bounded, so history survives a dose change', () => {
	const state = exampleRegimen();
	// 16 mg during the taper: two 8 mg tablets.
	assert.equal(unitsPerDay(state, 'delta-a', '2016-04-01'), 2);
	// 8 mg afterwards: one tablet.
	assert.equal(unitsPerDay(state, 'delta-a', '2017-04-01'), 1);
});

test('a therapy contributes nothing before it started', () => {
	const state = exampleRegimen();
	assert.equal(unitsPerDay(state, 'epsilon-a', '2016-01-01'), 0);
});

test('the sheet burn rates reproduce its hand-kept Jours column', () => {
	const state = exampleRegimen();
	for (const [productId, expected] of Object.entries(SHEET_JOURS)) {
		const perDay = unitsPerDay(state, productId, SNAPSHOT);
		if (expected === null) {
			assert.equal(perDay, 0, `${productId} should have no daily rate`);
			continue;
		}
		const onHand = stockOnHand(state.stockEvents, productId, SNAPSHOT);
		assert.equal(onHand / perDay, expected, `${productId} days of cover`);
	}
});

test('a composition matching the prescribed dose passes the cross-check', () => {
	const products = [product({ id: 'a5', strength: 5 }), product({ id: 'a3', strength: 3 })];
	const version: DoseVersion = {
		id: 'v1',
		therapyId: 't1',
		activeFrom: '2026-01-01',
		declaredTotalDose: 18,
		declaredUnit: 'mg',
		slots: [
			{
				time: '07:30',
				items: [
					{ productId: 'a5', units: 3 },
					{ productId: 'a3', units: 1 }
				]
			}
		]
	};
	assert.deepEqual(checkDoseConsistency(version, products), { ok: true });
});

test('a mismatched composition is reported, not corrected', () => {
	const products = [product({ id: 'a5', strength: 5 })];
	const version: DoseVersion = {
		id: 'v1',
		therapyId: 't1',
		activeFrom: '2026-01-01',
		declaredTotalDose: 18,
		declaredUnit: 'mg',
		slots: [{ time: '07:30', items: [{ productId: 'a5', units: 3 }] }]
	};
	const result = checkDoseConsistency(version, products);
	assert.equal(result.ok, false);
	if (!result.ok) {
		assert.equal(result.declared, 18);
		assert.equal(result.composed, 15);
	}
});

test('a per-slot dose is accepted against a twice-daily composition', () => {
	const products = [product({ id: 'c400', strength: 400 }), product({ id: 'c200', strength: 200 })];
	const version: DoseVersion = {
		id: 'v1',
		therapyId: 't1',
		activeFrom: '2026-01-01',
		declaredTotalDose: 600,
		declaredUnit: 'mg',
		slots: [
			{
				time: '07:30',
				items: [
					{ productId: 'c400', units: 1 },
					{ productId: 'c200', units: 1 }
				]
			},
			{
				time: '19:30',
				items: [
					{ productId: 'c400', units: 1 },
					{ productId: 'c200', units: 1 }
				]
			}
		]
	};
	assert.deepEqual(checkDoseConsistency(version, products), { ok: true });
});

/*
 * Derived depletion.
 *
 * These exist because of a bug worth remembering: the ledger only moved when an
 * event was written, so stock never fell with time and no reorder alert could ever
 * fire. The ledger records observations; what happens between them is derived.
 */

const depleting = (over: Partial<RegimenState> = {}): RegimenState => ({
	settings: { targetHorizonDays: 60, transplantDate: '2016-01-11' },
	products: [product({ id: 'p1', packageSize: 50, minDays: 3 })],
	therapies: [
		{
			id: 't1',
			name: 'Alfabine',
			activeIngredient: 'therapy-alfa',
			category: 'Maintenance A',
			isPrn: false,
			startedOn: '2026-01-01'
		}
	],
	doseVersions: [
		{
			id: 'v1',
			therapyId: 't1',
			activeFrom: '2026-01-01',
			slots: [{ time: '07:30', items: [{ productId: 'p1', units: 2 }] }]
		}
	],
	stockEvents: [
		{ id: 's1', productId: 'p1', kind: 'recount', units: 100, occurredOn: '2026-01-01' }
	],
	orderLines: [],
	...over
});

test('the ledger itself still reports only what was observed', () => {
	// stockOnHand must stay a pure ledger — projectedOnHand is where time is applied.
	assert.equal(stockOnHand(depleting().stockEvents, 'p1', '2026-03-01'), 100);
});

test('stock falls as days pass, with none consumed on the day it was counted', () => {
	const state = depleting();
	assert.equal(projectedOnHand(state, 'p1', '2026-01-01'), 100, 'counted today, so untouched');
	assert.equal(projectedOnHand(state, 'p1', '2026-01-02'), 98, 'one day at 2 a day');
	assert.equal(projectedOnHand(state, 'p1', '2026-01-11'), 80);
});

test('stock reaches the reorder floor on its own, with no event written', () => {
	const state = depleting();

	// 100 units at 2 a day is 50 days of cover, so a 3-day floor is crossed on day 47.
	assert.equal(
		productStatuses(state, '2026-02-16').find((s) => s.productId === 'p1')!.mustOrder,
		false
	);
	assert.equal(
		productStatuses(state, '2026-02-17').find((s) => s.productId === 'p1')!.mustOrder,
		true
	);
});

test('a recount corrects accumulated drift', () => {
	const state = depleting({
		stockEvents: [
			{ id: 's1', productId: 'p1', kind: 'recount', units: 100, occurredOn: '2026-01-01' },
			// Ten days later the box actually holds 74, not the 80 predicted — a dose was
			// doubled up, or one was dropped down the sink.
			{ id: 's2', productId: 'p1', kind: 'recount', units: 74, occurredOn: '2026-01-11' }
		]
	});

	assert.equal(projectedOnHand(state, 'p1', '2026-01-11'), 74);
	assert.equal(
		projectedOnHand(state, 'p1', '2026-01-12'),
		72,
		'and depletion resumes from the truth'
	);
});

test('a refill lands on top of what depletion has already taken', () => {
	const state = depleting({
		stockEvents: [
			{ id: 's1', productId: 'p1', kind: 'recount', units: 100, occurredOn: '2026-01-01' },
			{ id: 's2', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-01-11' }
		]
	});

	// 100 − 20 consumed + 50 delivered.
	assert.equal(projectedOnHand(state, 'p1', '2026-01-11'), 130);
});

test('running empty does not quietly swallow part of the next delivery', () => {
	const state = depleting({
		stockEvents: [
			{ id: 's1', productId: 'p1', kind: 'recount', units: 10, occurredOn: '2026-01-01' },
			// The box ran dry on day 5; the refill arrives on day 20.
			{ id: 's2', productId: 'p1', kind: 'refill', units: 50, occurredOn: '2026-01-21' }
		]
	});

	// A negative balance carried forward would have given 50 − 30 = 20 here.
	assert.equal(projectedOnHand(state, 'p1', '2026-01-21'), 50);
});

test('depletion follows a dose change rather than averaging across it', () => {
	const state = depleting({
		doseVersions: [
			{
				id: 'v1',
				therapyId: 't1',
				activeFrom: '2026-01-01',
				activeTo: '2026-01-11',
				slots: [{ time: '07:30', items: [{ productId: 'p1', units: 4 }] }]
			},
			{
				id: 'v2',
				therapyId: 't1',
				activeFrom: '2026-01-11',
				slots: [{ time: '07:30', items: [{ productId: 'p1', units: 1 }] }]
			}
		]
	});

	// Ten days at 4, then five at 1 — 45, not 15 days of either single rate. Note the
	// dates touch: activeTo is exclusive, so a gap here would silently consume nothing.
	assert.equal(consumedBetween(state, 'p1', '2026-01-01', '2026-01-16'), 45);
});

test('a stopped therapy stops consuming', () => {
	const state = depleting({
		therapies: [
			{
				id: 't1',
				name: 'Deltacort',
				activeIngredient: 'therapy-delta',
				category: 'Maintenance A',
				isPrn: false,
				startedOn: '2026-01-01',
				stoppedOn: '2026-01-11'
			}
		]
	});

	assert.equal(
		consumedBetween(state, 'p1', '2026-01-01', '2026-01-31'),
		20,
		'ten days, then nothing'
	);
	assert.equal(projectedOnHand(state, 'p1', '2026-06-01'), 80, 'and the remainder just sits there');
});

test('a recount entered today wins over an earlier event on the same day', () => {
	/*
	 * The bug: both the ledger and the projection sorted by `occurredOn` alone — a date with
	 * no time. Events sharing a day therefore kept whatever order they arrived in, and since
	 * ids are random UUIDs that order is effectively arbitrary. So recounting to zero on a day
	 * that already had an event could be silently discarded: no error, no console message,
	 * nothing appears to happen. Recounting to zero is exactly what you do when you have run
	 * out, which is the moment the app most needs to be believed.
	 */
	const opened: StockEvent[] = [
		{
			id: 'zzz',
			productId: 'p',
			kind: 'recount',
			units: 150,
			occurredOn: '2026-08-31',
			recordedAt: '2026-08-31T08:00:00.000Z'
		},
		{
			id: 'aaa',
			productId: 'p',
			kind: 'recount',
			units: 0,
			occurredOn: '2026-08-31',
			recordedAt: '2026-08-31T19:00:00.000Z'
		}
	];

	// Whatever order the rows come back in, the count entered later is the current truth.
	assert.equal(stockOnHand(opened, 'p', '2026-08-31'), 0);
	assert.equal(stockOnHand([...opened].reverse(), 'p', '2026-08-31'), 0);
});
