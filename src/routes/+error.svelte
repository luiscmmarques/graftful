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
	 * English only, consistent with the other content pages, which are not translated yet.
	 */
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Page not found · Graftful</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h2>Page not found</h2>

<div class="card">
	<p>
		{#if page.status === 404}
			There is no page at this address. The link may be mistyped, or it may point at something this
			version of Graftful does not have.
		{:else}
			Something went wrong loading this page.
		{/if}
	</p>
	<p class="muted">
		Nothing you have entered is affected. Your regimen, stock counts and history are stored by your
		browser on this device, and a bad link does not touch them.
	</p>
	<p><a href="/">Go to Today</a></p>
</div>
