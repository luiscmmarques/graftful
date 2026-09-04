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
		stockLabelled: (state) => `Bestand: ${state}`,
		stockEnough: 'ausreichend',
		days: 'Tage',
		save: 'Speichern',
		edit: 'Bearbeiten',
		errorPackageSize: 'Stück pro Packung muss eine ganze Zahl sein, mindestens 1.'
	},
	today: {
		title: 'Heute',
		metaDescription: 'Was heute zu nehmen ist, und wann.',
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
		metaDescription: 'Wie viele Tabletten übrig sind und wie lange sie reichen.',
		empty: 'Noch keine Produkte. Fügen Sie sie unter Einstellungen hinzu.',
		orderNow: 'jetzt bestellen',
		runningLow: 'wird knapp',
		perBox: (size) => `${size} pro Packung`,
		left: (units) => `${units} übrig`,
		perDay: (units) => `${units} pro Tag`,
		nothingConsumes: 'Nichts verbraucht dieses Produkt: abgesetzt oder nur nach Bedarf',
		onOrder: (units) => `${units} bestellt`,
		openActions: 'Ändern',
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
			'Am Anfang weiß das niemand. Man erfährt es von der Apotheke, manchmal erst wenn die Packung ankommt. Korrigieren Sie es hier, sobald Sie die richtige Zahl kennen. Es ändert, wie viele Packungen künftige Bestellungen verlangen; an Ihrem heutigen Bestand ändert es nichts.',
		errorBoxes: 'Die Anzahl Packungen muss eine ganze Zahl sein, mindestens 1.',
		errorCount: 'Eine Zählung kann nicht negativ sein.'
	},
	order: {
		title: 'Bestellung',
		metaDescription: 'Eine Apothekenbestellung vorbereiten, bevor etwas ausgeht.',
		nothingNeeded: 'Es muss nichts bestellt werden.',
		nextRunAround: (date) => `Der nächste Apothekengang wird um den ${date} erwartet.`,
		nothingConsumedYet: 'Noch wird kein Produkt verbraucht.',
		forceOrder: 'Trotzdem alles früher bestellen',
		atReorderPoint: (count) =>
			count === 1
				? '1 Produkt ist auf oder unter dem Nachbestellpunkt.'
				: `${count} Produkte sind auf oder unter dem Nachbestellpunkt.`,
		daysLeft: (days) => `${days} Tage übrig`,
		jointNote:
			'Alles andere wird auf denselben Horizont aufgefüllt, damit die nächste Bestellung ein einzelner Apothekengang wird und nicht mehrere.',
		addAnythingTitle: 'Noch etwas hinzufügen?',
		addAnythingNote:
			'Nichts verbraucht diese nach einem Plan, also wird keine Berechnung sie je verlangen, aber sie gehen ebenfalls aus. Es lohnt sich, sie gleich mitzubestellen.',
		boxesOf: (size) => `Packungen mit ${size}`,
		oneBoxFewer: 'Eine Packung weniger',
		oneBoxMore: 'Eine Packung mehr',
		suggestedTitle: 'Vorgeschlagene Bestellung',
		whenReadyLabel: 'Wann möchten Sie sie bereit haben? (optional)',
		whenReadyPlaceholder: 'Freitagmorgen',
		capped: 'begrenzt',
		addedByYou: 'von Ihnen hinzugefügt',
		coversTo: (days) => `deckt ${days} Tage`,
		nextRunAfter: (date) => `Nach dieser Bestellung wird der nächste Gang um den ${date} erwartet.`,
		copied: 'Kopiert',
		copyText: 'Bestelltext kopieren',
		openInEmail: 'In E-Mail öffnen',
		markOrdered: 'Als bestellt markieren',
		markOrderedNote:
			'Als bestellt markieren erfasst die Anfrage und beendet die Erinnerung. Ihr Bestand ändert sich dadurch nicht: das geschieht, wenn die Bestellung ankommt.',
		fullText: 'Vollständiger Bestelltext',
		awaitingTitle: 'Warten auf Abholung',
		outstanding: (units, date) => `${units} Stück offen, bestellt am ${date}`,
		receivedFull: 'Vollständig erhalten',
		receivedOneBox: 'Nur 1 Packung erhalten',
		partialNote:
			'Diese Produkte werden oft nicht vollständig abgegeben. Eine Teillieferung zu erfassen hält den Rest sichtbar, statt ihn stillschweigend zu verlieren.',
		fixBoxSize: 'Wenn die Packung eine andere Größe hatte, korrigieren Sie sie unter Bestand →'
	},
	setup: {
		title: 'Einstellungen',
		metaDescription: 'Ihre Produkte, Dosen, Erinnerungen und Sicherungen.',

		remindersTitle: 'Erinnerungen',
		icsNever:
			'Keine Web-API kann eine Benachrichtigung lokal planen, daher laufen Erinnerungen über den Kalender Ihres Telefons. Einmal exportieren und die Datei in Ihre Kalender-App importieren.',
		icsStaleTitle: 'Ihr Kalender ist nicht mehr aktuell.',
		icsStaleBody:
			'Zeitplan, Sprache oder Zeitzone haben sich seit dem letzten Export geändert. Exportieren Sie erneut und importieren Sie die Datei wieder. Bestehende Erinnerungen zu denselben Zeiten werden aktualisiert; wurde eine Zeit entfernt oder geändert, löschen Sie die alte Graftful-Erinnerung zuerst aus Ihrem Kalender.',
		icsCurrent: 'Ihr Kalender entspricht dem aktuellen Zeitplan.',
		exportIcs: 'Erinnerungen exportieren (.ics)',
		icsNote:
			'Medikamente nach Bedarf bleiben ausgenommen, weil es keinen Zeitplan gibt, der in einen Kalender passt. Push-Benachrichtigungen mit einer Schaltfläche „genommen“ kommen in einer späteren Version.',

		languageTitle: 'Sprache',
		languageLabel: 'Sprache für die App, die Apothekenbestellung und den Kalenderexport',
		followBrowser: (language) => `Meinem Browser folgen (${language})`,
		languageNote:
			'Das legt die Sprache der Bildschirme und der beiden Dinge fest, die die App verlassen: die Bestellung, die Sie Ihrer Apotheke senden, und die Kalenderdatei. So können Sie von einem englischen Telefon eine französische Bestellung senden.',

		timesTitle: 'Ihre gewohnten Zeiten',
		timesLabel: 'Wann Sie normalerweise Medikamente nehmen, mit Komma getrennt',
		saveTimes: 'Zeiten speichern',
		errorNotATime: (values) => `Keine Uhrzeit: ${values}. Verwenden Sie HH:MM, zum Beispiel 08:00.`,
		errorNoTime: 'Geben Sie mindestens eine Uhrzeit an, zum Beispiel 08:00.',
		timesNote:
			'Wird nur verwendet, um die Zeiten auszufüllen, wenn Sie etwas Neues hinzufügen. Jede Dose behält ihre eigenen, und Sie können jede einzeln ändern. Tragen Sie ein, was Sie mit Ihrem Zentrum vereinbart haben; Graftful schlägt keinen Abstand vor, denn wie weit Ihre Dosen auseinanderliegen sollen, entscheiden Ihre Ärztin oder Ihr Arzt.',

		detailsTitle: 'Ihre Angaben',
		transplantDate: 'Datum der Transplantation',
		horizonLabel: 'Auffüllhorizont in Tagen: wie weit eine Bestellung vorausreichen soll',
		errorBadDate: 'Dieses Datum gibt es nicht. Verwenden Sie JJJJ-MM-TT.',
		errorHorizon: 'Der Horizont muss eine ganze Zahl von Tagen sein, mindestens 1.',

		productsTitle: 'Produkte',
		reorderAt: (days) => `nachbestellen bei ${days} T.`,
		retired: 'abgesetzt',
		brandName: 'Handelsname',
		strength: 'Stärke',
		unit: 'Einheit',
		unitWholePill: 'cp (ganze Tablette)',
		unitsPerBox: 'Stück pro Packung',
		unitsPerBoxAsk: 'Stück pro Packung (in der Apotheke fragen)',
		reorderFloor: 'Nachbestellschwelle (Tage)',
		form: 'Form (optional)',
		formPlaceholder: 'Tablette, Kapsel…',
		saveChanges: 'Änderungen speichern',
		errorProductFields:
			'Prüfen Sie Name, Stärke, Stück pro Packung und Nachbestellschwelle — jedes muss eine positive Zahl sein.',
		confirmDeleteProduct: 'Dieses Produkt endgültig löschen?',
		errorCouldNotDelete: 'Löschen nicht möglich',
		restoreProduct: 'Dieses Produkt wieder verwenden',
		restoreProductNote:
			'Wiederherstellen nimmt es zurück in die Zeitplan-Berechnungen und in die Bestellliste.',
		retire: 'Absetzen',
		retireNote:
			'Absetzen ist der Weg, etwas nicht mehr zu verwenden. Es bleibt in Ihrer Historie, behält seinen Bestand, und frühere Bestellungen ergeben weiterhin Sinn. Es fällt lediglich aus der Bestellung heraus. Das ist die richtige Wahl, wenn eine Stärke vom Markt genommen wird oder sich eine Dose ändert.',
		deletePermanently: 'Endgültig löschen',
		deleteProductNote:
			'Nichts verweist auf dieses Produkt, das Löschen verliert also nichts. Verwenden Sie das für einen Eintrag, der aus Versehen entstanden ist.',
		cannotDeleteProduct: (doses, stockEvents, orders) =>
			`Löschen nicht möglich: es kommt in ${doses} ${doses === 1 ? 'Dose' : 'Dosen'}, ${stockEvents} ${stockEvents === 1 ? 'Bestandseintrag' : 'Bestandseinträgen'} und ${orders} ${orders === 1 ? 'Bestellung' : 'Bestellungen'} vor. Es zu entfernen würde eine Historie hinterlassen, die nicht mehr aufgeht. Setzen Sie es stattdessen ab.`,
		addProduct: 'Ein Produkt hinzufügen',
		unitsOnHand: 'Vorhandene Stück',
		addProductButton: 'Produkt hinzufügen',
		errorProductName: 'Geben Sie dem Produkt einen Namen.',
		errorStrength: 'Die Stärke muss eine positive Zahl sein.',
		errorMinDays: 'Die Nachbestellschwelle muss eine ganze Zahl von Tagen sein.',
		errorStockNegative: 'Vorhandene Stück können nicht negativ sein.',
		addProductNote:
			'Wenn Sie die Packungsgröße noch nicht kennen, tragen Sie Ihre beste Schätzung ein. Sie können sie hier oder unter Bestand korrigieren, sobald die Apotheke es Ihnen sagt, und sie beeinflusst nur, wie viele Packungen eine Bestellung verlangt.',

		therapiesTitle: 'Therapien',
		asNeededInline: 'nach Bedarf',
		doseVersions: (count) => `${count} ${count === 1 ? 'Dosisversion' : 'Dosisversionen'}`,
		stoppedOn: (date) => `beendet am ${date}`,
		name: 'Name',
		category: 'Kategorie',
		activeIngredient: 'Wirkstoff (optional)',
		activeIngredientPlaceholder: 'die Morgendosis',
		startedOn: 'Begonnen am',
		asNeededCheckbox: 'Nach Bedarf (kein Zeitplan)',
		saveDetails: 'Angaben speichern',
		doseHistoryTitle: 'Dosisverlauf',
		now: 'jetzt',
		perDayUnit: (amount, unit) => `${amount} ${unit}/Tag`,
		doseMismatch: (declared, composed, unit) =>
			`Erfasst als ${declared} ${unit} verordnet, die aufgeführten Produkte ergeben aber ${composed} ${unit}. Ein Blick auf Ihr Rezept lohnt sich.`,
		changeDoseTitle: 'Die Dose ändern',
		changeDoseNote:
			'Geben Sie ein, was Sie tatsächlich nehmen werden. Der Gesamtwert wird daraus errechnet, niemals umgekehrt, denn nur Ihre Ärztin oder Ihr Arzt kann entscheiden, wie eine Dose zusammengesetzt ist.',
		firstDayLabel: 'Erster Tag der neuen Dose',
		time: 'Uhrzeit',
		removeTime: 'Uhrzeit entfernen',
		product: 'Produkt',
		retiredParen: '(abgesetzt)',
		pills: 'Tabletten',
		removeProduct: 'Dieses Produkt entfernen',
		addProductHere: 'Hier ein Produkt hinzufügen',
		addAnotherTime: 'Weitere Uhrzeit hinzufügen',
		declaredLabel: 'Was die Ärztin oder der Arzt gesagt hat (optional)',
		entryComesTo: 'Was Sie eingegeben haben, ergibt',
		perDayAmount: (amount, unit) => `${amount} ${unit} pro Tag`,
		declaredMismatch: (declared, unit) =>
			`, was nicht den ${declared} ${unit} entspricht, die Sie erfasst haben.`,
		retiredWarning: (names, count) =>
			count === 1
				? `${names} ist abgesetzt. Wenn Sie dies speichern, wird es wieder verwendet und damit erneut eingeplant und bestellt.`
				: `${names} sind abgesetzt. Wenn Sie dies speichern, werden sie wieder verwendet und damit erneut eingeplant und bestellt.`,
		saveNewDose: 'Die neue Dose speichern',
		errorBadStartDate: 'Dieses Startdatum gibt es nicht. Verwenden Sie JJJJ-MM-TT.',
		errorSlotTime: (value) =>
			`„${value}“ ist keine Uhrzeit. Verwenden Sie HH:MM, zum Beispiel 08:00.`,
		errorUnits: 'Jedes Produkt braucht eine Menge über null.',
		errorChooseProduct: 'Wählen Sie für jede Zeile ein Produkt.',
		errorSaveDose: 'Die Dose konnte nicht gespeichert werden',
		changeDoseFooter:
			'Die Dose, die Sie jetzt nehmen, bleibt in Ihrer Historie und endet am Tag vor dem Beginn dieser neuen. Ihre Kalendererinnerungen müssen danach erneut exportiert werden.',
		resumeTherapy: 'Diese Therapie wieder aufnehmen',
		stopTherapy: 'Diese Therapie beenden',
		stopTherapyNote:
			'Beenden setzt dem Verbrauch ab heute ein Ende und behält jede erfasste Dose, sodass nachvollziehbar bleibt, was Sie wann genommen haben.',
		cannotDeleteTherapy: (since, doses) =>
			doses === 1
				? `Löschen nicht möglich: sie ist seit dem ${since} in Gebrauch, und ihre eine erfasste Dose ist der Nachweis dessen, was Sie genommen haben. Beenden Sie sie stattdessen.`
				: `Löschen nicht möglich: sie ist seit dem ${since} in Gebrauch, und ihre ${doses} erfassten Dosen sind der Nachweis dessen, was Sie genommen haben. Beenden Sie sie stattdessen.`,
		confirmDeleteTherapy: 'Diese Therapie und ihre Dosen löschen?',
		addTherapy: 'Eine Therapie hinzufügen',
		timesCommaLabel: 'Uhrzeiten, mit Komma getrennt',
		addTherapyDoseNote:
			'Was zu jeder dieser Zeiten genommen wird. Eine Dose kann mehrere Produkte kombinieren: 14 mg der Morgendosis sind 3 × 4 mg plus 1 × 2 mg.',
		pillsPerTime: 'Tabletten pro Einnahme',
		addProductToDose: 'Ein Produkt zu dieser Dose hinzufügen',
		sameCombinationNote: (changeDoseLabel) =>
			`Dieselbe Kombination wird zu jeder aufgeführten Zeit verwendet. Für unterschiedliche Morgen- und Abenddosen fügen Sie sie hier hinzu und verwenden dann oben ${changeDoseLabel}, wo jede Zeit einzeln bearbeitet wird.`,
		addTherapyButton: 'Therapie hinzufügen',
		errorTherapyName: 'Geben Sie der Therapie einen Namen.',
		errorTimes: 'Prüfen Sie die Uhrzeiten: verwenden Sie HH:MM, zum Beispiel 08:00.',
		errorProductQuantity: 'Wählen Sie für jede Zeile ein Produkt und eine positive Menge.',

		dataTitle: 'Ihre Daten',
		dataNote:
			'Alles wird auf diesem Gerät gespeichert. Das Löschen Ihrer Browserdaten löscht es mit, bewahren Sie also eine Sicherung auf.',
		storageNotGuaranteed:
			'Dieser Browser garantiert nicht, dass die hier gespeicherten Daten dauerhaft sind; sie könnten entfernt werden, wenn der Speicherplatz auf dem Gerät knapp wird. Der Schutz dagegen ist, von Zeit zu Zeit eine Sicherung zu exportieren.',
		exportBackup: 'Sicherung exportieren (JSON)',
		importBackup: 'Sicherung importieren',
		errorNothingToExport:
			'Noch nichts zu exportieren — auf diesem Gerät gibt es keinen Einnahmeplan.',
		errorImportFailed: 'Import fehlgeschlagen',
		confirmImport:
			'Diese Sicherung zu importieren ersetzt jedes Produkt, jede Dose, jede Bestandszählung und jede Bestellung auf diesem Gerät. Fortfahren?',
		restoredWithProblems: (count) =>
			`Wiederhergestellt, mit ${count} ${count === 1 ? 'Problem' : 'Problemen'}:`,

		dangerTitle: 'Achtung',
		deleteAll: 'Alle Daten löschen',
		deleting: 'Wird gelöscht…',
		confirmDeleteAll: 'Alles auf diesem Gerät löschen?',
		deleteDone: 'Alles auf diesem Gerät wurde gelöscht.',
		errorDeleteFailed: 'Löschen fehlgeschlagen'
	},
	about: {
		title: 'Über Graftful',
		metaDescription: 'Was Graftful tut, was es bewusst nicht tut, und wer es gemacht hat.',
		intro:
			'Graftful hilft Menschen mit Langzeitmedikation dabei, den Überblick zu behalten: was zu nehmen ist, wie viel noch da ist und wann nachbestellt werden muss. Es wurde für transplantierte Menschen gebaut, die für den Rest ihres Lebens täglich dieselben Medikamente nehmen und für die es keine Kleinigkeit ist, wenn etwas ausgeht.',
		introNote:
			'Es ist kostenlos, hat kein Konto, keine Werbung und funktioniert offline. Nichts über Ihre Gesundheit verlässt Ihr Gerät.',
		purposeTitle: 'Wofür es da ist',
		purposeStatement:
			'Graftful ist ein Selbstmanagement-Werkzeug für Menschen mit Langzeitmedikation. Es speichert einen von der Nutzerin oder dem Nutzer eingegebenen Einnahmeplan, erinnert an fällige Dosen, verfolgt, wie viele Tabletten noch vorhanden sind, und hilft bei der Vorbereitung einer Apothekenbestellung. Es gibt keine medizinischen Ratschläge, interpretiert keine klinischen Daten und bestimmt oder schlägt keine Dosis vor.',
		notTitle: 'Was es bewusst nicht tun wird',
		notIntro:
			'Das sind keine fehlenden Funktionen. Das ist die Grenze, die dies zu einem Nachverfolgungswerkzeug macht und nicht zu etwas, das als Medizinprodukt reguliert werden müsste. Und, einfacher gesagt: das sind Entscheidungen Ihrer Ärztin oder Ihres Arztes und nicht einer App.',
		notDoseLead: 'Eine Dosis berechnen',
		notDoseBody: 'aus einem Blutwert, Ihrem Gewicht oder einem Untersuchungsergebnis.',
		notCombinationLead: 'Bestimmen, welche Tabletten eine Dosis ergeben.',
		notCombinationBody:
			'Auf „14 mg“ hin entscheidet es nicht, dass das drei Kapseln mit 4 mg und eine mit 2 mg bedeutet. Sie geben ein, was Ihnen verordnet wurde. Es gibt echte klinische Gründe, warum eine bestimmte Zusammensetzung gewählt wird.',
		notMissedDoseLead: 'Ihnen sagen, was bei einer vergessenen Dosis zu tun ist.',
		notMissedDoseBody:
			'Es zeigt Ihnen, dass eine Dosis versäumt wurde und wann sie fällig war. Was als Nächstes zu tun ist, ist eine Frage für Ihr Transplantationszentrum.',
		notInteractions: 'Vor Wechselwirkungen warnen.',
		notLabResultLead: 'Ein Laborergebnis interpretieren.',
		notLabResultBody:
			'Einen Talspiegel zu notieren ist ein Tagebucheintrag, und das ist in Ordnung. Ihn rot einzufärben oder „außerhalb des Bereichs“ zu nennen, ist ein Urteil, das diese App nicht fällt.',
		notDatabaseLead: 'Mit einer Medikamentendatenbank kommen.',
		notDatabaseBody:
			'Jede Dose in Graftful wurde von Ihnen eingetragen, es ist also nie die Quelle einer klinischen Zahl.',
		arithmeticNote:
			'Es rechnet durchaus mit den Zahlen, die Sie eingegeben haben: wie viele Tage Ihr Bestand reicht und wie viele Packungen bei der Apotheke zu verlangen sind. Wenn Sie eine Gesamtdosis erfassen und die aufgeführten Tabletten diese nicht ergeben, sagt Graftful, dass die beiden nicht übereinstimmen. Es vergleicht Ihre eigenen zwei Zahlen und entscheidet nie, welche richtig ist.',
		nameTitle: 'Woher der Name kommt',
		nameGraft:
			'Ein „graft“ ist im Englischen das Transplantat selbst: die Niere, die Leber, das Herz oder die Lunge, die jemand Ihnen gegeben hat. Das Wort ist älter als die Medizin: es kommt aus dem Gartenbau, wo Pfropfen bedeutet, lebendes Gewebe einer Pflanze mit einer anderen zu verbinden, sodass beide als eine weiterwachsen. Genau das ist eine Transplantation.',
		nameFul:
			'„-ful“ ist die gewöhnliche englische Endung für „voll von“. Graftful heißt also „voll von Transplantat“, und es liegt nah genug an „grateful“, dankbar, um kein Zufall zu sein. Wer eines hat, weiß warum.',
		nameNotOrganSpecific:
			'Der Name ist außerdem bewusst nicht an ein Organ gebunden. Die erste Fassung sollte nach Nieren benannt werden, was falsch gewesen wäre: die tägliche Rechnerei mit Immunsuppressiva ist dieselbe, welches Organ Sie auch erhalten haben.',
		markTitle: 'Und das Zeichen',
		markAlt: 'Das Graftful-Zeichen: ein Stamm, dem von der Seite ein neuer Trieb zuwächst',
		markStrokes:
			'Zwei Striche: ein Stamm, der weitergeht, und ein neuer Trieb, der von der Seite dazukommt. Es ist eine Pfropfung im gärtnerischen, dem älteren Sinn, und deshalb steckt darin keine Spritze, kein Kreuz und kein Organ.',
		markJoinLead: 'Die Verbindung liegt absichtlich seitlich.',
		markJoinBody:
			'Ein Transplantat kommt nicht dorthin, wo das Original war. Eine transplantierte Niere wird vorn im Unterbauch platziert, während die beiden, mit denen Sie geboren wurden, hinten bleiben, wo sie sind. Eine symmetrische Gabel würde „ersetzt“ sagen. Diese sagt „an einer neuen Stelle verbunden“, und das ist, was tatsächlich geschehen ist.',
		markHand:
			'Es sieht auch aus wie eine Hand, die ein V formt, und das lasse ich gern so. Mit dem Transplantat Frieden zu schließen, und mit den Tabletten, die dazugehören, ist das meiste davon, wie das Leben damit aussieht.',
		originTitle: 'Woher es kommt',
		origin1:
			'Ich bin Luis. Ich habe am 11. Januar 2016 am CHUV in Lausanne eine Nierentransplantation erhalten, und wie alle, die ein Transplantationszentrum verlassen, ging ich mit einer Tüte voller Packungen und ohne besonderes System dafür.',
		origin2:
			'Was daraus wurde, war eine Tabelle. Darin stand jedes Produkt, wie viele Tabletten pro Tag es ergab, wie viele in der Packung übrig waren, und die Spalte, auf die es wirklich ankam: wie viele Tage das waren. Wenn eine Zahl niedrig wurde, schrieb ich der Apotheke. Ich habe sie jahrelang von Hand gepflegt, und es funktionierte, aber nur weil ich Tabellen mag. Das schien mir eine unsinnige Voraussetzung für jemanden drei Wochen nach einer Transplantation.',
		origin3:
			'Graftful ist diese Tabelle, neu gebaut, damit niemand sonst sie erfinden muss. Die Rechnungen darin sind die, die ich von Hand gemacht habe, und die unbequemen Teile des Beispiels stehen darin, weil sie in meinem standen: eine Dose aus drei verschiedenen Stärken, eine halbe Tablette, eine ausschleichende Dose und eine Stärke, die mitten in der Behandlung vom Markt geht.',
		originNote:
			'Der Beispielplan in der App verwendet erfundene Medikamentennamen. Die Zahlen sind echt, die Produkte nicht: was eine einzelne Person nimmt, ist niemandes Sache, meine eingeschlossen. Dies ist kein Produkt eines Krankenhauses und mit keinem Transplantationszentrum verbunden.',
		madeByTitle: 'Wer es gemacht hat',
		madeByBefore: 'Mit Sorgfalt gemacht von Luis und',
		madeByAfter:
			': einem transplantierten Menschen und einem KI-Assistenten, ausgehend von fünf Jahren Tabelle, um nur die Teile zu bauen, auf die es am Ende ankam.',
		madeByNote:
			'Jede klinische Grenze oben war eine bewusste Entscheidung und keine fehlende Funktion, und die Rechnungen werden gegen echte Apothekenbestellungen geprüft und nicht gegen sich selbst.',
		licenceTitle: 'Quellcode und Lizenz',
		licenceBefore: 'Graftful ist',
		licenceLink: 'quelloffen auf GitHub',
		licenceAfter:
			' unter der AGPL-3.0. Das ist aus einem praktischen und nicht aus einem ideologischen Grund wichtig: Menschen sind täglich darauf angewiesen, für Medikamente, die sie nicht auslassen können, und wenn ich die Pflege einstelle, soll niemand im Stich gelassen werden. Die Lizenz verhindert außerdem, dass jemand es schließt.',
		licenceName: 'Der Name ist geschützt, eine Abspaltung muss also anders heißen.',
		version: (version) => `Version ${version}`
	},
	privacy: {
		title: 'Datenschutz',
		metaDescription: 'Was Graftful speichert, wo es das speichert, und wie Sie es prüfen können.',
		headline: 'Ihre Medikationsdaten verlassen Ihr Gerät nie.',
		headlineBody:
			'Es gibt kein Konto, keine Anmeldung und keinen Server, der Ihren Einnahmeplan hält. Alles, was Sie eingeben (Produkte, Dosen, Bestandszählungen, Bestellungen, Ihr Transplantationsdatum), wird von Ihrem Browser auf dem Gerät gespeichert, das Sie benutzen, und nirgendwo sonst.',
		checkTitle: 'Wie Sie es prüfen, statt mir zu glauben',
		checkBody:
			'Öffnen Sie die Entwicklerwerkzeuge Ihres Browsers, gehen Sie auf den Reiter Netzwerk und benutzen Sie dann die App: fügen Sie ein Produkt hinzu, erfassen Sie eine Bestandszählung, erzeugen Sie eine Bestellung. Es wird nichts gesendet. Das ist mehr wert als jede Datenschutzerklärung, weil Sie das tatsächliche Verhalten beobachten und nicht eine Behauptung darüber lesen.',
		collectedTitle: 'Es wird nichts erhoben',
		collected:
			'Keine Statistiken, kein Besuchszähler und kein Skript von Dritten, gleich welcher Art. Die App lädt nur Dateien, die sie selbst ausliefert, und braucht nach dem ersten Besuch kein Netz mehr. Eine frühere Version zählte Seitenaufrufe über Cloudflare; das wurde entfernt, und nichts ist an seine Stelle getreten.',
		practiceTitle: 'Was das in der Praxis bedeutet',
		clearingLead: 'Das Löschen Ihrer Browserdaten löscht Ihren Einnahmeplan.',
		clearingBody:
			'Das ist das eigentliche Risiko daran, alles lokal zu speichern, und deshalb hat die App eine Export-Schaltfläche. Nutzen Sie sie.',
		devicesLead: 'Ihre Daten folgen Ihnen nicht von Gerät zu Gerät.',
		devicesBody:
			'Telefon und Laptop halten getrennte Kopien. Exportieren Sie aus dem einen und importieren Sie in das andere.',
		unlockLead: 'Wer Ihr Gerät entsperren kann, kann sie lesen.',
		unlockBody: 'Es gibt keinen eigenen App-Code. Die Sperre Ihres Geräts ist der Schutz.',
		noBackupLead: 'Nichts wird für Sie gesichert.',
		noBackupBody: 'Ich kann Ihre Daten nicht wiederherstellen, weil ich sie nie hatte.',
		deletingTitle: 'Alles löschen',
		deletingBody:
			'Unter Einstellungen gibt es eine Schaltfläche, die alles sofort löscht. Es ist nichts zu beantragen und kein Konto zu schließen.',
		deletingNoCopy:
			'Da ich keine personenbezogenen Daten halte, gibt es keine Kopie anzufordern und nichts, was ich aus der Ferne löschen könnte. Das ist Absicht: der sicherste Umgang mit sensiblen Gesundheitsdaten ist, sie nicht zu erhalten.',
		deletingContact: 'Fragen zu diesem Datenschutzmodell können an'
	},
	roadmap: {
		title: 'Fahrplan',
		metaDescription: 'Woran als Nächstes gearbeitet wird, und was nie gebaut wird.',
		noDates:
			'Keine Termine. Das hier baut eine Person an Abenden, und ein Termin wäre eine Vermutung im Gewand eines Versprechens. Die Reihenfolge unten entspricht etwa der Reihenfolge der Arbeit.',
		workingTitle: 'Was schon funktioniert',
		working: [
			'Ihr Plan, mit Dosen aus mehreren Tabletten, halben Tabletten und Medikamenten nach Bedarf',
			'Tage der Abdeckung pro Produkt, aus dem, was Sie tatsächlich in die Packung zählen',
			'Nachbestell-Hinweise und eine Apothekenbestellung, die Sie kopieren oder mailen können',
			'Dosisänderungen, die Ihre Historie behalten statt sie zu überschreiben',
			'Kalendererinnerungen, die Sie einmal exportieren und in Ihr Telefon importieren',
			'Sicherung und Wiederherstellung als Datei, die Sie selbst halten',
			'Funktioniert offline, ohne dass etwas über Ihre Gesundheit das Gerät verlässt'
		],
		remindersTitle: 'Als Nächstes: richtige Erinnerungen',
		reminders1:
			'Der Kalenderexport funktioniert und braucht keinen Server, hat aber einen echten Fehler: ändern Sie eine Dose, und der Kalender ist stillschweigend falsch, bis Sie erneut exportieren.',
		reminders2:
			'Push-Benachrichtigungen beheben das und bringen mit, was ein Kalender nicht kann: eine Schaltfläche „Genommen“ auf der Benachrichtigung selbst, sodass das Erfassen einer Einnahme kein Öffnen der App verlangt. Das ist auch die einzige ehrliche Art, Therapietreue zu erfassen: jemanden zu bitten, eine App zu öffnen, um zu bestätigen, dass eine Tablette genommen wurde, misst vor allem, wer daran denkt, Apps zu öffnen.',
		reminders3:
			'Es wird so gebaut, dass der Server nichts erfährt. Die Benachrichtigung trägt keinen Inhalt: der Server weiß nur, wann Ihr Gerät angestoßen werden soll, und der Text wird auf dem Telefon aus Daten zusammengesetzt, die es nie verlassen haben.',
		consultationsTitle: 'Als Nächstes: Ihre Kontrolltermine',
		consultations1:
			'Ein Datum und eine Uhrzeit für Ihre nächste Kontrolle, mit einem Countdown neben dem Tageszähler, den Sie schon sehen, und einer Erinnerung im selben Kalenderexport wie Ihre Dosen.',
		consultations2:
			'Warum das eine richtige Funktion verdient und nicht eine Notiz in der Ecke: Kontrollen hören nicht auf. Meine sind noch etwa alle drei Monate, mehr als zehn Jahre danach. Software für transplantierte Menschen nimmt oft ein intensives erstes Jahr an und danach nichts mehr, was nicht der Wirklichkeit entspricht. Die Termine, die Blutuntersuchungen und die Tabletten gehen unbegrenzt weiter.',
		consultations3:
			'Es sollte auch das Bestellen verändern. Was Sie wirklich wollen, sind genug Medikamente bis zum nächsten Termin, nicht willkürliche sechzig Tage. Sobald Graftful dieses Datum kennt, kann es es als Horizont verwenden, statt einer Zahl, die Sie erfinden mussten.',
		consultations4:
			'Ein Datum zu notieren ist ein Tagebucheintrag, das bleibt also weit von der unten beschriebenen Grenze entfernt. Graftful wird nicht vorschlagen, wann ein Termin sein sollte, und aus dem Abstand zwischen Ihren Terminen nichts ableiten.',
		blogTitle: 'Danach: ein Blog',
		blog1:
			'Ein Ort, um Dinge richtig aufzuschreiben. Der erste Beitrag ist schon entschieden: eine Schritt-für-Schritt-Anleitung zu Graftful — Produkte einrichten, eine Dose aus mehreren Tabletten eingeben, den Bestand zählen und die erste Apothekenbestellung herausbekommen.',
		blog2:
			'Die App versucht, sich selbst zu erklären, aber manches davon ist beim ersten Mal wirklich fummelig, und Bildschirmfotos schaffen auf einen Blick, was ein Absatz Hilfetext schlecht schafft. Es gäbe auch Transplantationskoordinatorinnen und -koordinatoren etwas zum Zeigen, das keine Anmeldeseite ist.',
		blog3:
			'Wahrscheinliche Beiträge danach: worin die Rechnungen wirklich bestehen und warum die App nie eine Dosis wählt; wie die Erinnerungen ohne Server funktionieren; und was zehn Jahre derselben Tabletten zweimal täglich über die Stellen lehren, die leicht schiefgehen.',
		thenTitle: 'Danach',
		missedLead: 'Vergessene Dosen.',
		missedBody:
			'Erfassen, dass eine Dose versäumt wurde und wann sie fällig war. Nicht, was dagegen zu tun ist. Siehe unten.',
		languagesLead: 'Weitere Sprachen.',
		languagesBody:
			'Englisch, Französisch, Deutsch und Portugiesisch decken die ganze App ab, dazu die Apothekenbestellung und die Kalenderdatei. Italienisch folgt als Nächstes, für das Tessin. Übersetzungen sind willkommen und bringen mehr als Geld.',
		expiryLead: 'Verfallsdaten und Chargennummern.',
		expiryBody:
			'Nützlich, wenn eine Packung ein Jahr im Schrank lag, und wenn es einen Rückruf gibt.',
		resultsLead: 'Ein Platz für Ihre Werte.',
		resultsBody:
			'Ein Ort, um einen Blutwert aufzuschreiben und zu behalten, als Tagebuch, ohne jede Deutung dazu.',
		travelLead: 'Reisen.',
		travelBody:
			'Ausrechnen, wie viel für eine Reise mitzunehmen ist, und was ein Zeitzonenwechsel mit einem zwölfstündigen Einnahmeabstand macht.',
		consideringTitle: 'Wird erwogen',
		surveyLead: 'Eine anonyme Umfrage.',
		surveyBody:
			'Ob Menschen dies nützlich finden und was fehlt. Eine Umfrage, die Sie beantworten wollen, und keine still im Hintergrund erhobenen Statistiken, was allem auf der Datenschutzseite widersprechen würde.',
		carerLead: 'Teilen mit einer betreuenden Person.',
		carerBody:
			'Wirklich schwierig ohne einen Server, der Ihre Daten hält, und das ist genau das Einzige, was diese App nicht tut. Noch keine gute Antwort.',
		neverTitle: 'Nie',
		neverIntro:
			'Das steht nicht auf einer Warteliste. Das ist die Grenze zwischen einem Nachverfolgungswerkzeug und einem regulierten Medizinprodukt, und es sind auch Entscheidungen Ihrer Ärztin oder Ihres Arztes.',
		never: [
			'Eine Dosis aus einem Blutwert, Ihrem Gewicht oder einem Untersuchungsergebnis berechnen',
			'Entscheiden, welche Tabletten eine verordnete Dosis ergeben',
			'Ihnen sagen, was bei einer vergessenen Dosis zu tun ist',
			'Warnungen vor Wechselwirkungen',
			'Ein Laborergebnis beurteilen: keine Schwellenwerte, keine Trendpfeile, keine roten Zahlen'
		],
		neverMoreLink: 'Mehr dazu, warum',
		neverMoreAfter: ', samt dem genauen Wortlaut dessen, wofür diese App da ist.',
		missingTitle: 'Fehlt etwas?',
		missing1:
			'Das Nützlichste, was Sie mir schicken können, ist das, was Sie geärgert hat, oder der Fall in Ihrem Plan, den diese App schlecht behandelt. Kein Plan ist typisch, und meiner ist nur einer davon.',
		suggestLink: 'Schlagen Sie es auf GitHub vor',
		missingOrEmail: 'oder schreiben Sie an',
		missingBugBefore: 'Wenn etwas kaputt ist und nicht fehlt,',
		bugLink: 'melden Sie einen Fehler',
		missingBugAfter: 'stattdessen.',
		missingPrivacyBefore:
			'GitHub-Tickets sind öffentlich: lassen Sie also Medikamentennamen, Dosen, Transplantationsdaten und alles andere aus Ihrem eigenen Plan weg; schreiben Sie eine E-Mail, wenn es sich ohne sie nicht beschreiben lässt. Es gibt weitere Wege zu helfen auf',
		supportLink: 'der Unterstützungsseite',
		missingPrivacyAfter: ', darunter eine Übersetzung zu verbessern.'
	},
	support: {
		title: 'Unterstützen',
		metaDescription:
			'Graftful ist kostenlos. Das Nützlichste ist, jemandem davon zu erzählen, der es braucht.',
		free1:
			'Graftful ist kostenlos und bleibt kostenlos. Es gibt keine Bezahlstufe, nichts ist gesperrt, und keine Funktion hängt davon ab, dass Geld fließt.',
		free2:
			'Der Betrieb kostet auch fast nichts: eine Domain und Hosting, das in dieser Größe kostenlos ist. Was wirklich fehlt, ist, dass Menschen von seiner Existenz wissen. Wenn Sie es nützlich gefunden haben, ist es einer anderen Person davon zu erzählen mehr wert als eine Spende.',
		tellTitle: 'Erzählen Sie jemandem davon, der es braucht',
		recipientLead: 'Einer anderen transplantierten Person.',
		recipientBody:
			'Jedem in den ersten Monaten nach einer Transplantation, der in Packungen versinkt. Das ist der Moment, in dem dies am meisten hilft, und der Moment, in dem niemand die Kraft hat, nach einem Werkzeug zu suchen.',
		coordinatorLead: 'Ihrer Transplantationskoordination.',
		coordinatorBody:
			'Das sind die Menschen, die das Gespräch über Therapietreue tatsächlich führen, und sie sind meist froh über etwas Konkretes zum Zeigen. Nicht die Anmeldung am Empfang.',
		pharmacistLead: 'Ihrer Hausärztin oder Ihrer Apotheke.',
		pharmacistBody:
			'Gerade Ihre Apotheke sieht jede Woche die Folgen schlecht getakteter Nachbestellungen.',
		associationLead: 'Einer Patientenorganisation oder einer Online-Gruppe.',
		associationBody: 'Ein Beitrag erreicht mehr Menschen, als ich es allein je werde.',
		tellNote:
			'Nichts anzumelden und nichts zu installieren. Die Adresse zu teilen genügt. Es läuft zuerst im Browser und lässt sich auf Wunsch auf den Startbildschirm installieren.',
		wrongTitle: 'Sagen Sie mir, was daran falsch ist',
		wrong1:
			'Das, was Sie verwirrt hat, oder was Sie umgehen mussten. Verwirrung ist ein Mangel, kein Bedienfehler.',
		wrong2:
			'Der Fall in Ihrem Plan, den Graftful schlecht behandelt. Keine zwei Pläne sind gleich, und meiner ist nur einer davon.',
		wrong3:
			'Alles, was sich klinisch falsch angefühlt hat. Das zählt mehr als jede andere Art von Meldung.',
		bugLink: 'Einen Fehler auf GitHub melden',
		wrongOrEmail: 'oder schreiben Sie an',
		wrongNote: (version) =>
			`Beide tragen die Version, die Sie benutzen (${version}), bereits mit sich, es ist also nichts nachzusehen. GitHub-Tickets sind öffentlich: bitte keine Medikamentennamen, Dosen, Transplantationsdaten, Bildschirmfotos Ihres Plans oder eine exportierte Sicherung. Nutzen Sie die E-Mail, wenn das Problem ohne persönliche Gesundheitsangaben nicht zu beschreiben ist. Graftful kann nicht zu einer vergessenen Dosis oder einer Medikationsentscheidung beraten; wenden Sie sich dafür an Ihr Transplantationsteam.`,
		ideasTitle: 'Ideen und weiterer Kontakt',
		ideasBefore: 'Für eine Idee oder Rückmeldung zum Produkt nutzen Sie das',
		ideaLink: 'Ideenformular auf GitHub',
		ideasOrEmail: 'oder schreiben Sie an',
		contactBefore: 'Für allgemeine Fragen, Partnerschaften oder Presse:',
		contactAfter:
			'. E-Mails an die Adressen +bugs und +ideas landen im selben Postfach und werden dort sortiert; sie werden nicht automatisch in ein öffentliches GitHub-Ticket kopiert. Sicherheitsmeldungen gehen an',
		securityAfter:
			'stattdessen, damit eine Schwachstelle nicht öffentlich wird, bevor sie behoben ist.',
		translationTitle: 'Eine Übersetzung verbessern',
		translationState:
			'Die ganze App ist auf Englisch, Französisch, Deutsch und Portugiesisch verfügbar, einschließlich der Apothekenbestellung und der Kalenderdatei. Das Deutsche wurde noch nicht von einer Person mit Muttersprache Deutsch gelesen.',
		translationBefore:
			'Wenn ein Wort in Ihrer Sprache falsch, holprig oder zu formell klingt, ist das eine Meldung wert. Schicken Sie es als',
		translationBugLink: 'Fehler',
		translationMiddle:
			', wofür kein GitHub-Konto nötig ist, oder bearbeiten Sie, wenn Sie mit Code vertraut sind, den Katalog direkt:',
		translationFilesLink: 'eine Datei pro Sprache',
		translationAfter: 'in',
		translationWhy:
			'Ein falsches Wort in einer Medikationsapp ist nicht kosmetisch. Wer abwägt, ob er dieser App sein Rezept anvertraut, liest den Ton vor den Funktionen, und eine Übersetzung erreicht ein ganzes Land. Das geht deutlich weiter als Geld.',
		moneyTitle: 'Wenn Sie doch lieber etwas schicken möchten',
		moneyNote: 'Wirklich freiwillig. Eine Transplantation zu bewältigen ist teuer genug.',
		twintAlt: 'TWINT-QR-Code'
	},
	notFound: {
		title: 'Seite nicht gefunden',
		body404:
			'Unter dieser Adresse gibt es keine Seite. Der Link ist vielleicht vertippt, oder er zeigt auf etwas, das diese Version von Graftful nicht hat.',
		bodyOther: 'Beim Laden dieser Seite ist etwas schiefgegangen.',
		dataSafe:
			'Nichts von dem, was Sie eingegeben haben, ist betroffen. Ihr Plan, Ihre Bestandszählungen und Ihre Historie werden von Ihrem Browser auf diesem Gerät gespeichert, und ein falscher Link berührt sie nicht.',
		goToToday: 'Zu Heute'
	}
};
