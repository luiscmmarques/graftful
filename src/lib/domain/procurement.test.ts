import { test } from 'vitest';
import assert from 'node:assert/strict';

import type { RegimenState } from './types.ts';
import {
	planOrder,
	productStatuses,
	projectNextOrder,
	receiveOrder,
	productUsage,
	recountStock
} from './procurement.ts';
import { stockOnHand } from './stock.ts';
import { exampleRegimen, SHEET_JOURS, SNAPSHOT } from './seed.ts';

const statusFor = (state: RegimenState, id: string, asOf = SNAPSHOT) => {
	const found = productStatuses(state, asOf).find((s) => s.productId === id);
	// An explicit throw rather than assert.ok: assertion signatures do not narrow
	// the return type of an arrow function without an annotation.
	if (!found) throw new Error(`no status for ${id}`);
	return found;
};

/**
 * Two products, one at its floor and one comfortable, mirroring the scenario
 * this planner exists for: "I have 3 days of one and 30 days of another, so I
 * ask for two months of the first and one month more of the second."
 */
function twoProductState(): RegimenState {
	return {
		settings: { targetHorizonDays: 60, transplantDate: '2016-01-11' },
		products: [
			{
				id: 'urgent',
				brandName: 'Urgent',
				strength: 5,
				strengthUnit: 'mg',
				form: 'tablet',
				packageSize: 30,
				minDays: 3
			},
			{
				id: 'comfortable',
				brandName: 'Comfortable',
				strength: 5,
				strengthUnit: 'mg',
				form: 'tablet',
				packageSize: 30,
				minDays: 3
			}
		],
		therapies: [
			{ id: 't-urgent', name: 'Urgent', category: 'x', isPrn: false, startedOn: '2016-01-01' },
			{
				id: 't-comfortable',
				name: 'Comfortable',
				category: 'x',
				isPrn: false,
				startedOn: '2016-01-01'
			}
		],
		doseVersions: [
			{
				id: 'v-urgent',
				therapyId: 't-urgent',
				activeFrom: '2016-01-01',
				slots: [{ time: '07:30', items: [{ productId: 'urgent', units: 1 }] }]
			},
			{
				id: 'v-comfortable',
				therapyId: 't-comfortable',
				activeFrom: '2016-01-01',
				slots: [{ time: '07:30', items: [{ productId: 'comfortable', units: 1 }] }]
			}
		],
		stockEvents: [
			{ id: 'e1', productId: 'urgent', kind: 'recount', units: 3, occurredOn: '2026-01-01' },
			{ id: 'e2', productId: 'comfortable', kind: 'recount', units: 30, occurredOn: '2026-01-01' }
		],
		orderLines: []
	};
}

test('days of cover match the original spreadsheet exactly', () => {
	const statuses = productStatuses(exampleRegimen(), SNAPSHOT);
	for (const status of statuses) {
		assert.equal(
			status.daysRemaining,
			SHEET_JOURS[status.productId],
			`${status.productId} days remaining`
		);
	}
});

test('a zero burn rate reads as null, not as zero days left', () => {
	// A retired product holding residual stock is not urgent.
	assert.equal(statusFor(exampleRegimen(), 'alfa-c').daysRemaining, null);
	assert.equal(statusFor(exampleRegimen(), 'eta-a').daysRemaining, null);
});

test('nothing is flagged while every product is above its floor', () => {
	const statuses = productStatuses(exampleRegimen(), SNAPSHOT);
	assert.equal(statuses.filter((s) => s.mustOrder).length, 0);
});

test('crossing the floor triggers an order', () => {
	const state = twoProductState();
	assert.equal(statusFor(state, 'urgent', '2026-01-01').mustOrder, true);
	assert.equal(statusFor(state, 'comfortable', '2026-01-01').mustOrder, false);
});

test('no trigger means no plan', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT);
	assert.deepEqual(plan.triggeredBy, []);
	assert.deepEqual(plan.lines, []);
});

test('a plan can be previewed on demand without a trigger', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	assert.deepEqual(plan.triggeredBy, []);
	assert.ok(plan.lines.length > 0);
});

test('one product at its floor tops up every other product too', () => {
	const plan = planOrder(twoProductState(), '2026-01-01');

	assert.deepEqual(plan.triggeredBy, ['urgent']);

	const urgent = plan.lines.find((l) => l.productId === 'urgent');
	const comfortable = plan.lines.find((l) => l.productId === 'comfortable');
	assert.ok(urgent && comfortable, 'both products should appear on the order');

	// 60-day target, 1 tablet a day, 30 to a box.
	// Urgent: 3 in hand, needs 57 -> 2 boxes. Comfortable: 30 in hand, needs 30 -> 1 box.
	assert.equal(urgent.packages, 2);
	assert.equal(comfortable.packages, 1);

	// Which lands both within three days of each other: the alignment is the point.
	assert.equal(urgent.coversToDays, 63);
	assert.equal(comfortable.coversToDays, 60);
});

test('products already above the horizon are left off the order', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	// 600 days of cover against a 60-day target.
	assert.equal(
		plan.lines.find((l) => l.productId === 'epsilon-a'),
		undefined
	);
});

test('retired and as-needed products are never ordered automatically', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	for (const id of ['alfa-c', 'zeta-b', 'eta-a']) {
		assert.equal(
			plan.lines.find((l) => l.productId === id),
			undefined,
			id
		);
	}
});

test('an order cap is honoured and reported rather than silently ignored', () => {
	const state = twoProductState();
	state.products[0].maxOrderUnits = 30; // one box only
	const plan = planOrder(state, '2026-01-01');

	const urgent = plan.lines.find((l) => l.productId === 'urgent');
	assert.ok(urgent);
	assert.equal(urgent.packages, 1);
	assert.equal(urgent.capped, true);
});

test('an outstanding order suppresses the alert', () => {
	const state = twoProductState();
	state.orderLines.push({
		id: 'o1',
		productId: 'urgent',
		unitsOrdered: 60,
		orderedOn: '2026-01-01'
	});

	const status = statusFor(state, 'urgent', '2026-01-01');
	assert.equal(status.onOrder, 60);
	assert.equal(status.hasOpenOrder, true);
	// Still low on stock, but not nagging: it has already been requested.
	assert.equal(status.daysRemaining, 3);
	assert.equal(status.mustOrder, false);
});

test('ordering does not change stock; receiving does', () => {
	let state = twoProductState();
	state.orderLines.push({
		id: 'o1',
		productId: 'urgent',
		unitsOrdered: 60,
		orderedOn: '2026-01-01'
	});

	assert.equal(stockOnHand(state.stockEvents, 'urgent', '2026-01-02'), 3);

	state = receiveOrder(state, 'o1', 60, '2026-01-05');
	assert.equal(stockOnHand(state.stockEvents, 'urgent', '2026-01-05'), 63);
	assert.equal(statusFor(state, 'urgent', '2026-01-05').onOrder, 0);
});

test('a short delivery leaves the remainder outstanding', () => {
	let state = twoProductState();
	state.orderLines.push({
		id: 'o1',
		productId: 'urgent',
		unitsOrdered: 60,
		orderedOn: '2026-01-01'
	});

	// The pharmacy only had one box.
	state = receiveOrder(state, 'o1', 30, '2026-01-05');

	const status = statusFor(state, 'urgent', '2026-01-05');
	assert.equal(stockOnHand(state.stockEvents, 'urgent', '2026-01-05'), 33);
	assert.equal(status.onOrder, 30, 'the undelivered half stays visible');
});

test('a recount corrects drift without looking like a refill', () => {
	const state = recountStock(exampleRegimen(), 'alfa-a', 141, '2021-09-01');

	const event = state.stockEvents.at(-1);
	assert.equal(event?.kind, 'recount');
	assert.equal(stockOnHand(state.stockEvents, 'alfa-a', '2021-09-01'), 141);
	assert.equal(statusFor(state, 'alfa-a').daysRemaining, 47);
});

test('the next pharmacy run is projected from the tightest product', () => {
	const state = exampleRegimen();
	// Alfabine 2 mg and Betacor 200 mg both sit at 50 days, floor of 3.
	assert.equal(projectNextOrder(state, SNAPSHOT), '2021-10-18');
});

test('the projection accounts for the plan being received in full', () => {
	const plan = planOrder(twoProductState(), '2026-01-01');
	// Comfortable lands at 60 days with a 3-day floor: 57 days out.
	assert.equal(plan.projectedNextOrderOn, '2026-02-27');
});

test('the projection is null when nothing is being consumed', () => {
	const state = twoProductState();
	state.doseVersions = [];
	assert.equal(projectNextOrder(state, '2026-01-01'), null);
});

test('a product with history cannot be deleted, only retired', () => {
	const state = exampleRegimen();
	const usage = productUsage(state, 'alfa-a');

	assert.ok(usage.doseVersions > 0, 'a dose refers to it');
	assert.ok(usage.stockEvents > 0, 'stock was counted');
	assert.equal(usage.canDelete, false);
});

test('a retired product still counts as history', () => {
	// Alfabine 6 mg was dropped when the dose went 20 to 14 mg. Nothing consumes it,
	// but the dose version that once did is part of the record.
	const usage = productUsage(exampleRegimen(), 'alfa-c');

	assert.equal(usage.canDelete, false);
	assert.ok(usage.stockEvents > 0);
});

test('a product typed in by mistake can be deleted outright', () => {
	const state = exampleRegimen();
	state.products.push({
		id: 'typo',
		brandName: 'Mistyped',
		strength: 1,
		strengthUnit: 'mg',
		packageSize: 30,
		minDays: 3
	});

	const usage = productUsage(state, 'typo');
	assert.deepEqual(usage, { doseVersions: 0, stockEvents: 0, orderLines: 0, canDelete: true });
});
