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
		days: 'jours'
	},
	today: {
		title: 'Aujourd’hui',
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
			'Personne ne le sait au début. On l’apprend de la pharmacie, parfois seulement à la réception de la boîte. Corrigez-le ici dès que vous connaissez le vrai chiffre. Cela change le nombre de boîtes demandées lors des prochaines commandes ; cela ne touche pas à ce que vous avez déjà.'
	}
};
