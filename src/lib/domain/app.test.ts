import { test } from 'vitest';
import assert from 'node:assert/strict';

import { pillsInSlots, pillsPerDay, prnTherapies, scheduleForDay } from './schedule.ts';
import { orderLineText, orderMailto, orderText } from './order-text.ts';
import { buildIcs, scheduleFingerprint } from './ics.ts';
import { planOrder, topUpCandidates } from './procurement.ts';
import { exampleRegimen, SNAPSHOT } from './seed.ts';

test('the day is grouped into slots in chronological order', () => {
	const slots = scheduleForDay(exampleRegimen(), SNAPSHOT);
	assert.deepEqual(
		slots.map((s) => s.time),
		['07:30', '19:30']
	);
});

test('a multi-product dose is reported with its derived total', () => {
	const morning = scheduleForDay(exampleRegimen(), SNAPSHOT)[0];
	const alfa = morning.entries.find((e) => e.therapyId === 'therapy-alfa');
	assert.ok(alfa);

	// 3 × 4 mg + 1 × 2 mg = 14 mg, from four capsules.
	assert.equal(alfa.items.length, 2);
	assert.equal(alfa.totalAmount, 14);
	assert.equal(alfa.totalUnit, 'mg');
	assert.equal(
		alfa.items.reduce((n, i) => n + i.units, 0),
		4
	);
});

test('half tablets survive into the schedule', () => {
	const morning = scheduleForDay(exampleRegimen(), SNAPSHOT)[0];
	const halfTablet = morning.entries.find((e) => e.therapyId === 'therapy-epsilon');
	assert.ok(halfTablet);
	assert.equal(halfTablet.items[0].units, 0.5);
	assert.equal(halfTablet.totalAmount, 15);
});

test('as-needed therapies are kept off the schedule', () => {
	const slots = scheduleForDay(exampleRegimen(), SNAPSHOT);
	const scheduled = slots.flatMap((s) => s.entries.map((e) => e.therapyId));
	assert.ok(!scheduled.includes('therapy-eta'));

	assert.deepEqual(
		prnTherapies(exampleRegimen(), SNAPSHOT).map((t) => t.id),
		['therapy-eta']
	);
});

test('the daily pill count matches the regimen', () => {
	// 4 Alfabine + 2×(1 Betacor 400 + 1 Betacor 200) + 2 Gammaphen
	// + 1 Deltacort + 0.5 Epsilonapril + 1 Zetacal = 12.5
	assert.equal(pillsPerDay(exampleRegimen(), SNAPSHOT), 12.5);
});

test('the schedule reflects the dose version in force', () => {
	// 16 mg of Deltacort during the taper: two tablets, not one.
	const morning = scheduleForDay(exampleRegimen(), '2016-06-01')[0];
	const delta = morning.entries.find((e) => e.therapyId === 'therapy-delta');
	assert.ok(delta);
	assert.equal(delta.items[0].units, 2);
	assert.equal(delta.totalAmount, 16);
});

test('an order line reads quantity, package, then product', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	const text = orderText(plan, { locale: 'fr' });

	// The shape a pharmacist actually receives: count first, because they are
	// picking boxes; package size second, because it says which box.
	assert.match(text, /^\d+ boîtes? x \d+ unités? - Alfabine 4 mg$/m);
	assert.doesNotMatch(text, /undefined/);
});

test('the dose form is never translated into pharmacy vocabulary', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	const text = orderText(plan, { locale: 'fr' });

	// Alfabine is technically a gélule and Gammaphen a comprimé, but nobody should have
	// to know that to place an order, and guessing wrong is worse than not saying.
	assert.doesNotMatch(text, /gélule|comprimé|capsule|tablet/);
	assert.match(text, /unités - Alfabine 4 mg/);
	assert.match(text, /unités - Gammaphen 60 mg/);
});

test('a product with no recorded form still produces a clean line', () => {
	// form is optional, so it must never leak "undefined" into a real email.
	assert.equal(
		orderLineText(
			{
				productId: 'p1',
				brandName: 'Alfabine',
				strength: 4,
				strengthUnit: 'mg',
				packages: 4,
				units: 200,
				coversToDays: null,
				capped: false,
				optional: false
			},
			'fr'
		),
		'4 boîtes x 50 unités - Alfabine 4 mg'
	);
});

test('the package size printed is the box the pharmacy dispenses', () => {
	// This strength comes as an outer carton of 150 and is also sold in 50s, so the
	// size is what says which package you mean. Asserted on the line formatter
	// directly, because at the snapshot it has 75 days of cover and is correctly
	// left off the order.
	assert.equal(
		orderLineText(
			{
				productId: 'beta-a',
				brandName: 'Betacor',
				strength: 400,
				strengthUnit: 'mg',
				packages: 1,
				units: 150,
				coversToDays: null,
				capped: false,
				optional: false
			},
			'fr'
		),
		'1 boîte x 150 unités - Betacor 400 mg'
	);
});

test('a requested collection time is folded into the sentence', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });

	assert.match(
		orderText(plan, { locale: 'fr', collectionNote: 'vendredi matin' }),
		/commander pour vendredi matin, si possible/
	);
	// And the sentence stays grammatical without one.
	assert.match(
		orderText(plan, { locale: 'fr' }),
		/J'aimerais commander les médicaments suivants :/
	);
});

test('order text omits lines with nothing to order', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	const text = orderText(plan, { locale: 'fr' });

	// Retired strengths have residual stock but nothing consuming them.
	assert.doesNotMatch(text, /Alfabine 6 mg/);
});

test('an as-needed product can be added by hand, since nothing could calculate it', () => {
	const state = exampleRegimen();

	// Etalgan has no daily rate, so the planner alone will never ask for it —
	// yet it appears on real orders, topped up while ordering anyway.
	const calculated = planOrder(state, SNAPSHOT, { force: true });
	assert.equal(
		calculated.lines.find((l) => l.productId === 'eta-a'),
		undefined
	);

	const withAddition = planOrder(state, SNAPSHOT, {
		force: true,
		additions: { 'eta-a': 1 }
	});
	const line = withAddition.lines.find((l) => l.productId === 'eta-a');
	if (!line) throw new Error('the requested addition is missing');

	assert.equal(line.packages, 1);
	assert.equal(line.units, 100, 'one box is what the pharmacy dispenses');
	assert.equal(line.optional, true);
	assert.equal(line.coversToDays, null, 'no rate means no answer to how long it lasts');
	assert.match(orderText(withAddition, { locale: 'fr' }), /Etalgan 2 g/);
});

test('the order the user reads their products in reaches the pharmacy', () => {
	/*
	 * The line order in `planOrder` is the line order in the email — `order-text.ts` renders
	 * them as they arrive. Before this it was an accident of the planner's loops: calculated
	 * lines in stored order, additions appended after, so asking for one extra box moved that
	 * product to the bottom of the message.
	 *
	 * Positions are put on two products only, which is the realistic case and also the one
	 * that catches treating an absent position as zero: the numbered pair must lead and
	 * everything else must follow by name.
	 */
	const state = exampleRegimen();
	const positioned = {
		...state,
		products: state.products.map((product) =>
			product.id === 'eta-a'
				? { ...product, sortOrder: 1 }
				: product.id === 'alfa-b'
					? { ...product, sortOrder: 2 }
					: product
		)
	};

	const plan = planOrder(positioned, SNAPSHOT, { force: true, additions: { 'eta-a': 1 } });
	const ids = plan.lines.map((line) => line.productId);

	assert.deepEqual(ids.slice(0, 2), ['eta-a', 'alfa-b'], 'numbered products lead, in their order');

	const rest = plan.lines.slice(2).map((line) => line.brandName);
	assert.deepEqual(
		rest,
		[...rest].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
		'the unnumbered remainder follows by name'
	);

	/*
	 * And the email agrees with the plan, which is the whole point of sorting in the planner.
	 *
	 * Located by the whole rendered line, not by brand name: two of the example products
	 * share a name and differ only by strength, so `indexOf(brandName)` returns the same
	 * position for both and the assertion passes on a coincidence.
	 */
	const text = orderText(plan, { locale: 'fr' });
	const positions = plan.lines
		.filter((line) => line.packages > 0)
		.map((line) => {
			const at = text.indexOf(orderLineText(line, 'fr'));
			if (at < 0) throw new Error(`${line.brandName} is missing from the order text`);
			return at;
		});

	assert.deepEqual(
		positions,
		[...positions].sort((a, b) => a - b),
		'the lines appear in the email in the same order as in the plan'
	);

	// The hand-added product is first in the email, not relegated to the bottom of it.
	assert.match(text.split('\n\n')[2], /^1 boîte x 100 unités - Etalgan 2 g$/m);
});

test('the pills in one dose are listed in the reading order too', () => {
	/*
	 * This is the list checked against what is in somebody's hand at seven in the morning, so
	 * it should read the same way every other screen does. It used to follow whatever order
	 * the composition rows were added in Setup, which is not an order anybody chose.
	 */
	const state = exampleRegimen();
	const multi = scheduleForDay(state, SNAPSHOT)
		.flatMap((slot) => slot.entries)
		.find((entry) => entry.items.length > 1);
	if (!multi) throw new Error('the example regimen has no multi-product dose');

	const byId = new Map(state.products.map((p) => [p.id, p]));
	const positioned = {
		...state,
		products: state.products.map((product) =>
			product.id === multi.items[multi.items.length - 1].productId
				? { ...product, sortOrder: 1 }
				: product
		)
	};

	const after = scheduleForDay(positioned, SNAPSHOT)
		.flatMap((slot) => slot.entries)
		.find((entry) => entry.therapyId === multi.therapyId);
	if (!after) throw new Error('the dose disappeared');

	assert.equal(
		after.items[0].productId,
		multi.items[multi.items.length - 1].productId,
		'the numbered product leads its dose'
	);
	assert.equal(after.items.length, multi.items.length, 'and nothing was lost in the sort');
	assert.ok(byId.has(after.items[0].productId));
});

test('the doses under one time follow the reading order as well', () => {
	/*
	 * Sorting the pills inside a dose was not enough. A time slot holds one entry per therapy
	 * and those were pushed in the order the therapies were stored, so a product numbered 1
	 * could still be read third on the one screen looked at every morning.
	 */
	const state = exampleRegimen();
	const morning = scheduleForDay(state, SNAPSHOT)[0];
	if (morning.entries.length < 2) throw new Error('the example regimen has a one-dose morning');

	// Number the product leading the *last* entry, so the expected move is unambiguous.
	const target = morning.entries[morning.entries.length - 1];
	const positioned = {
		...state,
		products: state.products.map((product) =>
			product.id === target.items[0].productId ? { ...product, sortOrder: 1 } : product
		)
	};

	const after = scheduleForDay(positioned, SNAPSHOT)[0];
	assert.equal(
		after.entries[0].therapyId,
		target.therapyId,
		'the dose holding the numbered product is read first'
	);
	assert.equal(after.entries.length, morning.entries.length, 'and no dose was lost in the sort');
	assert.deepEqual(
		[...after.entries.map((e) => e.therapyId)].sort(),
		[...morning.entries.map((e) => e.therapyId)].sort(),
		'the same therapies, reordered rather than replaced'
	);
});

test('numbering a product never reorders the times themselves', () => {
	/*
	 * The slots stay chronological whatever the products are called or numbered. Half past
	 * seven comes before half past nineteen because that is when the pills are swallowed —
	 * this is the one order on Today that is not the user's to choose.
	 */
	const state = exampleRegimen();
	const positioned = {
		...state,
		products: state.products.map((product, index) => ({ ...product, sortOrder: index + 1 }))
	};

	assert.deepEqual(
		scheduleForDay(positioned, SNAPSHOT).map((slot) => slot.time),
		['07:30', '19:30']
	);
	// The reorder is a display concern only: the same pills are still swallowed.
	assert.equal(pillsPerDay(positioned, SNAPSHOT), pillsPerDay(state, SNAPSHOT));
});

test('an unnumbered dose is read after every numbered one', () => {
	/*
	 * The absent-is-not-zero rule, at the level of a dose rather than a pill. Numbering one
	 * product must not appear to shuffle the therapies the user has said nothing about.
	 */
	const state = exampleRegimen();
	const morning = scheduleForDay(state, SNAPSHOT)[0];
	if (morning.entries.length < 2) throw new Error('the example regimen has a one-dose morning');

	const last = morning.entries[morning.entries.length - 1];
	const positioned = {
		...state,
		products: state.products.map((product) =>
			product.id === last.items[0].productId ? { ...product, sortOrder: 500 } : product
		)
	};

	const after = scheduleForDay(positioned, SNAPSHOT)[0];
	assert.equal(
		after.entries[0].therapyId,
		last.therapyId,
		'a single numbered product leads, however high its number'
	);
	assert.deepEqual(
		after.entries.slice(1).map((e) => e.therapyId),
		morning.entries.slice(0, -1).map((e) => e.therapyId),
		'and the unnumbered doses keep their existing relative order'
	);
});

test('counting a built day agrees with counting from the state', () => {
	/*
	 * Today renders the slots and the pill count together, so it counts the list it already
	 * has instead of rebuilding the whole day for a total. The two must not be able to drift:
	 * a summary line disagreeing with the pills listed above it reads as a bug in the regimen.
	 */
	const state = exampleRegimen();
	for (const asOf of [SNAPSHOT, '2016-06-01']) {
		assert.equal(pillsInSlots(scheduleForDay(state, asOf)), pillsPerDay(state, asOf));
	}
	assert.equal(pillsInSlots([]), 0, 'an empty day is zero pills, not NaN');
});

test('an addition can be requested when nothing has triggered an order', () => {
	const state = exampleRegimen();
	// No force, no trigger — asking for something is itself reason enough.
	const plan = planOrder(state, SNAPSHOT, { additions: { 'eta-a': 2 } });

	assert.equal(plan.triggeredBy.length, 0);
	assert.equal(plan.lines.length, 1);
	assert.equal(plan.lines[0].units, 200);
});

test('an addition to a calculated product increases that line rather than duplicating it', () => {
	const state = exampleRegimen();
	const plan = planOrder(state, SNAPSHOT, { force: true });
	const before = plan.lines.find((l) => l.productId === 'alfa-a');
	if (!before) throw new Error('expected a calculated line for Alfabine 4 mg');

	const bumped = planOrder(state, SNAPSHOT, { force: true, additions: { 'alfa-a': 1 } });
	const after = bumped.lines.filter((l) => l.productId === 'alfa-a');

	assert.equal(after.length, 1, 'one line per product');
	assert.equal(after[0].packages, before.packages + 1);
	assert.equal(after[0].optional, false, 'it is still a calculated line, just larger');
	assert.ok(
		after[0].coversToDays !== null && before.coversToDays !== null,
		'both carry a projection'
	);
	assert.ok(after[0].coversToDays > before.coversToDays, 'more stock covers more days');
});

test('top-up candidates are the products no calculation would ever request', () => {
	const candidates = topUpCandidates(exampleRegimen(), SNAPSHOT).map((c) => c.productId);

	assert.ok(candidates.includes('eta-a'), 'as-needed painkiller');
	assert.ok(!candidates.includes('alfa-a'), 'has a daily rate');
	assert.ok(!candidates.includes('alfa-c'), 'retired products are not offered');
});

test('order text omits lines with nothing to order', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	const text = orderText(plan, { locale: 'en' });
	// 600 days of cover against a 60-day target.
	assert.doesNotMatch(text, /Epsilonapril/);
});

test('a mailto is produced for a short order and refused for a long one', () => {
	const plan = planOrder(exampleRegimen(), SNAPSHOT, { force: true });
	assert.ok(orderMailto(plan, { locale: 'en' })?.startsWith('mailto:'));

	const huge = { ...plan, lines: Array.from({ length: 80 }, () => plan.lines[0]) };
	assert.equal(orderMailto(huge, { locale: 'en' }), null);
});

test('the ics has one recurring event per slot, each with an alarm', () => {
	const ics = buildIcs(exampleRegimen(), SNAPSHOT, { locale: 'en' });

	assert.equal(ics.match(/BEGIN:VEVENT/g)?.length, 3); // two slots + anniversary
	assert.equal(ics.match(/RRULE:FREQ=DAILY/g)?.length, 2);
	assert.equal(ics.match(/RRULE:FREQ=YEARLY/g)?.length, 1);
	assert.equal(ics.match(/BEGIN:VALARM/g)?.length, 3);
	assert.match(ics, /DTSTART;TZID=[A-Za-z_/]+:20210901T073000/);
});

test('the ics uses CRLF line endings, as RFC 5545 requires', () => {
	const ics = buildIcs(exampleRegimen(), SNAPSHOT);
	assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
	assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
	assert.ok(!/[^\r]\n/.test(ics), 'every LF should be preceded by CR');
});

test('the ics describes what to take', () => {
	const ics = buildIcs(exampleRegimen(), SNAPSHOT, { locale: 'en' });
	assert.match(ics, /3 × Alfabine 4mg/);
});

test('the anniversary can be excluded', () => {
	const ics = buildIcs(exampleRegimen(), SNAPSHOT, { includeAnniversary: false });
	assert.equal(ics.match(/RRULE:FREQ=YEARLY/g), null);
});

test('the fingerprint changes when a dose changes and is otherwise stable', () => {
	const state = exampleRegimen();
	const before = scheduleFingerprint(state, SNAPSHOT);

	assert.equal(scheduleFingerprint(exampleRegimen(), SNAPSHOT), before, 'stable across builds');

	const changed = exampleRegimen();
	const version = changed.doseVersions.find((v) => v.id === 'alfa-v1');
	assert.ok(version);
	version.slots[0].items[0].units = 4; // 14 mg -> 18 mg

	assert.notEqual(scheduleFingerprint(changed, SNAPSHOT), before);
});

test('calendar event UIDs stay stable when a dose changes, while SEQUENCE changes', () => {
	const before = exampleRegimen();
	const after = exampleRegimen();
	const version = after.doseVersions.find((v) => v.id === 'alfa-v1');
	assert.ok(version);
	version.slots[0].items[0].units = 4;

	const eventFields = (ics: string, field: 'UID' | 'SEQUENCE') =>
		ics
			.replace(/\r\n /g, '')
			.split('\r\n')
			.filter((line) => line.startsWith(`${field}:`));

	const first = buildIcs(before, SNAPSHOT, { locale: 'en', timeZone: 'Europe/Zurich' });
	const second = buildIcs(after, SNAPSHOT, { locale: 'en', timeZone: 'Europe/Zurich' });

	assert.deepEqual(
		eventFields(second, 'UID'),
		eventFields(first, 'UID'),
		'a dose change must update existing reminders rather than create duplicates'
	);
	assert.notDeepEqual(
		eventFields(second, 'SEQUENCE'),
		eventFields(first, 'SEQUENCE'),
		'the content change still needs a new iCalendar sequence'
	);
});

test('the fingerprint includes product labels, locale and timezone', () => {
	const state = exampleRegimen();
	const base = scheduleFingerprint(state, SNAPSHOT, {
		locale: 'en',
		timeZone: 'Europe/Zurich'
	});

	state.products[0].brandName = 'Renamed product';
	assert.notEqual(
		scheduleFingerprint(state, SNAPSHOT, { locale: 'en', timeZone: 'Europe/Zurich' }),
		base,
		'the calendar description changed'
	);
	assert.notEqual(
		scheduleFingerprint(exampleRegimen(), SNAPSHOT, {
			locale: 'fr',
			timeZone: 'Europe/Zurich'
		}),
		base,
		'the calendar language changed'
	);
	assert.notEqual(
		scheduleFingerprint(exampleRegimen(), SNAPSHOT, {
			locale: 'en',
			timeZone: 'Europe/Lisbon'
		}),
		base,
		'the reminder timezone changed'
	);
});

test('the fingerprint changes when the transplant date changes', () => {
	const state = exampleRegimen();
	const before = scheduleFingerprint(state, SNAPSHOT);
	state.settings.transplantDate = '2016-01-12';
	assert.notEqual(scheduleFingerprint(state, SNAPSHOT), before);
});

test('calendar events say where they came from and how to get back', () => {
	const ics = buildIcs(exampleRegimen(), SNAPSHOT, { locale: 'fr' });
	// Unfold before matching: RFC 5545 wraps at 75 octets, mid-URL if it has to.
	const unfolded = ics.replace(/\r\n /g, '');

	// A daily recurring event that outlives the memory of installing it needs to say
	// what created it, or a year later it is unidentifiable and gets deleted.
	assert.match(unfolded, /SUMMARY:\[Graftful\] Médicaments/);
	assert.match(unfolded, /URL:https:\/\/graftful\.app\/\?src=ics/);
	// And the description carries the link too, because most calendar apps show the
	// description but hide the URL property.
	assert.match(unfolded, /DESCRIPTION:.*graftful\.app\/\?src=ics/);
});

test('the anniversary event is labelled too', () => {
	const unfolded = buildIcs(exampleRegimen(), SNAPSHOT, { locale: 'en' }).replace(/\r\n /g, '');
	assert.match(unfolded, /SUMMARY:\[Graftful\] Transplant anniversary/);
});

test('the calendar is anchored to the given timezone, not a hardcoded one', () => {
	// This was pinned to Europe/Zurich, so every reminder fired at the wrong hour for
	// anyone outside Switzerland — and looked perfectly correct in the app that made it.
	const ics = buildIcs(exampleRegimen(), SNAPSHOT, { timeZone: 'America/Sao_Paulo' });

	assert.match(ics, /DTSTART;TZID=America\/Sao_Paulo:20210901T073000/);
	assert.doesNotMatch(ics, /Europe\/Zurich/);
});

test('any schedule is exported, not just a twice-daily one', () => {
	// Three doses at times nobody would have guessed. Twelve hours apart is a common
	// interval for twice-daily immunosuppressants, but it is not universal and the clock
	// times are agreed between a patient and their centre.
	const state = exampleRegimen();
	const version = state.doseVersions.find((v) => v.therapyId === 'therapy-alfa');
	if (!version) throw new Error('expected a dose version');

	version.slots = [
		{ time: '06:15', items: [{ productId: 'alfa-a', units: 1 }] },
		{ time: '14:45', items: [{ productId: 'alfa-a', units: 1 }] },
		{ time: '22:00', items: [{ productId: 'alfa-b', units: 2 }] }
	];

	const ics = buildIcs(state, SNAPSHOT, { timeZone: 'Europe/Lisbon' });
	for (const stamp of ['20210901T061500', '20210901T144500', '20210901T220000']) {
		assert.match(ics, new RegExp(`DTSTART;TZID=Europe/Lisbon:${stamp}`));
	}

	// And the Today screen shows them in order, interleaved with the other therapies'
	// unchanged times rather than forced into a shared pair of slots.
	assert.deepEqual(
		scheduleForDay(state, SNAPSHOT).map((slot) => slot.time),
		['06:15', '07:30', '14:45', '19:30', '22:00']
	);
});

test('changing a dose time makes the exported calendar stale', () => {
	// Otherwise the calendar keeps reminding at the old hour with nothing to indicate it.
	const before = exampleRegimen();
	const after = exampleRegimen();
	const version = after.doseVersions.find((v) => v.therapyId === 'therapy-alfa');
	if (!version) throw new Error('expected a dose version');
	version.slots[0].time = '06:00';

	assert.notEqual(scheduleFingerprint(before, SNAPSHOT), scheduleFingerprint(after, SNAPSHOT));
});

test('the anniversary reminder fires on the day, not the afternoon before', () => {
	/*
	 * The anniversary is an all-day event, so DTSTART is midnight. A negative trigger counts
	 * back from there: -PT540M put the reminder at 15:00 the previous day. Nobody reports a
	 * reminder that arrives a day early; they just stop trusting it.
	 */
	const unfolded = buildIcs(exampleRegimen(), SNAPSHOT, { locale: 'en' }).replace(/\r\n /g, '');
	const anniversary = unfolded
		.split('BEGIN:VEVENT')
		.find((block) => block.includes('RRULE:FREQ=YEARLY'));
	if (!anniversary) throw new Error('expected a yearly anniversary event');

	assert.match(anniversary, /TRIGGER:PT9H/);
	assert.doesNotMatch(anniversary, /TRIGGER:-/, 'a negative trigger lands on the previous day');
});
