import type { Messages } from './messages.ts';

/**
 * French (international).
 *
 * The launch language: the first users come from a French-speaking transplant centre.
 * Kept free of Swiss-only vocabulary so it reads naturally anywhere French is spoken —
 * no "huitante", and nothing that assumes a Swiss pharmacy.
 *
 * Vouvoiement throughout. Addressing a stranger about their own medication with "tu"
 * would be wrong, and this is read by people of every age.
 */
export const fr: Messages = {
	nav: {
		today: 'Aujourd’hui',
		stock: 'Stock',
		order: 'Commande',
		setup: 'Réglages',
		sections: 'Sections'
	},
	footer: {
		menu: 'Menu',
		about: 'À propos',
		roadmap: 'Feuille de route',
		privacy: 'Confidentialité',
		support: 'Soutenir'
	},
	header: {
		elapsed: (days, years, months, d) =>
			`Jour ${days} · ${years} a ${months} m ${d} j depuis la transplantation`,
		milestoneToday: (label) => `Aujourd’hui, c’est ${label}.`,
		milestoneIn: (label, days) => `${label} dans ${days} ${days === 1 ? 'jour' : 'jours'}.`,
		anniversaryLabel: (years) =>
			`${years} ${years === 1 ? 'an' : 'ans'} depuis votre transplantation`,
		dayLabel: (day) => `le jour ${day}`
	},
	common: {
		loading: 'Chargement…',
		close: 'Fermer',
		none: 'Aucun pour l’instant.',
		notInUse: 'non utilisé',
		days: 'jours',
		save: 'Enregistrer',
		edit: 'Modifier',
		errorPackageSize: 'Les unités par boîte doivent être un nombre entier, au moins 1.'
	},
	today: {
		title: 'Aujourd’hui',
		metaDescription: 'Ce qu’il faut prendre aujourd’hui, et à quelle heure.',
		emptyTitle: 'Rien n’est encore configuré',
		emptyBody:
			'Graftful conserve votre schéma de traitement et votre stock de comprimés sur cet appareil. Rien n’est transmis, et il n’y a pas de compte.',
		loadExample: 'Charger l’exemple',
		setUpManually: 'Configurer moi-même',
		exampleNote:
			'L’exemple utilise des noms de médicaments inventés, mais sa structure est réelle : onze produits, deux doses composées de plusieurs comprimés, un demi-comprimé et un antalgique en réserve. Utile pour voir comment cela fonctionne avant de saisir le vôtre.',
		needsReorder: (count) =>
			count === 1 ? '1 produit doit être commandé.' : `${count} produits doivent être commandés.`,
		openOrder: 'Voir la commande →',
		asNeeded: 'En réserve',
		noFixedSchedule: 'pas d’horaire fixe',
		summary: (pills, slots) =>
			`${pills} comprimés par jour, répartis sur ${slots} ${slots === 1 ? 'prise' : 'prises'}.`
	},
	stock: {
		title: 'Stock',
		metaDescription: 'Combien de comprimés il reste, et pour combien de temps.',
		empty: 'Aucun produit pour l’instant. Ajoutez-les dans Réglages.',
		orderNow: 'commander maintenant',
		runningLow: 'bientôt épuisé',
		perBox: (size) => `${size} par boîte`,
		left: (units) => `${units} restants`,
		perDay: (units) => `${units} par jour`,
		nothingConsumes: 'Rien ne consomme ce produit : arrêté, ou en réserve uniquement',
		onOrder: (units) => `${units} en commande`,
		openActions: 'Réapprovisionner, recompter ou corriger la boîte',
		refillLabel: (size) => `Réapprovisionner, en boîtes de ${size}`,
		addUnits: (units) => `Ajouter ${units} unités`,
		recountLabel: 'Recompter : unités réellement dans la boîte',
		setTo: (units) => `Fixer à ${units}`,
		refillVsRecount:
			'Un réapprovisionnement s’ajoute à ce qui est enregistré. Un recomptage le remplace. Utilisez-le lorsque le compte a dérivé.',
		boxSizeLabel: 'Unités par boîte, telle que délivrée par la pharmacie',
		boxSizeUnchanged: 'Taille de boîte inchangée',
		correctTo: (size) => `Corriger à ${size}`,
		boxSizeNote:
			'Personne ne le sait au début. On l’apprend de la pharmacie, parfois seulement à la réception de la boîte. Corrigez-le ici dès que vous connaissez le vrai chiffre. Cela change le nombre de boîtes demandées lors des prochaines commandes ; cela ne touche pas à ce que vous avez déjà.',
		errorBoxes: 'Le nombre de boîtes doit être un nombre entier, au moins 1.',
		errorCount: 'Un comptage ne peut pas être négatif.'
	},
	order: {
		title: 'Commande',
		metaDescription: 'Préparer une commande à la pharmacie avant d’être à court.',
		nothingNeeded: 'Rien n’est à commander.',
		nextRunAround: (date) => `Prochain passage à la pharmacie attendu vers le ${date}.`,
		nothingConsumedYet: 'Aucun produit n’est encore consommé.',
		forceOrder: 'Tout commander à l’avance quand même',
		atReorderPoint: (count) =>
			count === 1
				? '1 produit est au niveau de recommande ou en dessous.'
				: `${count} produits sont au niveau de recommande ou en dessous.`,
		daysLeft: (days) => `${days} jours restants`,
		jointNote:
			'Tout le reste est complété jusqu’au même horizon, afin que la prochaine commande se fasse en un seul passage à la pharmacie plutôt qu’en plusieurs.',
		addAnythingTitle: 'Ajouter autre chose ?',
		addAnythingNote:
			'Rien ne les consomme selon un horaire, donc aucun calcul ne les demandera jamais, mais ils s’épuisent aussi. Autant les compléter pendant que vous commandez.',
		boxesOf: (size) => `boîtes de ${size}`,
		oneBoxFewer: 'Une boîte de moins',
		oneBoxMore: 'Une boîte de plus',
		suggestedTitle: 'Commande proposée',
		whenReadyLabel: 'Pour quand la souhaitez-vous prête ? (facultatif)',
		whenReadyPlaceholder: 'vendredi matin',
		capped: 'plafonné',
		addedByYou: 'ajouté par vous',
		coversTo: (days) => `couvre ${days} jours`,
		nextRunAfter: (date) =>
			`Après cette commande, le prochain passage est attendu vers le ${date}.`,
		copied: 'Copié',
		copyText: 'Copier le texte de la commande',
		openInEmail: 'Ouvrir dans l’e-mail',
		markOrdered: 'Marquer comme commandé',
		markOrderedNote:
			'Marquer comme commandé enregistre la demande et met fin au rappel. Cela ne modifie pas votre stock : cela se produit à la réception de la commande.',
		fullText: 'Texte complet de la commande',
		awaitingTitle: 'En attente de retrait',
		outstanding: (units, date) => `${units} unités en attente, commandées le ${date}`,
		receivedFull: 'Reçu en totalité',
		receivedOneBox: 'Reçu 1 boîte seulement',
		partialNote:
			'Ces produits sont souvent délivrés en quantité incomplète. Enregistrer une livraison partielle garde le reste visible plutôt que de le perdre silencieusement.',
		fixBoxSize: 'Si la boîte avait une autre taille, corrigez-la dans Stock →'
	},
	setup: {
		title: 'Réglages',
		metaDescription: 'Vos produits, vos doses, vos rappels et vos sauvegardes.',

		remindersTitle: 'Rappels',
		icsNever:
			'Aucune API web ne permet de programmer une notification localement ; les rappels passent donc par le calendrier de votre téléphone. Exportez une fois, puis importez le fichier dans votre application de calendrier.',
		icsStaleTitle: 'Votre calendrier n’est plus à jour.',
		icsStaleBody:
			'Le schéma, la langue ou le fuseau horaire ont changé depuis votre dernier export. Exportez à nouveau et réimportez. Les rappels existants aux mêmes heures seront mis à jour ; si une heure a été supprimée ou modifiée, supprimez d’abord l’ancien rappel Graftful de votre calendrier.',
		icsCurrent: 'Votre calendrier correspond au schéma actuel.',
		exportIcs: 'Exporter les rappels (.ics)',
		icsNote:
			'Les médicaments en réserve sont exclus, car il n’y a pas d’horaire à inscrire dans un calendrier. Les notifications push, avec un bouton « pris », arriveront dans une version ultérieure.',

		languageTitle: 'Langue',
		languageLabel:
			'Langue de l’application, de la commande à la pharmacie et de l’export de calendrier',
		followBrowser: (language) => `Suivre mon navigateur (${language})`,
		languageNote:
			'Ceci définit la langue des écrans et des deux éléments qui quittent l’application : la commande que vous envoyez à votre pharmacie et le fichier de calendrier. Vous pouvez donc envoyer une commande en français depuis un téléphone en anglais.',

		timesTitle: 'Vos horaires habituels',
		timesLabel: 'Quand vous prenez habituellement vos médicaments, séparés par des virgules',
		saveTimes: 'Enregistrer les horaires',
		errorNotATime: (values) =>
			`Ce n’est pas une heure : ${values}. Utilisez HH:MM, par exemple 08:00.`,
		errorNoTime: 'Indiquez au moins une heure, par exemple 08:00.',
		timesNote:
			'Utilisés uniquement pour préremplir les heures lorsque vous ajoutez quelque chose de nouveau. Chaque dose conserve les siennes, et vous pouvez les modifier individuellement. Indiquez ce que vous avez convenu avec votre centre ; Graftful ne proposera pas d’intervalle, car l’espacement de vos prises est une décision qui revient à votre prescripteur.',

		detailsTitle: 'Vos informations',
		transplantDate: 'Date de la transplantation',
		horizonLabel:
			'Horizon de réapprovisionnement en jours : la durée que doit couvrir une commande',
		errorBadDate: 'Cette date n’existe pas. Utilisez AAAA-MM-JJ.',
		errorHorizon: 'L’horizon doit être un nombre entier de jours, au moins 1.',

		productsTitle: 'Produits',
		reorderAt: (days) => `commander à ${days} j`,
		retired: 'arrêté',
		brandName: 'Nom commercial',
		strength: 'Dosage',
		unit: 'Unité',
		unitWholePill: 'cp (comprimé entier)',
		unitsPerBox: 'Unités par boîte',
		unitsPerBoxAsk: 'Unités par boîte (demandez à la pharmacie)',
		reorderFloor: 'Seuil de recommande (jours)',
		form: 'Forme (facultatif)',
		formPlaceholder: 'comprimé, gélule…',
		saveChanges: 'Enregistrer les modifications',
		errorProductFields:
			'Vérifiez le nom, le dosage, les unités par boîte et le seuil de recommande — chacun doit être un nombre positif.',
		confirmDeleteProduct: 'Supprimer définitivement ce produit ?',
		errorCouldNotDelete: 'Suppression impossible',
		restoreProduct: 'Reprendre ce produit',
		restoreProductNote:
			'Le rétablir le remet dans les calculs du schéma et dans la liste de commande.',
		retire: 'Arrêter',
		retireNote:
			'Arrêter un produit, c’est ainsi que l’on cesse de l’utiliser. Il reste dans votre historique, conserve son stock, et les commandes passées gardent leur sens. Il sort simplement des commandes. C’est le bon choix lorsqu’un dosage est retiré du marché ou qu’une dose change.',
		deletePermanently: 'Supprimer définitivement',
		deleteProductNote:
			'Rien ne fait référence à ce produit, sa suppression ne perd donc rien. À utiliser pour une saisie faite par erreur.',
		cannotDeleteProduct: (doses, stockEvents, orders) =>
			`Suppression impossible : il apparaît dans ${doses} ${doses === 1 ? 'dose' : 'doses'}, ${stockEvents} ${stockEvents === 1 ? 'entrée' : 'entrées'} de stock et ${orders} ${orders === 1 ? 'commande' : 'commandes'}. Le retirer laisserait un historique qui ne serait plus cohérent. Arrêtez-le plutôt.`,
		addProduct: 'Ajouter un produit',
		unitsOnHand: 'Unités en stock',
		addProductButton: 'Ajouter le produit',
		errorProductName: 'Donnez un nom au produit.',
		errorStrength: 'Le dosage doit être un nombre positif.',
		errorMinDays: 'Le seuil de recommande doit être un nombre entier de jours.',
		errorStockNegative: 'Les unités en stock ne peuvent pas être négatives.',
		addProductNote:
			'Si vous ne connaissez pas encore la taille de la boîte, indiquez votre meilleure estimation. Vous pourrez la corriger ici ou depuis Stock lorsque la pharmacie vous l’aura dite ; cela n’influence que le nombre de boîtes demandées dans une commande.',

		therapiesTitle: 'Traitements',
		asNeededInline: 'en réserve',
		doseVersions: (count) => `${count} ${count === 1 ? 'version de dose' : 'versions de dose'}`,
		stoppedOn: (date) => `arrêté le ${date}`,
		name: 'Nom',
		category: 'Catégorie',
		activeIngredient: 'Principe actif (facultatif)',
		activeIngredientPlaceholder: 'la prise du matin',
		startedOn: 'Débuté le',
		asNeededCheckbox: 'En réserve (pas d’horaire)',
		saveDetails: 'Enregistrer les informations',
		doseHistoryTitle: 'Historique des doses',
		now: 'en cours',
		perDayUnit: (amount, unit) => `${amount} ${unit}/jour`,
		doseMismatch: (declared, composed, unit) =>
			`Enregistré comme ${declared} ${unit} prescrits, mais les produits indiqués totalisent ${composed} ${unit}. À vérifier avec votre ordonnance.`,
		changeDoseTitle: 'Modifier la dose',
		changeDoseNote:
			'Saisissez ce que vous allez réellement prendre. Le total en est déduit, jamais l’inverse, car seul votre prescripteur peut décider comment une dose est composée.',
		firstDayLabel: 'Premier jour de la nouvelle dose',
		time: 'Heure',
		removeTime: 'Supprimer l’heure',
		product: 'Produit',
		retiredParen: '(arrêté)',
		pills: 'Comprimés',
		removeProduct: 'Supprimer ce produit',
		addProductHere: 'Ajouter un produit ici',
		addAnotherTime: 'Ajouter une autre heure',
		declaredLabel: 'Ce que le médecin a dit (facultatif)',
		entryComesTo: 'Ce que vous avez saisi correspond à',
		perDayAmount: (amount, unit) => `${amount} ${unit} par jour`,
		declaredMismatch: (declared, unit) =>
			`, ce qui ne correspond pas aux ${declared} ${unit} que vous avez enregistrés.`,
		retiredWarning: (names, count) =>
			`${names} ${count === 1 ? 'est arrêté' : 'sont arrêtés'}. Enregistrer ceci ${count === 1 ? 'le remet' : 'les remet'} en service : ${count === 1 ? 'il sera planifié et commandé' : 'ils seront planifiés et commandés'} à nouveau.`,
		saveNewDose: 'Enregistrer la nouvelle dose',
		errorBadStartDate: 'Cette date de début n’existe pas. Utilisez AAAA-MM-JJ.',
		errorSlotTime: (value) =>
			`« ${value} » n’est pas une heure. Utilisez HH:MM, par exemple 08:00.`,
		errorUnits: 'Chaque produit doit avoir une quantité supérieure à zéro.',
		errorChooseProduct: 'Choisissez un produit pour chaque ligne.',
		errorSaveDose: 'Impossible d’enregistrer la dose',
		changeDoseFooter:
			'La dose que vous prenez actuellement reste dans votre historique et se termine la veille du début de celle-ci. Vos rappels de calendrier devront ensuite être exportés à nouveau.',
		resumeTherapy: 'Reprendre ce traitement',
		stopTherapy: 'Arrêter ce traitement',
		stopTherapyNote:
			'Arrêter met fin à la consommation à partir d’aujourd’hui et conserve toutes les doses enregistrées, de sorte que ce que vous avez pris et quand reste consultable.',
		cannotDeleteTherapy: (since, doses) =>
			`Suppression impossible : il est en usage depuis le ${since}, et ses ${doses} ${doses === 1 ? 'dose enregistrée' : 'doses enregistrées'} constituent le relevé de ce que vous avez pris. Arrêtez-le plutôt.`,
		confirmDeleteTherapy: 'Supprimer ce traitement et ses doses ?',
		addTherapy: 'Ajouter un traitement',
		timesCommaLabel: 'Heures, séparées par des virgules',
		addTherapyDoseNote:
			'Ce qu’il faut prendre à chacune de ces heures. Une dose peut combiner plusieurs produits : 14 mg de la prise du matin, c’est 3 × 4 mg plus 1 × 2 mg.',
		pillsPerTime: 'Comprimés par prise',
		addProductToDose: 'Ajouter un produit à cette dose',
		sameCombinationNote: (changeDoseLabel) =>
			`La même combinaison est utilisée à toutes les heures indiquées. Pour des doses différentes le matin et le soir, ajoutez-la ici puis utilisez ${changeDoseLabel} ci-dessus, qui modifie chaque heure séparément.`,
		addTherapyButton: 'Ajouter le traitement',
		errorTherapyName: 'Donnez un nom au traitement.',
		errorTimes: 'Vérifiez les heures : utilisez HH:MM, par exemple 08:00.',
		errorProductQuantity: 'Choisissez un produit et une quantité positive pour chaque ligne.',

		dataTitle: 'Vos données',
		dataNote:
			'Tout est enregistré sur cet appareil. Effacer les données de votre navigateur les supprimera : conservez une sauvegarde.',
		exportBackup: 'Exporter une sauvegarde (JSON)',
		importBackup: 'Importer une sauvegarde',
		errorNothingToExport:
			'Rien à exporter pour l’instant — il n’y a aucun schéma de traitement sur cet appareil.',
		errorImportFailed: 'Importation échouée',
		confirmImport:
			'Importer cette sauvegarde remplacera chaque produit, chaque dose, chaque comptage de stock et chaque commande sur cet appareil. Continuer ?',
		restoredWithProblems: (count) =>
			`Restauré, avec ${count} ${count === 1 ? 'problème' : 'problèmes'} :`,

		dangerTitle: 'Zone sensible',
		deleteAll: 'Supprimer toutes les données',
		deleting: 'Suppression…',
		confirmDeleteAll: 'Supprimer tout ce qui se trouve sur cet appareil ?',
		deleteDone: 'Tout ce qui se trouvait sur cet appareil a été supprimé.',
		errorDeleteFailed: 'Suppression échouée'
	},
	about: {
		title: 'À propos de Graftful',
		metaDescription:
			'Ce que fait Graftful, ce qu’il refuse délibérément de faire, et qui l’a réalisé.',
		intro:
			'Graftful aide les personnes sous traitement de longue durée à suivre ce qu’elles doivent prendre, ce qu’il leur reste et le moment de recommander. Il a été conçu pour les personnes transplantées, qui prennent les mêmes médicaments chaque jour pour le reste de leur vie et pour qui être à court n’est pas un simple désagrément.',
		introNote:
			'Il est gratuit, sans compte, sans publicité, et fonctionne hors ligne. Rien concernant votre santé ne quitte votre appareil.',
		purposeTitle: 'À quoi il sert',
		purposeStatement:
			'Graftful est un outil d’auto-gestion destiné aux personnes sous traitement de longue durée. Il enregistre un schéma de traitement saisi par l’utilisateur, lui rappelle quand une prise est due, suit le nombre de comprimés restants et l’aide à préparer une commande à la pharmacie. Il ne fournit aucun conseil médical, n’interprète aucune donnée clinique, et ne détermine ni ne propose aucune dose.',
		notTitle: 'Ce qu’il ne fera délibérément pas',
		notIntro:
			'Il ne s’agit pas de fonctions manquantes. C’est la limite qui fait de ceci un outil de suivi plutôt qu’un dispositif médical soumis à réglementation. Et, plus simplement, ce sont des décisions qui appartiennent à votre prescripteur et non à une application.',
		notDoseLead: 'Calculer une dose',
		notDoseBody: 'à partir d’un taux sanguin, de votre poids ou d’un résultat d’analyse.',
		notCombinationLead: 'Déterminer quels comprimés composent une dose.',
		notCombinationBody:
			'Face à « 14 mg », il ne décidera pas que cela signifie trois gélules de 4 mg et une de 2 mg. Vous saisissez ce qui vous a été prescrit. Il existe de vraies raisons cliniques au choix d’une combinaison précise.',
		notMissedDoseLead: 'Vous dire quoi faire en cas de prise oubliée.',
		notMissedDoseBody:
			'Il vous montrera qu’une prise a été oubliée et à quelle heure elle était due. Ce qu’il convient de faire ensuite est une question pour votre centre de transplantation.',
		notInteractions: 'Avertir des interactions médicamenteuses.',
		notLabResultLead: 'Interpréter un résultat de laboratoire.',
		notLabResultBody:
			'Noter un taux résiduel relève du journal de bord, et cela ne pose aucun problème. Le colorer en rouge, ou le qualifier de « hors norme », est un jugement que cette application ne portera pas.',
		notDatabaseLead: 'Être livré avec une base de données de médicaments.',
		notDatabaseBody:
			'Chaque dose dans Graftful a été saisie par vous, il n’est donc jamais la source d’un chiffre clinique.',
		arithmeticNote:
			'Il fait bien des calculs sur les chiffres que vous avez saisis : combien de jours votre stock va durer, et combien de boîtes demander à la pharmacie. Si vous enregistrez une dose totale et que les comprimés indiqués ne correspondent pas à ce total, Graftful signalera que les deux ne concordent pas. Il compare vos deux chiffres, et ne décide jamais lequel est le bon.',
		nameTitle: 'D’où vient le nom',
		nameGraft:
			'Un greffon, « graft » en anglais, c’est l’organe transplanté lui-même : le rein, le foie, le cœur ou le poumon que quelqu’un vous a donné. Le mot est plus ancien que la médecine : il vient de l’horticulture, où greffer signifie unir le tissu vivant d’une plante à une autre afin que les deux ne fassent qu’un. C’est exactement ce qu’est une transplantation.',
		nameFul:
			'« -ful » est le suffixe anglais courant qui signifie « plein de ». Graftful veut donc dire « plein de greffe », et cela ressemble suffisamment à « grateful », reconnaissant, pour que ce ne soit pas un hasard. Si vous en avez une, vous savez pourquoi.',
		nameNotOrganSpecific:
			'Ce nom n’est pas non plus lié à un organe, et c’est voulu. La première version devait porter un nom faisant référence aux reins, ce qui aurait été une erreur : l’arithmétique quotidienne des immunosuppresseurs est la même quel que soit l’organe reçu.',
		markTitle: 'Et le symbole',
		markAlt: 'Le symbole Graftful : une tige rejointe latéralement par une nouvelle pousse',
		markStrokes:
			'Deux traits : une tige qui continue, et une nouvelle pousse qui la rejoint sur le côté. C’est une greffe au sens horticole, le sens le plus ancien, et c’est pourquoi on n’y trouve ni seringue, ni croix, ni organe.',
		markJoinLead: 'La jonction est décalée sur le côté, volontairement.',
		markJoinBody:
			'Une greffe ne prend pas la place de l’original. Un rein transplanté est placé à l’avant de l’abdomen, tandis que les deux avec lesquels vous êtes né restent là où ils sont, à l’arrière. Une fourche symétrique dirait « remplacé ». Celle-ci dit « rejoint ailleurs », ce qui correspond à ce qui s’est réellement passé.',
		markHand:
			'On y voit aussi une main faisant un V, et cela ne me déplaît pas. Faire la paix avec sa greffe, et avec les comprimés qui l’accompagnent, occupe l’essentiel de la vie avec l’une d’elles.',
		originTitle: 'D’où cela vient',
		origin1:
			'Je m’appelle Luis. J’ai reçu une transplantation rénale au CHUV à Lausanne le 11 janvier 2016 et, comme tout le monde en quittant un centre de transplantation, je suis parti avec un sac de boîtes et aucune méthode particulière pour les gérer.',
		origin2:
			'Ce que j’ai fini par construire, c’est un tableur. Il contenait chaque produit, le nombre de comprimés par jour, le nombre restant dans la boîte, et la colonne qui comptait vraiment : le nombre de jours que cela représentait. Dès qu’un chiffre baissait, j’écrivais à la pharmacie. Je l’ai tenu à la main pendant des années, et cela fonctionnait, mais uniquement parce que les tableurs me plaisent. Cela paraissait absurde d’exiger cela de quelqu’un trois semaines après une transplantation.',
		origin3:
			'Graftful est ce tableur, reconstruit pour que personne d’autre n’ait à le réinventer. Les calculs sont ceux que je faisais à la main, et les cas particuliers de l’exemple s’y trouvent parce qu’ils étaient dans le mien : une dose composée de trois dosages différents, un demi-comprimé, une dose dégressive, et un dosage retiré du marché en cours de traitement.',
		originNote:
			'Le schéma d’exemple dans l’application utilise des noms de médicaments inventés. Les chiffres sont réels, les produits non : ce que prend une personne ne regarde personne d’autre, moi y compris. Ceci n’est pas un produit hospitalier et n’est affilié à aucun centre de transplantation.',
		madeByTitle: 'Qui l’a réalisé',
		madeByBefore: 'Réalisé avec soin par Luis et',
		madeByAfter:
			' : une personne transplantée et un assistant IA, partant de cinq ans de tableur pour ne construire que les parties qui se sont révélées utiles.',
		madeByNote:
			'Chacune des limites cliniques ci-dessus est une décision délibérée et non une fonction manquante, et les calculs sont vérifiés par rapport à de vraies commandes de pharmacie plutôt que contre eux-mêmes.',
		licenceTitle: 'Code source et licence',
		licenceBefore: 'Graftful est',
		licenceLink: 'un logiciel libre sur GitHub',
		licenceAfter:
			', sous licence AGPL-3.0. Cela compte pour une raison pratique plutôt qu’idéologique : des personnes en dépendent chaque jour pour des médicaments qu’elles ne peuvent pas sauter, et si je cesse de l’entretenir, personne ne doit se retrouver démuni. La licence empêche aussi quiconque de le refermer.',
		licenceName: 'Le nom est réservé : une version dérivée devra porter un autre nom.',
		version: (version) => `Version ${version}`
	},
	privacy: {
		title: 'Confidentialité',
		metaDescription:
			'Ce que Graftful enregistre, où il l’enregistre, et comment le vérifier vous-même.',
		headline: 'Vos données de traitement ne quittent jamais votre appareil.',
		headlineBody:
			'Il n’y a pas de compte, pas de connexion, et aucun serveur ne détient votre schéma de traitement. Tout ce que vous saisissez (produits, doses, comptages de stock, commandes, votre date de transplantation) est enregistré par votre navigateur sur l’appareil que vous utilisez, et nulle part ailleurs.',
		checkTitle: 'Comment le vérifier, plutôt que de me croire sur parole',
		checkBody:
			'Ouvrez les outils de développement de votre navigateur, allez dans l’onglet Réseau, puis utilisez l’application : ajoutez un produit, enregistrez un comptage de stock, générez une commande. Rien ne sera envoyé. Cela vaut mieux que n’importe quelle politique de confidentialité, car vous observez le comportement réel au lieu de lire une affirmation à son sujet.',
		collectedTitle: 'La seule chose qui est collectée',
		collected:
			'Les pages vues, via Cloudflare Web Analytics. Cela enregistre qu’une page a été ouverte, approximativement depuis quel pays d’après la requête, et laquelle. Aucun cookie n’est déposé, votre navigateur n’est pas identifié par empreinte, et rien de ce que vous avez saisi n’est visible. Je m’en sers pour savoir si quelqu’un trouve l’application.',
		collectedBlockable:
			'Il s’agit d’un seul script provenant de Cloudflare. Si vous le bloquez, l’application fonctionne exactement de la même façon.',
		practiceTitle: 'Ce que cela signifie en pratique',
		clearingLead: 'Effacer les données de votre navigateur supprimera votre schéma de traitement.',
		clearingBody:
			'C’est le véritable risque du stockage local, et c’est pourquoi l’application possède un bouton d’export. Utilisez-le.',
		devicesLead: 'Vos données ne vous suivent pas d’un appareil à l’autre.',
		devicesBody:
			'Le téléphone et l’ordinateur conservent des copies distinctes. Exportez depuis l’un et importez dans l’autre.',
		unlockLead: 'Toute personne pouvant déverrouiller votre appareil peut les lire.',
		unlockBody:
			'Il n’y a pas de code séparé pour l’application. Le verrouillage de votre appareil est la protection.',
		noBackupLead: 'Rien n’est sauvegardé à votre place.',
		noBackupBody: 'Je ne peux pas récupérer vos données, puisque je ne les ai jamais eues.',
		deletingTitle: 'Tout supprimer',
		deletingBody:
			'Les réglages contiennent un bouton qui efface tout immédiatement. Il n’y a rien à demander, et aucun compte à clôturer.',
		deletingNoCopy:
			'Comme je ne détiens aucune donnée personnelle, il n’y a aucune copie à demander et rien que je puisse supprimer à distance. C’est voulu : la façon la plus sûre de traiter des données de santé sensibles est de ne pas les recevoir.',
		deletingContact: 'Les questions sur ce modèle de confidentialité peuvent être adressées à'
	},
	roadmap: {
		title: 'Feuille de route',
		metaDescription: 'Ce qui est en préparation, et ce qui ne sera jamais construit.',
		noDates:
			'Aucune date. Ceci est développé par une seule personne le soir, et une date serait une supposition déguisée en promesse. L’ordre ci-dessous correspond à peu près à l’ordre des travaux.',
		workingTitle: 'Ce qui fonctionne déjà',
		working: [
			'Votre schéma, avec les doses à plusieurs comprimés, les demi-comprimés et les médicaments en réserve',
			'Les jours de couverture par produit, à partir de ce que vous comptez réellement dans la boîte',
			'Les alertes de recommande, et une commande de pharmacie à copier ou à envoyer par e-mail',
			'Les changements de dose qui conservent votre historique au lieu de l’écraser',
			'Des rappels de calendrier que vous exportez une fois et importez dans votre téléphone',
			'La sauvegarde et la restauration sous forme de fichier que vous conservez',
			'Le fonctionnement hors ligne, sans que rien concernant votre santé ne quitte l’appareil'
		],
		remindersTitle: 'Ensuite : de vrais rappels',
		reminders1:
			'L’export de calendrier fonctionne et ne nécessite aucun serveur, mais il a un vrai défaut : changez une dose et le calendrier devient silencieusement faux jusqu’à ce que vous l’exportiez à nouveau.',
		reminders2:
			'Les notifications push corrigent cela et ajoutent ce qu’un calendrier ne peut pas offrir : un bouton « Pris » sur la notification elle-même, afin qu’enregistrer une prise ne demande pas d’ouvrir l’application. C’est aussi la seule façon honnête de suivre l’observance : demander à quelqu’un d’ouvrir une application pour confirmer qu’il a pris un comprimé mesure surtout qui pense à ouvrir des applications.',
		reminders3:
			'Ce sera construit de sorte que le serveur n’apprenne rien. La notification ne contient aucun contenu : le serveur sait seulement quand solliciter votre appareil, et le texte est assemblé sur le téléphone à partir de données qui n’en sont jamais sorties.',
		consultationsTitle: 'Ensuite : vos consultations',
		consultations1:
			'Une date et une heure pour votre prochain contrôle, avec un compte à rebours à côté du compteur de jours que vous voyez déjà, et un rappel dans le même export de calendrier que vos prises.',
		consultations2:
			'Pourquoi cela mérite une vraie fonction plutôt qu’une note dans un coin : les contrôles ne s’arrêtent pas. Les miens sont encore à peu près tous les trois mois, plus de dix ans après. Les logiciels écrits pour les personnes transplantées supposent souvent une première année intense puis plus rien, ce qui ne correspond pas à la réalité. Les rendez-vous, les analyses de sang et les comprimés continuent indéfiniment.',
		consultations3:
			'Cela devrait aussi changer le fonctionnement des commandes. Ce que vous voulez vraiment, c’est assez de médicaments pour tenir jusqu’à la prochaine consultation, et non soixante jours arbitraires. Une fois que Graftful connaît cette date, il peut l’utiliser comme horizon, au lieu d’un chiffre que vous avez dû inventer.',
		consultations4:
			'Noter une date relève du journal de bord : cela reste bien à l’écart de la limite décrite ci-dessous. Graftful ne proposera pas quand une consultation devrait avoir lieu, et ne déduira rien de l’intervalle entre les vôtres.',
		blogTitle: 'Puis : un blog',
		blog1:
			'Un endroit pour écrire les choses correctement. Le premier billet est déjà décidé : un guide pas à pas pour utiliser Graftful — configurer vos produits, saisir une dose composée de plusieurs comprimés, compter votre stock, et sortir votre première commande de pharmacie.',
		blog2:
			'L’application essaie de s’expliquer, mais une partie de tout cela est réellement délicate la première fois, et une capture d’écran fait en un coup d’œil ce qu’un paragraphe d’aide fait mal. Cela donnerait aussi aux coordinatrices et coordinateurs de transplantation quelque chose à montrer qui ne soit pas une page de connexion.',
		blog3:
			'Billets probables ensuite : en quoi consistent réellement les calculs et pourquoi l’application ne choisit jamais une dose ; comment les rappels fonctionnent sans serveur ; et ce que dix ans de comprimés deux fois par jour apprennent sur les parties faciles à rater.',
		thenTitle: 'Puis',
		missedLead: 'Les prises oubliées.',
		missedBody:
			'Enregistrer qu’une prise a été oubliée, et à quelle heure elle était due. Pas ce qu’il faut faire ensuite. Voir plus bas.',
		languagesLead: 'D’autres langues.',
		languagesBody:
			'L’anglais, le français, l’allemand et le portugais couvrent toute l’application, la commande à la pharmacie et le fichier de calendrier. L’italien viendra ensuite, pour le Tessin. Les traductions sont bienvenues et vont plus loin que l’argent.',
		expiryLead: 'Dates de péremption et numéros de lot.',
		expiryBody:
			'Utile lorsqu’une boîte est restée un an dans une armoire, et en cas de rappel de lot.',
		resultsLead: 'Un endroit pour vos résultats.',
		resultsBody:
			'Un endroit pour noter un résultat sanguin et le conserver, comme un journal, sans aucune interprétation.',
		travelLead: 'Les voyages.',
		travelBody:
			'Calculer combien emporter pour un séjour, et ce qu’un changement de fuseau horaire fait à un intervalle de douze heures entre les prises.',
		consideringTitle: 'À l’étude',
		surveyLead: 'Un questionnaire anonyme.',
		surveyBody:
			'Savoir si cela vous est utile, et ce qui manque. Un questionnaire auquel vous choisissez de répondre, et non des statistiques collectées discrètement en arrière-plan, ce qui contredirait tout ce qui figure sur la page de confidentialité.',
		carerLead: 'Le partage avec un proche aidant.',
		carerBody:
			'Réellement difficile sans un serveur détenant vos données, ce qui est précisément la seule chose que cette application ne fait pas. Pas encore de bonne réponse.',
		neverTitle: 'Jamais',
		neverIntro:
			'Ceci n’est pas une liste d’attente. C’est la limite entre un outil de suivi et un dispositif médical réglementé, et ce sont aussi des décisions qui appartiennent à votre prescripteur.',
		never: [
			'Calculer une dose à partir d’un taux sanguin, de votre poids ou d’un résultat d’analyse',
			'Décider quels comprimés composent une dose qui vous a été prescrite',
			'Vous dire quoi faire en cas de prise oubliée',
			'Les avertissements d’interaction',
			'Juger un résultat de laboratoire : pas de seuils, pas de flèches de tendance, pas de chiffres rouges'
		],
		neverMoreLink: 'En savoir plus sur les raisons',
		neverMoreAfter: ', y compris la formulation exacte de ce à quoi sert cette application.',
		missingTitle: 'Il manque quelque chose ?',
		missing1:
			'La chose la plus utile que vous puissiez m’envoyer, c’est ce qui vous a agacé, ou le cas particulier de votre schéma que cette application gère mal. Aucun schéma n’est typique, et le mien n’en est qu’un.',
		suggestLink: 'Proposez-le sur GitHub',
		missingOrEmail: 'ou écrivez à',
		missingBugBefore: 'Si quelque chose est cassé plutôt que manquant,',
		bugLink: 'signalez un problème',
		missingBugAfter: 'à la place.',
		missingPrivacyBefore:
			'Les tickets GitHub sont publics : merci de ne pas y mettre de noms de médicaments, de doses, de dates de transplantation ni quoi que ce soit d’autre issu de votre propre schéma ; écrivez par e-mail si cela ne peut pas être décrit sans eux. Il existe d’autres façons d’aider sur',
		supportLink: 'la page de soutien',
		missingPrivacyAfter: ', notamment corriger une traduction.'
	},
	support: {
		title: 'Soutenir',
		metaDescription:
			'Graftful est gratuit. Le plus utile que vous puissiez faire, c’est en parler à quelqu’un qui en a besoin.',
		free1:
			'Graftful est gratuit et le restera. Il n’y a pas d’offre payante, rien n’est verrouillé, et aucune fonction ne dépend d’un paiement.',
		free2:
			'Son fonctionnement ne coûte presque rien : un nom de domaine, et un hébergement gratuit à cette échelle. Ce qui lui manque vraiment, c’est que les gens sachent qu’il existe. Si vous l’avez trouvé utile, en parler à une seule personne vaut plus qu’un don.',
		tellTitle: 'Parlez-en à quelqu’un qui en a besoin',
		recipientLead: 'Une autre personne transplantée.',
		recipientBody:
			'Quiconque se trouve dans les premiers mois après une transplantation, submergé de boîtes. C’est le moment où cela aide le plus, et celui où personne n’a l’énergie de chercher un outil.',
		coordinatorLead: 'Votre coordinatrice ou coordinateur de transplantation.',
		coordinatorBody:
			'Ce sont ces personnes qui ont réellement la conversation sur l’observance, et elles sont généralement contentes d’avoir quelque chose de concret à montrer. Pas la réception.',
		pharmacistLead: 'Votre médecin de famille ou votre pharmacien.',
		pharmacistBody:
			'Votre pharmacien en particulier voit chaque semaine les conséquences d’une recommande mal calculée.',
		associationLead: 'Une association de patients ou un groupe en ligne.',
		associationBody: 'Une seule publication touche plus de monde que je ne le ferai jamais seul.',
		tellNote:
			'Rien à créer et rien à installer. Partager l’adresse suffit. Cela fonctionne d’abord dans un navigateur, et s’installe sur l’écran d’accueil si vous le souhaitez.',
		wrongTitle: 'Dites-moi ce qui ne va pas',
		wrong1:
			'Ce qui vous a dérouté, ou ce que vous avez dû contourner. La confusion est un défaut, pas une erreur d’utilisation.',
		wrong2:
			'Le cas particulier de votre schéma que Graftful gère mal. Aucun schéma ne ressemble à un autre, et le mien n’en est qu’un.',
		wrong3:
			'Tout ce qui vous a semblé cliniquement faux. Cela compte plus que n’importe quel autre signalement.',
		bugLink: 'Signaler un problème sur GitHub',
		wrongOrEmail: 'ou écrivez à',
		wrongNote: (version) =>
			`Les deux indiquent déjà la version que vous utilisez (${version}), il n’y a donc rien à chercher. Les tickets GitHub sont publics : merci de ne pas inclure de noms de médicaments, de doses, de dates de transplantation, de captures d’écran de votre schéma ni de sauvegarde exportée. Utilisez l’e-mail si le problème ne peut pas être décrit sans informations de santé personnelles. Graftful ne peut pas vous conseiller sur une prise oubliée ni sur une décision de traitement ; contactez votre équipe de transplantation pour cela.`,
		ideasTitle: 'Idées et autres contacts',
		ideasBefore: 'Pour une idée ou un retour sur le produit, utilisez le',
		ideaLink: 'formulaire d’idée sur GitHub',
		ideasOrEmail: 'ou écrivez à',
		contactBefore: 'Pour les questions générales, les partenariats ou la presse :',
		contactAfter:
			'. Les e-mails envoyés aux adresses +bugs et +ideas arrivent dans la même boîte et y sont triés ; ils ne sont pas recopiés automatiquement dans un ticket GitHub public. Les signalements de sécurité vont à',
		securityAfter:
			'à la place, afin qu’une vulnérabilité ne soit pas rendue publique avant d’être corrigée.',
		translationTitle: 'Corriger une traduction',
		translationState:
			'Toute l’application est disponible en anglais, français, allemand et portugais, y compris la commande à la pharmacie et le fichier de calendrier. L’allemand n’a pas encore été relu par une personne de langue maternelle.',
		translationBefore:
			'Si un mot sonne faux, maladroit ou trop formel dans votre langue, cela vaut la peine de le signaler. Envoyez-le comme un',
		translationBugLink: 'problème',
		translationMiddle:
			', ce qui ne nécessite aucun compte GitHub, ou si le code ne vous fait pas peur, modifiez directement le catalogue :',
		translationFilesLink: 'un fichier par langue',
		translationAfter: 'dans',
		translationWhy:
			'Un mot mal choisi dans une application de traitement n’est pas cosmétique. Une personne qui se demande si elle peut confier son ordonnance à ceci lit le ton avant les fonctions, et une traduction touche tout un pays. Cela va bien plus loin que l’argent.',
		moneyTitle: 'Si vous préférez tout de même envoyer quelque chose',
		moneyNote: 'Vraiment facultatif. Gérer une transplantation coûte déjà assez cher.',
		twintAlt: 'Code QR TWINT'
	},
	notFound: {
		title: 'Page introuvable',
		body404:
			'Il n’y a aucune page à cette adresse. Le lien est peut-être mal saisi, ou il renvoie à quelque chose que cette version de Graftful ne possède pas.',
		bodyOther: 'Une erreur s’est produite lors du chargement de cette page.',
		dataSafe:
			'Rien de ce que vous avez saisi n’est affecté. Votre schéma, vos comptages de stock et votre historique sont enregistrés par votre navigateur sur cet appareil, et un mauvais lien n’y touche pas.',
		goToToday: 'Aller à Aujourd’hui'
	}
};
