/**
 * Procurement: status per product, and joint replenishment planning.
 *
 * Products are not reordered independently. One product crossing its must-order
 * floor triggers an order, and that order tops *every* product up to a shared
 * horizon, so refill cycles stay aligned and future orders batch into a single
 * pharmacy run.
 */

import type { OrderPlan, OrderPlanLine, ProductStatus, RegimenState } from './types.ts';
import { addDays } from './dates.ts';
import { daysRemaining, projectedOnHand, unitsPerDay } from './stock.ts';

/** Units ordered but not yet received, including partial fulfilments. */
export function unitsOnOrder(state: RegimenState, productId: string): number {
	return state.orderLines
		.filter((line) => line.productId === productId)
		.reduce((sum, line) => {
			const outstanding = line.unitsOrdered - (line.unitsReceived ?? 0);
			return sum + Math.max(0, outstanding);
		}, 0);
}

export function productStatuses(state: RegimenState, asOf: string): ProductStatus[] {
	return state.products.map((product) => {
		const onHand = projectedOnHand(state, product.id, asOf);
		const perDay = unitsPerDay(state, product.id, asOf);
		const days = daysRemaining(onHand, perDay);
		const onOrder = unitsOnOrder(state, product.id);
		const hasOpenOrder = onOrder > 0;

		return {
			productId: product.id,
			brandName: product.brandName,
			onHand,
			unitsPerDay: perDay,
			daysRemaining: days,
			onOrder,
			hasOpenOrder,
			// An outstanding order suppresses the alert: nagging about something
			// already requested is how people learn to ignore the notification.
			mustOrder: days !== null && days <= product.minDays && !hasOpenOrder
		};
	});
}

/**
 * Plan an order.
 *
 * Returns an empty plan when nothing has crossed its floor — the trigger is
 * deliberate, so the app does not propose an order every time something dips.
 * Pass `force` to preview the basket on demand.
 */
/**
 * What would break if this product were deleted.
 *
 * Products are retired rather than deleted, because dose versions, stock events and
 * past orders all point at them: removing one would leave a history that no longer
 * adds up, and for medication history that is worse than clutter. But a product
 * typed in by mistake has nothing pointing at it and should not be permanent, so
 * deletion is offered exactly when it is harmless.
 */
export function productUsage(
	state: RegimenState,
	productId: string
): {
	doseVersions: number;
	stockEvents: number;
	orderLines: number;
	canDelete: boolean;
} {
	const doseVersions = state.doseVersions.filter((version) =>
		version.slots.some((slot) => slot.items.some((item) => item.productId === productId))
	).length;
	const stockEvents = state.stockEvents.filter((e) => e.productId === productId).length;
	const orderLines = state.orderLines.filter((l) => l.productId === productId).length;

	return {
		doseVersions,
		stockEvents,
		orderLines,
		canDelete: doseVersions === 0 && stockEvents === 0 && orderLines === 0
	};
}

/**
 * Products that will never trigger an order, but which you may still want to add
 * while you are ordering anyway: nothing consumes them on a schedule, so there is
 * no burn rate to project from. An as-needed painkiller is the obvious case — it
 * appears on a real pharmacy email, but no calculation could have put it there.
 */
export function topUpCandidates(
	state: RegimenState,
	asOf: string
): Array<{ productId: string; brandName: string; packageSize: number; onHand: number }> {
	const byId = new Map(state.products.map((p) => [p.id, p]));

	return productStatuses(state, asOf)
		.filter((status) => status.unitsPerDay <= 0)
		.flatMap((status) => {
			const product = byId.get(status.productId);
			if (!product || product.retired) return [];
			return [
				{
					productId: product.id,
					brandName: product.brandName,
					packageSize: product.packageSize,
					onHand: status.onHand
				}
			];
		});
}

export function planOrder(
	state: RegimenState,
	asOf: string,
	options: {
		force?: boolean;
		/** Extra whole packages to request, by product id. Added on top of any
		 * calculated line for the same product. */
		additions?: Record<string, number>;
	} = {}
): OrderPlan {
	const statuses = productStatuses(state, asOf);
	const byId = new Map(state.products.map((p) => [p.id, p]));
	const statusById = new Map(statuses.map((s) => [s.productId, s]));
	const triggeredBy = statuses.filter((s) => s.mustOrder).map((s) => s.productId);
	const additions = options.additions ?? {};
	const hasAdditions = Object.values(additions).some((n) => n > 0);

	if (triggeredBy.length === 0 && !options.force && !hasAdditions) {
		return { triggeredBy: [], lines: [], projectedNextOrderOn: null };
	}

	/*
	 * Whether to run the joint top-up at all. Asking for one extra box of a
	 * painkiller is not a reason to reorder two months of everything else — that
	 * would turn a small favour into a pharmacy run nobody asked for. So an
	 * addition on its own produces only itself.
	 */
	const calculate = triggeredBy.length > 0 || options.force === true;

	const target = state.settings.targetHorizonDays;
	const lines: OrderPlanLine[] = [];
	const plannedUnits = new Map<string, number>();

	for (const status of calculate ? statuses : []) {
		const product = byId.get(status.productId);
		if (!product || product.retired) continue;
		if (status.unitsPerDay <= 0) continue;

		const needed = target * status.unitsPerDay - status.onHand - status.onOrder;
		if (needed <= 0) continue;

		let packages = Math.ceil(needed / product.packageSize);
		let capped = false;

		if (product.maxOrderUnits !== undefined) {
			const maxPackages = Math.floor(product.maxOrderUnits / product.packageSize);
			if (maxPackages < packages) {
				packages = Math.max(0, maxPackages);
				capped = true;
			}
		}

		const units = packages * product.packageSize;
		plannedUnits.set(product.id, units);

		lines.push({
			productId: product.id,
			brandName: product.brandName,
			strength: product.strength,
			strengthUnit: product.strengthUnit,
			packages,
			units,
			coversToDays: (status.onHand + status.onOrder + units) / status.unitsPerDay,
			capped,
			optional: false
		});
	}

	// Requested additions, applied after the calculation so they can only ever add.
	for (const [productId, extraPackages] of Object.entries(additions)) {
		if (extraPackages <= 0) continue;
		const product = byId.get(productId);
		if (!product || product.retired) continue;

		const status = statusById.get(productId);
		const extraUnits = extraPackages * product.packageSize;
		plannedUnits.set(productId, (plannedUnits.get(productId) ?? 0) + extraUnits);

		const existing = lines.find((line) => line.productId === productId);
		if (existing) {
			existing.packages += extraPackages;
			existing.units += extraUnits;
			if (status && status.unitsPerDay > 0) {
				existing.coversToDays =
					(status.onHand + status.onOrder + existing.units) / status.unitsPerDay;
			}
			continue;
		}

		lines.push({
			productId: product.id,
			brandName: product.brandName,
			strength: product.strength,
			strengthUnit: product.strengthUnit,
			packages: extraPackages,
			units: extraUnits,
			// No rate, so no answer to "how long does this last".
			coversToDays: null,
			capped: false,
			optional: true
		});
	}

	return {
		triggeredBy,
		lines,
		projectedNextOrderOn: projectNextOrder(state, asOf, statuses, plannedUnits)
	};
}

/**
 * The date the next pharmacy run is expected: the earliest any product falls
 * back to its own floor, assuming the plan is received in full.
 *
 * This is the number the joint replenishment is really for — more useful than a
 * row of amber badges.
 */
export function projectNextOrder(
	state: RegimenState,
	asOf: string,
	statuses: ProductStatus[] = productStatuses(state, asOf),
	plannedUnits: Map<string, number> = new Map()
): string | null {
	const byId = new Map(state.products.map((p) => [p.id, p]));
	let soonest: number | null = null;

	for (const status of statuses) {
		if (status.unitsPerDay <= 0) continue;
		const product = byId.get(status.productId);
		if (!product || product.retired) continue;

		const projected = status.onHand + status.onOrder + (plannedUnits.get(status.productId) ?? 0);
		const cover = projected / status.unitsPerDay;
		const untilTrigger = Math.max(0, cover - product.minDays);

		if (soonest === null || untilTrigger < soonest) soonest = untilTrigger;
	}

	return soonest === null ? null : addDays(asOf, Math.floor(soonest));
}

/** Apply a received order to the ledger. Ordering never changes stock; this does. */
export function receiveOrder(
	state: RegimenState,
	orderLineId: string,
	unitsReceived: number,
	receivedOn: string,
	recordedAt: string = new Date().toISOString()
): RegimenState {
	const line = state.orderLines.find((l) => l.id === orderLineId);
	if (!line) throw new Error(`Unknown order line: ${orderLineId}`);

	return {
		...state,
		orderLines: state.orderLines.map((l) =>
			l.id === orderLineId ? { ...l, unitsReceived, receivedOn } : l
		),
		stockEvents: [
			...state.stockEvents,
			{
				id: `refill-${orderLineId}-${receivedOn}`,
				productId: line.productId,
				kind: 'refill',
				units: unitsReceived,
				occurredOn: receivedOn,
				recordedAt,
				note: `Order ${orderLineId}`
			}
		]
	};
}

/**
 * Truth-up after drift. Distinct from a refill so the ledger stays meaningful.
 *
 * `recordedAt` decides which observation wins when two share a day, so it defaults to now —
 * a correction entered later today should beat what was there this morning. Callers that
 * need a deterministic result pass it explicitly.
 */
export function recountStock(
	state: RegimenState,
	productId: string,
	units: number,
	occurredOn: string,
	note?: string,
	recordedAt: string = new Date().toISOString()
): RegimenState {
	return {
		...state,
		stockEvents: [
			...state.stockEvents,
			{
				id: `recount-${productId}-${occurredOn}`,
				productId,
				kind: 'recount',
				units,
				occurredOn,
				recordedAt,
				note
			}
		]
	};
}
