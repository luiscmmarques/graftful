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
		save: string;
		edit: string;
		/** Shared by Stock and Setup, which both validate the same field. */
		errorPackageSize: string;
	};
	today: {
		title: string;
		metaDescription: string;
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
		metaDescription: string;
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
		errorBoxes: string;
		errorCount: string;
	};
	order: {
		title: string;
		metaDescription: string;
		nothingNeeded: string;
		nextRunAround: (date: string) => string;
		nothingConsumedYet: string;
		forceOrder: string;
		atReorderPoint: (count: number) => string;
		daysLeft: (days: string) => string;
		jointNote: string;
		addAnythingTitle: string;
		addAnythingNote: string;
		boxesOf: (size: number) => string;
		oneBoxFewer: string;
		oneBoxMore: string;
		suggestedTitle: string;
		whenReadyLabel: string;
		/** An example of what to type, so it belongs to the language rather than to a place. */
		whenReadyPlaceholder: string;
		capped: string;
		addedByYou: string;
		coversTo: (days: string) => string;
		nextRunAfter: (date: string) => string;
		copied: string;
		copyText: string;
		openInEmail: string;
		markOrdered: string;
		markOrderedNote: string;
		fullText: string;
		awaitingTitle: string;
		outstanding: (units: string, date: string) => string;
		receivedFull: string;
		receivedOneBox: string;
		partialNote: string;
		/** Whole link text, as with `today.openOrder`, so no sentence is glued together. */
		fixBoxSize: string;
	};
	setup: {
		title: string;
		metaDescription: string;

		remindersTitle: string;
		icsNever: string;
		icsStaleTitle: string;
		icsStaleBody: string;
		icsCurrent: string;
		exportIcs: string;
		icsNote: string;

		languageTitle: string;
		languageLabel: string;
		followBrowser: (language: string) => string;
		languageNote: string;

		timesTitle: string;
		timesLabel: string;
		saveTimes: string;
		errorNotATime: (values: string) => string;
		errorNoTime: string;
		timesNote: string;

		detailsTitle: string;
		transplantDate: string;
		horizonLabel: string;
		errorBadDate: string;
		errorHorizon: string;

		productsTitle: string;
		reorderAt: (days: number) => string;
		retired: string;
		brandName: string;
		strength: string;
		unit: string;
		/** Only the parenthetical is translated; "cp" is the printed abbreviation. */
		unitWholePill: string;
		unitsPerBox: string;
		unitsPerBoxAsk: string;
		reorderFloor: string;
		form: string;
		formPlaceholder: string;
		saveChanges: string;
		errorProductFields: string;
		confirmDeleteProduct: string;
		errorCouldNotDelete: string;
		restoreProduct: string;
		restoreProductNote: string;
		retire: string;
		retireNote: string;
		deletePermanently: string;
		deleteProductNote: string;
		cannotDeleteProduct: (doses: number, stockEvents: number, orders: number) => string;
		addProduct: string;
		unitsOnHand: string;
		addProductButton: string;
		errorProductName: string;
		errorStrength: string;
		errorMinDays: string;
		errorStockNegative: string;
		addProductNote: string;

		therapiesTitle: string;
		asNeededInline: string;
		doseVersions: (count: number) => string;
		stoppedOn: (date: string) => string;
		name: string;
		category: string;
		activeIngredient: string;
		activeIngredientPlaceholder: string;
		startedOn: string;
		asNeededCheckbox: string;
		saveDetails: string;
		doseHistoryTitle: string;
		/** The open end of a dose version's interval. */
		now: string;
		perDayUnit: (amount: string, unit: string) => string;
		/**
		 * Reports that two numbers the user entered disagree. It never says which is right,
		 * which is what keeps `checkDoseConsistency` on the permitted side of the boundary.
		 */
		doseMismatch: (declared: string, composed: string, unit: string) => string;
		changeDoseTitle: string;
		changeDoseNote: string;
		firstDayLabel: string;
		time: string;
		removeTime: string;
		product: string;
		retiredParen: string;
		pills: string;
		removeProduct: string;
		addProductHere: string;
		addAnotherTime: string;
		declaredLabel: string;
		entryComesTo: string;
		perDayAmount: (amount: string, unit: string) => string;
		/** A continuation clause, appended to `perDayAmount` — hence the leading comma. */
		declaredMismatch: (declared: string, unit: string) => string;
		retiredWarning: (names: string, count: number) => string;
		saveNewDose: string;
		errorBadStartDate: string;
		errorSlotTime: (value: string) => string;
		errorUnits: string;
		errorChooseProduct: string;
		errorSaveDose: string;
		changeDoseFooter: string;
		resumeTherapy: string;
		stopTherapy: string;
		stopTherapyNote: string;
		cannotDeleteTherapy: (since: string, doses: number) => string;
		confirmDeleteTherapy: string;
		addTherapy: string;
		timesCommaLabel: string;
		addTherapyDoseNote: string;
		pillsPerTime: string;
		addProductToDose: string;
		/** Takes the label of the section it points at, so the two can never drift apart. */
		sameCombinationNote: (changeDoseLabel: string) => string;
		addTherapyButton: string;
		errorTherapyName: string;
		errorTimes: string;
		errorProductQuantity: string;

		dataTitle: string;
		dataNote: string;
		exportBackup: string;
		importBackup: string;
		errorNothingToExport: string;
		errorImportFailed: string;
		confirmImport: string;
		restoredWithProblems: (count: number) => string;

		dangerTitle: string;
		deleteAll: string;
		deleting: string;
		confirmDeleteAll: string;
		deleteDone: string;
		errorDeleteFailed: string;
	};
	/**
	 * The content pages.
	 *
	 * Two conventions, both to keep whole sentences whole rather than gluing fragments
	 * together in the markup:
	 *
	 * - Inline emphasis inside running prose is dropped. It survives only where it is a
	 *   lead-in label at the start of a block, which every language can reproduce — hence
	 *   the `…Lead` / `…Body` pairs in the lists.
	 * - A key whose text continues after an inline link carries its own leading
	 *   punctuation and space, because where the comma or colon falls differs by language.
	 */
	about: {
		title: string;
		metaDescription: string;
		intro: string;
		introNote: string;
		purposeTitle: string;
		/** The intended-use statement. Its wording is the regulatory position; keep it exact. */
		purposeStatement: string;
		notTitle: string;
		notIntro: string;
		notDoseLead: string;
		notDoseBody: string;
		notCombinationLead: string;
		notCombinationBody: string;
		notMissedDoseLead: string;
		notMissedDoseBody: string;
		notInteractions: string;
		notLabResultLead: string;
		notLabResultBody: string;
		notDatabaseLead: string;
		notDatabaseBody: string;
		arithmeticNote: string;
		nameTitle: string;
		nameGraft: string;
		nameFul: string;
		nameNotOrganSpecific: string;
		markTitle: string;
		markAlt: string;
		markStrokes: string;
		markJoinLead: string;
		markJoinBody: string;
		markHand: string;
		originTitle: string;
		origin1: string;
		origin2: string;
		origin3: string;
		originNote: string;
		madeByTitle: string;
		madeByBefore: string;
		madeByAfter: string;
		madeByNote: string;
		licenceTitle: string;
		licenceBefore: string;
		licenceLink: string;
		licenceAfter: string;
		licenceName: string;
		version: (version: string) => string;
	};
	privacy: {
		title: string;
		metaDescription: string;
		headline: string;
		headlineBody: string;
		checkTitle: string;
		checkBody: string;
		collectedTitle: string;
		collected: string;
		collectedBlockable: string;
		practiceTitle: string;
		clearingLead: string;
		clearingBody: string;
		devicesLead: string;
		devicesBody: string;
		unlockLead: string;
		unlockBody: string;
		noBackupLead: string;
		noBackupBody: string;
		deletingTitle: string;
		deletingBody: string;
		deletingNoCopy: string;
		deletingContact: string;
	};
	roadmap: {
		title: string;
		metaDescription: string;
		noDates: string;
		workingTitle: string;
		working: readonly [string, string, string, string, string, string, string];
		remindersTitle: string;
		reminders1: string;
		reminders2: string;
		reminders3: string;
		consultationsTitle: string;
		consultations1: string;
		consultations2: string;
		consultations3: string;
		consultations4: string;
		blogTitle: string;
		blog1: string;
		blog2: string;
		blog3: string;
		thenTitle: string;
		missedLead: string;
		missedBody: string;
		languagesLead: string;
		languagesBody: string;
		expiryLead: string;
		expiryBody: string;
		resultsLead: string;
		resultsBody: string;
		travelLead: string;
		travelBody: string;
		consideringTitle: string;
		surveyLead: string;
		surveyBody: string;
		carerLead: string;
		carerBody: string;
		neverTitle: string;
		neverIntro: string;
		never: readonly [string, string, string, string, string];
		neverMoreLink: string;
		neverMoreAfter: string;
		missingTitle: string;
		missing1: string;
		suggestLink: string;
		missingOrEmail: string;
		missingBugBefore: string;
		bugLink: string;
		missingBugAfter: string;
		missingPrivacyBefore: string;
		supportLink: string;
		missingPrivacyAfter: string;
	};
	support: {
		title: string;
		metaDescription: string;
		free1: string;
		free2: string;
		tellTitle: string;
		recipientLead: string;
		recipientBody: string;
		coordinatorLead: string;
		coordinatorBody: string;
		pharmacistLead: string;
		pharmacistBody: string;
		associationLead: string;
		associationBody: string;
		tellNote: string;
		wrongTitle: string;
		wrong1: string;
		wrong2: string;
		wrong3: string;
		bugLink: string;
		wrongOrEmail: string;
		wrongNote: (version: string) => string;
		ideasTitle: string;
		ideasBefore: string;
		ideaLink: string;
		ideasOrEmail: string;
		contactBefore: string;
		contactAfter: string;
		securityAfter: string;
		translationTitle: string;
		translationState: string;
		translationBefore: string;
		translationBugLink: string;
		translationMiddle: string;
		translationFilesLink: string;
		translationAfter: string;
		translationWhy: string;
		moneyTitle: string;
		moneyNote: string;
		twintAlt: string;
	};
	notFound: {
		title: string;
		body404: string;
		bodyOther: string;
		dataSafe: string;
		goToToday: string;
	};
}
