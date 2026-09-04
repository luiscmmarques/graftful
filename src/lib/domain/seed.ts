/**
 * The example regimen.
 *
 * **The products here are fictional.** Alfabine, Betacor, Gammaphen, Deltacort,
 * Epsilonapril, Zetacal and Etalgan are invented names; none is a real medicine. This
 * repository is public, so a real regimen committed here would publish a complete list
 * of what somebody takes every day — a fairly precise medical history, and not
 * something worth handing over in exchange for a nicer demo.
 *
 * The *numbers* are real. Strengths, box sizes, pill counts, dose changes and stock
 * counts all come from a genuine post-transplant regimen whose spreadsheet carried a
 * hand-maintained "days of cover" column. That is what makes `SHEET_JOURS` worth
 * having: every expected figure in the tests was verified against years of actual use
 * rather than invented to make the code agree with itself. Two of the three most
 * valuable bugs in this project were found by these numbers disagreeing with the code.
 *
 * So: never adjust the arithmetic to make a test pass, and never swap the invented
 * names for real ones.
 *
 * The shape is deliberately awkward, because real regimens are:
 *   - two multi-product doses — 14 mg once daily = 3 x 4 mg + 1 x 2 mg, and
 *     600 mg twice daily = 1 x 400 mg + 1 x 200 mg
 *   - a half tablet
 *   - a therapy with two dose versions, so there is taper history
 *   - two retired strengths that still hold stock
 *   - an as-needed painkiller with no daily rate at all
 */

import type { RegimenState } from './types.ts';

export const SNAPSHOT = '2021-09-01';
export const TRANSPLANT_DATE = '2016-01-11';

/** Days of cover as recorded by hand in the original spreadsheet. */
export const SHEET_JOURS: Record<string, number | null> = {
	'alfa-a': 50,
	'alfa-b': 50,
	'alfa-c': null, // retired when the dose changed and this strength was dropped
	'beta-a': 75,
	'beta-b': 50,
	'gamma-a': 50,
	'delta-a': 200,
	'epsilon-a': 600,
	'zeta-a': 90,
	'zeta-b': null, // retired
	'eta-a': null // as-needed, no daily rate
};

/*
 * The counts are what the spreadsheet showed *on* the snapshot date, so by default
 * they are recorded on that date — see the `stockAsOf` option below. Dating them a day
 * earlier would have the engine derive one day of consumption before the snapshot and
 * shift every figure by one, which is exactly what caught the missing-depletion bug.
 */

/**
 * @param options.stockAsOf
 * Date to record the stock counts on. Defaults to the historical snapshot, which is
 * what the tests assert against.
 *
 * Pass today's date when loading this as a demonstration. Otherwise the counts are
 * years old, derived depletion correctly concludes every box emptied long ago, and
 * the example opens with eleven products in red — accurate, and a terrible first
 * impression for someone deciding whether to trust the app.
 *
 * Only the stock counts move. The transplant date and the dose history stay where
 * they were: they are the point of the example, and a taper that happened in 2016
 * should look like it happened in 2016.
 */
export function exampleRegimen(options: { stockAsOf?: string } = {}): RegimenState {
	const stockAt = options.stockAsOf ?? SNAPSHOT;

	return {
		settings: {
			/*
			 * Deliberately not the 30-day default a new setup gets. This is the horizon the
			 * real orders in `SHEET_JOURS` were placed with, and the procurement tests are
			 * calibrated against them — changing it here would quietly retune the regression
			 * baseline rather than test against it.
			 */
			targetHorizonDays: 60,
			transplantDate: TRANSPLANT_DATE
		},

		products: [
			{
				id: 'alfa-a',
				brandName: 'Alfabine',
				strength: 4,
				strengthUnit: 'mg',
				form: 'gélule',
				packageSize: 50,
				minDays: 3
			},
			{
				id: 'alfa-b',
				brandName: 'Alfabine',
				strength: 2,
				strengthUnit: 'mg',
				form: 'gélule',
				packageSize: 50,
				minDays: 3
			},
			{
				id: 'alfa-c',
				brandName: 'Alfabine',
				strength: 6,
				strengthUnit: 'mg',
				form: 'gélule',
				packageSize: 50,
				minDays: 3,
				retired: true
			},
			// 150 is the outer carton — 3 inner packs of 50. The same strength is also
			// sold in 50s, which is why a real order email states the box size: it says
			// which package you mean.
			{
				id: 'beta-a',
				brandName: 'Betacor',
				strength: 400,
				strengthUnit: 'mg',
				form: 'comprimé',
				packageSize: 150,
				minDays: 3
			},
			{
				id: 'beta-b',
				brandName: 'Betacor',
				strength: 200,
				strengthUnit: 'mg',
				form: 'gélule',
				packageSize: 100,
				minDays: 3
			},
			{
				id: 'gamma-a',
				brandName: 'Gammaphen',
				strength: 60,
				strengthUnit: 'mg',
				form: 'comprimé',
				packageSize: 100,
				minDays: 3
			},
			{
				id: 'delta-a',
				brandName: 'Deltacort',
				strength: 8,
				strengthUnit: 'mg',
				form: 'comprimé',
				packageSize: 100,
				minDays: 3
			},
			{
				id: 'epsilon-a',
				brandName: 'Epsilonapril',
				strength: 30,
				strengthUnit: 'mg',
				form: 'comprimé',
				packageSize: 100,
				minDays: 3
			},
			{
				id: 'zeta-a',
				brandName: 'Zetacal Forte',
				strength: 2,
				strengthUnit: 'g',
				form: 'comprimé',
				packageSize: 90,
				minDays: 3
			},
			{
				id: 'zeta-b',
				brandName: 'Zetacal Forte',
				strength: 1,
				strengthUnit: 'g',
				form: 'comprimé',
				packageSize: 30,
				minDays: 3,
				retired: true
			},
			{
				id: 'eta-a',
				brandName: 'Etalgan',
				strength: 2,
				strengthUnit: 'g',
				form: 'comprimé',
				packageSize: 100,
				minDays: 3
			}
		],

		/*
		 * Labels in French, and deliberately not clinical.
		 *
		 * "Maintenance A/B/C" and "Support A/B" were what the real clinical classes were
		 * replaced with when this fixture was anonymised, and they read exactly like what
		 * they are: placeholders. Someone evaluating the app sees obviously fake data on the
		 * first screen, which is the wrong first impression for the audience this is aimed at.
		 *
		 * What a person actually writes here is the name on the box, so the therapy name is
		 * just that. The category is how they group their own doses, not how a pharmacologist
		 * would: `Traitement de fond` covers everything taken every day whatever it is for,
		 * which is both what someone would write and — the reason it matters — free of any
		 * class information. Do not "improve" these back into real classes. Strengths and
		 * counts are still real, so `Anti-Rejet` beside them is enough for a clinician to
		 * name the molecule, which is precisely what the anonymisation removed.
		 *
		 * `activeIngredient` is gone rather than translated: it held `'gamma'` and
		 * `'epsilon'`, which were artefacts of the same pass, and the field is optional and
		 * display-only. An invented INN would be worse — the suffix is the class.
		 */
		therapies: [
			{
				id: 'therapy-alfa',
				name: 'Alfabine',
				category: 'Traitement de fond',
				isPrn: false,
				startedOn: '2016-05-28'
			},
			{
				id: 'therapy-beta',
				name: 'Betacor',
				category: 'Traitement de fond',
				isPrn: false,
				startedOn: '2016-03-17'
			},
			{
				id: 'therapy-gamma',
				name: 'Gammaphen',
				category: 'Traitement de fond',
				isPrn: false,
				startedOn: '2016-03-17'
			},
			{
				id: 'therapy-delta',
				name: 'Deltacort',
				category: 'Traitement de fond',
				isPrn: false,
				startedOn: '2016-03-11'
			},
			{
				id: 'therapy-epsilon',
				name: 'Epsilonapril',
				category: 'Traitement de fond',
				isPrn: false,
				startedOn: '2016-07-12'
			},
			{
				id: 'therapy-zeta',
				name: 'Zetacal',
				category: 'Complément',
				isPrn: false,
				startedOn: '2016-03-17'
			},
			{
				id: 'therapy-eta',
				name: 'Etalgan',
				category: 'Au besoin',
				isPrn: true,
				startedOn: '2016-01-20'
			}
		],

		doseVersions: [
			{
				id: 'alfa-v1',
				therapyId: 'therapy-alfa',
				activeFrom: '2016-05-28',
				declaredTotalDose: 14,
				declaredUnit: 'mg',
				slots: [
					{
						time: '07:30',
						items: [
							{ productId: 'alfa-a', units: 3 },
							{ productId: 'alfa-b', units: 1 }
						]
					}
				]
			},
			{
				id: 'beta-v1',
				therapyId: 'therapy-beta',
				activeFrom: '2021-08-29',
				declaredTotalDose: 600,
				declaredUnit: 'mg',
				slots: [
					{
						time: '07:30',
						items: [
							{ productId: 'beta-a', units: 1 },
							{ productId: 'beta-b', units: 1 }
						]
					},
					{
						time: '19:30',
						items: [
							{ productId: 'beta-a', units: 1 },
							{ productId: 'beta-b', units: 1 }
						]
					}
				]
			},
			{
				id: 'gamma-v1',
				therapyId: 'therapy-gamma',
				activeFrom: '2016-03-17',
				slots: [
					{ time: '07:30', items: [{ productId: 'gamma-a', units: 1 }] },
					{ time: '19:30', items: [{ productId: 'gamma-a', units: 1 }] }
				]
			},
			// Two versions, because some doses are reduced over time: a higher dose first,
			// lower later. This is the history the app has to keep, not just today's dose.
			{
				id: 'delta-v1',
				therapyId: 'therapy-delta',
				activeFrom: '2016-03-11',
				activeTo: '2016-09-01',
				declaredTotalDose: 16,
				declaredUnit: 'mg',
				slots: [{ time: '07:30', items: [{ productId: 'delta-a', units: 2 }] }]
			},
			{
				id: 'delta-v2',
				therapyId: 'therapy-delta',
				activeFrom: '2016-09-01',
				declaredTotalDose: 8,
				declaredUnit: 'mg',
				slots: [{ time: '07:30', items: [{ productId: 'delta-a', units: 1 }] }]
			},
			// 15 mg from a 30 mg tablet: half a tablet a day, so 0.5 units.
			{
				id: 'epsilon-v1',
				therapyId: 'therapy-epsilon',
				activeFrom: '2016-07-12',
				declaredTotalDose: 15,
				declaredUnit: 'mg',
				slots: [{ time: '07:30', items: [{ productId: 'epsilon-a', units: 0.5 }] }]
			},
			{
				id: 'zeta-v1',
				therapyId: 'therapy-zeta',
				activeFrom: '2016-03-17',
				slots: [{ time: '07:30', items: [{ productId: 'zeta-a', units: 1 }] }]
			}
		],

		/*
		 * recordedAt sits at the start of the day so anything entered later the same day wins
		 * the tie. Without it a recount made today competed with these on random id order.
		 */
		stockEvents: [
			{
				id: 's1',
				productId: 'alfa-a',
				kind: 'recount',
				units: 150,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's2',
				productId: 'alfa-b',
				kind: 'recount',
				units: 50,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's3',
				productId: 'alfa-c',
				kind: 'recount',
				units: 0,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's4',
				productId: 'beta-a',
				kind: 'recount',
				units: 150,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's5',
				productId: 'beta-b',
				kind: 'recount',
				units: 100,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's6',
				productId: 'gamma-a',
				kind: 'recount',
				units: 100,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's7',
				productId: 'delta-a',
				kind: 'recount',
				units: 200,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's8',
				productId: 'epsilon-a',
				kind: 'recount',
				units: 300,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's9',
				productId: 'zeta-a',
				kind: 'recount',
				units: 90,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's10',
				productId: 'zeta-b',
				kind: 'recount',
				units: 0,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			},
			{
				id: 's11',
				productId: 'eta-a',
				kind: 'recount',
				units: 30,
				occurredOn: stockAt,
				recordedAt: `${stockAt}T00:00:00.000Z`
			}
		],

		orderLines: []
	};
}
