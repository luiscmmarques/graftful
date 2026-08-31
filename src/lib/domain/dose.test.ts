import { test } from 'vitest';
import assert from 'node:assert/strict';

import { composedDose, planDoseChange, retiredProductsIn, therapyUsage } from './dose.ts';
import { activeDoseVersion, checkDoseConsistency, unitsPerDay } from './stock.ts';
import { exampleRegimen, SNAPSHOT } from './seed.ts';
import type { DoseSlot } from './types.ts';

/** 20 mg of alfa: 3 x 4 mg + 1 x 2 mg + 1 x 6 mg, all in the morning. */
const twenty: DoseSlot[] = [
	{
		time: '07:30',
		items: [
			{ productId: 'alfa-a', units: 3 },
			{ productId: 'alfa-b', units: 1 },
			{ productId: 'alfa-c', units: 1 }
		]
	}
];

test('a dose change closes the old version and opens a new one', () => {
	const state = exampleRegimen();
	const change = planDoseChange(state, {
		therapyId: 'therapy-alfa',
		effectiveFrom: '2021-09-15',
		slots: twenty,
		newVersionId: 'v-new'
	});

	assert.equal(change.kind, 'supersede');
	if (change.kind !== 'supersede') return;

	// The two versions meet exactly: activeTo is exclusive, so an off-by-one here
	// would leave a day that schedules nothing and consumes nothing.
	assert.equal(change.closed?.activeTo, '2021-09-15');
	assert.equal(change.created.activeFrom, '2021-09-15');
	assert.equal(change.closed?.activeTo, change.created.activeFrom);
});

test('the old dose stays true for the days it applied to', () => {
	const state = exampleRegimen();
	const change = planDoseChange(state, {
		therapyId: 'therapy-alfa',
		effectiveFrom: '2021-09-15',
		slots: twenty,
		newVersionId: 'v-new'
	});
	if (change.kind !== 'supersede' || !change.closed) throw new Error('expected a supersede');

	// Apply it the way the store would.
	state.doseVersions = [
		...state.doseVersions.filter((v) => v.id !== change.closed!.id),
		change.closed,
		change.created
	];

	assert.equal(unitsPerDay(state, 'alfa-c', '2021-09-14'), 0, 'not yet needed');
	assert.equal(unitsPerDay(state, 'alfa-c', '2021-09-15'), 1, 'needed from the change');
	assert.equal(
		activeDoseVersion(state.doseVersions, 'therapy-alfa', '2021-09-14')?.id,
		change.closed.id
	);
	assert.equal(activeDoseVersion(state.doseVersions, 'therapy-alfa', '2021-09-15')?.id, 'v-new');
});

test('changing the dose on the day it started corrects it instead of splitting it', () => {
	const state = exampleRegimen();
	const current = activeDoseVersion(state.doseVersions, 'therapy-alfa', SNAPSHOT);
	if (!current) throw new Error('expected an active version');

	const change = planDoseChange(state, {
		therapyId: 'therapy-alfa',
		effectiveFrom: current.activeFrom,
		slots: twenty,
		newVersionId: 'v-new'
	});

	// A zero-length version would otherwise be left behind.
	assert.equal(change.kind, 'correct');
	if (change.kind !== 'correct') return;
	assert.equal(change.version.id, current.id);
	assert.equal(change.version.activeFrom, current.activeFrom);
});

test('a change dated before the current dose is refused, not reconciled', () => {
	const state = exampleRegimen();
	assert.throws(
		() =>
			planDoseChange(state, {
				therapyId: 'therapy-alfa',
				effectiveFrom: '2016-01-01',
				slots: twenty,
				newVersionId: 'v-new'
			}),
		/already recorded as starting/
	);
});

test('an empty or zero composition is rejected', () => {
	const state = exampleRegimen();
	const base = { therapyId: 'therapy-alfa', effectiveFrom: '2021-09-15', newVersionId: 'v' };

	assert.throws(() => planDoseChange(state, { ...base, slots: [] }), /at least one time/);
	assert.throws(
		() => planDoseChange(state, { ...base, slots: [{ time: '07:30', items: [] }] }),
		/at least one product/
	);
	assert.throws(
		() =>
			planDoseChange(state, {
				...base,
				slots: [{ time: '07:30', items: [{ productId: 'alfa-a', units: 0 }] }]
			}),
		/above zero/
	);
});

test('a retired product needed by a new dose is reported', () => {
	const state = exampleRegimen();

	// The 6 mg capsule was retired when the dose came down from 20 to 14. Going back
	// up needs it again.
	const retired = retiredProductsIn(state.products, twenty);
	assert.deepEqual(
		retired.map((p) => p.id),
		['alfa-c']
	);
});

test('the total is derived from the units, never the other way round', () => {
	const state = exampleRegimen();
	const composed = composedDose(state.products, twenty);

	assert.equal(composed.perDay, 20);
	assert.equal(composed.unit, 'mg');
});

test('a dose mixing units reports no single total rather than converting', () => {
	const state = exampleRegimen();
	const mixed: DoseSlot[] = [
		{
			time: '07:30',
			items: [
				{ productId: 'alfa-a', units: 1 },
				{ productId: 'zeta-a', units: 1 }
			]
		}
	];

	assert.equal(composedDose(state.products, mixed).unit, null);
});

test('a composition that does not match what was prescribed is reported', () => {
	const state = exampleRegimen();
	const change = planDoseChange(state, {
		therapyId: 'therapy-alfa',
		effectiveFrom: '2021-09-15',
		// Told 20 mg, but only 14 mg entered — the 6 mg capsule was forgotten.
		slots: [
			{
				time: '07:30',
				items: [
					{ productId: 'alfa-a', units: 3 },
					{ productId: 'alfa-b', units: 1 }
				]
			}
		],
		declaredTotalDose: 20,
		declaredUnit: 'mg',
		newVersionId: 'v-new'
	});
	if (change.kind !== 'supersede') throw new Error('expected a supersede');

	const result = checkDoseConsistency(change.created, state.products);
	assert.equal(result.ok, false);
	if (result.ok) return;
	assert.equal(result.declared, 20);
	assert.equal(result.composed, 14);
});

test('a therapy that has been in force is stopped rather than deleted', () => {
	const state = exampleRegimen();
	assert.equal(therapyUsage(state, 'therapy-alfa', SNAPSHOT).canDelete, false);
});

test('a therapy entered today can be removed outright', () => {
	const state = exampleRegimen();
	state.therapies.push({
		id: 'oops',
		name: 'Mistyped',
		category: 'Maintenance A',
		isPrn: false,
		startedOn: SNAPSHOT
	});

	assert.equal(therapyUsage(state, 'oops', SNAPSHOT).canDelete, true);
});
