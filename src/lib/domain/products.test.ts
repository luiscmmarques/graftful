import { test } from 'vitest';
import assert from 'node:assert/strict';

import type { Product } from './types.ts';
import { compareByProductId, compareProducts, sortedProducts } from './products.ts';

/**
 * The order products are read in.
 *
 * Worth testing beyond "it sorts", because every interesting case here is one where the
 * obvious implementation is wrong: a missing position treated as zero, a plain `<` on names
 * with accents, and a sort that mutates the store's own array.
 */

function product(fields: Partial<Product> & { id: string; brandName: string }): Product {
	return {
		strength: 1,
		strengthUnit: 'mg',
		packageSize: 30,
		minDays: 3,
		...fields
	};
}

const names = (products: readonly Product[]) => products.map((p) => p.brandName);

test('an explicit position beats the name', () => {
	const sorted = sortedProducts([
		product({ id: 'a', brandName: 'Alfabine', sortOrder: 2 }),
		product({ id: 'z', brandName: 'Zonatril', sortOrder: 1 })
	]);

	assert.deepEqual(names(sorted), ['Zonatril', 'Alfabine']);
});

test('a product with no position sorts after every product that has one', () => {
	/*
	 * The bug this exists to prevent. Treating an absent position as 0 puts every unnumbered
	 * product first, so numbering one product appears to reorder all the others — the field
	 * would look broken the first time anybody used it, which is the first time it is used.
	 */
	const sorted = sortedProducts([
		product({ id: 'none', brandName: 'Alfabine' }),
		product({ id: 'numbered', brandName: 'Zonatril', sortOrder: 9 })
	]);

	assert.deepEqual(names(sorted), ['Zonatril', 'Alfabine']);
});

test('unnumbered products fall in behind, in name order', () => {
	const sorted = sortedProducts([
		product({ id: '1', brandName: 'Corvex' }),
		product({ id: '2', brandName: 'Berilex' }),
		product({ id: '3', brandName: 'Zonatril', sortOrder: 5 })
	]);

	assert.deepEqual(names(sorted), ['Zonatril', 'Berilex', 'Corvex']);
});

test('an accented name is filed where a reader expects it, not by code point', () => {
	/*
	 * `'É' < 'a'` is true by code point, so a plain comparison files Épsilon before every
	 * lowercase name and after none of them. Drug names carry accents routinely.
	 */
	const sorted = sortedProducts([
		product({ id: 'z', brandName: 'Zonatril' }),
		product({ id: 'e', brandName: 'Épsilon' }),
		product({ id: 'a', brandName: 'Alfabine' })
	]);

	assert.deepEqual(names(sorted), ['Alfabine', 'Épsilon', 'Zonatril']);
});

test('a number inside a name sorts numerically', () => {
	// Lexicographic ordering puts "Retard 100" between "Retard 10" and "Retard 20".
	const sorted = sortedProducts([
		product({ id: 'c', brandName: 'Retard 100' }),
		product({ id: 'a', brandName: 'Retard 10' }),
		product({ id: 'b', brandName: 'Retard 20' })
	]);

	assert.deepEqual(names(sorted), ['Retard 10', 'Retard 20', 'Retard 100']);
});

test('the same drug at two strengths is ordered by strength', () => {
	// The common case: one molecule is several products here, differing only by dose.
	const sorted = sortedProducts([
		product({ id: 'high', brandName: 'Alfabine', strength: 6 }),
		product({ id: 'low', brandName: 'Alfabine', strength: 2 })
	]);

	assert.deepEqual(
		sorted.map((p) => p.strength),
		[2, 6]
	);
});

test('sorting never touches the array it was given', () => {
	/*
	 * `state.products` is the array inside the reactive store, and Array.prototype.sort
	 * mutates. Sorting it in place would reorder the store's own data from inside a derived
	 * value — a hidden write, and a way for one screen's ordering to leak into every other.
	 */
	const original = [
		product({ id: 'z', brandName: 'Zonatril' }),
		product({ id: 'a', brandName: 'Alfabine' })
	];

	const sorted = sortedProducts(original);

	assert.deepEqual(names(original), ['Zonatril', 'Alfabine']);
	assert.deepEqual(names(sorted), ['Alfabine', 'Zonatril']);
});

test('equal in every respect compares as equal, so a sort stays stable', () => {
	const left = product({ id: 'a', brandName: 'Alfabine', sortOrder: 1 });
	const right = product({ id: 'b', brandName: 'Alfabine', sortOrder: 1 });

	assert.equal(compareProducts(left, right), 0);
});

test('comparing by id puts a product the lookup does not know last', () => {
	/*
	 * Callers are usually rendering a list of something that only references a product — an
	 * order line, a stock status, a dose item. A list in the wrong order beats a screen that
	 * throws while drawing it.
	 */
	const known = product({ id: 'known', brandName: 'Alfabine' });
	const products = new Map([[known.id, known]]);

	assert.ok(compareByProductId(products, 'known', 'ghost') < 0);
	assert.ok(compareByProductId(products, 'ghost', 'known') > 0);
	assert.equal(compareByProductId(products, 'ghost', 'other-ghost'), 0);
});
