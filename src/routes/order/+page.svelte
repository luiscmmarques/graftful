<script lang="ts">
	import { receiveOrderLine, recordOrder, regimen, saveSettings, settingsStore } from '$lib/db';
	import { planOrder, productStatuses, topUpCandidates } from '$lib/domain/procurement';
	import { orderLineText, orderMailto, orderText } from '$lib/domain/order-text';
	import { formatDays, formatNumber } from '$lib/util';
	import { locale } from '$lib/locale';
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
	<title>Order · Graftful</title>
	<meta name="description" content="Prepare a pharmacy order before you run out." />
</svelte:head>

<h2>Order</h2>

{#if !$regimen || !plan}
	<p class="muted">Loading…</p>
{:else}
	{#if triggered.length === 0}
		<div class="card">
			<strong>Nothing needs ordering.</strong>
			<p class="muted" style="margin:0.25rem 0 0.75rem">
				{#if plan.projectedNextOrderOn}
					Next pharmacy run expected around <strong>{plan.projectedNextOrderOn}</strong>.
				{:else}
					No product is being consumed yet.
				{/if}
			</p>
			{#if !forced}
				<button onclick={() => (forced = true)}>Order everything early anyway</button>
			{/if}
		</div>
	{:else}
		<div class="card" style="border-color: var(--alert)">
			<strong>
				{triggered.length}
				{triggered.length === 1 ? 'product is' : 'products are'} at or below the reorder point.
			</strong>
			<ul>
				{#each triggered as status (status.productId)}
					<li>{status.brandName}: {formatDays(status.daysRemaining)} days left</li>
				{/each}
			</ul>
			<p class="muted" style="margin-bottom:0">
				Everything else is topped up to the same horizon, so the next order lands as a single
				pharmacy run rather than several.
			</p>
		</div>
	{/if}

	{#if candidates.length > 0}
		<div class="card">
			<h3>Add anything else?</h3>
			<p class="muted">
				Nothing takes these on a schedule, so no calculation will ever ask for them, but they run
				out too. Worth topping up while you are ordering.
			</p>
			{#each candidates as candidate (candidate.productId)}
				<div class="line">
					<div class="row" style="justify-content: space-between">
						<div>
							<strong>{candidate.brandName}</strong>
							<div class="muted">
								{formatNumber(candidate.onHand)} left &middot; boxes of {candidate.packageSize}
							</div>
						</div>
						<div class="row">
							<button
								onclick={() => bump(candidate.productId, -1)}
								disabled={(additions[candidate.productId] ?? 0) === 0}
								aria-label="One box fewer">−</button
							>
							<span class="count">{additions[candidate.productId] ?? 0}</span>
							<button onclick={() => bump(candidate.productId, 1)} aria-label="One box more">
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
			<h3>Suggested order</h3>

			<label class="field">
				<span>When would you like it ready? (optional)</span>
				<input bind:value={collectionNote} placeholder="vendredi matin" />
			</label>

			{#each plan.lines as line (line.productId)}
				<div class="line">
					<div>
						<code>{orderLineText(line, $locale)}</code>
						{#if line.capped}<span class="badge warn">capped</span>{/if}
						{#if line.optional}<span class="badge">added by you</span>{/if}
					</div>
					{#if line.coversToDays !== null}
						<div class="muted">covers to {formatDays(line.coversToDays)} days</div>
					{/if}
				</div>
			{/each}

			{#if plan.projectedNextOrderOn}
				<p class="muted">
					After this order, the next run is expected around
					<strong>{plan.projectedNextOrderOn}</strong>.
				</p>
			{/if}

			<div class="row">
				<button class="primary" onclick={copy}>{copied ? 'Copied' : 'Copy order text'}</button>
				{#if mailto}
					<a href={mailto}><button>Open in email</button></a>
				{/if}
				<button onclick={markOrdered}>Mark as ordered</button>
			</div>
			<p class="muted">
				Marking it ordered records the request and silences the reminder. It does not change your
				stock. That happens when the order arrives.
			</p>

			<details>
				<summary>Full order text</summary>
				<pre>{text}</pre>
			</details>
		</div>
	{/if}

	{#if openOrders.length > 0}
		<div class="card">
			<h3>Awaiting collection</h3>
			{#each openOrders as { line, product } (line.id)}
				<div class="line">
					<div>
						<strong>{product?.brandName ?? line.productId}</strong>
						<span class="muted">
							{formatNumber(line.unitsOrdered - (line.unitsReceived ?? 0))} units outstanding, ordered
							{line.orderedOn}
						</span>
					</div>
					<div class="row">
						<button
							class="primary"
							onclick={() =>
								receiveOrderLine(line.id, line.unitsOrdered - (line.unitsReceived ?? 0), $today)}
						>
							Received in full
						</button>
						{#if product}
							<button onclick={() => receiveOrderLine(line.id, product.packageSize, $today)}>
								Received 1 box only
							</button>
						{/if}
					</div>
				</div>
			{/each}
			<p class="muted" style="margin-bottom:0">
				These products are often dispensed short. Recording a partial delivery keeps the remainder
				visible rather than quietly losing it. If the box turned out to be a different size than
				expected, correct it in <a href="/stock">Stock</a>.
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
