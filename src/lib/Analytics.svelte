<script lang="ts">
	/*
	 * Cloudflare Web Analytics.
	 *
	 * Chosen over GA4 deliberately: no cookies, no cross-site identifiers, no consent
	 * banner needed, and Cloudflare is not in the business of building advertising
	 * profiles. For an app handling medication data, sending anything to an ad network
	 * would undercut the entire privacy claim — including the one on /privacy that
	 * invites people to watch the Network tab and see nothing.
	 *
	 * What it records: that a page was opened, which page, and a coarse country from
	 * the request. It cannot see anything the user typed, because nothing typed ever
	 * leaves the device.
	 *
	 * Absent a token — which is the case in dev and in any fork — this renders nothing
	 * at all rather than pointing at someone else's account.
	 */
	const token = __CF_BEACON_TOKEN__;
</script>

{#if token}
	<script
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={JSON.stringify({ token })}
	></script>
{/if}
