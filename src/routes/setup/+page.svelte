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
	import { browserLocale, locale, LOCALES } from '$lib/locale';
	import { t } from '$lib/i18n';
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
			productError = $t.setup.errorProductFields;
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
		if (!confirm($t.setup.confirmDeleteProduct)) return;
		try {
			await deleteProduct(productId);
			editing = null;
			productError = '';
		} catch (error) {
			// The thrown text comes from the data layer and is English wherever it surfaces.
			// Translating it means giving those errors codes, which is a change to the layer
			// below rather than to this screen.
			productError = error instanceof Error ? error.message : $t.setup.errorCouldNotDelete;
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
			doseTimesError = $t.setup.errorNotATime(invalid.join(', '));
			return;
		}
		if (times.length === 0) {
			doseTimesError = $t.setup.errorNoTime;
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
			doseError = $t.setup.errorBadStartDate;
			return;
		}

		const slots: Array<{ time: string; items: Array<{ productId: string; units: number }> }> = [];
		for (const slot of dSlots) {
			const time = normaliseTime(slot.time);
			if (time === null) {
				doseError = $t.setup.errorSlotTime(slot.time);
				return;
			}

			const items = [];
			for (const item of slot.items) {
				const units = normaliseNumber(item.units, LIMITS.units);
				if (units === null) {
					doseError = $t.setup.errorUnits;
					return;
				}
				if (!item.productId) {
					doseError = $t.setup.errorChooseProduct;
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
			doseError = error instanceof Error ? error.message : $t.setup.errorSaveDose;
		}
	}

	async function removeTherapy(therapyId: string) {
		if (!confirm($t.setup.confirmDeleteTherapy)) return;
		try {
			await deleteTherapy(therapyId, $today);
			editingTherapy = null;
			therapyError = '';
		} catch (error) {
			therapyError = error instanceof Error ? error.message : $t.setup.errorCouldNotDelete;
		}
	}

	let importError = $state('');

	let settingsError = $state('');

	async function saveSettingsForm() {
		const date = transplantDate === '' ? '' : normaliseDate(transplantDate);
		if (date === null) {
			settingsError = $t.setup.errorBadDate;
			return;
		}

		const days = normaliseNumber(horizon, LIMITS.horizonDays);
		if (days === null) {
			settingsError = $t.setup.errorHorizon;
			return;
		}

		settingsError = '';
		await saveSettings({ transplantDate: date, targetHorizonDays: days });
	}

	let productFormError = $state('');

	async function addProduct() {
		if (!pBrand.trim()) {
			productFormError = $t.setup.errorProductName;
			return;
		}

		// A box size of zero would make order rounding divide by zero and ask for an
		// infinite number of boxes. A guess is fine — Stock lets you correct it later.
		const pack = normaliseNumber(pPack, LIMITS.packageSize);
		const strength = normaliseNumber(pStrength, LIMITS.strength);
		const floor = normaliseNumber(pMinDays, LIMITS.minDays);
		const stock = normaliseNumber(pStock === 0 ? '0' : pStock, LIMITS.stockUnits);

		if (strength === null) {
			productFormError = $t.setup.errorStrength;
			return;
		}
		if (pack === null) {
			productFormError = $t.common.errorPackageSize;
			return;
		}
		if (floor === null) {
			productFormError = $t.setup.errorMinDays;
			return;
		}
		if (stock === null) {
			productFormError = $t.setup.errorStockNegative;
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
			therapyFormError = $t.setup.errorTherapyName;
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
				therapyFormError = $t.setup.errorTimes;
				return;
			}
			times = parsed.times;

			for (const item of tItems) {
				const units = normaliseNumber(item.units, LIMITS.units);
				if (!item.productId || units === null) {
					therapyFormError = $t.setup.errorProductQuantity;
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
			exportError = $t.setup.errorNothingToExport;
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
		if (!confirm($t.setup.confirmDeleteAll)) return;
		deleteState = 'working';
		deleteError = '';
		try {
			await clearAll();
			deleteState = 'done';
		} catch (error) {
			deleteState = 'idle';
			deleteError = error instanceof Error ? error.message : $t.setup.errorDeleteFailed;
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
		if (!confirm($t.setup.confirmImport)) {
			input.value = '';
			return;
		}

		try {
			// Anything the backup could not supply is reported rather than swallowed: a
			// restore that quietly drops half a regimen is worse than one that refuses.
			// The warnings themselves come from the domain's validator and are English.
			importWarnings = await importJson(await file.text());
			importError = '';
		} catch (error) {
			importWarnings = [];
			importError = error instanceof Error ? error.message : $t.setup.errorImportFailed;
		} finally {
			input.value = '';
		}
	}
</script>

<svelte:head>
	<title>{$t.setup.title} · Graftful</title>
	<meta name="description" content={$t.setup.metaDescription} />
</svelte:head>

<h2>{$t.setup.title}</h2>

<div class="card">
	<h3>{$t.setup.remindersTitle}</h3>
	{#if icsNeverExported}
		<p class="muted">
			{$t.setup.icsNever}
		</p>
	{:else if icsStale}
		<p class="stale" role="alert">
			<strong>{$t.setup.icsStaleTitle}</strong>
			{$t.setup.icsStaleBody}
		</p>
	{:else}
		<p class="muted">{$t.setup.icsCurrent}</p>
	{/if}
	<button class="primary" onclick={exportIcs}>{$t.setup.exportIcs}</button>
	<p class="muted" style="margin-bottom:0">
		{$t.setup.icsNote}
	</p>
</div>

<div class="card">
	<h3>{$t.setup.languageTitle}</h3>
	<label class="field">
		<span>{$t.setup.languageLabel}</span>
		<select
			value={$settingsStore?.locale ?? ''}
			onchange={(event) =>
				saveSettings({
					locale: (event.currentTarget.value || undefined) as Locale | undefined
				})}
		>
			<option value="">
				{$t.setup.followBrowser(
					LOCALES.find((option) => option.value === browserLocale())?.label ?? 'English'
				)}
			</option>
			{#each LOCALES as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</label>
	<p class="muted" style="margin-bottom:0">
		{$t.setup.languageNote}
	</p>
</div>

<div class="card">
	<h3>{$t.setup.timesTitle}</h3>
	<label class="field">
		<span>{$t.setup.timesLabel}</span>
		<input bind:value={doseTimesDraft} placeholder="08:00, 20:00" />
	</label>
	<button onclick={saveDoseTimes}>{$t.setup.saveTimes}</button>
	{#if doseTimesError}<p class="stale">{doseTimesError}</p>{/if}
	<p class="muted" style="margin-bottom:0">
		{$t.setup.timesNote}
	</p>
</div>

<div class="card">
	<h3>{$t.setup.detailsTitle}</h3>
	<label class="field">
		<span>{$t.setup.transplantDate}</span>
		<input type="date" bind:value={transplantDate} />
	</label>
	<label class="field">
		<span>{$t.setup.horizonLabel}</span>
		<input type="number" min="7" step="1" bind:value={horizon} />
	</label>
	<button onclick={saveSettingsForm}>{$t.common.save}</button>
	{#if settingsError}<p class="stale">{settingsError}</p>{/if}
</div>

<div class="card">
	<h3>{$t.setup.productsTitle}</h3>
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
							{$t.stock.perBox(product.packageSize)} &middot; {$t.setup.reorderAt(product.minDays)}
							{#if product.form}&middot; {product.form}{/if}
						</div>
					</div>
					<div class="row">
						{#if product.retired}<span class="badge">{$t.setup.retired}</span>{/if}
						<button onclick={() => openEditor(product)}>
							{editing === product.id ? $t.common.close : $t.common.edit}
						</button>
					</div>
				</div>

				{#if editing === product.id}
					<div class="editor">
						<label class="field"
							><span>{$t.setup.brandName}</span><input bind:value={eBrand} /></label
						>
						<div class="grid">
							<label class="field">
								<span>{$t.setup.strength}</span>
								<input type="number" step="0.5" bind:value={eStrength} />
							</label>
							<label class="field">
								<span>{$t.setup.unit}</span>
								<select bind:value={eUnit}>
									<option value="mg">mg</option>
									<option value="g">g</option>
									<option value="cp">{$t.setup.unitWholePill}</option>
								</select>
							</label>
							<label class="field">
								<span>{$t.setup.unitsPerBox}</span>
								<input type="number" min="1" step="1" bind:value={ePack} />
							</label>
							<label class="field">
								<span>{$t.setup.reorderFloor}</span>
								<input type="number" min="0" step="1" bind:value={eMinDays} />
							</label>
							<label class="field">
								<span>{$t.setup.form}</span>
								<input bind:value={eForm} placeholder={$t.setup.formPlaceholder} />
							</label>
						</div>
						<div class="row">
							<button class="primary" onclick={() => saveProduct(product.id)}>
								{$t.setup.saveChanges}
							</button>
						</div>

						<div class="lifecycle">
							{#if product.retired}
								<button onclick={() => setProductRetired(product.id, false)}>
									{$t.setup.restoreProduct}
								</button>
								<p class="muted">
									{$t.setup.restoreProductNote}
								</p>
							{:else}
								<button onclick={() => setProductRetired(product.id, true)}>
									{$t.setup.retire}
								</button>
								<p class="muted">
									{$t.setup.retireNote}
								</p>
							{/if}

							{#if usage.canDelete}
								<button class="danger" onclick={() => removeProduct(product.id)}>
									{$t.setup.deletePermanently}
								</button>
								<p class="muted">
									{$t.setup.deleteProductNote}
								</p>
							{:else}
								<p class="muted">
									{$t.setup.cannotDeleteProduct(
										usage.doseVersions,
										usage.stockEvents,
										usage.orderLines
									)}
								</p>
							{/if}
							{#if productError}<p class="stale">{productError}</p>{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<p class="muted">{$t.common.none}</p>
	{/if}

	<details>
		<summary>{$t.setup.addProduct}</summary>
		<label class="field"><span>{$t.setup.brandName}</span><input bind:value={pBrand} /></label>
		<div class="grid">
			<label class="field"
				><span>{$t.setup.strength}</span><input
					type="number"
					step="0.5"
					bind:value={pStrength}
				/></label
			>
			<label class="field">
				<span>{$t.setup.unit}</span>
				<select bind:value={pUnit}>
					<option value="mg">mg</option>
					<option value="g">g</option>
					<option value="cp">{$t.setup.unitWholePill}</option>
				</select>
			</label>
			<label class="field"
				><span>{$t.setup.unitsPerBoxAsk}</span><input
					type="number"
					step="1"
					bind:value={pPack}
				/></label
			>
			<label class="field"
				><span>{$t.setup.reorderFloor}</span><input
					type="number"
					step="1"
					bind:value={pMinDays}
				/></label
			>
			<label class="field"
				><span>{$t.setup.unitsOnHand}</span><input
					type="number"
					step="1"
					bind:value={pStock}
				/></label
			>
		</div>
		<button class="primary" onclick={addProduct} disabled={!pBrand.trim()}>
			{$t.setup.addProductButton}
		</button>
		{#if productFormError}<p class="stale">{productFormError}</p>{/if}
		<p class="muted" style="margin-bottom:0">
			{$t.setup.addProductNote}
		</p>
	</details>
</div>

<div class="card">
	<h3>{$t.setup.therapiesTitle}</h3>
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
							{#if therapy.isPrn}&middot; {$t.setup.asNeededInline}{/if}
							{#if versions.length > 0}
								&middot; {$t.setup.doseVersions(versions.length)}
							{/if}
						</div>
					</div>
					<div class="row">
						{#if therapy.stoppedOn}<span class="badge">
								{$t.setup.stoppedOn(therapy.stoppedOn)}
							</span>{/if}
						<button onclick={() => openTherapy(therapy, versions)}>
							{editingTherapy === therapy.id ? $t.common.close : $t.common.edit}
						</button>
					</div>
				</div>

				{#if editingTherapy === therapy.id}
					<div class="editor">
						<label class="field"><span>{$t.setup.name}</span><input bind:value={tEditName} /></label
						>
						<div class="grid">
							<label class="field"
								><span>{$t.setup.category}</span><input bind:value={tEditCategory} /></label
							>
							<label class="field">
								<span>{$t.setup.activeIngredient}</span>
								<input
									bind:value={tEditIngredient}
									placeholder={$t.setup.activeIngredientPlaceholder}
								/>
							</label>
							<label class="field">
								<span>{$t.setup.startedOn}</span>
								<input type="date" bind:value={tEditStarted} />
							</label>
						</div>
						<label class="row" style="margin-bottom:0.625rem">
							<input type="checkbox" bind:checked={tEditPrn} style="width:auto;min-height:auto" />
							<span>{$t.setup.asNeededCheckbox}</span>
						</label>
						<button class="primary" onclick={() => saveTherapy(therapy.id)}>
							{$t.setup.saveDetails}
						</button>

						{#if versions.length > 0}
							<div class="lifecycle">
								<h3>{$t.setup.doseHistoryTitle}</h3>
								{#each versions as version (version.id)}
									{@const check = checkDoseConsistency(version, $regimen.products)}
									{@const composed = composedDose($regimen.products, version.slots)}
									<div class="version">
										<div class="row" style="justify-content: space-between">
											<strong>
												{version.activeFrom} &rarr; {version.activeTo ?? $t.setup.now}
											</strong>
											{#if composed.unit}
												<span class="badge">
													{$t.setup.perDayUnit(formatNumber(composed.perDay), composed.unit)}
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
												{$t.setup.doseMismatch(
													String(check.declared),
													String(check.composed),
													String(check.unit)
												)}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						{#if !therapy.isPrn}
							<div class="lifecycle">
								<h3>{$t.setup.changeDoseTitle}</h3>
								<p class="muted">
									{$t.setup.changeDoseNote}
								</p>

								<label class="field">
									<span>{$t.setup.firstDayLabel}</span>
									<input type="date" bind:value={dFrom} />
								</label>

								{#each dSlots as slot, slotIndex (slotIndex)}
									<div class="slot">
										<div class="row" style="justify-content: space-between">
											<label class="field" style="margin:0; flex:1">
												<span>{$t.setup.time}</span>
												<input type="time" bind:value={slot.time} />
											</label>
											<button onclick={() => removeSlot(slotIndex)} disabled={dSlots.length === 1}>
												{$t.setup.removeTime}
											</button>
										</div>

										{#each slot.items as item, itemIndex (itemIndex)}
											<div class="row">
												<label class="field" style="margin:0; flex:2">
													<span>{$t.setup.product}</span>
													<select bind:value={item.productId}>
														{#each $regimen.products as product (product.id)}
															<option value={product.id}>
																{product.brandName}
																{product.strengthUnit === 'cp'
																	? ''
																	: `${product.strength} ${product.strengthUnit}`}
																{product.retired ? $t.setup.retiredParen : ''}
															</option>
														{/each}
													</select>
												</label>
												<label class="field" style="margin:0; flex:1">
													<span>{$t.setup.pills}</span>
													<input type="number" step="0.5" min="0" bind:value={item.units} />
												</label>
												<button
													onclick={() => removeItem(slotIndex, itemIndex)}
													disabled={slot.items.length === 1}
													aria-label={$t.setup.removeProduct}>&times;</button
												>
											</div>
										{/each}

										<button onclick={() => addItem(slotIndex)}>{$t.setup.addProductHere}</button>
									</div>
								{/each}

								<button onclick={addSlot}>{$t.setup.addAnotherTime}</button>

								<div class="grid" style="margin-top:0.875rem">
									<label class="field">
										<span>{$t.setup.declaredLabel}</span>
										<input type="number" step="0.5" min="0" bind:value={dDeclared} />
									</label>
									<label class="field">
										<span>{$t.setup.unit}</span>
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
										{$t.setup.entryComesTo}
										<strong>
											{$t.setup.perDayAmount(formatNumber(draftTotal.perDay), draftTotal.unit)}
										</strong>
										{#if dSlots.length > 1}
											({draftTotal.perSlot.map((v) => formatNumber(v)).join(' + ')})
										{/if}
										{#if declaredMismatch}
											{$t.setup.declaredMismatch(String(dDeclared), dDeclaredUnit)}
										{/if}
									</p>
								{/if}

								{#if draftRetired.length > 0}
									<p class="stale">
										{$t.setup.retiredWarning(
											draftRetired.map((p) => p.brandName).join(', '),
											draftRetired.length
										)}
									</p>
								{/if}

								<button class="primary" onclick={() => saveDose(therapy.id)}>
									{$t.setup.saveNewDose}
								</button>
								{#if doseError}<p class="stale">{doseError}</p>{/if}
								<p class="muted">
									{$t.setup.changeDoseFooter}
								</p>
							</div>
						{/if}

						<div class="lifecycle">
							{#if therapy.stoppedOn}
								<button onclick={() => setTherapyStopped(therapy.id, undefined)}>
									{$t.setup.resumeTherapy}
								</button>
							{:else}
								<button onclick={() => setTherapyStopped(therapy.id, $today)}>
									{$t.setup.stopTherapy}
								</button>
								<p class="muted">
									{$t.setup.stopTherapyNote}
								</p>
							{/if}

							{#if usage.canDelete}
								<button class="danger" onclick={() => removeTherapy(therapy.id)}>
									{$t.setup.deletePermanently}
								</button>
							{:else}
								<p class="muted">
									{$t.setup.cannotDeleteTherapy(therapy.startedOn, usage.doseVersions)}
								</p>
							{/if}
							{#if therapyError}<p class="stale">{therapyError}</p>{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<p class="muted">{$t.common.none}</p>
	{/if}

	<details>
		<summary>{$t.setup.addTherapy}</summary>
		<label class="field"><span>{$t.setup.name}</span><input bind:value={tName} /></label>
		<label class="field"><span>{$t.setup.category}</span><input bind:value={tCategory} /></label>
		<label class="row" style="margin-bottom:0.625rem">
			<input type="checkbox" bind:checked={tPrn} style="width:auto;min-height:auto" />
			<span>{$t.setup.asNeededCheckbox}</span>
		</label>

		{#if !tPrn}
			<label class="field">
				<span>{$t.setup.timesCommaLabel}</span>
				<input bind:value={tTimes} placeholder={defaultTimes.join(', ')} />
			</label>

			<p class="muted">
				{$t.setup.addTherapyDoseNote}
			</p>

			{#each tItems as item, index (index)}
				<div class="grid">
					<label class="field">
						<span>{$t.setup.product}</span>
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
						<span>{$t.setup.pillsPerTime}</span>
						<input type="number" step="0.5" min="0" bind:value={item.units} />
					</label>
				</div>
			{/each}

			<button
				onclick={() =>
					(tItems = [...tItems, { productId: $regimen?.products[0]?.id ?? '', units: 1 }])}
			>
				{$t.setup.addProductToDose}
			</button>
			<p class="muted">
				{$t.setup.sameCombinationNote($t.setup.changeDoseTitle)}
			</p>
		{/if}

		<button class="primary" onclick={addTherapy}>{$t.setup.addTherapyButton}</button>
		{#if therapyFormError}<p class="stale">{therapyFormError}</p>{/if}
	</details>
</div>

<div class="card">
	<h3>{$t.setup.dataTitle}</h3>
	<p class="muted">
		{$t.setup.dataNote}
	</p>
	<div class="row">
		<button onclick={doExport}>{$t.setup.exportBackup}</button>
		<label class="import">
			<span>{$t.setup.importBackup}</span>
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
			<strong>{$t.setup.restoredWithProblems(importWarnings.length)}</strong>
			<ul>
				{#each importWarnings as warning, index (index)}
					<li>{warning}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<div class="card">
	<h3>{$t.setup.dangerTitle}</h3>
	<button class="danger" onclick={deleteEverything} disabled={deleteState === 'working'}>
		{deleteState === 'working' ? $t.setup.deleting : $t.setup.deleteAll}
	</button>
	{#if deleteState === 'done'}
		<p role="status">{$t.setup.deleteDone}</p>
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
