<script lang="ts">
	import { addStockEvent, regimen, setPackageSize } from '$lib/db';
	import { productStatuses } from '$lib/domain/procurement';
	import { formatDays, formatNumber } from '$lib/util';
	import { today } from '$lib/lifecycle';
	import { LIMITS, normaliseNumber } from '$lib/domain/validate';
	import { t } from '$lib/i18n';

	const rows = $derived.by(() => {
		if (!$regimen) return [];
		const byId = new Map($regimen.products.map((p) => [p.id, p]));

		return productStatuses($regimen, $today)
			.map((status) => ({ status, product: byId.get(status.productId)! }))
			.sort((a, b) => {
				// Nothing consuming it sinks to the bottom; otherwise most urgent first.
				const left = a.status.daysRemaining ?? Number.POSITIVE_INFINITY;
				const right = b.status.daysRemaining ?? Number.POSITIVE_INFINITY;
				return left - right;
			});
	});

	let openFor = $state<string | null>(null);
	let packages = $state(1);
	let recount = $state(0);
	let boxSize = $state(0);

	function toggle(productId: string, onHand: number, packageSize: number) {
		openFor = openFor === productId ? null : productId;
		packages = 1;
		recount = onHand;
		boxSize = packageSize;
	}

	let stockError = $state('');

	async function refill(productId: string, packageSize: number) {
		const boxes = normaliseNumber(packages, LIMITS.packages);
		if (boxes === null) {
			stockError = 'Boxes must be a whole number, at least 1.';
			return;
		}

		stockError = '';
		await addStockEvent(productId, 'refill', boxes * packageSize, $today, `${boxes} pack(s)`);
		openFor = null;
	}

	async function applyRecount(productId: string) {
		// Zero is valid — an empty box is a real thing to record. Negative is not.
		const units = normaliseNumber(recount, LIMITS.stockUnits);
		if (units === null) {
			stockError = 'A count cannot be negative.';
			return;
		}

		stockError = '';
		await addStockEvent(productId, 'recount', units, $today, 'Counted by hand');
		openFor = null;
	}

	async function applyBoxSize(productId: string) {
		const size = normaliseNumber(boxSize, LIMITS.packageSize);
		if (size === null) {
			stockError = 'Units per box must be a whole number, at least 1.';
			return;
		}

		stockError = '';
		await setPackageSize(productId, size);
	}
</script>

<svelte:head>
	<title>{$t.stock.title} · Graftful</title>
	<meta name="description" content="How many pills are left, and how long they will last." />
</svelte:head>

<h2>{$t.stock.title}</h2>

{#if !$regimen}
	<p class="muted">{$t.common.loading}</p>
{:else if rows.length === 0}
	<p class="muted">{$t.stock.empty}</p>
{:else}
	{#each rows as { status, product } (product.id)}
		<div class="card">
			<div class="row" style="justify-content: space-between">
				<div>
					<strong>{product.brandName} {product.strength}{product.strengthUnit}</strong>
					<div class="muted">
						{#if product.form}{product.form} &middot;
						{/if}{product.packageSize} per box
					</div>
				</div>
				<div style="text-align:right">
					{#if status.daysRemaining === null}
						<span class="badge">{$t.common.notInUse}</span>
					{:else if status.mustOrder}
						<span class="badge alert">
							{$t.stock.orderNow} · {formatDays(status.daysRemaining)}
							{$t.common.days}
						</span>
					{:else if status.daysRemaining < product.minDays * 4}
						<span class="badge warn">
							{$t.stock.runningLow} · {formatDays(status.daysRemaining)}
							{$t.common.days}
						</span>
					{:else}
						<span class="badge">{formatDays(status.daysRemaining)} {$t.common.days}</span>
					{/if}
					<div class="muted">{$t.stock.left(formatNumber(status.onHand))}</div>
				</div>
			</div>

			<p class="muted" style="margin:0.5rem 0 0">
				{#if status.unitsPerDay > 0}
					{$t.stock.perDay(formatNumber(status.unitsPerDay))}
				{:else}
					{$t.stock.nothingConsumes}
				{/if}
				{#if status.onOrder > 0}
					&middot; {$t.stock.onOrder(formatNumber(status.onOrder))}
				{/if}
			</p>

			<div class="row" style="margin-top:0.625rem">
				<button onclick={() => toggle(product.id, status.onHand, product.packageSize)}>
					{openFor === product.id ? $t.common.close : $t.stock.openActions}
				</button>
			</div>

			{#if openFor === product.id}
				<div class="actions">
					<label class="field">
						<span>{$t.stock.refillLabel(product.packageSize)}</span>
						<input type="number" min="1" step="1" bind:value={packages} />
					</label>
					<button class="primary" onclick={() => refill(product.id, product.packageSize)}>
						{$t.stock.addUnits(packages * product.packageSize)}
					</button>

					<label class="field" style="margin-top:0.875rem">
						<span>{$t.stock.recountLabel}</span>
						<input type="number" min="0" step="1" bind:value={recount} />
					</label>
					<button onclick={() => applyRecount(product.id)}>{$t.stock.setTo(recount)}</button>
					<p class="muted">
						{$t.stock.refillVsRecount}
					</p>

					<label class="field" style="margin-top:0.875rem">
						<span>{$t.stock.boxSizeLabel}</span>
						<input type="number" min="1" step="1" bind:value={boxSize} />
					</label>
					<button
						onclick={() => applyBoxSize(product.id)}
						disabled={boxSize === product.packageSize}
					>
						{boxSize === product.packageSize
							? $t.stock.boxSizeUnchanged
							: $t.stock.correctTo(boxSize)}
					</button>
					<p class="muted">
						{$t.stock.boxSizeNote}
					</p>
					{#if stockError}<p class="stock-error" role="alert">{stockError}</p>{/if}
				</div>
			{/if}
		</div>
	{/each}
{/if}

<style>
	.stock-error {
		background: var(--warn-soft);
		color: var(--warn);
		border-radius: var(--radius);
		padding: 0.625rem;
	}

	.actions {
		border-top: 1px solid var(--line);
		margin-top: 0.75rem;
		padding-top: 0.75rem;
	}
</style>
