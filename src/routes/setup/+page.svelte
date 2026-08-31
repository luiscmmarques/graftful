<script lang="ts">
	import {
		addStockEvent,
		applyDoseChange,
		clearAll,
		deleteProduct,
		deleteTherapy,
		exportJson,
		importJson,
		putDoseVersion,
		putProduct,
		putTherapy,
		regimen,
		saveSettings,
		setProductRetired,
		setTherapyStopped,
		settingsStore,
		updateProduct,
		updateTherapy
	} from '$lib/db';
	import { buildIcs, scheduleFingerprint } from '$lib/domain/ics';
	import { composedDose, planDoseChange, retiredProductsIn, therapyUsage } from '$lib/domain/dose';
	import { productUsage } from '$lib/domain/procurement';
	import { checkDoseConsistency } from '$lib/domain/stock';
	import type { DoseVersion, Product, RegimenState, Therapy, Unit } from '$lib/domain/types';
	import { downloadFile, formatNumber } from '$lib/util';
	import { today } from '$lib/lifecycle';
	import { locale, LOCALES } from '$lib/locale';
	import type { Locale } from '$lib/domain/locale';
	import {
		LIMITS,
		normaliseDate,
		normaliseNumber,
		normaliseTime,
		parseTimeList
	} from '$lib/domain/validate';

	const calendarTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const fingerprint = $derived(
		$regimen
			? scheduleFingerprint($regimen, $today, {
					locale: $locale,
					timeZone: calendarTimeZone
				})
			: ''
	);
	const icsStale = $derived(
		$settingsStore?.lastIcsFingerprint !== undefined &&
			$settingsStore.lastIcsFingerprint !== fingerprint
	);
	const icsNeverExported = $derived($settingsStore?.lastIcsFingerprint === undefined);

	// --- settings ---
	let transplantDate = $state('');
	let horizon = $state(30);
	let syncedDetails = '';

	// Same resync as the times above, for the same reason.
	$effect(() => {
		const stored = `${$settingsStore?.transplantDate ?? ''}|${$settingsStore?.targetHorizonDays ?? 60}`;
		if (stored !== syncedDetails) {
			syncedDetails = stored;
			transplantDate = $settingsStore?.transplantDate ?? '';
			horizon = $settingsStore?.targetHorizonDays || 30;
		}
	});

	// --- new product ---
	let pBrand = $state('');
	let pStrength = $state(1);
	let pUnit = $state<Unit>('mg');
	let pPack = $state(0);
	let pMinDays = $state(3);
	let pStock = $state(0);

	// --- editing an existing product ---
	let editing = $state<string | null>(null);
	let eBrand = $state('');
	let eStrength = $state(1);
	let eUnit = $state<Unit>('mg');
	let ePack = $state(1);
	let eMinDays = $state(3);
	let eForm = $state('');
	let productError = $state('');

	function openEditor(product: Product) {
		productError = '';
		if (editing === product.id) {
			editing = null;
			return;
		}
		editing = product.id;
		eBrand = product.brandName;
		eStrength = product.strength;
		eUnit = product.strengthUnit;
		ePack = product.packageSize;
		eMinDays = product.minDays;
		eForm = product.form ?? '';
	}

	async function saveProduct(productId: string) {
		const strength = normaliseNumber(eStrength, LIMITS.strength);
		const pack = normaliseNumber(ePack, LIMITS.packageSize);
		const floor = normaliseNumber(eMinDays, LIMITS.minDays);

		if (!eBrand.trim() || strength === null || pack === null || floor === null) {
			productError =
				'Check the name, strength, units per box and reorder floor — each must be a positive number.';
			return;
		}

		productError = '';
		await updateProduct(productId, {
			brandName: eBrand.trim(),
			strength,
			strengthUnit: eUnit,
			packageSize: pack,
			minDays: floor,
			form: eForm.trim() || undefined
		});
		editing = null;
	}

	async function removeProduct(productId: string) {
		if (!confirm('Delete this product permanently?')) return;
		try {
			await deleteProduct(productId);
			editing = null;
			productError = '';
		} catch (error) {
			productError = error instanceof Error ? error.message : 'Could not delete';
		}
	}

	/*
	 * The user's usual times, used only as defaults for new therapies and new slots. Falls
	 * back to a single time rather than a pair: assuming twice daily is the same mistake as
	 * assuming the hours.
	 */
	const defaultTimes = $derived(
		$settingsStore?.defaultDoseTimes?.length ? $settingsStore.defaultDoseTimes : ['08:00']
	);

	let doseTimesDraft = $state('');
	let syncedTimes = '';

	/*
	 * Resync whenever the *stored* value changes, rather than loading once.
	 *
	 * A one-shot load left this field showing defaults after restoring a backup: the
	 * database held the right times, the box did not, and the obvious response is to type
	 * them again. Comparing against the last synced value means typing is never clobbered —
	 * the draft only gets overwritten when what is persisted actually changed.
	 */
	$effect(() => {
		const stored = ($settingsStore?.defaultDoseTimes ?? ['08:00', '20:00']).join(', ');
		if (stored !== syncedTimes) {
			syncedTimes = stored;
			doseTimesDraft = stored;
		}
	});

	$effect(() => {
		// Prefill the add-therapy times from the user's own schedule, not a fixed pair.
		if (!tTimes) tTimes = defaultTimes.join(', ');
	});

	let doseTimesError = $state('');

	async function saveDoseTimes() {
		const { times, invalid } = parseTimeList(doseTimesDraft);

		// Reported rather than skipped: silently dropping "25:00" would leave someone
		// believing they had set a time they had not.
		if (invalid.length > 0) {
			doseTimesError = `Not a time: ${invalid.join(', ')}. Use HH:MM, like 08:00.`;
			return;
		}
		if (times.length === 0) {
			doseTimesError = 'Give at least one time, like 08:00.';
			return;
		}

		doseTimesError = '';
		doseTimesDraft = times.join(', ');
		await saveSettings({ defaultDoseTimes: times });
	}

	// --- new therapy ---
	let tName = $state('');
	let tCategory = $state('');
	let tPrn = $state(false);
	let tTimes = $state('');
	let tItems = $state<Array<{ productId: string; units: number }>>([]);

	// --- editing an existing therapy ---
	let editingTherapy = $state<string | null>(null);
	let tEditName = $state('');
	let tEditCategory = $state('');
	let tEditIngredient = $state('');
	let tEditStarted = $state('');
	let tEditPrn = $state(false);
	let therapyError = $state('');

	// --- the dose being drafted ---
	let dFrom = $state($today);
	let dSlots = $state<Array<{ time: string; items: Array<{ productId: string; units: number }> }>>(
		[]
	);
	let dDeclared = $state<number | ''>('');
	let dDeclaredUnit = $state<Unit>('mg');
	let doseError = $state('');

	const draftTotal = $derived(
		$regimen ? composedDose($regimen.products, dSlots) : { perDay: 0, perSlot: [], unit: null }
	);
	const draftRetired = $derived($regimen ? retiredProductsIn($regimen.products, dSlots) : []);
	const declaredMismatch = $derived(
		dDeclared !== '' &&
			draftTotal.unit === dDeclaredUnit &&
			Math.abs(draftTotal.perDay - Number(dDeclared)) > 1e-9 &&
			!draftTotal.perSlot.some((v) => Math.abs(v - Number(dDeclared)) < 1e-9)
	);

	function versionsFor(state: RegimenState, therapyId: string): DoseVersion[] {
		return state.doseVersions
			.filter((v) => v.therapyId === therapyId)
			.sort((a, b) => a.activeFrom.localeCompare(b.activeFrom));
	}

	function describeItem(state: RegimenState, item: { productId: string; units: number }): string {
		const product = state.products.find((p) => p.id === item.productId);
		if (!product) return `${item.units} × (unknown)`;
		const strength =
			product.strengthUnit === 'cp' ? '' : ` ${product.strength} ${product.strengthUnit}`;
		return `${formatNumber(item.units)} × ${product.brandName}${strength}`;
	}

	function openTherapy(therapy: Therapy, versions: DoseVersion[]) {
		therapyError = '';
		doseError = '';
		if (editingTherapy === therapy.id) {
			editingTherapy = null;
			return;
		}
		editingTherapy = therapy.id;
		tEditName = therapy.name;
		tEditCategory = therapy.category;
		tEditIngredient = therapy.activeIngredient ?? '';
		tEditStarted = therapy.startedOn;
		tEditPrn = therapy.isPrn;

		// Pre-fill the draft with the dose currently in force, so a change is an edit
		// of what you take rather than something to type out again from scratch.
		const current = versions[versions.length - 1];
		dFrom = $today;
		dDeclared = current?.declaredTotalDose ?? '';
		dDeclaredUnit = current?.declaredUnit ?? 'mg';
		dSlots = current
			? current.slots.map((slot) => ({
					time: slot.time,
					items: slot.items.map((item) => ({ productId: item.productId, units: item.units }))
				}))
			: [
					{
						time: defaultTimes[0],
						items: [{ productId: $regimen?.products[0]?.id ?? '', units: 1 }]
					}
				];
	}

	async function saveTherapy(therapyId: string) {
		if (!tEditName.trim()) return;
		await updateTherapy(therapyId, {
			name: tEditName.trim(),
			category: tEditCategory.trim(),
			activeIngredient: tEditIngredient.trim() || undefined,
			startedOn: tEditStarted,
			isPrn: tEditPrn
		});
	}

	function addSlot() {
		dSlots = [
			...dSlots,
			{
				// Next unused usual time, or the last one again if they are all taken.
				time: defaultTimes[dSlots.length] ?? defaultTimes[defaultTimes.length - 1],
				items: [{ productId: $regimen?.products[0]?.id ?? '', units: 1 }]
			}
		];
	}

	function removeSlot(index: number) {
		dSlots = dSlots.filter((_, i) => i !== index);
	}

	function addItem(slotIndex: number) {
		dSlots = dSlots.map((slot, i) =>
			i === slotIndex
				? {
						...slot,
						items: [...slot.items, { productId: $regimen?.products[0]?.id ?? '', units: 1 }]
					}
				: slot
		);
	}

	function removeItem(slotIndex: number, itemIndex: number) {
		dSlots = dSlots.map((slot, i) =>
			i === slotIndex ? { ...slot, items: slot.items.filter((_, j) => j !== itemIndex) } : slot
		);
	}

	async function saveDose(therapyId: string) {
		if (!$regimen) return;
		doseError = '';

		const effectiveFrom = normaliseDate(dFrom);
		if (effectiveFrom === null) {
			doseError = 'That start date does not exist. Use YYYY-MM-DD.';
			return;
		}

		const slots: Array<{ time: string; items: Array<{ productId: string; units: number }> }> = [];
		for (const slot of dSlots) {
			const time = normaliseTime(slot.time);
			if (time === null) {
				doseError = `"${slot.time}" is not a time. Use HH:MM, like 08:00.`;
				return;
			}

			const items = [];
			for (const item of slot.items) {
				const units = normaliseNumber(item.units, LIMITS.units);
				if (units === null) {
					doseError = 'Every product needs a quantity above zero.';
					return;
				}
				if (!item.productId) {
					doseError = 'Choose a product for every line.';
					return;
				}
				items.push({ productId: item.productId, units });
			}
			slots.push({ time, items });
		}

		try {
			const change = planDoseChange($regimen, {
				therapyId,
				effectiveFrom,
				slots,
				declaredTotalDose: dDeclared === '' ? undefined : Number(dDeclared),
				declaredUnit: dDeclared === '' ? undefined : dDeclaredUnit,
				newVersionId: crypto.randomUUID()
			});
			await applyDoseChange(change);
			/*
			 * Do not clear lastIcsFingerprint here. Keeping the previous fingerprint is what
			 * lets `icsStale` compare old with new and show the warning. Clearing it made an
			 * exported calendar look as if it had never existed precisely after it became stale.
			 */
		} catch (error) {
			doseError = error instanceof Error ? error.message : 'Could not save the dose';
		}
	}

	async function removeTherapy(therapyId: string) {
		if (!confirm('Delete this therapy and its doses?')) return;
		try {
			await deleteTherapy(therapyId, $today);
			editingTherapy = null;
			therapyError = '';
		} catch (error) {
			therapyError = error instanceof Error ? error.message : 'Could not delete';
		}
	}

	let importError = $state('');

	let settingsError = $state('');

	async function saveSettingsForm() {
		const date = transplantDate === '' ? '' : normaliseDate(transplantDate);
		if (date === null) {
			settingsError = 'That date does not exist. Use YYYY-MM-DD.';
			return;
		}

		const days = normaliseNumber(horizon, LIMITS.horizonDays);
		if (days === null) {
			settingsError = 'The horizon must be a whole number of days, at least 1.';
			return;
		}

		settingsError = '';
		await saveSettings({ transplantDate: date, targetHorizonDays: days });
	}

	let productFormError = $state('');

	async function addProduct() {
		if (!pBrand.trim()) {
			productFormError = 'Give the product a name.';
			return;
		}

		// A box size of zero would make order rounding divide by zero and ask for an
		// infinite number of boxes. A guess is fine — Stock lets you correct it later.
		const pack = normaliseNumber(pPack, LIMITS.packageSize);
		const strength = normaliseNumber(pStrength, LIMITS.strength);
		const floor = normaliseNumber(pMinDays, LIMITS.minDays);
		const stock = normaliseNumber(pStock === 0 ? '0' : pStock, LIMITS.stockUnits);

		if (strength === null) {
			productFormError = 'The strength must be a positive number.';
			return;
		}
		if (pack === null) {
			productFormError = 'Units per box must be a whole number, at least 1.';
			return;
		}
		if (floor === null) {
			productFormError = 'The reorder floor must be a whole number of days.';
			return;
		}
		if (stock === null) {
			productFormError = 'Units on hand cannot be negative.';
			return;
		}

		productFormError = '';
		const id = await putProduct({
			brandName: pBrand.trim(),
			strength,
			strengthUnit: pUnit,
			packageSize: pack,
			minDays: floor
		});
		if (stock > 0) {
			await addStockEvent(id, 'recount', stock, $today, 'Initial count');
		}
		pBrand = '';
		pStock = 0;
	}

	let therapyFormError = $state('');

	async function addTherapy() {
		if (!tName.trim()) {
			therapyFormError = 'Give the therapy a name.';
			return;
		}

		/*
		 * Validate the optional dose before writing the therapy. This used to insert the
		 * therapy first and only then discover an invalid time, leaving a half-created record
		 * behind despite showing an error.
		 */
		let times: string[] = [];
		let items: Array<{ productId: string; units: number }> = [];
		if (!tPrn && tItems.length > 0) {
			const parsed = parseTimeList(tTimes);
			if (parsed.invalid.length > 0 || parsed.times.length === 0) {
				therapyFormError = 'Check the times: use HH:MM, like 08:00.';
				return;
			}
			times = parsed.times;

			for (const item of tItems) {
				const units = normaliseNumber(item.units, LIMITS.units);
				if (!item.productId || units === null) {
					therapyFormError = 'Choose a product and a positive quantity for every line.';
					return;
				}
				items.push({ productId: item.productId, units });
			}
		}

		therapyFormError = '';
		const therapyId = await putTherapy({
			name: tName.trim(),
			category: tCategory,
			isPrn: tPrn,
			startedOn: $today
		});

		if (times.length > 0) {
			await putDoseVersion({
				therapyId,
				activeFrom: $today,
				slots: times.map((time) => ({ time, items }))
			});
		}

		tName = '';
		tItems = [];
	}

	async function exportIcs() {
		if (!$regimen) return;
		downloadFile(
			'graftful.ics',
			buildIcs($regimen, $today, {
				locale: $locale,
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
			}),
			'text/calendar'
		);
		await saveSettings({ lastIcsFingerprint: fingerprint });
	}

	async function doExport() {
		/*
		 * An empty export is refused rather than downloaded.
		 *
		 * A file with no products is indistinguishable from a real backup by name and size,
		 * and restoring it replaces everything with nothing. Someone who exported at the
		 * wrong moment would be holding a file that destroys the data it is meant to save.
		 */
		if (!$regimen || ($regimen.products.length === 0 && $regimen.therapies.length === 0)) {
			exportError = 'Nothing to export yet — there is no regimen on this device.';
			return;
		}
		exportError = '';
		downloadFile('graftful-backup.json', await exportJson(), 'application/json');
	}

	let exportError = $state('');
	let importWarnings = $state<string[]>([]);

	let deleteState = $state<'idle' | 'working' | 'done'>('idle');
	let deleteError = $state('');

	/*
	 * Deletion is awaited and reported.
	 *
	 * This was `confirm(...) && clearAll()` — fire and forget. The click handler returned
	 * before the transaction committed, so navigating straight afterwards could tear it down
	 * with data still in place, and a failure surfaced nowhere at all. On a screen whose
	 * whole promise is that the data is yours and destroyable, a delete that quietly does
	 * not delete is the worst thing here to get wrong.
	 */
	async function deleteEverything() {
		if (!confirm('Delete everything on this device?')) return;
		deleteState = 'working';
		deleteError = '';
		try {
			await clearAll();
			deleteState = 'done';
		} catch (error) {
			deleteState = 'idle';
			deleteError = error instanceof Error ? error.message : 'Delete failed';
		}
	}

	async function doImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		/*
		 * Import is destructive: replaceAll clears every table before writing the backup.
		 * Product and therapy deletion are confirmed individually, so replacing the entire
		 * regimen without one was both inconsistent and much higher impact. Reset the input on
		 * cancel so selecting the same file again still fires `change`.
		 */
		if (
			!confirm(
				'Importing this backup will replace every product, dose, stock count and order on this device. Continue?'
			)
		) {
			input.value = '';
			return;
		}

		try {
			// Anything the backup could not supply is reported rather than swallowed: a
			// restore that quietly drops half a regimen is worse than one that refuses.
			importWarnings = await importJson(await file.text());
			importError = '';
		} catch (error) {
			importWarnings = [];
			importError = error instanceof Error ? error.message : 'Import failed';
		} finally {
			input.value = '';
		}
	}
</script>

<svelte:head>
	<title>Setup · Graftful</title>
	<meta name="description" content="Your products, doses, reminders and backups." />
</svelte:head>

<h2>Setup</h2>

<div class="card">
	<h3>Reminders</h3>
	{#if icsNeverExported}
		<p class="muted">
			No web API can schedule a notification locally, so reminders work through your phone's
			calendar. Export once and import the file into your calendar app.
		</p>
	{:else if icsStale}
		<p class="stale" role="alert">
			<strong>Your calendar is out of date.</strong> The schedule, language or timezone changed since
			you last exported. Export again and re-import. Existing reminders at the same times will update;
			if a time was removed or changed, delete the old Graftful reminder from your calendar first.
		</p>
	{:else}
		<p class="muted">Your calendar matches the current schedule.</p>
	{/if}
	<button class="primary" onclick={exportIcs}>Export reminders (.ics)</button>
	<p class="muted" style="margin-bottom:0">
		As-needed medication is left out, because there is no schedule to put in a calendar. Push
		notifications, with a "taken" button, come in a later version.
	</p>
</div>

<div class="card">
	<h3>Language</h3>
	<label class="field">
		<span>Language for the pharmacy order and the calendar export</span>
		<select
			value={$settingsStore?.locale ?? ''}
			onchange={(event) =>
				saveSettings({
					locale: (event.currentTarget.value || undefined) as Locale | undefined
				})}
		>
			<option value="">Follow my browser ({$locale === 'fr' ? 'Français' : 'English'})</option>
			{#each LOCALES as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</label>
	<p class="muted" style="margin-bottom:0">
		The screens themselves are English for now. This already sets the language of the two things
		that leave the app: the order you send your pharmacy, and the calendar file. So you can send a
		French order from an English phone.
	</p>
</div>

<div class="card">
	<h3>Your usual times</h3>
	<label class="field">
		<span>When you normally take medication, comma separated</span>
		<input bind:value={doseTimesDraft} placeholder="08:00, 20:00" />
	</label>
	<button onclick={saveDoseTimes}>Save times</button>
	{#if doseTimesError}<p class="stale">{doseTimesError}</p>{/if}
	<p class="muted" style="margin-bottom:0">
		Only used to fill in the times when you add something new. Each dose keeps its own, and you can
		change any of them individually. Set whatever you and your centre agreed; Graftful will not
		suggest an interval, because how far apart your doses should be is a decision for your
		prescriber.
	</p>
</div>

<div class="card">
	<h3>Your details</h3>
	<label class="field">
		<span>Transplant date</span>
		<input type="date" bind:value={transplantDate} />
	</label>
	<label class="field">
		<span>Top-up horizon in days: how far ahead an order should cover</span>
		<input type="number" min="7" step="1" bind:value={horizon} />
	</label>
	<button onclick={saveSettingsForm}>Save</button>
	{#if settingsError}<p class="stale">{settingsError}</p>{/if}
</div>

<div class="card">
	<h3>Products</h3>
	{#if $regimen && $regimen.products.length > 0}
		{#each $regimen.products as product (product.id)}
			{@const usage = productUsage($regimen, product.id)}
			<div class="line">
				<div class="row" style="justify-content: space-between">
					<div>
						<strong class:retired={product.retired}>
							{product.brandName}
							{product.strengthUnit === 'cp' ? '' : `${product.strength} ${product.strengthUnit}`}
						</strong>
						<div class="muted">
							{product.packageSize} per box &middot; reorder at {product.minDays}d
							{#if product.form}&middot; {product.form}{/if}
						</div>
					</div>
					<div class="row">
						{#if product.retired}<span class="badge">retired</span>{/if}
						<button onclick={() => openEditor(product)}>
							{editing === product.id ? 'Close' : 'Edit'}
						</button>
					</div>
				</div>

				{#if editing === product.id}
					<div class="editor">
						<label class="field"><span>Brand name</span><input bind:value={eBrand} /></label>
						<div class="grid">
							<label class="field">
								<span>Strength</span>
								<input type="number" step="0.5" bind:value={eStrength} />
							</label>
							<label class="field">
								<span>Unit</span>
								<select bind:value={eUnit}>
									<option value="mg">mg</option>
									<option value="g">g</option>
									<option value="cp">cp (whole pill)</option>
								</select>
							</label>
							<label class="field">
								<span>Units per box</span>
								<input type="number" min="1" step="1" bind:value={ePack} />
							</label>
							<label class="field">
								<span>Reorder floor (days)</span>
								<input type="number" min="0" step="1" bind:value={eMinDays} />
							</label>
							<label class="field">
								<span>Form (optional)</span>
								<input bind:value={eForm} placeholder="tablet, capsule…" />
							</label>
						</div>
						<div class="row">
							<button class="primary" onclick={() => saveProduct(product.id)}>Save changes</button>
						</div>

						<div class="lifecycle">
							{#if product.retired}
								<button onclick={() => setProductRetired(product.id, false)}>
									Start using this again
								</button>
								<p class="muted">
									Restoring it puts it back into the schedule calculations and the order list.
								</p>
							{:else}
								<button onclick={() => setProductRetired(product.id, true)}>Retire</button>
								<p class="muted">
									Retiring is how you stop using something. It stays in your history, keeps its
									stock, and past orders still make sense. It just drops out of ordering. This is
									the right choice when a strength is discontinued or a dose changes.
								</p>
							{/if}

							{#if usage.canDelete}
								<button class="danger" onclick={() => removeProduct(product.id)}>
									Delete permanently
								</button>
								<p class="muted">
									Nothing refers to this product, so deleting it loses nothing. Use this for
									something typed in by mistake.
								</p>
							{:else}
								<p class="muted">
									This cannot be deleted: it appears in {usage.doseVersions}
									{usage.doseVersions === 1 ? 'dose' : 'doses'}, {usage.stockEvents} stock
									{usage.stockEvents === 1 ? 'entry' : 'entries'} and {usage.orderLines}
									{usage.orderLines === 1 ? 'order' : 'orders'}. Removing it would leave a history
									that no longer adds up. Retire it instead.
								</p>
							{/if}
							{#if productError}<p class="stale">{productError}</p>{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<p class="muted">None yet.</p>
	{/if}

	<details>
		<summary>Add a product</summary>
		<label class="field"><span>Brand name</span><input bind:value={pBrand} /></label>
		<div class="grid">
			<label class="field"
				><span>Strength</span><input type="number" step="0.5" bind:value={pStrength} /></label
			>
			<label class="field">
				<span>Unit</span>
				<select bind:value={pUnit}>
					<option value="mg">mg</option>
					<option value="g">g</option>
					<option value="cp">cp (whole pill)</option>
				</select>
			</label>
			<label class="field"
				><span>Units per box (ask the pharmacy)</span><input
					type="number"
					step="1"
					bind:value={pPack}
				/></label
			>
			<label class="field"
				><span>Reorder floor (days)</span><input
					type="number"
					step="1"
					bind:value={pMinDays}
				/></label
			>
			<label class="field"
				><span>Units on hand</span><input type="number" step="1" bind:value={pStock} /></label
			>
		</div>
		<button class="primary" onclick={addProduct} disabled={!pBrand.trim()}>Add product</button>
		{#if productFormError}<p class="stale">{productFormError}</p>{/if}
		<p class="muted" style="margin-bottom:0">
			If you do not know the box size yet, put your best guess in. You can correct it here or from
			Stock once the pharmacy tells you, and it only affects how many boxes an order asks for.
		</p>
	</details>
</div>

<div class="card">
	<h3>Therapies</h3>
	{#if $regimen && $regimen.therapies.length > 0}
		{#each $regimen.therapies as therapy (therapy.id)}
			{@const usage = therapyUsage($regimen, therapy.id, $today)}
			{@const versions = versionsFor($regimen, therapy.id)}
			<div class="line">
				<div class="row" style="justify-content: space-between">
					<div>
						<strong class:retired={therapy.stoppedOn}>{therapy.name}</strong>
						<div class="muted">
							{therapy.category}
							{#if therapy.isPrn}&middot; as needed{/if}
							{#if versions.length > 0}
								&middot; {versions.length} dose {versions.length === 1 ? 'version' : 'versions'}
							{/if}
						</div>
					</div>
					<div class="row">
						{#if therapy.stoppedOn}<span class="badge">stopped {therapy.stoppedOn}</span>{/if}
						<button onclick={() => openTherapy(therapy, versions)}>
							{editingTherapy === therapy.id ? 'Close' : 'Edit'}
						</button>
					</div>
				</div>

				{#if editingTherapy === therapy.id}
					<div class="editor">
						<label class="field"><span>Name</span><input bind:value={tEditName} /></label>
						<div class="grid">
							<label class="field"><span>Category</span><input bind:value={tEditCategory} /></label>
							<label class="field">
								<span>Active ingredient (optional)</span>
								<input bind:value={tEditIngredient} placeholder="the morning dose" />
							</label>
							<label class="field">
								<span>Started on</span>
								<input type="date" bind:value={tEditStarted} />
							</label>
						</div>
						<label class="row" style="margin-bottom:0.625rem">
							<input type="checkbox" bind:checked={tEditPrn} style="width:auto;min-height:auto" />
							<span>As needed (no schedule)</span>
						</label>
						<button class="primary" onclick={() => saveTherapy(therapy.id)}>Save details</button>

						{#if versions.length > 0}
							<div class="lifecycle">
								<h3>Dose history</h3>
								{#each versions as version (version.id)}
									{@const check = checkDoseConsistency(version, $regimen.products)}
									{@const composed = composedDose($regimen.products, version.slots)}
									<div class="version">
										<div class="row" style="justify-content: space-between">
											<strong>
												{version.activeFrom} &rarr; {version.activeTo ?? 'now'}
											</strong>
											{#if composed.unit}
												<span class="badge">
													{formatNumber(composed.perDay)}
													{composed.unit}/day
												</span>
											{/if}
										</div>
										{#each version.slots as slot (slot.time)}
											<div class="muted">
												{slot.time}:
												{slot.items.map((i) => describeItem($regimen, i)).join(' + ')}
											</div>
										{/each}
										{#if !check.ok}
											<p class="stale">
												Recorded as {check.declared}
												{check.unit} prescribed, but the products listed add up to {check.composed}
												{check.unit}. Worth checking against your prescription.
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						{#if !therapy.isPrn}
							<div class="lifecycle">
								<h3>Change the dose</h3>
								<p class="muted">
									Enter what you will actually take. The total is worked out from that, never the
									other way round, because only your prescriber can decide how a dose should be made
									up.
								</p>

								<label class="field">
									<span>First day of the new dose</span>
									<input type="date" bind:value={dFrom} />
								</label>

								{#each dSlots as slot, slotIndex (slotIndex)}
									<div class="slot">
										<div class="row" style="justify-content: space-between">
											<label class="field" style="margin:0; flex:1">
												<span>Time</span>
												<input type="time" bind:value={slot.time} />
											</label>
											<button onclick={() => removeSlot(slotIndex)} disabled={dSlots.length === 1}>
												Remove time
											</button>
										</div>

										{#each slot.items as item, itemIndex (itemIndex)}
											<div class="row">
												<label class="field" style="margin:0; flex:2">
													<span>Product</span>
													<select bind:value={item.productId}>
														{#each $regimen.products as product (product.id)}
															<option value={product.id}>
																{product.brandName}
																{product.strengthUnit === 'cp'
																	? ''
																	: `${product.strength} ${product.strengthUnit}`}
																{product.retired ? '(retired)' : ''}
															</option>
														{/each}
													</select>
												</label>
												<label class="field" style="margin:0; flex:1">
													<span>Pills</span>
													<input type="number" step="0.5" min="0" bind:value={item.units} />
												</label>
												<button
													onclick={() => removeItem(slotIndex, itemIndex)}
													disabled={slot.items.length === 1}
													aria-label="Remove this product">&times;</button
												>
											</div>
										{/each}

										<button onclick={() => addItem(slotIndex)}>Add a product here</button>
									</div>
								{/each}

								<button onclick={addSlot}>Add another time</button>

								<div class="grid" style="margin-top:0.875rem">
									<label class="field">
										<span>What the doctor said (optional)</span>
										<input type="number" step="0.5" min="0" bind:value={dDeclared} />
									</label>
									<label class="field">
										<span>Unit</span>
										<select bind:value={dDeclaredUnit}>
											<option value="mg">mg</option>
											<option value="g">g</option>
										</select>
									</label>
								</div>

								{#if draftTotal.unit}
									<p
										class:stale={declaredMismatch}
										class:agrees={!declaredMismatch && dDeclared !== ''}
									>
										What you entered comes to
										<strong>{formatNumber(draftTotal.perDay)} {draftTotal.unit} a day</strong>
										{#if dSlots.length > 1}
											({draftTotal.perSlot.map((v) => formatNumber(v)).join(' + ')})
										{/if}
										{#if declaredMismatch}
											, which does not match the {dDeclared} {dDeclaredUnit} you recorded.
										{/if}
									</p>
								{/if}

								{#if draftRetired.length > 0}
									<p class="stale">
										{draftRetired.map((p) => p.brandName).join(', ')} is retired. Saving this brings it
										back into use, so it will be scheduled and ordered again.
									</p>
								{/if}

								<button class="primary" onclick={() => saveDose(therapy.id)}>
									Save the new dose
								</button>
								{#if doseError}<p class="stale">{doseError}</p>{/if}
								<p class="muted">
									The dose you are on now stays in your history, ending the day before this one
									starts. Your calendar reminders will need exporting again afterwards.
								</p>
							</div>
						{/if}

						<div class="lifecycle">
							{#if therapy.stoppedOn}
								<button onclick={() => setTherapyStopped(therapy.id, undefined)}>
									Start taking this again
								</button>
							{:else}
								<button onclick={() => setTherapyStopped(therapy.id, $today)}>
									Stop taking this
								</button>
								<p class="muted">
									Stopping ends consumption from today and keeps every dose you have recorded, so
									what you took and when stays answerable.
								</p>
							{/if}

							{#if usage.canDelete}
								<button class="danger" onclick={() => removeTherapy(therapy.id)}>
									Delete permanently
								</button>
							{:else}
								<p class="muted">
									This cannot be deleted: it has been in use since {therapy.startedOn}, and its
									{usage.doseVersions} recorded {usage.doseVersions === 1 ? 'dose' : 'doses'} are the
									record of what you took. Stop it instead.
								</p>
							{/if}
							{#if therapyError}<p class="stale">{therapyError}</p>{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<p class="muted">None yet.</p>
	{/if}

	<details>
		<summary>Add a therapy</summary>
		<label class="field"><span>Name</span><input bind:value={tName} /></label>
		<label class="field"><span>Category</span><input bind:value={tCategory} /></label>
		<label class="row" style="margin-bottom:0.625rem">
			<input type="checkbox" bind:checked={tPrn} style="width:auto;min-height:auto" />
			<span>As needed (no schedule)</span>
		</label>

		{#if !tPrn}
			<label class="field">
				<span>Times, comma separated</span>
				<input bind:value={tTimes} placeholder={defaultTimes.join(', ')} />
			</label>

			<p class="muted">
				What to take at each of those times. A dose can combine products: 14 mg of the morning dose
				is 3 × 4 mg plus 1 × 2 mg.
			</p>

			{#each tItems as item, index (index)}
				<div class="grid">
					<label class="field">
						<span>Product</span>
						<select bind:value={item.productId}>
							{#each $regimen?.products ?? [] as product (product.id)}
								<option value={product.id}>
									{product.brandName}
									{product.strength}{product.strengthUnit}
								</option>
							{/each}
						</select>
					</label>
					<label class="field">
						<span>Pills per time</span>
						<input type="number" step="0.5" min="0" bind:value={item.units} />
					</label>
				</div>
			{/each}

			<button
				onclick={() =>
					(tItems = [...tItems, { productId: $regimen?.products[0]?.id ?? '', units: 1 }])}
			>
				Add a product to this dose
			</button>
			<p class="muted">
				The same combination is used at every time listed. For different morning and evening doses,
				add it here and then use <strong>Change the dose</strong> above, which edits each time separately.
			</p>
		{/if}

		<button class="primary" onclick={addTherapy}>Add therapy</button>
		{#if therapyFormError}<p class="stale">{therapyFormError}</p>{/if}
	</details>
</div>

<div class="card">
	<h3>Your data</h3>
	<p class="muted">
		Everything is stored on this device. Clearing your browser data will delete it, so keep a
		backup.
	</p>
	<div class="row">
		<button onclick={doExport}>Export backup (JSON)</button>
		<label class="import">
			<span>Import backup</span>
			<input type="file" accept="application/json" onchange={doImport} />
		</label>
	</div>
	{#if exportError}
		<p class="stale">{exportError}</p>
	{/if}
	{#if importError}
		<p class="stale">{importError}</p>
	{/if}
	{#if importWarnings.length > 0}
		<div class="stale">
			<strong
				>Restored, with {importWarnings.length} problem{importWarnings.length === 1
					? ''
					: 's'}:</strong
			>
			<ul>
				{#each importWarnings as warning, index (index)}
					<li>{warning}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<div class="card">
	<h3>Danger</h3>
	<button class="danger" onclick={deleteEverything} disabled={deleteState === 'working'}>
		{deleteState === 'working' ? 'Deleting…' : 'Delete all data'}
	</button>
	{#if deleteState === 'done'}
		<p role="status">Everything on this device has been deleted.</p>
	{/if}
	{#if deleteError}
		<p class="stale">{deleteError}</p>
	{/if}
</div>

<style>
	.line + .line {
		border-top: 1px solid var(--line);
		margin-top: 0.625rem;
		padding-top: 0.625rem;
	}

	.retired {
		text-decoration: line-through;
		color: var(--ink-soft);
	}

	.editor {
		margin-top: 0.75rem;
		padding-left: 0.75rem;
		border-left: 3px solid var(--accent-soft);
	}

	.lifecycle {
		border-top: 1px solid var(--line);
		margin-top: 0.875rem;
		padding-top: 0.75rem;
	}

	.version + .version {
		margin-top: 0.5rem;
	}

	.version {
		padding: 0.5rem;
		background: var(--bg);
		border-radius: var(--radius);
	}

	.slot {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.625rem;
		margin-bottom: 0.625rem;
	}

	.agrees {
		background: var(--accent-soft);
		color: var(--accent);
		border-radius: var(--radius);
		padding: 0.625rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 0 0.625rem;
	}

	details {
		border-top: 1px solid var(--line);
		padding-top: 0.625rem;
	}

	summary {
		cursor: pointer;
		color: var(--accent);
		min-height: var(--tap);
		display: flex;
		align-items: center;
	}

	.stale {
		background: var(--warn-soft);
		color: var(--warn);
		border-radius: var(--radius);
		padding: 0.625rem;
	}

	.import {
		display: inline-flex;
		flex-direction: column;
	}

	.import span {
		font-size: 0.8125rem;
		color: var(--ink-soft);
	}
</style>
