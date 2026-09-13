/**
 * The order products are read in.
 *
 * One comparator, used everywhere a product appears in a list, because the alternative is
 * every screen sorting slightly differently and the user having to re-find the same box on
 * each one. The Setup list, the dropdowns, the Order screen, the pills within a dose on
 * Today and the pharmacy order text all go through this.
 *
 * The one deliberate exception is the Stock screen, which sorts by urgency — the product
 * about to run out belongs at the top of that screen whatever its name. This comparator is
 * its tie-breaker instead, which it previously had none of: two products with the same days
 * of cover appeared in whatever order the database returned them.
 */

import type { Product } from './types.ts';

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

	const byName = a.brandName.localeCompare(b.brandName, undefined, {
		numeric: true,
		sensitivity: 'base'
	});
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
