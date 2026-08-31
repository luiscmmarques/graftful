/**
 * Pharmacy order text.
 *
 * The line shape is taken from real orders rather than invented:
 *
 *   4 boîtes x 50 unités - Alfabine 4 mg
 *
 * Quantity first, then the package, then the product. That order matters — the
 * pharmacist is picking boxes off a shelf, so the count is the first thing they
 * need. Stating the package size is not redundant either: several of these
 * products are sold in more than one box size (the example 400 mg tablet comes in 50s and
 * in cartons of 150), so the size is what says which package you mean.
 *
 * The exact product matters too. Substitution between formulations is not always
 * milligram-for-milligram, so a molecule name and a strength are not a safe substitute for a
 * named product someone is established on. Brand and strength always appear.
 *
 * Output is plain text for the clipboard, with a `mailto:` variant. Clipboard is
 * primary: mail clients truncate long `mailto:` bodies and handle newlines
 * inconsistently, which is a bad surprise for something you rely on.
 */

import type { OrderPlan, OrderPlanLine } from './types.ts';
import type { Locale } from './locale.ts';

export interface OrderTextOptions {
	/** Defaults to French, the source locale. */
	locale?: Locale;
	/**
	 * When the order should be ready, in the user's own words — "vendredi matin",
	 * "dès que possible", "lundi après-midi". Free text rather than a date, because
	 * what people actually ask for is a recurring slot, not a calendar day.
	 */
	collectionNote?: string;
}

/**
 * One neutral noun per language, rather than translating the dose form.
 *
 * An earlier version printed "gélules" for capsules and "comprimés" for tablets,
 * which is what a pharmacist would write. It was dropped: most people do not know
 * which of those their medication technically is, the distinction is not reliably
 * recorded, and getting it wrong is worse than not saying it. The number next to
 * the box is the part that carries meaning, and the pharmacist knows the form of a
 * named product better than the patient does.
 */
const STRINGS = {
	fr: {
		subject: 'Commande de médicaments',
		greeting: 'Bonjour,',
		request: (note?: string) =>
			note
				? `J'aimerais commander pour ${note}, si possible, les médicaments suivants :`
				: "J'aimerais commander les médicaments suivants :",
		box: (n: number) => (n === 1 ? 'boîte' : 'boîtes'),
		unit: (n: number) => (n === 1 ? 'unité' : 'unités'),
		outro: 'Merci d’avance et bonne journée.'
	},
	en: {
		subject: 'Medication order',
		greeting: 'Hello,',
		request: (note?: string) =>
			note
				? `I would like to order the following medication, for ${note} if possible:`
				: 'I would like to order the following medication:',
		box: (n: number) => (n === 1 ? 'box' : 'boxes'),
		unit: (n: number) => (n === 1 ? 'unit' : 'units'),
		outro: 'Many thanks.'
	},
	de: {
		subject: 'Medikamentenbestellung',
		greeting: 'Guten Tag,',
		request: (note?: string) =>
			note
				? `Ich möchte gerne folgende Medikamente bestellen, wenn möglich für ${note}:`
				: 'Ich möchte gerne folgende Medikamente bestellen:',
		box: (n: number) => (n === 1 ? 'Packung' : 'Packungen'),
		// Invariant in German, and "Stück" is what a pharmacy label says.
		unit: () => 'Stück',
		outro: 'Vielen Dank und freundliche Grüße.'
	},
	pt: {
		subject: 'Encomenda de medicamentos',
		greeting: 'Bom dia,',
		request: (note?: string) =>
			note
				? `Gostaria de encomendar os seguintes medicamentos, se possível para ${note}:`
				: 'Gostaria de encomendar os seguintes medicamentos:',
		box: (n: number) => (n === 1 ? 'caixa' : 'caixas'),
		unit: (n: number) => (n === 1 ? 'unidade' : 'unidades'),
		outro: 'Muito obrigado e os melhores cumprimentos.'
	}
} as const;

/** 500 stays 500; 0.5 stays 0.5. */
function formatStrength(value: number): string {
	return String(value);
}

/**
 * `Alfabine 4 mg`. A product measured in whole pills rather than a dose has no
 * meaningful strength to print, so only the name appears.
 */
function describeProduct(line: OrderPlanLine): string {
	if (line.strengthUnit === 'cp') return line.brandName;
	return `${line.brandName} ${formatStrength(line.strength)} ${line.strengthUnit}`;
}

export function orderSubject(options: OrderTextOptions = {}): string {
	return STRINGS[options.locale ?? 'fr'].subject;
}

/** `4 boîtes x 50 unités - Alfabine 4 mg` */
export function orderLineText(line: OrderPlanLine, locale: Locale = 'fr'): string {
	const t = STRINGS[locale];
	const packageSize = line.packages > 0 ? Math.round(line.units / line.packages) : line.units;
	return (
		`${line.packages} ${t.box(line.packages)} x ${packageSize} ${t.unit(packageSize)}` +
		` - ${describeProduct(line)}`
	);
}

export function orderText(plan: OrderPlan, options: OrderTextOptions = {}): string {
	const locale = options.locale ?? 'fr';
	const t = STRINGS[locale];

	const lines: string[] = [t.greeting, '', t.request(options.collectionNote), ''];

	// Calculated lines first, then anything added by hand — the same order as the
	// decision that produced them.
	const ordered = [
		...plan.lines.filter((l) => !l.optional),
		...plan.lines.filter((l) => l.optional)
	];

	for (const line of ordered) {
		if (line.packages <= 0) continue;
		lines.push(orderLineText(line, locale));
	}

	lines.push('', t.outro);

	return lines.join('\n');
}

/**
 * A `mailto:` URL. Kept as the secondary path — see the note at the top of this
 * file. Returns null when the body would exceed a length mail clients handle
 * reliably, so the caller can fall back to the clipboard rather than silently
 * sending a truncated order.
 */
export function orderMailto(
	plan: OrderPlan,
	options: OrderTextOptions & { to?: string } = {}
): string | null {
	const body = orderText(plan, options);
	const url =
		`mailto:${options.to ?? ''}` +
		`?subject=${encodeURIComponent(orderSubject(options))}` +
		`&body=${encodeURIComponent(body)}`;

	return url.length > 1800 ? null : url;
}
