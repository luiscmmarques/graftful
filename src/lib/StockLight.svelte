<!--
	A three-lamp cover indicator, for Stock and Today.

	`DESIGN.md` says status is never signalled by colour alone, and a traffic light is
	colour by definition — so the colour here is the *third* cue, not the only one. All
	three lamps are always drawn and only one is ever lit, which means **which position
	is lit** carries the status on its own: left is fine, middle is running low, right is
	order now. The lit lamp is also larger than the two beside it. Read in greyscale, in
	sunlight, or by someone who cannot separate red from green, the position and the size
	still say it.

	The accessible name is not optional for the same reason. On Today the indicator sits
	beside a medication name with no words next to it, and a red dot there could be read
	as something being wrong with the *medicine* rather than with the number of boxes
	left. `aria-label` and `title` both say "Stock: …" so the subject is never in doubt.

	`none` — nothing consumes the product — deliberately lights nothing rather than
	borrowing the healthy lamp. A retired product with a cupboard full of residual stock
	has no cover to report, and claiming it is fine would be a statement the arithmetic
	does not make.

	Not interactive, so `--tap` does not apply: it is an indicator, and the button beside
	it is the target. Nothing animates — a pulsing red light on a medication screen is
	alarm, and this app does not do alarm.
-->
<script lang="ts">
	import type { StockLevel } from '$lib/domain/procurement';
	import { t } from '$lib/i18n';

	let { level }: { level: StockLevel } = $props();

	const text = $derived(
		level === 'order'
			? $t.stock.orderNow
			: level === 'low'
				? $t.stock.runningLow
				: level === 'ok'
					? $t.common.stockEnough
					: $t.common.notInUse
	);

	const label = $derived($t.common.stockLabelled(text));
</script>

<span class="light" role="img" aria-label={label} title={label}>
	<span class="lamp ok" class:lit={level === 'ok'}></span>
	<span class="lamp low" class:lit={level === 'low'}></span>
	<span class="lamp order" class:lit={level === 'order'}></span>
</span>

<style>
	.light {
		display: inline-flex;
		align-items: center;
		gap: 0.1875rem;
		/* Sits on the text baseline of whatever it is placed beside. */
		vertical-align: middle;
	}

	.lamp {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		/* The off state is visible, not absent: three lamps are what make position
		   readable, so an unlit one still has to be seen. */
		background: var(--line);
		transition: none;
	}

	/* Size is the second cue, after position. Kept modest so the row does not shift. */
	.lamp.lit {
		width: 0.6875rem;
		height: 0.6875rem;
	}

	.lamp.ok.lit {
		background: var(--accent);
	}

	.lamp.low.lit {
		background: var(--warn);
	}

	.lamp.order.lit {
		background: var(--alert);
	}

	/*
	 * Forced-colours mode replaces our palette outright, which would collapse the three
	 * lamps into one indistinguishable colour. Fall back to filled versus outlined, so
	 * the lit position still reads with no colour information at all.
	 */
	@media (forced-colors: active) {
		.lamp {
			background: transparent;
			border: 1px solid CanvasText;
		}

		.lamp.lit {
			background: CanvasText;
		}
	}
</style>
