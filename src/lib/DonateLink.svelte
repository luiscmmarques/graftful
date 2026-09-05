<!--
	The donate link, wherever one appears.

	One component so the URL and the rules travel together: a plain anchor, never
	PayPal's embedded button — the button loads their JavaScript, which would break the
	"no third-party requests" property the privacy page depends on and the e2e suite
	enforces. The caller supplies the label, because what the link says depends on the
	sentence around it: "PayPal" on the Support card, "donation" mid-sentence on About.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { donateUrl } from '$lib/contact';

	let { children }: { children: Snippet } = $props();
</script>

<a href={donateUrl} rel="noopener noreferrer" target="_blank">{@render children()}</a>
