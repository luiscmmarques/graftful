<script lang="ts">
	import { receiveOrderLine, recordOrder, regimen, saveSettings, settingsStore } from '$lib/db';
	import { planOrder, productStatuses, topUpCandidates } from '$lib/domain/procurement';
	import { orderLineText, orderMailto, orderText } from '$lib/domain/order-text';
	import { formatDays, formatNumber } from '$lib/util';
	import { locale } from '$lib/locale';
	import { t } from '$lib/i18n';
	import { today } from '$lib/lifecycle';

	let forced = $state(false);
	let copied = $state(false);
	let additions = $state<Record<string, number>>({});

	// Remembered between orders, because asking for the same slot every time is
	// what actually happens.
	let collectionNote = $state('');
	let syncedNote: string | null = null;

	// Resync on change rather than loading once, so a restored backup is reflected here
	// instead of showing a blank box over a stored value.
	$effect(() => {
		const stored = $settingsStore?.collectionNote ?? '';
		if (stored !== syncedNote) {
			syncedNote = stored;
			collectionNote = stored;
		}
	});

	const plan = $derived(
		$regimen ? planOrder($regimen, $today, { force: forced, additions }) : null
	);
	const triggered = $derived(
		$regimen ? productStatuses($regimen, $today).filter((s) => s.mustOrder) : []
	);
	const candidates = $derived($regimen ? topUpCandidates($regimen, $today) : []);

	const textOptions = $derived({
		locale: $locale,
		collectionNote: collectionNote.trim() || undefined
	});
	const text = $derived(plan ? orderText(plan, textOptions) : '');
	const mailto = $derived(plan ? orderMailto(plan, textOptions) : null);

	const openOrders = $derived.by(() => {
		if (!$regimen) return [];
		const byId = new Map($regimen.products.map((p) => [p.id, p]));
		return $regimen.orderLines
			.filter((l) => l.unitsOrdered - (l.unitsReceived ?? 0) > 0)
			.map((l) => ({ line: l, product: byId.get(l.productId) }));
	});

	function bump(productId: string, by: number) {
		const next = Math.max(0, (additions[productId] ?? 0) + by);
		additions = { ...additions, [productId]: next };
	}

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function markOrdered() {
		if (!plan) return;
		await recordOrder(
			plan.lines
				.filter((l) => l.packages > 0)
				.map((l) => ({ productId: l.productId, units: l.units })),
			$today
		);
		await saveSettings({ collectionNote: collectionNote.trim() || undefined });
		forced = false;
		additions = {};
	}
</script>

<svelte:head>
	<title>{$t.order.title} · Graftful</title>
	<meta name="description" content={$t.order.metaDescription} />
</svelte:head>

<h2>{$t.order.title}</h2>

{#if !$regimen || !plan}
	<p class="muted">{$t.common.loading}</p>
{:else}
	{#if triggered.length === 0}
		<div class="card">
			<strong>{$t.order.nothingNeeded}</strong>
			<p class="muted" style="margin:0.25rem 0 0.75rem">
				{#if plan.projectedNextOrderOn}
					{$t.order.nextRunAround(plan.projectedNextOrderOn)}
				{:else}
					{$t.order.nothingConsumedYet}
				{/if}
			</p>
			{#if !forced}
				<button onclick={() => (forced = true)}>{$t.order.forceOrder}</button>
			{/if}
		</div>
	{:else}
		<div class="card" style="border-color: var(--alert)">
			<strong>{$t.order.atReorderPoint(triggered.length)}</strong>
			<ul>
				{#each triggered as status (status.productId)}
					<li>{status.brandName}: {$t.order.daysLeft(formatDays(status.daysRemaining))}</li>
				{/each}
			</ul>
			<p class="muted" style="margin-bottom:0">
				{$t.order.jointNote}
			</p>
		</div>
	{/if}

	{#if candidates.length > 0}
		<div class="card">
			<h3>{$t.order.addAnythingTitle}</h3>
			<p class="muted">
				{$t.order.addAnythingNote}
			</p>
			{#each candidates as candidate (candidate.productId)}
				<div class="line">
					<div class="row" style="justify-content: space-between">
						<div>
							<strong>{candidate.brandName}</strong>
							<div class="muted">
								{$t.stock.left(formatNumber(candidate.onHand))} &middot; {$t.order.boxesOf(
									candidate.packageSize
								)}
							</div>
						</div>
						<div class="row">
							<button
								onclick={() => bump(candidate.productId, -1)}
								disabled={(additions[candidate.productId] ?? 0) === 0}
								aria-label={$t.order.oneBoxFewer}>−</button
							>
							<span class="count">{additions[candidate.productId] ?? 0}</span>
							<button onclick={() => bump(candidate.productId, 1)} aria-label={$t.order.oneBoxMore}>
								+
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if plan.lines.length > 0}
		<div class="card">
			<h3>{$t.order.suggestedTitle}</h3>

			<label class="field">
				<span>{$t.order.whenReadyLabel}</span>
				<input bind:value={collectionNote} placeholder={$t.order.whenReadyPlaceholder} />
			</label>

			{#each plan.lines as line (line.productId)}
				<div class="line">
					<div>
						<code>{orderLineText(line, $locale)}</code>
						{#if line.capped}<span class="badge warn">{$t.order.capped}</span>{/if}
						{#if line.optional}<span class="badge">{$t.order.addedByYou}</span>{/if}
					</div>
					{#if line.coversToDays !== null}
						<div class="muted">{$t.order.coversTo(formatDays(line.coversToDays))}</div>
					{/if}
				</div>
			{/each}

			{#if plan.projectedNextOrderOn}
				<p class="muted">
					{$t.order.nextRunAfter(plan.projectedNextOrderOn)}
				</p>
			{/if}

			<div class="row">
				<button class="primary" onclick={copy}
					>{copied ? $t.order.copied : $t.order.copyText}</button
				>
				{#if mailto}
					<a href={mailto}><button>{$t.order.openInEmail}</button></a>
				{/if}
				<button onclick={markOrdered}>{$t.order.markOrdered}</button>
			</div>
			<p class="muted">
				{$t.order.markOrderedNote}
			</p>

			<details>
				<summary>{$t.order.fullText}</summary>
				<pre>{text}</pre>
			</details>
		</div>
	{/if}

	{#if openOrders.length > 0}
		<div class="card">
			<h3>{$t.order.awaitingTitle}</h3>
			{#each openOrders as { line, product } (line.id)}
				<div class="line">
					<div>
						<strong>{product?.brandName ?? line.productId}</strong>
						<span class="muted">
							{$t.order.outstanding(
								formatNumber(line.unitsOrdered - (line.unitsReceived ?? 0)),
								line.orderedOn
							)}
						</span>
					</div>
					<div class="row">
						<button
							class="primary"
							onclick={() =>
								receiveOrderLine(line.id, line.unitsOrdered - (line.unitsReceived ?? 0), $today)}
						>
							{$t.order.receivedFull}
						</button>
						{#if product}
							<button onclick={() => receiveOrderLine(line.id, product.packageSize, $today)}>
								{$t.order.receivedOneBox}
							</button>
						{/if}
					</div>
				</div>
			{/each}
			<p class="muted" style="margin-bottom:0">
				{$t.order.partialNote}
				<a href="/stock">{$t.order.fixBoxSize}</a>
			</p>
		</div>
	{/if}
{/if}

<style>
	.line + .line {
		border-top: 1px solid var(--line);
		margin-top: 0.625rem;
		padding-top: 0.625rem;
	}

	ul {
		margin: 0.375rem 0;
		padding-left: 1.125rem;
	}

	code {
		font-size: 0.875rem;
	}

	.count {
		min-width: 1.5rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	pre {
		white-space: pre-wrap;
		font-size: 0.8125rem;
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.625rem;
	}

	details {
		margin-top: 0.75rem;
	}

	summary {
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--accent);
		min-height: var(--tap);
		display: flex;
		align-items: center;
	}

	a {
		color: var(--accent);
	}
</style>
