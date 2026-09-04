<script lang="ts">
	import { regimen, replaceAll } from '$lib/db';
	import { exampleRegimen } from '$lib/domain/seed';
	import { pillsPerDay, prnTherapies, scheduleForDay } from '$lib/domain/schedule';
	import { productStatuses, stockLevel, type StockLevel } from '$lib/domain/procurement';
	import StockLight from '$lib/StockLight.svelte';
	import { formatNumber } from '$lib/util';
	import { today } from '$lib/lifecycle';
	import { t } from '$lib/i18n';

	const empty = $derived($regimen !== undefined && $regimen.products.length === 0);
	const slots = $derived($regimen ? scheduleForDay($regimen, $today) : []);
	const prn = $derived($regimen ? prnTherapies($regimen, $today) : []);
	const pills = $derived($regimen ? pillsPerDay($regimen, $today) : 0);

	// Computed once and shared: the reorder count and the per-entry indicator ask the
	// same question of the same numbers, and calling it twice invites them to diverge.
	const statuses = $derived($regimen ? productStatuses($regimen, $today) : []);
	const lowCount = $derived(statuses.filter((s) => s.mustOrder).length);

	const levels = $derived.by(() => {
		const floors = new Map(($regimen?.products ?? []).map((p) => [p.id, p.minDays]));
		return new Map(statuses.map((s) => [s.productId, stockLevel(s, floors.get(s.productId) ?? 0)]));
	});

	/*
	 * A dose is only as covered as its scarcest product.
	 *
	 * A therapy taken as three capsules is not fine because two of them are, so the entry
	 * shows the worst band among the products it actually consumes rather than an average —
	 * averaging would hide the one box that is about to run out, which is the only thing
	 * this indicator exists to surface.
	 */
	const RANK: Record<StockLevel, number> = { none: 0, ok: 1, low: 2, order: 3 };

	function worstLevel(productIds: string[]): StockLevel {
		let worst: StockLevel = 'none';
		for (const productId of productIds) {
			const level = levels.get(productId) ?? 'none';
			if (RANK[level] > RANK[worst]) worst = level;
		}
		return worst;
	}

	async function loadExample() {
		await replaceAll(exampleRegimen({ stockAsOf: $today }));
	}
</script>

<svelte:head>
	<title>{$t.today.title} · Graftful</title>
	<meta name="description" content={$t.today.metaDescription} />
</svelte:head>

{#if $regimen === undefined}
	<p class="muted">{$t.common.loading}</p>
{:else if empty}
	<div class="card">
		<h2>{$t.today.emptyTitle}</h2>
		<p class="muted">{$t.today.emptyBody}</p>
		<div class="row">
			<button class="primary" onclick={loadExample}>{$t.today.loadExample}</button>
			<a href="/setup"><button>{$t.today.setUpManually}</button></a>
		</div>
		<p class="muted" style="margin-bottom:0">{$t.today.exampleNote}</p>
	</div>
{:else}
	{#if lowCount > 0}
		<div class="card" style="border-color: var(--warn)">
			<strong>{$t.today.needsReorder(lowCount)}</strong>
			<a href="/order">{$t.today.openOrder}</a>
		</div>
	{/if}

	<h2>{$t.today.title}</h2>

	{#each slots as slot (slot.time)}
		<div class="card">
			<h3>{slot.time}</h3>
			{#each slot.entries as entry (entry.therapyId)}
				<div class="entry">
					<div class="row" style="justify-content: space-between">
						<span class="row">
							<strong>{entry.therapyName}</strong>
							<StockLight level={worstLevel(entry.items.map((item) => item.productId))} />
						</span>
						{#if entry.totalAmount !== null}
							<span class="badge">{formatNumber(entry.totalAmount)} {entry.totalUnit}</span>
						{/if}
					</div>
					<ul>
						{#each entry.items as item (item.productId)}
							<li>
								<strong>{formatNumber(item.units)}</strong>
								× {item.brandName}
								{item.strength}{item.strengthUnit}
								{#if item.form}<span class="muted">({item.form})</span>{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/each}

	{#if prn.length > 0}
		<div class="card">
			<h3>{$t.today.asNeeded}</h3>
			<ul>
				{#each prn as therapy (therapy.id)}
					<li>{therapy.name} <span class="muted">({$t.today.noFixedSchedule})</span></li>
				{/each}
			</ul>
		</div>
	{/if}

	<p class="muted">{$t.today.summary(formatNumber(pills), slots.length)}</p>
{/if}

<style>
	.entry + .entry {
		border-top: 1px solid var(--line);
		margin-top: 0.625rem;
		padding-top: 0.625rem;
	}

	ul {
		margin: 0.375rem 0 0;
		padding-left: 1.125rem;
	}

	li {
		margin-bottom: 0.125rem;
	}

	a {
		color: var(--accent);
	}
</style>
