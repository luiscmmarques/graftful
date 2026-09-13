/**
 * The order products are read in.
 *
 * One comparator, used everywhere a product appears in a list, because the alternative is
 * every screen sorting slightly differently and the user having to re-find the same box on
 * each one. The Setup list, the dropdowns, the Order screen, the pharmacy order text and
 * both levels of Today — the pills within a dose, and the doses under one time — all go
 * through this.
 *
 * The one deliberate exception is the Stock screen, which sorts by urgency — the product
 * about to run out belongs at the top of that screen whatever its name. This comparator is
 * its tie-breaker instead, which it previously had none of: two products with the same days
 * of cover appeared in whatever order the database returned them.
 */

import type { Product, Unit } from './types.ts';

/*
 * One collator, built once, rather than an options object handed to `localeCompare` on every
 * comparison — which is what this did first. `localeCompare(b, undefined, opts)` has to
 * resolve a collator from those options per call, and a comparator runs O(n log n) times per
 * sort, on every render of Setup, Order, Stock and both levels of Today. Building it once and
 * reusing `compare` is the documented way round that.
 *
 * Behaviour is unchanged: `undefined` still means the reader's own collation, and the runtime
 * default locale cannot change within a page session, so resolving it once at module load
 * gives the same answer as resolving it per call. The app's own language override is
 * deliberately not used here — it never was.
 */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Compare two display names.
 *
 * Exported so anything ordering a label — a therapy name on Today, say — collates it exactly
 * the way product names are collated, rather than growing a second slightly different rule.
 */
export function compareNames(a: string, b: string): number {
	return collator.compare(a, b);
}

/**
 * The minimum needed to name a product on screen.
 *
 * A structural type rather than `Product`, because half the callers hold something that only
 * carries these three fields — a `ScheduledItem` on Today, for instance — and were writing
 * the label out by hand rather than converting back to a product.
 */
export interface NameableProduct {
	brandName: string;
	strength: number;
	strengthUnit: Unit;
}

/**
 * How a product is named wherever it is named.
 *
 * This was written out at the point of use six times and had drifted into three different
 * answers: `Alfabine 4 mg`, `Alfabine 4mg`, and one that dropped the strength for a `cp`
 * product while three others kept it. The same box therefore read differently in the two
 * dropdowns of the Setup screen, which is the drift a single home for the rule prevents.
 *
 * `cp` carries no strength. It counts tablets rather than measuring them, so a strength
 * beside it is either meaningless or actively misleading — `Zetacal 1cp` invites the reading
 * "one tablet" when the number is not a quantity at all. The three sites that already knew
 * this were right and the other three were wrong.
 *
 * A space before the unit, because `4 mg` is how a dose is written on a box and on a
 * prescription, and because the audience reads this at large text sizes where `4mg` runs
 * together. Nothing is derived from the string: it is a name, not an input.
 */
export function productLabel(product: NameableProduct): string {
	if (product.strengthUnit === 'cp') return product.brandName;
	return `${product.brandName} ${product.strength} ${product.strengthUnit}`;
}

/**
 * Compare two products for display.
 *
 * `sortOrder` wins when either has one, then brand name, then strength. Products with no
 * `sortOrder` sort after every product that has one — see the field's own note in
 * `types.ts` for why absent is not zero.
 *
 * Names are compared with `localeCompare` rather than `<`. Drug names carry accents and
 * `'É' < 'a'` is true by code point, so a plain comparison files Épsilon after Zonatril.
 * The `undefined` locale means the reader's own collation, which is the right one: the same
 * regimen read in French and in German should each read naturally.
 *
 * `numeric: true` because brand names routinely end in a number, and lexicographic
 * ordering puts a 100 mg box between a 10 mg and a 20 mg one. Strength breaks the
 * remaining tie for products that differ only by dose, which is the common case — the same
 * drug at 2 mg and 6 mg is two products here.
 */
export function compareProducts(a: Product, b: Product): number {
	if (a.sortOrder !== undefined || b.sortOrder !== undefined) {
		const left = a.sortOrder ?? Number.POSITIVE_INFINITY;
		const right = b.sortOrder ?? Number.POSITIVE_INFINITY;
		if (left !== right) return left - right;
	}

	const byName = compareNames(a.brandName, b.brandName);
	if (byName !== 0) return byName;

	return a.strength - b.strength;
}

/**
 * A sorted copy. Never sorts in place.
 *
 * `state.products` is the array held by the reactive store, and `Array.prototype.sort`
 * mutates. Sorting it directly would reorder the store's own data from inside a `$derived`,
 * which is both a hidden write and a way to make one screen's sort choice leak into every
 * other.
 */
export function sortedProducts(products: readonly Product[]): Product[] {
	return [...products].sort(compareProducts);
}

/**
 * Compare by product id, given a lookup.
 *
 * For the lists that hold something else — an order line, a stock status, a dose item —
 * and only reference the product. A missing product sorts last rather than throwing: the
 * caller is usually rendering, and a list that renders in the wrong order beats a screen
 * that does not render at all.
 */
export function compareByProductId(
	products: ReadonlyMap<string, Product>,
	leftId: string,
	rightId: string
): number {
	const left = products.get(leftId);
	const right = products.get(rightId);
	if (!left || !right) return left ? -1 : right ? 1 : 0;
	return compareProducts(left, right);
}
