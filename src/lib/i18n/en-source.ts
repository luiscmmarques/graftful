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
		stockLabelled: (state) => `Stock: ${state}`,
		stockEnough: 'enough left',
		days: 'days',
		save: 'Save',
		edit: 'Edit',
		errorPackageSize: 'Units per box must be a whole number, at least 1.'
	},
	today: {
		title: 'Today',
		metaDescription: 'What to take today, and when.',
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
		metaDescription: 'How many pills are left, and how long they will last.',
		empty: 'No products yet. Add them in Setup.',
		orderNow: 'order now',
		runningLow: 'running low',
		perBox: (size) => `${size} per box`,
		left: (units) => `${units} left`,
		perDay: (units) => `${units} a day`,
		nothingConsumes: 'Nothing consumes this: retired, or as-needed only',
		onOrder: (units) => `${units} on order`,
		openActions: 'Modify',
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
			'Nobody knows this at the start. You find it out from the pharmacy, sometimes only when the box arrives. Correct it here whenever you learn the real figure. It changes how many boxes future orders ask for; it does not touch what you already have.',
		errorBoxes: 'Boxes must be a whole number, at least 1.',
		errorCount: 'A count cannot be negative.'
	},
	order: {
		title: 'Order',
		metaDescription: 'Prepare a pharmacy order before you run out.',
		nothingNeeded: 'Nothing needs ordering.',
		nextRunAround: (date) => `Next pharmacy run expected around ${date}.`,
		nothingConsumedYet: 'No product is being consumed yet.',
		forceOrder: 'Order everything early anyway',
		atReorderPoint: (count) =>
			count === 1
				? '1 product is at or below the reorder point.'
				: `${count} products are at or below the reorder point.`,
		daysLeft: (days) => `${days} days left`,
		jointNote:
			'Everything else is topped up to the same horizon, so the next order lands as a single pharmacy run rather than several.',
		addAnythingTitle: 'Add anything else?',
		addAnythingNote:
			'Nothing takes these on a schedule, so no calculation will ever ask for them, but they run out too. Worth topping up while you are ordering.',
		boxesOf: (size) => `boxes of ${size}`,
		oneBoxFewer: 'One box fewer',
		oneBoxMore: 'One box more',
		suggestedTitle: 'Suggested order',
		whenReadyLabel: 'When would you like it ready? (optional)',
		whenReadyPlaceholder: 'Friday morning',
		capped: 'capped',
		addedByYou: 'added by you',
		coversTo: (days) => `covers to ${days} days`,
		nextRunAfter: (date) => `After this order, the next run is expected around ${date}.`,
		copied: 'Copied',
		copyText: 'Copy order text',
		openInEmail: 'Open in email',
		markOrdered: 'Mark as ordered',
		markOrderedNote:
			'Marking it ordered records the request and silences the reminder. It does not change your stock. That happens when the order arrives.',
		fullText: 'Full order text',
		awaitingTitle: 'Awaiting collection',
		outstanding: (units, date) => `${units} units outstanding, ordered ${date}`,
		receivedFull: 'Received in full',
		receivedOneBox: 'Received 1 box only',
		partialNote:
			'These products are often dispensed short. Recording a partial delivery keeps the remainder visible rather than quietly losing it.',
		fixBoxSize: 'If the box was a different size, correct it in Stock →'
	},
	setup: {
		title: 'Setup',
		metaDescription: 'Your products, doses, reminders and backups.',

		remindersTitle: 'Reminders',
		icsNever:
			"No web API can schedule a notification locally, so reminders work through your phone's calendar. Export once and import the file into your calendar app.",
		icsStaleTitle: 'Your calendar is out of date.',
		icsStaleBody:
			'The schedule, language or timezone changed since you last exported. Export again and re-import. Existing reminders at the same times will update; if a time was removed or changed, delete the old Graftful reminder from your calendar first.',
		icsCurrent: 'Your calendar matches the current schedule.',
		exportIcs: 'Export reminders (.ics)',
		icsNote:
			'As-needed medication is left out, because there is no schedule to put in a calendar. Push notifications, with a "taken" button, come in a later version.',

		languageTitle: 'Language',
		languageLabel: 'Language for the app, the pharmacy order and the calendar export',
		followBrowser: (language) => `Follow my browser (${language})`,
		languageNote:
			'This sets the language of the screens and of the two things that leave the app: the order you send your pharmacy, and the calendar file. So you can send a French order from an English phone.',

		timesTitle: 'Your usual times',
		timesLabel: 'When you normally take medication, comma separated',
		saveTimes: 'Save times',
		errorNotATime: (values) => `Not a time: ${values}. Use HH:MM, like 08:00.`,
		errorNoTime: 'Give at least one time, like 08:00.',
		timesNote:
			'Only used to fill in the times when you add something new. Each dose keeps its own, and you can change any of them individually. Set whatever you and your centre agreed; Graftful will not suggest an interval, because how far apart your doses should be is a decision for your prescriber.',

		detailsTitle: 'Your details',
		transplantDate: 'Transplant date',
		horizonLabel: 'Top-up horizon in days: how far ahead an order should cover',
		errorBadDate: 'That date does not exist. Use YYYY-MM-DD.',
		errorHorizon: 'The horizon must be a whole number of days, at least 1.',

		productsTitle: 'Products',
		reorderAt: (days) => `reorder at ${days}d`,
		retired: 'retired',
		brandName: 'Brand name',
		strength: 'Strength',
		unit: 'Unit',
		unitWholePill: 'cp (whole pill)',
		unitsPerBox: 'Units per box',
		unitsPerBoxAsk: 'Units per box (ask the pharmacy)',
		reorderFloor: 'Reorder floor (days)',
		form: 'Form (optional)',
		formPlaceholder: 'tablet, capsule…',
		saveChanges: 'Save changes',
		errorProductFields:
			'Check the name, strength, units per box and reorder floor — each must be a positive number.',
		confirmDeleteProduct: 'Delete this product permanently?',
		errorCouldNotDelete: 'Could not delete',
		restoreProduct: 'Start using this again',
		restoreProductNote:
			'Restoring it puts it back into the schedule calculations and the order list.',
		retire: 'Retire',
		retireNote:
			'Retiring is how you stop using something. It stays in your history, keeps its stock, and past orders still make sense. It just drops out of ordering. This is the right choice when a strength is discontinued or a dose changes.',
		deletePermanently: 'Delete permanently',
		deleteProductNote:
			'Nothing refers to this product, so deleting it loses nothing. Use this for something typed in by mistake.',
		cannotDeleteProduct: (doses, stockEvents, orders) =>
			`This cannot be deleted: it appears in ${doses} ${doses === 1 ? 'dose' : 'doses'}, ${stockEvents} stock ${stockEvents === 1 ? 'entry' : 'entries'} and ${orders} ${orders === 1 ? 'order' : 'orders'}. Removing it would leave a history that no longer adds up. Retire it instead.`,
		addProduct: 'Add a product',
		unitsOnHand: 'Units on hand',
		addProductButton: 'Add product',
		errorProductName: 'Give the product a name.',
		errorStrength: 'The strength must be a positive number.',
		errorMinDays: 'The reorder floor must be a whole number of days.',
		errorStockNegative: 'Units on hand cannot be negative.',
		addProductNote:
			'If you do not know the box size yet, put your best guess in. You can correct it here or from Stock once the pharmacy tells you, and it only affects how many boxes an order asks for.',

		therapiesTitle: 'Therapies',
		asNeededInline: 'as needed',
		doseVersions: (count) => `${count} dose ${count === 1 ? 'version' : 'versions'}`,
		stoppedOn: (date) => `stopped ${date}`,
		name: 'Name',
		category: 'Category',
		activeIngredient: 'Active ingredient (optional)',
		activeIngredientPlaceholder: 'the morning dose',
		startedOn: 'Started on',
		asNeededCheckbox: 'As needed (no schedule)',
		saveDetails: 'Save details',
		doseHistoryTitle: 'Dose history',
		now: 'now',
		perDayUnit: (amount, unit) => `${amount} ${unit}/day`,
		doseMismatch: (declared, composed, unit) =>
			`Recorded as ${declared} ${unit} prescribed, but the products listed add up to ${composed} ${unit}. Worth checking against your prescription.`,
		changeDoseTitle: 'Change the dose',
		changeDoseNote:
			'Enter what you will actually take. The total is worked out from that, never the other way round, because only your prescriber can decide how a dose should be made up.',
		firstDayLabel: 'First day of the new dose',
		time: 'Time',
		removeTime: 'Remove time',
		product: 'Product',
		retiredParen: '(retired)',
		pills: 'Pills',
		removeProduct: 'Remove this product',
		addProductHere: 'Add a product here',
		addAnotherTime: 'Add another time',
		declaredLabel: 'What the doctor said (optional)',
		entryComesTo: 'What you entered comes to',
		perDayAmount: (amount, unit) => `${amount} ${unit} a day`,
		declaredMismatch: (declared, unit) =>
			`, which does not match the ${declared} ${unit} you recorded.`,
		retiredWarning: (names, count) =>
			`${names} ${count === 1 ? 'is' : 'are'} retired. Saving this brings ${count === 1 ? 'it' : 'them'} back into use, so ${count === 1 ? 'it' : 'they'} will be scheduled and ordered again.`,
		saveNewDose: 'Save the new dose',
		errorBadStartDate: 'That start date does not exist. Use YYYY-MM-DD.',
		errorSlotTime: (value) => `"${value}" is not a time. Use HH:MM, like 08:00.`,
		errorUnits: 'Every product needs a quantity above zero.',
		errorChooseProduct: 'Choose a product for every line.',
		errorSaveDose: 'Could not save the dose',
		changeDoseFooter:
			'The dose you are on now stays in your history, ending the day before this one starts. Your calendar reminders will need exporting again afterwards.',
		resumeTherapy: 'Start taking this again',
		stopTherapy: 'Stop taking this',
		stopTherapyNote:
			'Stopping ends consumption from today and keeps every dose you have recorded, so what you took and when stays answerable.',
		cannotDeleteTherapy: (since, doses) =>
			`This cannot be deleted: it has been in use since ${since}, and its ${doses} recorded ${doses === 1 ? 'dose' : 'doses'} are the record of what you took. Stop it instead.`,
		confirmDeleteTherapy: 'Delete this therapy and its doses?',
		addTherapy: 'Add a therapy',
		timesCommaLabel: 'Times, comma separated',
		addTherapyDoseNote:
			'What to take at each of those times. A dose can combine products: 14 mg of the morning dose is 3 × 4 mg plus 1 × 2 mg.',
		pillsPerTime: 'Pills per time',
		addProductToDose: 'Add a product to this dose',
		sameCombinationNote: (changeDoseLabel) =>
			`The same combination is used at every time listed. For different morning and evening doses, add it here and then use ${changeDoseLabel} above, which edits each time separately.`,
		addTherapyButton: 'Add therapy',
		errorTherapyName: 'Give the therapy a name.',
		errorTimes: 'Check the times: use HH:MM, like 08:00.',
		errorProductQuantity: 'Choose a product and a positive quantity for every line.',

		dataTitle: 'Your data',
		dataNote:
			'Everything is stored on this device. Clearing your browser data will delete it, so keep a backup.',
		storageNotGuaranteed:
			'This browser has not guaranteed that the data here is permanent, so it could be removed if the device runs short of space. Exporting a backup from time to time is the protection against that.',
		exportBackup: 'Export backup (JSON)',
		importBackup: 'Import backup',
		errorNothingToExport: 'Nothing to export yet — there is no regimen on this device.',
		errorImportFailed: 'Import failed',
		confirmImport:
			'Importing this backup will replace every product, dose, stock count and order on this device. Continue?',
		restoredWithProblems: (count) =>
			`Restored, with ${count} ${count === 1 ? 'problem' : 'problems'}:`,

		dangerTitle: 'Danger',
		deleteAll: 'Delete all data',
		deleting: 'Deleting…',
		confirmDeleteAll: 'Delete everything on this device?',
		deleteDone: 'Everything on this device has been deleted.',
		errorDeleteFailed: 'Delete failed'
	},
	about: {
		title: 'About Graftful',
		metaDescription: 'What Graftful does, what it deliberately does not do, and who made it.',
		intro:
			'Graftful helps people on long-term medication keep track of what to take, how much is left, and when to reorder. It was built for transplant recipients, who take the same drugs every day for the rest of their lives and for whom running out is not a minor inconvenience.',
		introNote:
			'It is free, has no account, no adverts, and works offline. Nothing about your health leaves your device.',
		purposeTitle: 'What it is for',
		purposeStatement:
			'Graftful is a self-management tool for people taking long-term medication. It stores a medication schedule entered by the user, reminds them when a dose is due, tracks how many pills remain, and helps them prepare a pharmacy order. It does not provide medical advice, does not interpret clinical data, and does not determine or suggest any dose.',
		notTitle: 'What it deliberately will not do',
		notIntro:
			'These are not missing features. They are the boundary that keeps this a tracking tool rather than something that ought to be regulated as a medical device. And, more simply, they are decisions that belong to your prescriber and not to an app.',
		notDoseLead: 'Work out a dose',
		notDoseBody: 'from a blood level, your weight, or any test result.',
		notCombinationLead: 'Work out which pills make up a dose.',
		notCombinationBody:
			'Told "14 mg", it will not decide that this means three 4 mg capsules and a 2 mg. You enter what you were prescribed. There are real clinical reasons a particular combination is chosen.',
		notMissedDoseLead: 'Tell you what to do about a missed dose.',
		notMissedDoseBody:
			'It will show you that one was missed and when it was due. What to do next is a question for your transplant centre.',
		notInteractions: 'Warn about drug interactions.',
		notLabResultLead: 'Interpret a lab result.',
		notLabResultBody:
			'Recording a trough level is a diary entry and that is fine. Colouring it red, or calling it "out of range", is a judgement this app will not make.',
		notDatabaseLead: 'Come with a drug database.',
		notDatabaseBody:
			'Every dose in Graftful was typed in by you, so it is never the source of a clinical number.',
		arithmeticNote:
			'It does do arithmetic on numbers you entered: how many days your stock will last, and how many boxes to ask the pharmacy for. If you record a total dose and the pills you list do not add up to it, Graftful will say the two disagree. It compares your own two numbers, and never decides which is right.',
		nameTitle: 'Where the name comes from',
		nameGraft:
			'A graft is the transplanted organ itself: the kidney, liver, heart or lung somebody gave you. The word is older than medicine: it comes from horticulture, where grafting means joining living tissue from one plant onto another so that the two grow as one. Which is exactly what a transplant is.',
		nameFul:
			'"-ful" is the ordinary English suffix meaning full of. So Graftful is full of graft, and it sits close enough to "grateful" to be no accident. If you have one of these, you know why.',
		nameNotOrganSpecific:
			'It is also deliberately not organ-specific. The first version was going to be named after kidneys, which would have been wrong: the daily arithmetic of immunosuppressants is the same whichever organ you were given.',
		markTitle: 'And the mark',
		markAlt: 'The Graftful mark: a stem with new growth joining it from the side',
		markStrokes:
			'Two strokes: a stem that carries on, and new growth joining it from the side. It is a graft in the horticultural sense, the older one, which is why there is no syringe, no cross and no organ in it.',
		markJoinLead: 'The join is off to one side on purpose.',
		markJoinBody:
			'A graft does not go where the original was. A transplanted kidney is placed at the front of the abdomen, while the two you were born with stay where they are, at the back. A symmetrical fork would say replaced. This says joined somewhere new, which is what actually happened.',
		markHand:
			'It also looks like a hand making a V, which I am happy to leave in. Making peace with the graft, and with the pills that come with it, is most of what living with one turns out to be.',
		originTitle: 'Where it came from',
		origin1:
			'I am Luis. I had a kidney transplant at CHUV in Lausanne on 11 January 2016, and like everyone who leaves a transplant centre I left with a bag of boxes and no particular system for them.',
		origin2:
			'What I ended up building was a spreadsheet. It held each product, how many pills a day it came to, how many were left in the box, and the column that actually mattered: how many days that was. When any number got low, I emailed the pharmacy. I maintained it by hand for years, and it worked, but it only worked because I happen to enjoy spreadsheets. That seemed like a silly thing to require of somebody three weeks post-transplant.',
		origin3:
			'Graftful is that spreadsheet, rebuilt so nobody else has to invent it. The arithmetic in it is the arithmetic I was doing by hand, and the awkward parts of the example are in there because they were in mine: a dose made from three different pill strengths, a half tablet, a dose that tapers, and a strength that gets discontinued mid-treatment.',
		originNote:
			"The example regimen in the app uses invented medicine names. The numbers are real, the products are not: what any individual takes is nobody else's business, mine included. This is not a hospital product and is not affiliated with any transplant centre.",
		madeByTitle: 'Who made it',
		madeByBefore: 'Made with care by Luis and',
		madeByAfter:
			': a transplant recipient and an AI assistant, working from five years of a spreadsheet to build only the parts that turned out to matter.',
		madeByNote:
			'Every clinical boundary above was a deliberate decision rather than a missing feature, and the arithmetic is checked against real pharmacy orders rather than against itself.',
		licenceTitle: 'Source and licence',
		licenceBefore: 'Graftful is',
		licenceLink: 'open source on GitHub',
		licenceAfter:
			' under the AGPL-3.0. That matters for a practical reason rather than an ideological one: people depend on this daily for medication they cannot skip, and if I stop maintaining it nobody should be stranded. The licence also stops anyone taking it closed.',
		licenceName: 'The name is reserved, so a fork has to be called something else.',
		version: (version) => `Version ${version}`
	},
	privacy: {
		title: 'Privacy',
		metaDescription: 'What Graftful stores, where it stores it, and how to check.',
		headline: 'Your medication data never leaves your device.',
		headlineBody:
			'There is no account, no sign-in, and no server holding your regimen. Everything you enter (products, doses, stock counts, orders, your transplant date) is stored by your browser on the device you are using, and nowhere else.',
		checkTitle: 'How to check, rather than take my word for it',
		checkBody:
			"Open your browser's developer tools, go to the Network tab, and then use the app: add a product, record a stock count, generate an order. Nothing will be sent. This is worth more than any privacy policy, because you are watching the actual behaviour rather than reading a claim about it.",
		collectedTitle: 'Nothing is collected',
		collected:
			'No analytics, no visit counter, and no third-party script of any kind. The app loads only files it serves itself, so after the first visit it does not need the network at all. An earlier version counted page views through Cloudflare; that was removed, and nothing replaced it.',
		practiceTitle: 'What this means in practice',
		clearingLead: 'Clearing your browser data will delete your regimen.',
		clearingBody:
			'This is the real risk of storing everything locally, and it is why the app has an export button. Use it.',
		devicesLead: 'Your data does not follow you between devices.',
		devicesBody:
			'Phone and laptop hold separate copies. Export from one and import into the other.',
		unlockLead: 'Anyone who can unlock your device can read it.',
		unlockBody: 'There is no separate app passcode. Your device lock is the protection.',
		noBackupLead: 'Nothing is backed up for you.',
		noBackupBody: 'I cannot recover your data, because I never had it.',
		deletingTitle: 'Deleting everything',
		deletingBody:
			'Setup has a button that erases all of it immediately. There is nothing to request, and no account to close.',
		deletingNoCopy:
			'Because I hold no personal data, there is no copy to request and nothing for me to delete remotely. That is by design: the safest way to handle sensitive health data is not to receive it.',
		deletingContact: 'Questions about this privacy model can go to'
	},
	roadmap: {
		title: 'Roadmap',
		metaDescription: 'What is being worked on next, and what will never be built.',
		noDates:
			'No dates. This is built by one person in evenings, and a date would be a guess dressed up as a promise. The order below is roughly the order of work.',
		workingTitle: 'Working now',
		working: [
			'Your schedule, with multi-pill doses, half tablets and as-needed medication',
			'Days of cover per product, from what you actually count into the box',
			'Reorder alerts, and a pharmacy order you can copy or email',
			'Dose changes that keep your history rather than overwriting it',
			'Calendar reminders you export once and import into your phone',
			'Backup and restore as a file you hold',
			'Works offline, with nothing about your health leaving the device'
		],
		remindersTitle: 'Next: proper reminders',
		reminders1:
			'The calendar export works and needs no server, but it has one real flaw: change a dose and the calendar is silently wrong until you export it again.',
		reminders2:
			'Push notifications fix that, and add the thing a calendar cannot: a "Taken" button on the notification itself, so recording a dose does not require opening the app. That is also the only honest way to track adherence: asking someone to open an app to confirm they took a pill mostly measures who remembers to open apps.',
		reminders3:
			'It will be built so the server learns nothing. The notification carries no content: the server knows only when to ping your device, and the words are assembled on the phone from data that never left it.',
		consultationsTitle: 'Next: your consultations',
		consultations1:
			'A date and a time for your next check-up, with a countdown next to the day counter you already see, and a reminder in the same calendar export as your doses.',
		consultations2:
			'Why this deserves to be a proper feature rather than a note in a corner: check-ups do not stop. Mine are still roughly every three months, more than ten years on. Software written for transplant recipients tends to assume an intense first year and then nothing, which is not how any of this works. The appointments, the blood tests and the pills all carry on indefinitely.',
		consultations3:
			'It should also change how ordering works. What you really want is enough medication to last until the next consultation, not an arbitrary sixty days. Once Graftful knows that date it can use it as the horizon, instead of a number you had to invent.',
		consultations4:
			'Recording a date is a diary entry, so this stays well clear of the line described below. Graftful will not suggest when a consultation ought to be, nor read anything into how far apart yours are.',
		blogTitle: 'Then: a blog',
		blog1:
			'Somewhere to write things down properly. The first post is already decided: a step-by-step guide to using Graftful — setting up your products, entering a dose made of several pills, counting your stock, and getting your first pharmacy order out.',
		blog2:
			'The app tries to explain itself, but some of this is genuinely fiddly the first time, and screenshots do in one glance what a paragraph of help text does badly. It would also give transplant coordinators something to point at that is not a login page.',
		blog3:
			'Likely posts after that: what the arithmetic actually is and why the app never chooses a dose; how the reminders work without a server; and what ten years of taking the same pills twice a day teaches you about the parts that are easy to get wrong.',
		thenTitle: 'Then',
		missedLead: 'Missed doses.',
		missedBody:
			'Recording that one was missed, and when it was due. Not what to do about it. See below.',
		languagesLead: 'More languages.',
		languagesBody:
			'English, French, German and Portuguese cover the whole app, the pharmacy order and the calendar file. Italian is next, for Ticino. Translations are welcome and go further than money.',
		expiryLead: 'Expiry dates and batch numbers.',
		expiryBody: 'Useful when a box has been in a cupboard for a year, and when there is a recall.',
		resultsLead: 'Somewhere for your results.',
		resultsBody:
			'A place to write down a blood result and keep it, as a diary, with no interpretation attached to it.',
		travelLead: 'Travel.',
		travelBody:
			'Working out how much to carry for a trip, and what a time-zone change does to a twelve-hour dosing interval.',
		consideringTitle: 'Being considered',
		surveyLead: 'An anonymous survey.',
		surveyBody:
			'Whether people find this useful, and what it is missing. A survey you choose to answer, not statistics collected quietly in the background, which would contradict everything on the privacy page.',
		carerLead: 'Sharing with a carer.',
		carerBody:
			'Genuinely difficult without a server that holds your data, which is the one thing this app does not do. No good answer yet.',
		neverTitle: 'Never',
		neverIntro:
			'These are not on a waiting list. They are the line between a tracking tool and a regulated medical device, and they are also decisions that belong to your prescriber.',
		never: [
			'Working out a dose from a blood level, your weight, or any test result',
			'Deciding which pills make up a dose you were given',
			'Telling you what to do about a missed dose',
			'Interaction warnings',
			'Judging a lab result: no thresholds, no trend arrows, no red numbers'
		],
		neverMoreLink: 'More on why',
		neverMoreAfter: ', including the exact wording of what this app is for.',
		missingTitle: 'Something missing?',
		missing1:
			"The most useful thing you can send me is the thing that annoyed you, or the case your regimen has that this app handles badly. Nobody's regimen is typical, and mine is only one of them.",
		suggestLink: 'Suggest it on GitHub',
		missingOrEmail: 'or email',
		missingBugBefore: 'If something is broken rather than missing,',
		bugLink: 'report a bug',
		missingBugAfter: 'instead.',
		missingPrivacyBefore:
			'GitHub issues are public, so please leave out medicine names, doses, transplant dates and anything else from your own regimen; email if it cannot be described without them. There are other ways to help on',
		supportLink: 'the support page',
		missingPrivacyAfter: ', including fixing a translation.'
	},
	support: {
		title: 'Support this',
		metaDescription:
			'Graftful is free. The most useful thing you can do is tell someone who needs it.',
		free1:
			'Graftful is free and will stay free. There is no paid tier, nothing is locked, and no feature depends on money changing hands.',
		free2:
			'It also costs almost nothing to run: a domain, and hosting that is free at this size. What it genuinely lacks is people knowing it exists. If you have found it useful, telling one other person is worth more than a donation.',
		tellTitle: 'Tell someone who needs it',
		recipientLead: 'Another recipient.',
		recipientBody:
			'Anyone in their first months after a transplant, drowning in boxes. That is the moment this helps most, and the moment nobody has the energy to go looking for a tool.',
		coordinatorLead: 'Your transplant coordinator.',
		coordinatorBody:
			'They are the people who actually have the adherence conversation, and they are usually glad of something concrete to point at. Not the reception desk.',
		pharmacistLead: 'Your GP or pharmacist.',
		pharmacistBody:
			'Your pharmacist in particular sees the consequences of bad reorder timing every week.',
		associationLead: 'A patient association or online group.',
		associationBody: 'One post reaches more people than I ever will alone.',
		tellNote:
			'Nothing to sign up for and nothing to install. Sharing the address is enough. It works in a browser first, and installs to the home screen if wanted.',
		wrongTitle: 'Tell me what is wrong with it',
		wrong1:
			'The thing that confused you, or that you had to work around. Confusion is a defect, not a user error.',
		wrong2:
			'The case your regimen has that Graftful handles badly. No two regimens are the same, and mine is only one of them.',
		wrong3: 'Anything that felt clinically wrong. That matters more than any other kind of report.',
		bugLink: 'Report a bug on GitHub',
		wrongOrEmail: 'or email',
		wrongNote: (version) =>
			`Both already carry the version you are running (${version}), so there is nothing to look up. GitHub issues are public: please do not include medicine names, doses, transplant dates, screenshots of your regimen or an exported backup. Use email if the problem cannot be described without personal health information. Graftful cannot advise on a missed dose or any medication decision; contact your transplant team for that.`,
		ideasTitle: 'Ideas and other contact',
		ideasBefore: 'For an idea or product feedback, use the',
		ideaLink: 'idea form on GitHub',
		ideasOrEmail: 'or email',
		contactBefore: 'For general questions, partnerships or media:',
		contactAfter:
			'. Email to the +bugs and +ideas addresses reaches the same mailbox and is sorted there; it is not copied automatically into a public GitHub issue. Security reports go to',
		securityAfter: 'instead, so a vulnerability is not made public before it is fixed.',
		translationTitle: 'Fix a translation',
		translationState:
			'The whole app is available in English, French, German and Portuguese, including the pharmacy order and the calendar file. The German has not been read by a native speaker yet.',
		translationBefore:
			'If a word reads wrong, awkward or too formal in your language, that is worth reporting. Send it as a',
		translationBugLink: 'bug',
		translationMiddle:
			', which needs no GitHub account, or if you are comfortable with code, edit the catalogue directly:',
		translationFilesLink: 'one file per language',
		translationAfter: 'in',
		translationWhy:
			'A wrong word in a medication app is not cosmetic. Someone deciding whether to trust this with their prescription reads the tone before they read the features, and a translation reaches an entire country that cannot currently use the whole app. It goes considerably further than money does.',
		moneyTitle: 'If you would still rather send something',
		moneyNote: 'Genuinely optional. Managing a transplant is expensive enough.',
		twintAlt: 'TWINT QR code'
	},
	notFound: {
		title: 'Page not found',
		body404:
			'There is no page at this address. The link may be mistyped, or it may point at something this version of Graftful does not have.',
		bodyOther: 'Something went wrong loading this page.',
		dataSafe:
			'Nothing you have entered is affected. Your regimen, stock counts and history are stored by your browser on this device, and a bad link does not touch them.',
		goToToday: 'Go to Today'
	}
};
