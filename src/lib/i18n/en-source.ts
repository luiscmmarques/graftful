import type { Messages } from './messages.ts';

/** English. The source language: this file defines the shape every other must match. */
export const en: Messages = {
	nav: { today: 'Today', stock: 'Stock', order: 'Order', setup: 'Setup', sections: 'Sections' },
	footer: {
		menu: 'Menu',
		about: 'About',
		roadmap: 'Roadmap',
		privacy: 'Privacy',
		support: 'Support this'
	},
	header: {
		elapsed: (days, years, months, d) =>
			`Day ${days} · ${years}y ${months}m ${d}d since transplant`,
		milestoneToday: (label) => `Today is ${label}.`,
		milestoneIn: (label, days) => `${label} in ${days} ${days === 1 ? 'day' : 'days'}.`,
		anniversaryLabel: (years) => `${years} ${years === 1 ? 'year' : 'years'} since your transplant`,
		dayLabel: (day) => `day ${day}`
	},
	common: {
		loading: 'Loading…',
		close: 'Close',
		none: 'None yet.',
		notInUse: 'not in use',
		days: 'days'
	},
	today: {
		title: 'Today',
		emptyTitle: 'Nothing set up yet',
		emptyBody:
			'Graftful keeps your medication schedule and pill stock on this device. Nothing is uploaded, and there is no account.',
		loadExample: 'Load example regimen',
		setUpManually: 'Set up manually',
		exampleNote:
			'The example uses invented medicine names, but its shape is real: eleven products, two multi-product doses, a half tablet and an as-needed painkiller. Useful for seeing how it works before entering your own.',
		needsReorder: (count) =>
			count === 1 ? '1 product needs reordering.' : `${count} products need reordering.`,
		openOrder: 'Open the order list →',
		asNeeded: 'As needed',
		noFixedSchedule: 'no fixed schedule',
		summary: (pills, slots) =>
			`${pills} pills a day across ${slots} ${slots === 1 ? 'time' : 'times'}.`
	},
	stock: {
		title: 'Stock',
		empty: 'No products yet. Add them in Setup.',
		orderNow: 'order now',
		runningLow: 'running low',
		perBox: (size) => `${size} per box`,
		left: (units) => `${units} left`,
		perDay: (units) => `${units} a day`,
		nothingConsumes: 'Nothing consumes this: retired, or as-needed only',
		onOrder: (units) => `${units} on order`,
		openActions: 'Refill, recount or fix box size',
		refillLabel: (size) => `Refill, in boxes of ${size}`,
		addUnits: (units) => `Add ${units} units`,
		recountLabel: 'Recount: units actually in the box',
		setTo: (units) => `Set to ${units}`,
		refillVsRecount:
			'A refill adds to what is recorded. A recount replaces it. Use that when the count has drifted.',
		boxSizeLabel: 'Units per box, as the pharmacy dispenses it',
		boxSizeUnchanged: 'Box size unchanged',
		correctTo: (size) => `Correct to ${size}`,
		boxSizeNote:
			'Nobody knows this at the start. You find it out from the pharmacy, sometimes only when the box arrives. Correct it here whenever you learn the real figure. It changes how many boxes future orders ask for; it does not touch what you already have.'
	}
};
