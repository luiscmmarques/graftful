<script lang="ts">
	import { page } from '$app/state';
	import { regimen } from '$lib/db';
	import { elapsedSince, type Milestone, upcomingMilestones } from '$lib/domain/anniversary';
	import { today } from '$lib/lifecycle';
	import { t } from '$lib/i18n';
	import { watchStoredData } from '$lib/persistence';
	import { registerServiceWorker } from '$lib/registerServiceWorker';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Offline support. Deliberately explicit; see the module for why.
	onMount(() => {
		void registerServiceWorker();
	});

	/*
	 * Ask the browser not to evict the database — but only once it holds a regimen, since
	 * on Firefox the request is a permission prompt. See src/lib/persistence.ts.
	 */
	onMount(() => watchStoredData());

	const elapsed = $derived.by(() => {
		const tx = $regimen?.settings.transplantDate;
		return tx ? elapsedSince(tx, $today) : null;
	});

	/*
	 * The nearest upcoming milestone, within the next month.
	 *
	 * This is the one piece of the app that is not about logistics. Ten years of
	 * taking the same pills twice a day is relentless, and "day 4,000" is a genuinely
	 * good thing to be told on a Tuesday morning.
	 */
	const milestone = $derived.by(() => {
		const tx = $regimen?.settings.transplantDate;
		if (!tx) return null;
		return upcomingMilestones(tx, $today, 30)[0] ?? null;
	});

	function milestoneLabel(m: Milestone): string {
		return m.kind === 'anniversary'
			? $t.header.anniversaryLabel(m.value)
			: $t.header.dayLabel(m.value.toLocaleString());
	}

	/*
	 * Content-page menu.
	 *
	 * A button rather than a row of links because the header is already carrying the
	 * wordmark, the day counter and sometimes a milestone, and on a 390px phone there is
	 * no room left. The primary navigation stays permanently visible at the bottom, so
	 * nothing anyone needs daily is hidden behind this.
	 */
	let menuOpen = $state(false);

	/*
	 * Closed by watching the route rather than in each link's click handler. Detaching an
	 * anchor inside its own click handler can cancel the navigation it was supposed to
	 * start — and doing it this way also closes the menu on back and forward, which a
	 * click handler never would.
	 */
	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});

	const content = $derived([
		{ href: '/about', label: $t.footer.about },
		{ href: '/roadmap', label: $t.footer.roadmap },
		{ href: '/privacy', label: $t.footer.privacy },
		{ href: '/support', label: $t.footer.support }
	]);

	const nav = $derived([
		{ href: '/', label: $t.nav.today },
		{ href: '/stock', label: $t.nav.stock },
		{ href: '/order', label: $t.nav.order },
		{ href: '/setup', label: $t.nav.setup }
	]);
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') menuOpen = false;
	}}
/>

<div class="shell">
	<header>
		<div class="top">
			<a href="/" class="wordmark">
				<!--
					One asset, mark and name together, rather than an SVG beside a text node.

					That is the whole point of a lockup: the spacing, weight and relationship between
					the two are fixed in the file, so the header, the social card, the app icon and
					anything sent to a printer cannot drift apart. Composed from two elements, the gap
					would depend on the reader's font metrics and the wordmark on whatever font they
					happened to have.

					The name inside the file is outlined into paths, so no font is downloaded and none
					is shipped. The fallback follows what MDN documents for vector graphics: the SVG
					goes in `srcset` and a raster in `src`, so anything that cannot render SVG is left
					with a PNG rather than a broken image. `alt` carries the name, which is what makes
					the link read as "Graftful".
				-->
				<img
					class="lockup"
					src="/lockup-104.png"
					srcset="/lockup.svg"
					alt="Graftful"
					width="389"
					height="104"
				/>
			</a>

			<button
				class="burger"
				aria-label={$t.footer.menu}
				aria-expanded={menuOpen}
				aria-controls="content-menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<!-- Drawn rather than an icon font, so it scales with text and needs no asset. -->
				<span class="bars" class:open={menuOpen} aria-hidden="true"></span>
			</button>
		</div>
		{#if elapsed}
			<p class="elapsed">
				{$t.header.elapsed(
					elapsed.days.toLocaleString(),
					elapsed.calendar.years,
					elapsed.calendar.months,
					elapsed.calendar.days
				)}
			</p>
		{/if}
		{#if milestone}
			<p class="milestone">
				{#if milestone.daysUntil === 0}
					{$t.header.milestoneToday(milestoneLabel(milestone))}
				{:else}
					{$t.header.milestoneIn(milestoneLabel(milestone), milestone.daysUntil)}
				{/if}
			</p>
		{/if}
		{#if menuOpen}
			<!--
				Rendered inside the header rather than as an overlay: it pushes the page down
				instead of covering it, which avoids trapping focus and avoids the scroll
				locking that overlays need.
			-->
			<div class="menu" id="content-menu">
				{#each content as item (item.href)}
					<a href={item.href} aria-current={page.url.pathname === item.href ? 'page' : undefined}>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}
	</header>

	<main>
		{@render children()}
	</main>

	<nav class="sections" aria-label={$t.nav.sections}>
		{#each nav as item (item.href)}
			<a href={item.href} aria-current={page.url.pathname === item.href ? 'page' : undefined}>
				{item.label}
			</a>
		{/each}
	</nav>
</div>

<style>
	:global(:root) {
		/* Green for the graft, warm rather than clinical. */
		--accent: #1f6f4a;
		--accent-soft: #e6f2eb;
		--ink: #1a1a1a;
		--ink-soft: #5a5f5c;
		--bg: #fbfbf9;
		--surface: #ffffff;
		--line: #e2e4e1;
		--warn: #8a5a00;
		--warn-soft: #fdf3e0;
		--alert: #a32020;
		--alert-soft: #fdecec;
		--radius: 0.625rem;
		/* Tap targets never below this. Much of the audience is older. */
		--tap: 2.75rem;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		/* rem throughout, so OS text scaling works. Never fixed px for text. */
		font-size: 100%;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
		line-height: 1.5;
	}

	:global(h2) {
		font-size: 1.125rem;
		margin: 0 0 0.75rem;
	}

	:global(h3) {
		font-size: 1rem;
		margin: 0 0 0.5rem;
	}

	:global(button),
	:global(input),
	:global(select) {
		font: inherit;
		min-height: var(--tap);
	}

	:global(button) {
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		border-radius: var(--radius);
		padding: 0.5rem 0.875rem;
		cursor: pointer;
	}

	:global(button:hover) {
		border-color: var(--accent);
	}

	:global(button.primary) {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	:global(button.danger) {
		color: var(--alert);
		border-color: var(--alert);
	}

	:global(input),
	:global(select) {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.5rem;
		background: var(--surface);
		color: var(--ink);
		width: 100%;
	}

	:global(.card) {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 1rem;
		margin-bottom: 0.75rem;
	}

	:global(.muted) {
		color: var(--ink-soft);
		font-size: 0.875rem;
	}

	:global(.row) {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	:global(.badge) {
		display: inline-block;
		border-radius: 999px;
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		background: var(--accent-soft);
		color: var(--accent);
	}

	:global(.badge.warn) {
		background: var(--warn-soft);
		color: var(--warn);
	}

	:global(.badge.alert) {
		background: var(--alert-soft);
		color: var(--alert);
	}

	:global(.field) {
		display: block;
		margin-bottom: 0.625rem;
	}

	:global(.field > span) {
		display: block;
		font-size: 0.8125rem;
		color: var(--ink-soft);
		margin-bottom: 0.1875rem;
	}

	.shell {
		max-width: 40rem;
		margin: 0 auto;
		padding: 0 0.875rem 5rem;
	}

	header {
		padding: 1rem 0 0.5rem;
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--accent);
		text-decoration: none;
		/* Tapping the name is the fastest way back to today's doses, which is the
		   screen people actually want nine times out of ten. */
		padding: 0.25rem 0;
		min-height: var(--tap);
	}

	.wordmark:hover,
	.wordmark:focus-visible {
		text-decoration: underline;
	}

	/*
	 * Sized in `em` so the mark tracks the wordmark rather than being pinned to a pixel
	 * value that stops matching as soon as anyone changes their text size.
	 */
	/*
	 * Height in rem so the lockup tracks the text scale of the rest of the header, and width
	 * auto so its own aspect ratio decides the rest. Nothing here should pin a pixel value:
	 * the proportions live in the asset.
	 */
	.lockup {
		display: block;
		height: 1.6rem;
		width: auto;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		flex-wrap: wrap;
	}

	.burger {
		width: var(--tap);
		min-width: var(--tap);
		height: var(--tap);
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border-color: transparent;
	}

	.burger:hover,
	.burger:focus-visible {
		border-color: var(--line);
	}

	/* Three bars from one element: the middle is the box, the outer two are borders. */
	.bars,
	.bars::before,
	.bars::after {
		display: block;
		width: 1.125rem;
		height: 2px;
		background: var(--ink-soft);
		border-radius: 2px;
	}

	.bars::before,
	.bars::after {
		content: '';
		position: relative;
	}

	.bars::before {
		top: -6px;
	}

	.bars::after {
		top: 4px;
	}

	.bars.open,
	.bars.open::before,
	.bars.open::after {
		background: var(--accent);
	}

	.menu {
		display: flex;
		flex-direction: column;
		margin-top: 0.5rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		overflow: hidden;
	}

	.menu a {
		padding: 0.625rem 0.875rem;
		min-height: var(--tap);
		display: flex;
		align-items: center;
		color: var(--ink);
		text-decoration: none;
		font-size: 0.9375rem;
	}

	.menu a + a {
		border-top: 1px solid var(--line);
	}

	.menu a:hover,
	.menu a:focus-visible {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.menu a[aria-current='page'] {
		color: var(--accent);
		font-weight: 600;
	}

	.elapsed {
		margin: 0.125rem 0 0;
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}

	.milestone {
		margin: 0.375rem 0 0;
		font-size: 0.8125rem;
		color: var(--accent);
		background: var(--accent-soft);
		border-radius: var(--radius);
		padding: 0.375rem 0.625rem;
		display: inline-block;
	}

	/*
	 * Scoped to the section bar on purpose. This used to be a bare `nav` selector, which
	 * also caught the content menu in the header — pinning it to the bottom of the screen
	 * behind this bar, where it was invisible on a phone.
	 */
	nav.sections {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		background: var(--surface);
		border-top: 1px solid var(--line);
		padding-bottom: env(safe-area-inset-bottom);
	}

	nav.sections a {
		flex: 1;
		/* Equal widths regardless of label length, so the bar never reflows per language. */
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.5rem 0.25rem;
		min-height: var(--tap);
		text-decoration: none;
		color: var(--ink-soft);
		/*
		 * Scales with the viewport because label lengths differ sharply by language:
		 * "Setup" is five characters, "Einstellungen" is thirteen, and at a fixed size the
		 * German sat exactly on the limit at 390px — one character from breaking. Wrapping
		 * and hyphenation are allowed as the last resort rather than clipping, because a
		 * truncated navigation label is worse than a slightly taller bar.
		 */
		font-size: clamp(0.75rem, 3.1vw, 0.875rem);
		line-height: 1.15;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	nav.sections a[aria-current='page'] {
		color: var(--accent);
		font-weight: 600;
		box-shadow: inset 0 2px 0 var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
