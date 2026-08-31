/**
 * Local persistence.
 *
 * IndexedDB via Dexie, chosen for versioned migrations: the schema will change —
 * lot and expiry tracking is deferred, not cancelled — and hand-rolling
 * `onupgradeneeded` chains across releases on devices that skip versions is a
 * real source of data-loss bugs.
 *
 * Nothing here talks to a network. Everything the app knows lives on the device.
 */

import { browser } from '$app/environment';
import Dexie, { liveQuery, type Table } from 'dexie';
import { readable, type Readable, writable } from 'svelte/store';
import type {
	DoseVersion,
	OrderLine,
	Product,
	RegimenState,
	Settings,
	StockEvent,
	Therapy
} from '$lib/domain/types';
import { type DoseChange, therapyUsage } from '$lib/domain/dose';
import type { Locale } from '$lib/domain/locale';
import { buildExport, parseImport, type Preferences } from '$lib/domain/transfer';
import { onRestore } from '$lib/lifecycle';

/** Settings is a singleton row; Dexie needs a key for it. */
interface SettingsRow extends Settings {
	id: 'singleton';
	/** Fingerprint of the schedule at the last .ics export, for staleness. */
	lastIcsFingerprint?: string;
	locale?: Locale;
	/** Usual collection slot, in the user's own words — "vendredi matin". */
	collectionNote?: string;
	/**
	 * The times this person usually takes medication, e.g. `['07:30', '19:30']`.
	 *
	 * Only ever defaults: the authoritative times live on each dose version, because a
	 * regimen can perfectly well have one therapy at 08:00 and another at 13:00. This
	 * exists so that adding a therapy does not start by assuming somebody else's routine.
	 *
	 * It was assumed. The app shipped with 07:30 and 19:30 written into four places in the
	 * UI, which is one person's schedule — twelve hours apart happens to be a common
	 * interval for twice-daily immunosuppressants, but the actual clock times are agreed
	 * between a patient and their centre and are nobody else's default.
	 *
	 * Graftful never proposes an interval of its own. These are the user's own times,
	 * echoed back.
	 */
	defaultDoseTimes?: string[];
}

class GraftfulDb extends Dexie {
	products!: Table<Product, string>;
	therapies!: Table<Therapy, string>;
	doseVersions!: Table<DoseVersion, string>;
	stockEvents!: Table<StockEvent, string>;
	orderLines!: Table<OrderLine, string>;
	settings!: Table<SettingsRow, string>;

	constructor() {
		super('graftful');

		// v1. Add a new version block for changes; never edit this one in place.
		this.version(1).stores({
			products: 'id, brandName, retired',
			therapies: 'id, category, isPrn',
			doseVersions: 'id, therapyId, activeFrom',
			stockEvents: 'id, productId, occurredOn',
			orderLines: 'id, productId, orderedOn',
			settings: 'id'
		});
	}
}

export const db = new GraftfulDb();

export const DEFAULT_SETTINGS: SettingsRow = {
	id: 'singleton',
	/*
	 * One month. Chosen as the default because it matches how most people actually collect —
	 * a monthly pharmacy trip — and because under-ordering is correctable on the next visit
	 * while over-ordering ties up money and fills a cupboard with boxes that may expire.
	 *
	 * The example regimen keeps its own longer horizon: it is a snapshot of a real
	 * configuration, and the procurement tests are calibrated against a real pharmacy order
	 * made with it. Editable in Setup, which is where anyone whose centre works to a
	 * different rhythm should change it.
	 */
	targetHorizonDays: 30,
	transplantDate: ''
	// `locale` is deliberately absent. It holds an explicit override chosen in Setup, so
	// a default here would mean the browser's language was never consulted — which is
	// exactly the bug it caused: every visitor got French regardless of their device.
};

export async function getSettings(): Promise<SettingsRow> {
	return (await db.settings.get('singleton')) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(patch: Partial<SettingsRow>): Promise<void> {
	const current = await getSettings();
	await db.settings.put({ ...current, ...patch, id: 'singleton' });
}

/** Assemble the whole state the domain functions operate on. */
export async function loadState(): Promise<RegimenState> {
	const [settings, products, therapies, doseVersions, stockEvents, orderLines] = await Promise.all([
		getSettings(),
		db.products.toArray(),
		db.therapies.toArray(),
		db.doseVersions.toArray(),
		db.stockEvents.toArray(),
		db.orderLines.toArray()
	]);

	return {
		settings: {
			targetHorizonDays: settings.targetHorizonDays,
			transplantDate: settings.transplantDate
		},
		products,
		therapies,
		doseVersions,
		stockEvents,
		orderLines
	};
}

/**
 * The whole state as a Svelte-compatible store. Dexie's liveQuery re-emits on
 * any write to the observed tables, so the UI reacts without a state library.
 *
 * Named `regimen` rather than `state` because `$state` is a Svelte 5 rune and
 * the auto-subscription prefix would collide with it.
 *
 * Wrapped rather than exposed directly so it can be forced to refetch. A page
 * restored from bfcache resumes with its liveQuery observers intact but with any
 * change notification that arrived while it was frozen missed — Dexie signals
 * cross-tab writes over a BroadcastChannel, and a frozen page processes no
 * messages. Re-subscribing re-runs the query, which is the cheapest correct way to
 * resynchronise.
 *
 * Inert outside the browser. The content pages are prerendered, which renders the
 * shared layout on the server, and IndexedDB does not exist there. Yielding
 * `undefined` is what the loading branch already handles, so nothing special is
 * needed in the components.
 */
function liveStore<T>(query: () => Promise<T>): Readable<T | undefined> & { refresh: () => void } {
	if (!browser) {
		return { subscribe: readable<T | undefined>(undefined).subscribe, refresh: () => {} };
	}

	const inner = writable<T | undefined>(undefined);
	let detach: (() => void) | null = null;

	const attach = () => {
		detach?.();
		const subscription = liveQuery(query).subscribe({
			next: (value) => inner.set(value),
			error: (error) => console.error('Local database query failed', error)
		});
		detach = () => subscription.unsubscribe();
	};

	return {
		subscribe: (run, invalidate) => {
			if (!detach) attach();
			return inner.subscribe(run, invalidate);
		},
		refresh: attach
	};
}

export const regimen = liveStore(() => loadState());
export const settingsStore = liveStore(() => getSettings());

if (browser) {
	onRestore(() => {
		regimen.refresh();
		settingsStore.refresh();
	});
}

export async function isEmpty(): Promise<boolean> {
	return (await db.products.count()) === 0 && (await db.therapies.count()) === 0;
}

export async function clearAll(): Promise<void> {
	await db.transaction(
		'rw',
		[db.products, db.therapies, db.doseVersions, db.stockEvents, db.orderLines, db.settings],
		async () => {
			await Promise.all([
				db.products.clear(),
				db.therapies.clear(),
				db.doseVersions.clear(),
				db.stockEvents.clear(),
				db.orderLines.clear(),
				db.settings.clear()
			]);
		}
	);
}

/** Replace everything. Used by the seed loader and by import. */
/**
 * Replace everything with an imported regimen, atomically.
 *
 * The clear and the write must share one transaction. They used to be two: `clearAll()`
 * committed, then a second transaction wrote the new data. Anything interrupting the gap —
 * a navigation, a closed tab, a crash — left the first half applied and the second not, so
 * restoring a backup could empty the database instead of filling it. The old data was gone
 * and the new data never arrived, which is the one outcome a restore must never produce.
 *
 * One transaction means an interruption rolls back and the existing data survives.
 */
export async function replaceAll(next: RegimenState, preferences: Preferences = {}): Promise<void> {
	await db.transaction(
		'rw',
		[db.products, db.therapies, db.doseVersions, db.stockEvents, db.orderLines, db.settings],
		async () => {
			await Promise.all([
				db.products.clear(),
				db.therapies.clear(),
				db.doseVersions.clear(),
				db.stockEvents.clear(),
				db.orderLines.clear(),
				db.settings.clear()
			]);

			await db.products.bulkPut(next.products);
			await db.therapies.bulkPut(next.therapies);
			await db.doseVersions.bulkPut(next.doseVersions);
			await db.stockEvents.bulkPut(next.stockEvents);
			await db.orderLines.bulkPut(next.orderLines);
			/*
			 * Preferences are restored too. This previously wrote only the horizon and the
			 * transplant date over DEFAULT_SETTINGS, so importing a backup silently
			 * discarded the usual dose times, the language override and the collection
			 * note — from a file that contained all three.
			 */
			await db.settings.put({
				...DEFAULT_SETTINGS,
				...preferences,
				targetHorizonDays: next.settings.targetHorizonDays,
				transplantDate: next.settings.transplantDate,
				id: 'singleton'
			});
		}
	);
}

const id = () => crypto.randomUUID();

export async function addStockEvent(
	productId: string,
	kind: StockEvent['kind'],
	units: number,
	occurredOn: string,
	note?: string
): Promise<void> {
	// recordedAt orders events that share a day. Without it, correcting a count on a day that
	// already had one could be discarded depending on which random id sorted later.
	await db.stockEvents.put({
		id: id(),
		productId,
		kind,
		units,
		occurredOn,
		recordedAt: new Date().toISOString(),
		note
	});
}

export async function putProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<string> {
	const withId = { ...product, id: product.id ?? id() };
	await db.products.put(withId);
	return withId.id;
}

export async function putTherapy(therapy: Omit<Therapy, 'id'> & { id?: string }): Promise<string> {
	const withId = { ...therapy, id: therapy.id ?? id() };
	await db.therapies.put(withId);
	return withId.id;
}

/** Edit a therapy in place. Doses keep pointing at it, so history is unaffected. */
export async function updateTherapy(
	therapyId: string,
	patch: Partial<Omit<Therapy, 'id'>>
): Promise<void> {
	const therapy = await db.therapies.get(therapyId);
	if (!therapy) return;
	await db.therapies.put({ ...therapy, ...patch, id: therapyId });
}

/**
 * Stop or resume a therapy.
 *
 * Stopping is the normal end of a treatment. It leaves every dose version in place,
 * so what was taken and when stays answerable, and simply ends consumption from that
 * date. `stoppedOn` is the first day *not* taken, matching the half-open convention
 * used for dose versions.
 */
export async function setTherapyStopped(
	therapyId: string,
	stoppedOn: string | undefined
): Promise<void> {
	const therapy = await db.therapies.get(therapyId);
	if (!therapy) return;
	const next: Therapy = { ...therapy, stoppedOn };
	if (!stoppedOn) delete next.stoppedOn;
	await db.therapies.put(next);
}

/**
 * Apply a dose change worked out by `planDoseChange`.
 *
 * Also brings back any product the new dose needs that had been retired: a product
 * being actively dosed cannot sensibly be retired, or it would be scheduled and
 * never ordered. The 6 mg capsule coming back for a move from 14 mg to
 * 20 mg is exactly this.
 *
 * One transaction, so a half-applied change can never leave two doses claiming the
 * same days.
 */
export async function applyDoseChange(change: DoseChange): Promise<void> {
	const versions = change.kind === 'correct' ? [change.version] : [change.closed, change.created];

	const productIds = new Set(
		versions
			.filter((v): v is DoseVersion => v !== null)
			.flatMap((v) => v.slots.flatMap((slot) => slot.items.map((item) => item.productId)))
	);

	await db.transaction('rw', [db.doseVersions, db.products], async () => {
		for (const version of versions) {
			if (version) await db.doseVersions.put(version);
		}

		for (const productId of productIds) {
			const product = await db.products.get(productId);
			if (product?.retired) {
				const restored = { ...product };
				delete restored.retired;
				await db.products.put(restored);
			}
		}
	});
}

/**
 * Delete a therapy and its doses.
 *
 * Refuses once the therapy has been in force, because its dose versions are the
 * record of what was actually taken. `therapyUsage` decides; this enforces it, so a
 * mistake in the UI cannot destroy history.
 */
export async function deleteTherapy(therapyId: string, asOf: string): Promise<void> {
	const state = await loadState();
	if (!therapyUsage(state, therapyId, asOf).canDelete) {
		throw new Error('This therapy has been in use. Stop it instead of deleting it.');
	}

	await db.transaction('rw', [db.therapies, db.doseVersions], async () => {
		await db.doseVersions.where('therapyId').equals(therapyId).delete();
		await db.therapies.delete(therapyId);
	});
}

/**
 * Correct the units per box.
 *
 * This is not something people know when they start. You find out from the
 * pharmacy — sometimes only when the box arrives and it holds 150 rather than the
 * 50 you assumed. Changing it only affects future order rounding; the stock ledger
 * is in units, so nothing already recorded moves.
 */
export async function setPackageSize(productId: string, packageSize: number): Promise<void> {
	const product = await db.products.get(productId);
	if (!product || packageSize <= 0) return;
	await db.products.put({ ...product, packageSize: Math.round(packageSize) });
}

/** Edit a product in place. Its id never changes, so history keeps pointing at it. */
export async function updateProduct(
	productId: string,
	patch: Partial<Omit<Product, 'id'>>
): Promise<void> {
	const product = await db.products.get(productId);
	if (!product) return;
	await db.products.put({ ...product, ...patch, id: productId });
}

/**
 * Retire or restore a product.
 *
 * Retiring is the normal way to stop using something. It keeps the product, its
 * stock and every past order intact, but takes it out of ordering and out of the
 * top-up list. The 6 mg capsule that stopped being needed when a dose
 * went from 20 to 14 mg is exactly this case: still part of the history, no longer
 * part of the routine.
 */
export async function setProductRetired(productId: string, retired: boolean): Promise<void> {
	const product = await db.products.get(productId);
	if (!product) return;
	// Store the flag only when true, so an unretired product looks untouched.
	const next: Product = { ...product, retired };
	if (!retired) delete next.retired;
	await db.products.put(next);
}

/**
 * Delete a product outright.
 *
 * Refuses when anything references it. Deleting a product that appears in a dose
 * version, a stock count or a past order would leave a history that no longer adds
 * up, and for a medication record that is worse than leaving clutter behind. The
 * caller should offer retiring instead — `productUsage` says which case applies
 * before the button is even shown.
 */
export async function deleteProduct(productId: string): Promise<void> {
	const [doseVersions, stockEvents, orderLines] = await Promise.all([
		db.doseVersions.toArray(),
		db.stockEvents.where('productId').equals(productId).count(),
		db.orderLines.where('productId').equals(productId).count()
	]);

	const inDose = doseVersions.some((version) =>
		version.slots.some((slot) => slot.items.some((item) => item.productId === productId))
	);

	if (inDose || stockEvents > 0 || orderLines > 0) {
		throw new Error('This product has history. Retire it instead of deleting it.');
	}

	await db.products.delete(productId);
}

export async function putDoseVersion(
	version: Omit<DoseVersion, 'id'> & { id?: string }
): Promise<string> {
	const withId = { ...version, id: version.id ?? id() };
	await db.doseVersions.put(withId);
	return withId.id;
}

export async function recordOrder(
	lines: Array<{ productId: string; units: number }>,
	orderedOn: string
): Promise<void> {
	await db.orderLines.bulkPut(
		lines.map((line) => ({
			id: id(),
			productId: line.productId,
			unitsOrdered: line.units,
			orderedOn
		}))
	);
}

export async function receiveOrderLine(
	orderLineId: string,
	unitsReceived: number,
	receivedOn: string
): Promise<void> {
	const line = await db.orderLines.get(orderLineId);
	if (!line) return;
	await db.transaction('rw', [db.orderLines, db.stockEvents], async () => {
		await db.orderLines.put({ ...line, unitsReceived, receivedOn });
		await db.stockEvents.put({
			id: id(),
			productId: line.productId,
			kind: 'refill',
			units: unitsReceived,
			occurredOn: receivedOn,
			note: `Order ${orderLineId}`
		});
	});
}

/** Export as JSON. The guarantee against lock-in, and against a cleared cache. */
export async function exportJson(): Promise<string> {
	const snapshot = await loadState();
	const settings = await getSettings();

	return JSON.stringify(
		buildExport(
			snapshot,
			{
				locale: settings.locale,
				collectionNote: settings.collectionNote,
				defaultDoseTimes: settings.defaultDoseTimes,
				lastIcsFingerprint: settings.lastIcsFingerprint
			},
			new Date().toISOString()
		),
		null,
		2
	);
}

/**
 * Restore from a backup, returning anything that had to be discarded.
 *
 * Validation happens in `parseImport`, which is pure and tested. A hand-edited or
 * truncated file used to go straight into the database, where an invalid time produces a
 * calendar no client can parse and a missing box size divides by zero.
 */
export async function importJson(json: string): Promise<string[]> {
	const { state, preferences, warnings } = parseImport(json);
	await replaceAll(state, preferences);
	return warnings;
}
