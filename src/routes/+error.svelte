<script lang="ts">
	/*
	 * Rendered for any path the app does not have, and it is what Cloudflare serves as
	 * 404.html (see the adapter fallback in vite.config.ts). Without this file SvelteKit's
	 * built-in error page appears instead: unstyled, untitled, and offering no way back —
	 * which on a live medication app looks like the app is broken rather than the link.
	 *
	 * It renders inside +layout.svelte, so the header and navigation are already present and
	 * every route is one tap away. The only thing worth adding is a plain explanation and a
	 * direct route to the screen people actually came for.
	 *
	 * The document Cloudflare serves as 404.html carries prerendered English, because a
	 * static file cannot know the reader's language. Hydration replaces it with theirs.
	 */
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t.notFound.title} · Graftful</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h2>{$t.notFound.title}</h2>

<div class="card">
	<p>
		{#if page.status === 404}
			{$t.notFound.body404}
		{:else}
			{$t.notFound.bodyOther}
		{/if}
	</p>
	<p class="muted">
		{$t.notFound.dataSafe}
	</p>
	<p><a href="/">{$t.notFound.goToToday}</a></p>
</div>
