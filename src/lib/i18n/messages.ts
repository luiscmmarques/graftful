/**
 * UI message catalogue.
 *
 * English is the source and defines the type; every other language must satisfy
 * `Messages`, so a missing or misspelled key is a compile error rather than a blank
 * space discovered by a user. Values are plain strings or functions — no template
 * parser, no build step, no runtime dependency.
 *
 * Migration is progressive and honest: keys live here only once all four languages have
 * been written. A screen still holding English literals is untranslated, not silently
 * falling back, so `npm run check` never goes green over a half-done language.
 *
 * On tone: the audience is people managing a lifelong condition, some of them newly
 * transplanted and frightened, many of them older. Every language should read calm and
 * plain — no exclamation marks, no encouragement, no cheerfulness about medication.
 */

export interface Messages {
	nav: {
		today: string;
		stock: string;
		order: string;
		setup: string;
		sections: string;
	};
	footer: {
		/** Label for the button that reveals the content pages. */
		menu: string;
		about: string;
		roadmap: string;
		privacy: string;
		support: string;
	};
	header: {
		/** "Day 3,886 · 10y 7m 20d since transplant" */
		elapsed: (days: string, years: number, months: number, d: number) => string;
		milestoneToday: (label: string) => string;
		milestoneIn: (label: string, days: number) => string;
		anniversaryLabel: (years: number) => string;
		dayLabel: (day: string) => string;
	};
	common: {
		loading: string;
		close: string;
		none: string;
		notInUse: string;
		days: string;
	};
	today: {
		title: string;
		emptyTitle: string;
		emptyBody: string;
		loadExample: string;
		setUpManually: string;
		exampleNote: string;
		needsReorder: (count: number) => string;
		openOrder: string;
		asNeeded: string;
		noFixedSchedule: string;
		/** "12.5 pills a day across 2 times." */
		summary: (pills: string, slots: number) => string;
	};
	stock: {
		title: string;
		empty: string;
		orderNow: string;
		runningLow: string;
		perBox: (size: number) => string;
		left: (units: string) => string;
		perDay: (units: string) => string;
		nothingConsumes: string;
		onOrder: (units: string) => string;
		openActions: string;
		refillLabel: (size: number) => string;
		addUnits: (units: number) => string;
		recountLabel: string;
		setTo: (units: number) => string;
		refillVsRecount: string;
		boxSizeLabel: string;
		boxSizeUnchanged: string;
		correctTo: (size: number) => string;
		boxSizeNote: string;
	};
}
