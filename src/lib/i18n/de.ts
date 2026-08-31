import type { Messages } from './messages.ts';

/**
 * German (international).
 *
 * Standard orthography, so "ß" where the rules call for it — Schließen, Größe, weiß —
 * while muss, müssen and erfassten keep "ss" after a short vowel. Deliberately not Swiss
 * German: the wording should read naturally in Bern and in Berlin.
 *
 * Siezen throughout, as with French. This is read by strangers of every age about their
 * own medication.
 *
 * Should be reviewed by a native speaker before launch.
 */
export const de: Messages = {
	nav: {
		today: 'Heute',
		stock: 'Bestand',
		order: 'Bestellung',
		setup: 'Einstellungen',
		sections: 'Bereiche'
	},
	footer: {
		menu: 'Menü',
		about: 'Über',
		roadmap: 'Fahrplan',
		privacy: 'Datenschutz',
		support: 'Unterstützen'
	},
	header: {
		elapsed: (days, years, months, d) =>
			`Tag ${days} · ${years} J. ${months} M. ${d} T. seit der Transplantation`,
		milestoneToday: (label) => `Heute ist ${label}.`,
		milestoneIn: (label, days) => `${label} in ${days} ${days === 1 ? 'Tag' : 'Tagen'}.`,
		anniversaryLabel: (years) =>
			`${years} ${years === 1 ? 'Jahr' : 'Jahre'} seit Ihrer Transplantation`,
		dayLabel: (day) => `Tag ${day}`
	},
	common: {
		loading: 'Wird geladen…',
		close: 'Schließen',
		none: 'Noch keine.',
		notInUse: 'nicht in Gebrauch',
		days: 'Tage'
	},
	today: {
		title: 'Heute',
		emptyTitle: 'Noch nichts eingerichtet',
		emptyBody:
			'Graftful speichert Ihren Einnahmeplan und Ihren Tablettenbestand auf diesem Gerät. Nichts wird übertragen, und es gibt kein Konto.',
		loadExample: 'Beispiel laden',
		setUpManually: 'Selbst einrichten',
		exampleNote:
			'Das Beispiel verwendet erfundene Medikamentennamen, sein Aufbau ist aber echt: elf Produkte, zwei Dosen aus mehreren Tabletten, eine halbe Tablette und ein Schmerzmittel nach Bedarf. Nützlich, um die Funktionsweise zu sehen, bevor Sie Ihre eigenen Daten eingeben.',
		needsReorder: (count) =>
			count === 1
				? '1 Produkt muss nachbestellt werden.'
				: `${count} Produkte müssen nachbestellt werden.`,
		openOrder: 'Zur Bestellung →',
		asNeeded: 'Nach Bedarf',
		noFixedSchedule: 'kein fester Zeitplan',
		summary: (pills, slots) =>
			`${pills} Tabletten pro Tag, verteilt auf ${slots} ${slots === 1 ? 'Einnahme' : 'Einnahmen'}.`
	},
	stock: {
		title: 'Bestand',
		empty: 'Noch keine Produkte. Fügen Sie sie unter Einstellungen hinzu.',
		orderNow: 'jetzt bestellen',
		runningLow: 'wird knapp',
		perBox: (size) => `${size} pro Packung`,
		left: (units) => `${units} übrig`,
		perDay: (units) => `${units} pro Tag`,
		nothingConsumes: 'Nichts verbraucht dieses Produkt: abgesetzt oder nur nach Bedarf',
		onOrder: (units) => `${units} bestellt`,
		openActions: 'Auffüllen, nachzählen oder Packungsgröße korrigieren',
		refillLabel: (size) => `Auffüllen, in Packungen mit ${size}`,
		addUnits: (units) => `${units} Stück hinzufügen`,
		recountLabel: 'Nachzählen: tatsächlich in der Packung',
		setTo: (units) => `Auf ${units} setzen`,
		refillVsRecount:
			'Auffüllen kommt zum erfassten Bestand hinzu. Nachzählen ersetzt ihn. Verwenden Sie das, wenn der Bestand abgewichen ist.',
		boxSizeLabel: 'Stück pro Packung, wie von der Apotheke abgegeben',
		boxSizeUnchanged: 'Packungsgröße unverändert',
		correctTo: (size) => `Auf ${size} korrigieren`,
		boxSizeNote:
			'Am Anfang weiß das niemand. Man erfährt es von der Apotheke, manchmal erst wenn die Packung ankommt. Korrigieren Sie es hier, sobald Sie die richtige Zahl kennen. Es ändert, wie viele Packungen künftige Bestellungen verlangen; an Ihrem heutigen Bestand ändert es nichts.'
	}
};
