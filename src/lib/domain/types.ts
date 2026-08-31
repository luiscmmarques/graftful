/**
 * The domain model.
 *
 * ## Before you change anything in this file
 *
 * Adding, renaming or removing a field here means checking the backup round trip in the
 * same change. A field that does not survive export and re-import is lost data — the file
 * is the only copy that exists outside one browser profile, and the failure is silent: the
 * value exports correctly and vanishes on the way back in.
 *
 * See the "Changing the data model" checklist in AGENTS.md.
 *
 * Two guards will catch you: `transfer.roundtrip.test.ts` stops compiling until a new
 * field is listed, and its round-trip assertion names any field that fails to survive.
 */

/**
 * How a strength is expressed.
 *
 * `cp` means the product is counted in whole pills rather than a measured amount, so no
 * numeric strength is meaningful and none is printed.
 */
export type Unit = 'mg' | 'g' | 'cp';

export interface Product {
	id: string;
	/** Exact dispensed product. Substitution matters, so this is not the molecule. */
	brandName: string;
	strength: number;
	strengthUnit: Unit;
	/**
	 * Tablet, capsule, sachet — optional free text, and purely a visual aid for
	 * telling two similar boxes apart. Nothing is derived from it. In particular the
	 * order text does not translate it into pharmacy vocabulary: most people do not
	 * know whether what they take is technically a comprimé or a gélule, and a
	 * confidently wrong word is worse than a neutral one.
	 */
	form?: string;
	/** Units per box. Orders are placed in whole packages. */
	packageSize: number;
	/** Must-order floor in days. Below this, an order is triggered. */
	minDays: number;
	/** Optional cap per order (insurance / prescription / pharmacy stock limits). */
	maxOrderUnits?: number;
	/**
	 * No longer part of any active composition, but kept for history and any
	 * residual stock. Never delete a product.
	 */
	retired?: boolean;
}

export interface Therapy {
	id: string;
	name: string;
	activeIngredient?: string;
	/** Free text, whatever grouping the person uses. Not a clinical taxonomy. */
	category: string;
	/** As-needed. Excluded from forecasting: there is no daily rate. */
	isPrn: boolean;
	startedOn: string;
	stoppedOn?: string;
}

export interface DoseItem {
	productId: string;
	/** Pills at this slot. Fractional allowed: 0.5 for a half tablet. */
	units: number;
}

export interface DoseSlot {
	/** Local time, "HH:MM". */
	time: string;
	items: DoseItem[];
}

export interface DoseVersion {
	id: string;
	therapyId: string;
	slots: DoseSlot[];
	activeFrom: string;
	/**
	 * Exclusive: the version applies over `[activeFrom, activeTo)`. When one dose
	 * replaces another, this must equal the next version's `activeFrom` — setting it
	 * to the last day the dose was actually taken leaves a one-day hole in which
	 * nothing is consumed and nothing is scheduled.
	 */
	activeTo?: string;
	/**
	 * What the prescriber said ("14 mg"). Optional, and never used to derive the
	 * composition — only to cross-check it. See `checkDoseConsistency`.
	 */
	declaredTotalDose?: number;
	declaredUnit?: Unit;
}

/**
 * `refill` and `adjustment` are deltas, `recount` is absolute.
 * Stock is the running total of the ledger, never a mutable field.
 */
export type StockEventKind = 'refill' | 'recount' | 'adjustment';

export interface StockEvent {
	/**
	 * When this was entered, as an ISO instant. Distinct from `occurredOn`, which is the day
	 * the observation applies to.
	 *
	 * It exists to order events that share a day. Without it a recount entered this evening
	 * competed with a refill recorded this morning and the winner was decided by which random
	 * id happened to sort later — so correcting a count to zero could silently do nothing.
	 * Optional because records written before this existed do not have it.
	 */
	recordedAt?: string;
	id: string;
	productId: string;
	kind: StockEventKind;
	units: number;
	occurredOn: string;
	note?: string;
}

/**
 * Ordering and receiving are separate events. Ordering does not change stock;
 * it silences the low-stock alert so the app stops nagging about something
 * already requested. `unitsReceived` may be less than ordered: these products
 * are frequently dispensed short.
 */
export interface OrderLine {
	id: string;
	productId: string;
	unitsOrdered: number;
	orderedOn: string;
	unitsReceived?: number;
	receivedOn?: string;
}

export interface Settings {
	/** Order-up-to horizon. On any trigger, top every product up to this. */
	targetHorizonDays: number;
	transplantDate: string;
}

export interface RegimenState {
	settings: Settings;
	products: Product[];
	therapies: Therapy[];
	doseVersions: DoseVersion[];
	stockEvents: StockEvent[];
	orderLines: OrderLine[];
}

export interface ProductStatus {
	productId: string;
	brandName: string;
	onHand: number;
	/** Pills consumed per day across every active composition using this product. */
	unitsPerDay: number;
	/** null when the burn rate is zero — retired or PRN-only, not "0 days left". */
	daysRemaining: number | null;
	/** Units on open orders not yet received. */
	onOrder: number;
	mustOrder: boolean;
	/** True when an order is outstanding, which suppresses the alert. */
	hasOpenOrder: boolean;
}

export interface OrderPlanLine {
	productId: string;
	brandName: string;
	strength: number;
	strengthUnit: Unit;
	packages: number;
	units: number;
	/**
	 * Days of cover this line buys, on top of current stock. Null when nothing
	 * consumes the product on a schedule — an as-needed painkiller has no daily
	 * rate, so "how many days does a box last" has no answer.
	 */
	coversToDays: number | null;
	/** True when `maxOrderUnits` prevented reaching the target horizon. */
	capped: boolean;
	/**
	 * True when the line was asked for rather than calculated. As-needed products
	 * never trigger an order, but they do get topped up while you are ordering
	 * anyway, which is exactly how they appear on a real pharmacy email.
	 */
	optional: boolean;
}

export interface OrderPlan {
	/** Products that crossed their must-order floor and caused this plan. */
	triggeredBy: string[];
	lines: OrderPlanLine[];
	/** Projected next pharmacy run, assuming this plan is received in full. */
	projectedNextOrderOn: string | null;
}
