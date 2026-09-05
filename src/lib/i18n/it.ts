import type { Messages } from './messages.ts';

/**
 * Italian (international).
 *
 * Standard Italian rather than a Ticino variant, so the wording reads the same in Lugano,
 * Milan or Rome — transplant recipients move, and a canton-sized variant would exclude
 * far more readers than it would please.
 *
 * "Lei" throughout, as with the French, German and Portuguese. This is read by strangers
 * of every age about their own medication.
 */
export const it: Messages = {
	nav: {
		today: 'Oggi',
		stock: 'Scorte',
		order: 'Ordine',
		setup: 'Impostazioni',
		sections: 'Sezioni'
	},
	footer: {
		menu: 'Menu',
		about: 'Informazioni',
		roadmap: 'Programma',
		privacy: 'Privacy',
		support: 'Sostieni'
	},
	header: {
		elapsed: (days, years, months, d) =>
			`Giorno ${days} · ${years} a ${months} m ${d} g dal trapianto`,
		milestoneToday: (label) => `Oggi è ${label}.`,
		milestoneIn: (label, days) => `${label} tra ${days} ${days === 1 ? 'giorno' : 'giorni'}.`,
		anniversaryLabel: (years) => `${years} ${years === 1 ? 'anno' : 'anni'} dal suo trapianto`,
		dayLabel: (day) => `il giorno ${day}`
	},
	common: {
		loading: 'Caricamento…',
		close: 'Chiudi',
		none: 'Ancora nessuno.',
		notInUse: 'non in uso',
		stockLabelled: (state) => `Scorte: ${state}`,
		stockEnough: 'sufficienti',
		days: 'giorni',
		save: 'Salva',
		edit: 'Modifica',
		errorPackageSize: 'Le unità per scatola devono essere un numero intero, almeno 1.'
	},
	today: {
		title: 'Oggi',
		metaDescription: 'Cosa prendere oggi, e a che ora.',
		emptyTitle: 'Non è ancora stato configurato nulla',
		emptyBody:
			'Graftful conserva il suo schema terapeutico e le scorte di compresse su questo dispositivo. Nulla viene inviato e non esiste alcun account.',
		loadExample: 'Carica un esempio',
		setUpManually: 'Configura manualmente',
		exampleNote:
			'L’esempio usa nomi di farmaci inventati, ma la struttura è reale: undici prodotti, due dosi composte da più compresse, mezza compressa e un antidolorifico al bisogno. Utile per vedere come funziona prima di inserire i propri dati.',
		needsReorder: (count) =>
			count === 1
				? '1 prodotto deve essere riordinato.'
				: `${count} prodotti devono essere riordinati.`,
		openOrder: 'Apri l’ordine →',
		asNeeded: 'Al bisogno',
		noFixedSchedule: 'nessun orario fisso',
		summary: (pills, slots) =>
			`${pills} compresse al giorno, in ${slots} ${slots === 1 ? 'assunzione' : 'assunzioni'}.`
	},
	stock: {
		title: 'Scorte',
		metaDescription: 'Quante compresse restano e per quanto tempo bastano.',
		empty: 'Ancora nessun prodotto. Li aggiunga in Impostazioni.',
		orderNow: 'da ordinare',
		runningLow: 'in esaurimento',
		perBox: (size) => `${size} per scatola`,
		left: (units) => `${units} rimanenti`,
		perDay: (units) => `${units} al giorno`,
		nothingConsumes: 'Nulla consuma questo prodotto: sospeso, oppure solo al bisogno',
		onOrder: (units) => `${units} in ordine`,
		openActions: 'Modifica',
		refillLabel: (size) => `Rifornimento, in scatole da ${size}`,
		addUnits: (units) => `Aggiungi ${units} unità`,
		recountLabel: 'Riconteggio: unità effettivamente nella scatola',
		setTo: (units) => `Imposta a ${units}`,
		refillVsRecount:
			'Un rifornimento si aggiunge a quanto è registrato. Un riconteggio lo sostituisce. Lo usi quando il conteggio si è discostato dalla realtà.',
		boxSizeLabel: 'Unità per scatola, come la consegna la farmacia',
		boxSizeUnchanged: 'Dimensione della scatola invariata',
		correctTo: (size) => `Correggi a ${size}`,
		boxSizeNote:
			'All’inizio nessuno lo sa. Lo si scopre in farmacia, a volte solo quando arriva la scatola. Lo corregga qui appena conosce il numero reale. Cambia quante scatole chiederanno i prossimi ordini; non modifica ciò che ha già.',
		errorBoxes: 'Le scatole devono essere un numero intero, almeno 1.',
		errorCount: 'Un conteggio non può essere negativo.'
	},
	order: {
		title: 'Ordine',
		metaDescription: 'Preparare un ordine in farmacia prima di restare senza.',
		nothingNeeded: 'Non c’è nulla da ordinare.',
		nextRunAround: (date) => `Il prossimo passaggio in farmacia è previsto intorno al ${date}.`,
		nothingConsumedYet: 'Nessun prodotto è ancora in consumo.',
		forceOrder: 'Ordina comunque tutto in anticipo',
		atReorderPoint: (count) =>
			count === 1
				? '1 prodotto è al punto di riordino o sotto.'
				: `${count} prodotti sono al punto di riordino o sotto.`,
		daysLeft: (days) => `${days} giorni rimanenti`,
		jointNote:
			'Tutto il resto viene riportato allo stesso orizzonte, così il prossimo ordine diventa un unico passaggio in farmacia invece di diversi.',
		addAnythingTitle: 'Aggiungere altro?',
		addAnythingNote:
			'Nulla li consuma secondo un orario, quindi nessun calcolo li chiederà, ma finiscono anche loro. Vale la pena rifornirli mentre ordina.',
		boxesOf: (size) => `scatole da ${size}`,
		oneBoxFewer: 'Una scatola in meno',
		oneBoxMore: 'Una scatola in più',
		suggestedTitle: 'Ordine suggerito',
		whenReadyLabel: 'Per quando lo desidera pronto? (facoltativo)',
		whenReadyPlaceholder: 'venerdì mattina',
		capped: 'limitato',
		addedByYou: 'aggiunto da lei',
		coversTo: (days) => `copre ${days} giorni`,
		nextRunAfter: (date) =>
			`Dopo questo ordine, il prossimo passaggio è previsto intorno al ${date}.`,
		copied: 'Copiato',
		copyText: 'Copia il testo dell’ordine',
		openInEmail: 'Apri nell’e-mail',
		markOrdered: 'Segna come ordinato',
		markOrderedNote:
			'Segnarlo come ordinato registra la richiesta e chiude l’avviso. Non modifica le sue scorte: questo avviene quando l’ordine arriva.',
		fullText: 'Testo completo dell’ordine',
		awaitingTitle: 'In attesa di ritiro',
		outstanding: (units, date) => `${units} unità in sospeso, ordinate il ${date}`,
		receivedFull: 'Ricevuto per intero',
		receivedOneBox: 'Ricevuta solo 1 scatola',
		partialNote:
			'Questi prodotti vengono spesso consegnati in quantità incompleta. Registrare una consegna parziale mantiene visibile il resto invece di perderlo senza avviso.',
		fixBoxSize: 'Se la scatola era di un’altra dimensione, la corregga in Scorte →'
	},
	setup: {
		title: 'Impostazioni',
		metaDescription: 'I suoi prodotti, le dosi, gli avvisi e i backup.',

		remindersTitle: 'Avvisi',
		icsNever:
			'Nessuna API web permette di programmare una notifica in locale, quindi gli avvisi passano dal calendario del suo telefono. Esporti una volta e importi il file nell’app calendario.',
		icsStaleTitle: 'Il suo calendario non è aggiornato.',
		icsStaleBody:
			'Lo schema, la lingua o il fuso orario sono cambiati dall’ultima esportazione. Esporti di nuovo e importi ancora. Gli avvisi esistenti agli stessi orari verranno aggiornati; se un orario è stato rimosso o modificato, elimini prima dal calendario il vecchio avviso di Graftful.',
		icsCurrent: 'Il suo calendario corrisponde allo schema attuale.',
		exportIcs: 'Esporta gli avvisi (.ics)',
		icsNote:
			'I farmaci al bisogno restano fuori, perché non c’è un orario da mettere in un calendario. Le notifiche push, con un pulsante «assunto», arriveranno in una versione successiva.',

		languageTitle: 'Lingua',
		languageLabel: 'Lingua dell’app, dell’ordine in farmacia e dell’esportazione del calendario',
		followBrowser: (language) => `Segui il mio browser (${language})`,
		languageNote:
			'Imposta la lingua delle schermate e delle due cose che escono dall’app: l’ordine che invia alla farmacia e il file di calendario. Può così inviare un ordine in francese da un telefono in inglese.',

		timesTitle: 'I suoi orari abituali',
		timesLabel: 'Quando prende normalmente i farmaci, separati da virgole',
		saveTimes: 'Salva gli orari',
		errorNotATime: (values) => `Non è un orario: ${values}. Usi HH:MM, per esempio 08:00.`,
		errorNoTime: 'Indichi almeno un orario, per esempio 08:00.',
		timesNote:
			'Usati solo per precompilare gli orari quando aggiunge qualcosa di nuovo. Ogni dose conserva i propri e può modificarli singolarmente. Indichi quanto ha concordato con il suo centro; Graftful non suggerisce intervalli, perché la distanza fra le sue assunzioni è una decisione di chi le prescrive.',

		detailsTitle: 'Le sue informazioni',
		transplantDate: 'Data del trapianto',
		horizonLabel: 'Orizzonte di rifornimento in giorni: quanto tempo deve coprire un ordine',
		showMilestonesLabel: 'Mostra le tappe nell’intestazione',
		showMilestonesNote:
			'I conteggi tondi di giorni, come 1000 giorni, appaiono in alto quando si avvicinano. Il conteggio dei giorni resta in ogni caso.',
		errorBadDate: 'Questa data non esiste. Usi AAAA-MM-GG.',
		errorHorizon: 'L’orizzonte deve essere un numero intero di giorni, almeno 1.',

		productsTitle: 'Prodotti',
		reorderAt: (days) => `riordino a ${days} g`,
		retired: 'sospeso',
		brandName: 'Nome commerciale',
		strength: 'Dosaggio',
		unit: 'Unità',
		unitWholePill: 'cp (compressa intera)',
		unitsPerBox: 'Unità per scatola',
		unitsPerBoxAsk: 'Unità per scatola (chieda in farmacia)',
		reorderFloor: 'Soglia di riordino (giorni)',
		form: 'Forma (facoltativo)',
		formPlaceholder: 'compressa, capsula…',
		saveChanges: 'Salva le modifiche',
		errorProductFields:
			'Controlli il nome, il dosaggio, le unità per scatola e la soglia di riordino — ognuno deve essere un numero positivo.',
		confirmDeleteProduct: 'Eliminare definitivamente questo prodotto?',
		errorCouldNotDelete: 'Impossibile eliminare',
		restoreProduct: 'Riprendi a usare questo prodotto',
		restoreProductNote:
			'Ripristinarlo lo rimette nei calcoli dello schema e nella lista dell’ordine.',
		retire: 'Sospendi',
		retireNote:
			'Sospendere è il modo di smettere di usare qualcosa. Resta nella sua cronologia, mantiene le scorte e gli ordini passati continuano ad avere senso. Esce soltanto dagli ordini. È la scelta giusta quando un dosaggio non è più in commercio o quando una dose cambia.',
		deletePermanently: 'Elimina definitivamente',
		deleteProductNote:
			'Nulla fa riferimento a questo prodotto, quindi eliminarlo non perde nulla. Lo usi per qualcosa inserito per errore.',
		cannotDeleteProduct: (doses, stockEvents, orders) =>
			`Non è possibile eliminarlo: compare in ${doses} ${doses === 1 ? 'dose' : 'dosi'}, ${stockEvents} ${stockEvents === 1 ? 'registrazione' : 'registrazioni'} di scorte e ${orders} ${orders === 1 ? 'ordine' : 'ordini'}. Rimuoverlo lascerebbe una cronologia che non torna più. Lo sospenda invece.`,
		addProduct: 'Aggiungi un prodotto',
		unitsOnHand: 'Unità disponibili',
		addProductButton: 'Aggiungi prodotto',
		errorProductName: 'Dia un nome al prodotto.',
		errorStrength: 'Il dosaggio deve essere un numero positivo.',
		errorMinDays: 'La soglia di riordino deve essere un numero intero di giorni.',
		errorStockNegative: 'Le unità disponibili non possono essere negative.',
		addProductNote:
			'Se non conosce ancora la dimensione della scatola, inserisca la sua stima migliore. Potrà correggerla qui o da Scorte quando la farmacia glielo dirà, e influisce solo su quante scatole chiede un ordine.',

		therapiesTitle: 'Terapie',
		asNeededInline: 'al bisogno',
		doseVersions: (count) =>
			`${count} ${count === 1 ? 'versione della dose' : 'versioni della dose'}`,
		stoppedOn: (date) => `interrotta il ${date}`,
		name: 'Nome',
		category: 'Categoria',
		activeIngredient: 'Principio attivo (facoltativo)',
		activeIngredientPlaceholder: 'l’assunzione del mattino',
		startedOn: 'Iniziata il',
		asNeededCheckbox: 'Al bisogno (senza orario)',
		saveDetails: 'Salva le informazioni',
		doseHistoryTitle: 'Cronologia delle dosi',
		now: 'adesso',
		perDayUnit: (amount, unit) => `${amount} ${unit}/giorno`,
		doseMismatch: (declared, composed, unit) =>
			`Registrata come ${declared} ${unit} prescritti, ma i prodotti indicati sommano ${composed} ${unit}. Vale la pena verificare con la sua ricetta.`,
		changeDoseTitle: 'Modifica la dose',
		changeDoseNote:
			'Inserisca ciò che prenderà effettivamente. Il totale viene calcolato da questo, mai il contrario, perché solo chi le prescrive può decidere come è composta una dose.',
		firstDayLabel: 'Primo giorno della nuova dose',
		time: 'Orario',
		removeTime: 'Rimuovi l’orario',
		product: 'Prodotto',
		retiredParen: '(sospeso)',
		pills: 'Compresse',
		removeProduct: 'Rimuovi questo prodotto',
		addProductHere: 'Aggiungi un prodotto qui',
		addAnotherTime: 'Aggiungi un altro orario',
		declaredLabel: 'Quanto ha detto il medico (facoltativo)',
		entryComesTo: 'Quanto ha inserito corrisponde a',
		perDayAmount: (amount, unit) => `${amount} ${unit} al giorno`,
		declaredMismatch: (declared, unit) =>
			`, che non corrisponde ai ${declared} ${unit} che ha registrato.`,
		retiredWarning: (names, count) =>
			count === 1
				? `${names} è sospeso. Salvando lo rimette in uso, quindi verrà di nuovo programmato e ordinato.`
				: `${names} sono sospesi. Salvando li rimette in uso, quindi verranno di nuovo programmati e ordinati.`,
		saveNewDose: 'Salva la nuova dose',
		errorBadStartDate: 'Questa data di inizio non esiste. Usi AAAA-MM-GG.',
		errorSlotTime: (value) => `«${value}» non è un orario. Usi HH:MM, per esempio 08:00.`,
		errorUnits: 'Ogni prodotto deve avere una quantità superiore a zero.',
		errorChooseProduct: 'Scelga un prodotto per ogni riga.',
		errorSaveDose: 'Impossibile salvare la dose',
		changeDoseFooter:
			'La dose che prende adesso resta nella sua cronologia e termina il giorno prima dell’inizio di questa. Dopo dovrà esportare di nuovo gli avvisi del calendario.',
		resumeTherapy: 'Riprendi questa terapia',
		stopTherapy: 'Interrompi questa terapia',
		stopTherapyNote:
			'Interrompere termina il consumo da oggi e conserva tutte le dosi registrate, così cosa ha preso e quando resta consultabile.',
		cannotDeleteTherapy: (since, doses) =>
			doses === 1
				? `Non è possibile eliminarla: è in uso dal ${since}, e la dose registrata è il documento di ciò che ha preso. La interrompa invece.`
				: `Non è possibile eliminarla: è in uso dal ${since}, e le sue ${doses} dosi registrate sono il documento di ciò che ha preso. La interrompa invece.`,
		confirmDeleteTherapy: 'Eliminare questa terapia e le sue dosi?',
		addTherapy: 'Aggiungi una terapia',
		timesCommaLabel: 'Orari, separati da virgole',
		addTherapyDoseNote:
			'Cosa prendere a ciascuno di quegli orari. Una dose può combinare prodotti: 14 mg dell’assunzione del mattino sono 3 × 4 mg più 1 × 2 mg.',
		pillsPerTime: 'Compresse per assunzione',
		addProductToDose: 'Aggiungi un prodotto a questa dose',
		sameCombinationNote: (changeDoseLabel) =>
			`La stessa combinazione viene usata a ogni orario indicato. Per dosi diverse fra mattina e sera, la aggiunga qui e poi usi ${changeDoseLabel} sopra, che modifica ogni orario separatamente.`,
		addTherapyButton: 'Aggiungi terapia',
		errorTherapyName: 'Dia un nome alla terapia.',
		errorTimes: 'Controlli gli orari: usi HH:MM, per esempio 08:00.',
		errorProductQuantity: 'Scelga un prodotto e una quantità positiva per ogni riga.',

		dataTitle: 'I suoi dati',
		dataNote:
			'Tutto è conservato su questo dispositivo. Cancellare i dati del browser li elimina, quindi conservi un backup.',
		storageNotGuaranteed:
			'Questo browser non garantisce che i dati conservati qui siano permanenti: potrebbero essere rimossi se il dispositivo esaurisce lo spazio. La protezione è esportare un backup di tanto in tanto.',
		exportBackup: 'Esporta il backup (JSON)',
		importBackup: 'Importa un backup',
		errorNothingToExport:
			'Non c’è ancora nulla da esportare — su questo dispositivo non esiste alcuno schema.',
		errorImportFailed: 'Importazione non riuscita',
		confirmImport:
			'Importare questo backup sostituirà tutti i prodotti, le dosi, i conteggi delle scorte e gli ordini su questo dispositivo. Continuare?',
		restoredWithProblems: (count) =>
			`Ripristinato, con ${count} ${count === 1 ? 'problema' : 'problemi'}:`,

		dangerTitle: 'Attenzione',
		deleteAll: 'Elimina tutti i dati',
		deleting: 'Eliminazione…',
		confirmDeleteAll: 'Eliminare tutto su questo dispositivo?',
		deleteDone: 'Tutto su questo dispositivo è stato eliminato.',
		errorDeleteFailed: 'Eliminazione non riuscita'
	},
	about: {
		title: 'Informazioni su Graftful',
		metaDescription: 'Cosa fa Graftful, cosa deliberatamente non fa e chi l’ha realizzato.',
		intro:
			'Graftful aiuta chi assume farmaci a lungo termine a tenere traccia di cosa prendere, quanto ne resta e quando riordinare. È stato realizzato per le persone trapiantate, che prendono gli stessi farmaci ogni giorno per il resto della vita e per le quali restare senza non è un piccolo inconveniente.',
		introNote:
			'È gratuito, non ha account, non ha pubblicità e funziona senza connessione. Nulla che riguardi la sua salute lascia il suo dispositivo.',
		purposeTitle: 'A cosa serve',
		purposeStatement:
			'Graftful è uno strumento di autogestione per chi assume farmaci a lungo termine. Conserva uno schema terapeutico inserito dall’utente, ricorda quando è prevista un’assunzione, tiene traccia di quante compresse restano e aiuta a preparare un ordine in farmacia. Non fornisce consigli medici, non interpreta dati clinici e non determina né suggerisce alcuna dose.',
		notTitle: 'Cosa deliberatamente non farà',
		notIntro:
			'Non sono funzioni mancanti. Sono il confine che tiene questo strumento nel campo del monitoraggio e non in quello di qualcosa che dovrebbe essere regolamentato come dispositivo medico. E, più semplicemente, sono decisioni che spettano a chi le prescrive e non a un’app.',
		notDoseLead: 'Calcolare una dose',
		notDoseBody: 'da un livello ematico, dal suo peso o da qualsiasi esame.',
		notCombinationLead: 'Decidere quali compresse compongono una dose.',
		notCombinationBody:
			'Dato «14 mg», non deciderà che significa tre capsule da 4 mg più una da 2 mg. È lei a inserire ciò che le è stato prescritto. Esistono ragioni cliniche reali per cui viene scelta una combinazione precisa.',
		notMissedDoseLead: 'Dirle cosa fare per una dose dimenticata.',
		notMissedDoseBody:
			'Le mostrerà che una dose è stata dimenticata e a che ora era prevista. Cosa fare poi è una domanda per il suo centro trapianti.',
		notInteractions: 'Avvisare delle interazioni fra farmaci.',
		notLabResultLead: 'Interpretare un esame.',
		notLabResultBody:
			'Registrare un livello ematico è una voce di diario, e va bene. Colorarlo di rosso, o definirlo «fuori intervallo», è un giudizio che questa app non dà.',
		notDatabaseLead: 'Arrivare con una banca dati di farmaci.',
		notDatabaseBody:
			'Ogni dose in Graftful è stata inserita da lei, quindi non è mai l’origine di un numero clinico.',
		arithmeticNote:
			'Fa aritmetica sui numeri che ha inserito lei: per quanti giorni basteranno le scorte e quante scatole chiedere in farmacia. Se registra una dose totale e le compresse che elenca non la raggiungono, Graftful dice che i due valori non coincidono. Confronta due numeri suoi e non decide mai quale sia quello giusto.',
		nameTitle: 'Da dove viene il nome',
		nameGraft:
			'«Graft», in inglese, è l’organo trapiantato stesso: il rene, il fegato, il cuore o il polmone che qualcuno le ha donato. La parola è più antica della medicina: viene dall’orticoltura, dove innestare significa unire il tessuto vivo di una pianta a un’altra perché le due crescano come una sola. Che è esattamente ciò che è un trapianto.',
		nameFul:
			'«-ful» è il comune suffisso inglese che significa «pieno di». Graftful vuol dire quindi «pieno di innesto», e somiglia abbastanza a «grateful», grato, perché non sia un caso. Chi ne ha uno sa perché.',
		nameNotOrganSpecific:
			'Il nome non è nemmeno legato a un organo, e questo è deliberato. La prima versione avrebbe avuto un nome legato ai reni, e sarebbe stato un errore: l’aritmetica quotidiana degli immunosoppressori è la stessa qualunque sia l’organo ricevuto.',
		markTitle: 'E il simbolo',
		markAlt: 'Il simbolo di Graftful: un fusto con un nuovo germoglio che vi si unisce di lato',
		markStrokes:
			'Due tratti: un fusto che continua e un nuovo germoglio che vi si unisce di lato. È un innesto nel senso orticolo, quello più antico, ed è per questo che non contiene né siringhe, né croci, né organi.',
		markJoinLead: 'L’innesto è di lato di proposito.',
		markJoinBody:
			'Un innesto non va dove stava l’originale. Un rene trapiantato viene collocato davanti, nell’addome, mentre i due con cui è nato restano dove sono, dietro. Una biforcazione simmetrica direbbe «sostituito». Questa dice «unito in un posto nuovo», che è ciò che è realmente accaduto.',
		markHand:
			'Sembra anche una mano che fa una V, e la cosa non mi dispiace. Fare pace con l’innesto, e con le compresse che lo accompagnano, è la maggior parte di ciò che vivere con un trapianto si rivela essere.',
		originTitle: 'Da dove nasce',
		origin1:
			'Sono Luis. Ho ricevuto un trapianto di rene al CHUV di Lausanne l’11 gennaio 2016 e, come tutti quelli che escono da un centro trapianti, sono uscito con un sacchetto di scatole e nessun sistema per gestirle.',
		origin2:
			'Quello che ho finito per costruire è stato un foglio di calcolo. Conteneva ogni prodotto, quante compresse al giorno faceva, quante ne restavano nella scatola e la colonna che contava davvero: quanti giorni erano. Quando un numero scendeva, scrivevo alla farmacia. L’ho tenuto a mano per anni e funzionava, ma funzionava solo perché a me i fogli di calcolo piacciono. Mi pareva assurdo pretenderlo da qualcuno a tre settimane da un trapianto.',
		origin3:
			'Graftful è quel foglio di calcolo, ricostruito perché nessun altro debba inventarlo. L’aritmetica al suo interno è quella che facevo a mano, e le parti scomode dell’esempio ci sono perché c’erano nel mio: una dose fatta di tre dosaggi diversi, mezza compressa, una dose a scalare e un dosaggio uscito dal commercio a metà del trattamento.',
		originNote:
			'Lo schema di esempio nell’app usa nomi di farmaci inventati. I numeri sono reali, i prodotti no: cosa prende ciascuno non riguarda nessun altro, me compreso. Questo non è un prodotto ospedaliero e non è collegato ad alcun centro trapianti.',
		madeByTitle: 'Chi l’ha realizzato',
		madeByBefore: 'Realizzato con cura da Luis e da',
		madeByAfter:
			': una persona trapiantata e un assistente IA, partendo da cinque anni di foglio di calcolo per costruire solo le parti che si sono rivelate importanti.',
		madeByNote:
			'Ogni confine clinico qui sopra è stato una decisione deliberata e non una funzione mancante, e l’aritmetica è verificata su ordini reali di farmacia e non su se stessa.',
		donateBefore: 'Se Graftful le è utile, una',
		donateLink: 'donazione',
		donateAfter: ' aiuta a tenerlo online. ❤️',
		licenceTitle: 'Codice e licenza',
		licenceBefore: 'Graftful è',
		licenceLink: 'software libero su GitHub',
		licenceAfter:
			', con licenza AGPL-3.0. Conta per una ragione pratica e non ideologica: ci sono persone che ne dipendono ogni giorno per farmaci che non possono saltare, e se smettessi di mantenerlo nessuno dovrebbe restare a piedi. La licenza impedisce anche che qualcuno lo chiuda.',
		licenceName: 'Il nome è riservato, quindi una versione derivata deve chiamarsi diversamente.',
		trademarks:
			'PayPal, GitHub, Cloudflare e Kiro sono marchi dei rispettivi proprietari. Nominarli qui indica soltanto su cosa si appoggia Graftful e verso cosa rimanda; nessuno di essi è affiliato a Graftful né lo avalla.',
		version: (version) => `Versione ${version}`
	},
	privacy: {
		title: 'Privacy',
		metaDescription: 'Cosa conserva Graftful, dove lo conserva e come verificarlo.',
		headline: 'I suoi dati sui farmaci non lasciano mai il suo dispositivo.',
		headlineBody:
			'Non c’è account, non c’è accesso e non c’è alcun server che conservi il suo schema. Tutto ciò che inserisce (prodotti, dosi, conteggi delle scorte, ordini, la sua data del trapianto) è conservato dal browser sul dispositivo che sta usando, e in nessun altro posto.',
		checkTitle: 'Come verificarlo, invece di credere alla mia parola',
		checkBody:
			'Apra gli strumenti per sviluppatori del browser, vada alla scheda Rete e poi usi l’app: aggiunga un prodotto, registri un conteggio delle scorte, generi un ordine. Non verrà inviato nulla. Questo vale più di qualsiasi informativa sulla privacy, perché sta osservando il comportamento reale invece di leggere un’affermazione al riguardo.',
		collectedTitle: 'Non viene raccolto nulla',
		collected:
			'Nessuna statistica, nessun contatore di visite e nessuno script di terze parti. L’app carica solo file che serve da sé, quindi dopo la prima visita non ha bisogno della rete. Una versione precedente contava le visite tramite Cloudflare; è stato rimosso e nulla l’ha sostituito.',
		practiceTitle: 'Cosa significa in pratica',
		clearingLead: 'Cancellare i dati del browser elimina il suo schema.',
		clearingBody:
			'È il vero rischio di conservare tutto in locale, ed è il motivo per cui l’app ha un pulsante di esportazione. Lo usi.',
		devicesLead: 'I suoi dati non la seguono da un dispositivo all’altro.',
		devicesBody:
			'Telefono e computer conservano copie separate. Esporti da uno e importi nell’altro.',
		unlockLead: 'Chi riesce a sbloccare il suo dispositivo può leggerli.',
		unlockBody:
			'Non esiste un codice separato per l’app. Il blocco del dispositivo è la protezione.',
		noBackupLead: 'Nulla viene salvato al suo posto.',
		noBackupBody: 'Non posso recuperare i suoi dati, perché non li ho mai avuti.',
		deletingTitle: 'Eliminare tutto',
		deletingBody:
			'Le impostazioni hanno un pulsante che cancella tutto immediatamente. Non c’è nulla da richiedere e nessun account da chiudere.',
		deletingNoCopy:
			'Poiché non conservo dati personali, non c’è alcuna copia da richiedere e nulla che io possa eliminare a distanza. È voluto: il modo più sicuro di trattare dati sanitari sensibili è non riceverli.',
		deletingContact: 'Le domande su questo modello di privacy possono essere inviate a'
	},
	roadmap: {
		title: 'Programma',
		metaDescription: 'Cosa si sta preparando e cosa non verrà mai realizzato.',
		noDates:
			'Nessuna data. Questo è costruito da una persona sola alla sera, e una data sarebbe un’ipotesi travestita da promessa. L’ordine qui sotto è più o meno l’ordine del lavoro.',
		workingTitle: 'Cosa funziona già',
		working: [
			'Il suo schema, con dosi da più compresse, mezze compresse e farmaci al bisogno',
			'Giorni di copertura per prodotto, a partire da quanto conta davvero nella scatola',
			'Avvisi di riordino e un testo d’ordine da copiare o inviare per e-mail',
			'Modifiche di dose che conservano la cronologia invece di sovrascriverla',
			'Avvisi di calendario da esportare una volta e importare nel telefono',
			'Backup e ripristino come file suo',
			'Funziona senza connessione e, una volta caricata, non fa alcuna richiesta di rete'
		],
		remindersTitle: 'Poi: avvisi veri',
		reminders1:
			'L’esportazione del calendario funziona e non richiede alcun server, ma ha un difetto reale: se cambia una dose, il calendario resta silenziosamente sbagliato fino a una nuova esportazione.',
		reminders2:
			'Le notifiche push risolvono questo e aggiungono ciò che un calendario non può dare: un pulsante «Assunto» sulla notifica stessa, così registrare un’assunzione non richiede di aprire l’app. È anche l’unico modo onesto di seguire l’aderenza: chiedere a qualcuno di aprire un’app per confermare di aver preso una compressa misura soprattutto chi si ricorda di aprire le app.',
		reminders3:
			'Verrà costruito perché il server non apprenda nulla. La notifica non porta contenuti: il server sa solo quando avvisare il suo dispositivo, e il testo viene composto sul telefono a partire da dati che non l’hanno mai lasciato.',
		consultationsTitle: 'Poi: le sue visite',
		consultations1:
			'Una data e un’ora per il prossimo controllo, con un conto alla rovescia accanto al contatore dei giorni che già vede, e un avviso nella stessa esportazione di calendario delle sue assunzioni.',
		consultations2:
			'Perché questo merita di essere una funzione vera e non una nota in un angolo: i controlli non finiscono. I miei sono ancora circa ogni tre mesi, più di dieci anni dopo. Il software scritto per le persone trapiantate tende a presupporre un primo anno intenso e poi nulla, e non è così che funziona. Le visite, gli esami del sangue e le compresse continuano a tempo indeterminato.',
		consultations3:
			'Dovrebbe anche cambiare il modo di ordinare. Ciò che serve davvero è avere farmaci che bastino fino alla prossima visita, non sessanta giorni arbitrari. Quando Graftful conoscerà quella data potrà usarla come orizzonte, invece di un numero che ha dovuto inventare.',
		consultations4:
			'Registrare una data è una voce di diario, quindi questo resta ben lontano dal confine descritto qui sotto. Graftful non suggerirà quando dovrebbe essere una visita, né trarrà conclusioni dalla distanza fra le sue.',
		blogTitle: 'Poi: un blog',
		blog1:
			'Un posto dove scrivere le cose come si deve. Il primo articolo è già deciso: una guida passo per passo all’uso di Graftful — configurare i prodotti, inserire una dose composta da più compresse, contare le scorte e mandare il primo ordine in farmacia.',
		blog2:
			'L’app prova a spiegarsi, ma alcune di queste cose sono davvero delicate la prima volta, e un’immagine fa in un colpo d’occhio quello che un paragrafo di aiuto fa male. Darebbe anche ai coordinatori dei trapianti qualcosa da mostrare che non sia una pagina di accesso.',
		blog3:
			'Probabili articoli successivi: in cosa consiste davvero l’aritmetica e perché l’app non sceglie mai una dose; come funzionano gli avvisi senza un server; e cosa insegnano dieci anni delle stesse compresse due volte al giorno sulle parti che è facile sbagliare.',
		thenTitle: 'Poi',
		missedLead: 'Dosi dimenticate.',
		missedBody:
			'Registrare che una dose è stata dimenticata e a che ora era prevista. Non cosa fare al riguardo. Vedi qui sotto.',
		languagesLead: 'Altre lingue.',
		languagesBody:
			'Inglese, francese, tedesco, portoghese e italiano coprono tutta l’app, l’ordine in farmacia e il file di calendario. Le traduzioni sono benvenute e vanno più lontano del denaro.',
		expiryLead: 'Date di scadenza e numeri di lotto.',
		expiryBody:
			'Utili quando una scatola è in un armadietto da un anno, e quando c’è un richiamo di lotto.',
		resultsLead: 'Un posto per i suoi esami.',
		resultsBody:
			'Un posto dove annotare un risultato del sangue e conservarlo, come un diario, senza alcuna interpretazione.',
		travelLead: 'Viaggi.',
		travelBody:
			'Calcolare quanto portare per un viaggio, e cosa comporta un cambio di fuso orario per un intervallo di dodici ore fra le assunzioni.',
		consideringTitle: 'In valutazione',
		surveyLead: 'Un questionario anonimo.',
		surveyBody:
			'Sapere se questo è utile e cosa manca. Un questionario a cui si sceglie di rispondere, non statistiche raccolte silenziosamente in secondo piano, che contraddirebbero tutto quanto è scritto nella pagina sulla privacy.',
		carerLead: 'Condividere con chi la assiste.',
		carerBody:
			'Davvero difficile senza un server che conservi i suoi dati, che è precisamente l’unica cosa che questa app non fa. Ancora senza una buona risposta.',
		neverTitle: 'Mai',
		neverIntro:
			'Non sono in lista d’attesa. Sono il confine fra uno strumento di monitoraggio e un dispositivo medico regolamentato, e sono anche decisioni che spettano a chi le prescrive.',
		never: [
			'Calcolare una dose da un livello ematico, dal suo peso o da qualsiasi esame',
			'Decidere quali compresse compongono una dose che le è stata prescritta',
			'Dirle cosa fare per una dose dimenticata',
			'Avvisi sulle interazioni',
			'Giudicare un esame: nessuna soglia, nessuna freccia di tendenza, nessun numero rosso'
		],
		neverMoreLink: 'Altro sulle ragioni',
		neverMoreAfter: ', compresa la formulazione esatta di ciò a cui serve questa app.',
		missingTitle: 'Manca qualcosa?',
		missing1:
			'La cosa più utile che può mandarmi è ciò che l’ha infastidita, o il caso che il suo schema presenta e che questa app gestisce male. Nessuno schema è tipico, e il mio è solo uno fra tanti.',
		suggestLink: 'Lo proponga su GitHub',
		missingOrEmail: 'o scriva a',
		missingBugBefore: 'Se qualcosa è rotto invece di mancante,',
		bugLink: 'segnali un problema',
		missingBugAfter: 'invece.',
		missingPrivacyBefore:
			'Le segnalazioni su GitHub sono pubbliche, quindi lasci fuori nomi di farmaci, dosi, date di trapianto e qualsiasi altro dato del suo schema; scriva un’e-mail se non è possibile descriverlo senza. Ci sono altri modi di aiutare su',
		supportLink: 'la pagina di sostegno',
		missingPrivacyAfter: ', compreso correggere una traduzione.'
	},
	support: {
		title: 'Sostieni',
		metaDescription:
			'Graftful è gratuito. La cosa più utile che può fare è parlarne a chi ne ha bisogno.',
		free1:
			'Graftful è gratuito e resterà gratuito. Non c’è un livello a pagamento, nulla è bloccato e nessuna funzione dipende dal denaro.',
		free2:
			'Ciò che le manca davvero è che la gente sappia che esiste. Se l’ha trovato utile, parlarne a una persona vale più di una donazione.',
		tellTitle: 'Ne parli a chi ne ha bisogno',
		recipientLead: 'Un’altra persona trapiantata.',
		recipientBody:
			'Chi è nei primi mesi dopo un trapianto, sommerso di scatole. È il momento in cui questo aiuta di più, e il momento in cui nessuno ha l’energia di andare a cercare uno strumento.',
		coordinatorLead: 'Il suo coordinatore dei trapianti.',
		coordinatorBody:
			'Sono le persone che hanno davvero la conversazione sull’aderenza, e di solito sono contente di avere qualcosa di concreto da mostrare. Non la reception.',
		pharmacistLead: 'Il suo medico di famiglia o il farmacista.',
		pharmacistBody:
			'Il farmacista in particolare vede ogni settimana le conseguenze di riordini mal calcolati.',
		associationLead: 'Un’associazione di pazienti o un gruppo online.',
		associationBody: 'Un solo post raggiunge più persone di quante ne raggiungerò mai da solo.',
		tellNote:
			'Niente da registrare e niente da installare. Condividere l’indirizzo è sufficiente. Funziona prima di tutto in un browser, e si installa nella schermata principale se lo desidera.',
		wrongTitle: 'Mi dica cosa non va',
		wrong1:
			'Ciò che l’ha confusa, o che ha dovuto aggirare. La confusione è un difetto, non un errore dell’utente.',
		wrong2:
			'Il caso che il suo schema presenta e che Graftful gestisce male. Non esistono due schemi uguali, e il mio è solo uno fra tanti.',
		wrong3:
			'Tutto ciò che le è sembrato clinicamente sbagliato. Questo conta più di qualsiasi altro tipo di segnalazione.',
		bugLink: 'Segnala un problema su GitHub',
		wrongOrEmail: 'o scriva a',
		wrongNote: (version) =>
			`Entrambi portano già la versione che sta usando (${version}), quindi non c’è nulla da cercare. Le segnalazioni su GitHub sono pubbliche: la prego di non includere nomi di farmaci, dosi, date di trapianto, immagini del suo schema o un backup esportato. Usi l’e-mail se il problema non può essere descritto senza informazioni sanitarie personali. Graftful non può dare indicazioni su una dose dimenticata né su alcuna decisione terapeutica; per questo contatti la sua équipe dei trapianti.`,
		ideasTitle: 'Idee e altri contatti',
		ideasBefore: 'Per un’idea o un commento sul prodotto, usi il',
		ideaLink: 'modulo per le idee su GitHub',
		ideasOrEmail: 'o scriva a',
		contactBefore: 'Per domande generali, collaborazioni o stampa:',
		contactAfter:
			'. Le e-mail agli indirizzi +bugs e +ideas arrivano nella stessa casella e vengono smistate lì; non vengono copiate automaticamente in una segnalazione pubblica su GitHub. Le segnalazioni di sicurezza vanno a',
		securityAfter: 'invece, così una vulnerabilità non diventa pubblica prima di essere corretta.',
		translationTitle: 'Correggere una traduzione',
		translationState:
			'Tutta l’app è disponibile in inglese, francese, tedesco, portoghese e italiano, compresi l’ordine in farmacia e il file di calendario.',
		translationBefore:
			'Se una parola suona sbagliata, goffa o troppo formale nella sua lingua, vale la pena segnalarlo. La invii come',
		translationBugLink: 'problema',
		translationMiddle:
			', che non richiede un account GitHub, oppure, se se la cava con il codice, modifichi direttamente il catalogo:',
		translationFilesLink: 'un file per lingua',
		translationAfter: 'in',
		translationWhy:
			'Una parola sbagliata in un’app per i farmaci non è un dettaglio estetico. Chi sta decidendo se affidarle la propria terapia legge il tono prima delle funzioni, e una traduzione raggiunge un paese intero. Va considerevolmente più lontano del denaro.',
		moneyTitle: 'Fare una donazione ❤️',
		moneyNote:
			'Se Graftful le è utile, una donazione aiuta a tenerlo online. L’ho creato perché anch’io vivo con questa disabilità invisibile. Davvero facoltativo — gestire un trapianto è già abbastanza costoso.'
	},
	notFound: {
		title: 'Pagina non trovata',
		body404:
			'A questo indirizzo non c’è nessuna pagina. Il link potrebbe essere scritto male, oppure puntare a qualcosa che questa versione di Graftful non ha.',
		bodyOther: 'Si è verificato un errore durante il caricamento di questa pagina.',
		dataSafe:
			'Nulla di ciò che ha inserito viene toccato. Il suo schema, i conteggi delle scorte e la cronologia sono conservati dal browser su questo dispositivo, e un link sbagliato non li tocca.',
		goToToday: 'Vai a Oggi'
	}
};
