/**
 * Generate every raster icon and the social card from the SVG sources.
 *
 * Run with `npm run icons`.
 *
 * Why a script rather than instructions in a README: the previous instructions used
 * `sharp-cli` with the output directory set to the source directory, which overwrites the
 * input with its own output. That is how `mark.svg` came to be a 192 px PNG named `.svg` —
 * after which every icon was upscaled from that, and the documented way to regenerate them
 * would have produced garbage. A script that reads the sources and writes only to derived
 * filenames cannot do that to you.
 *
 * Rendering goes through the Chromium that Playwright already installs, so there is no new
 * dependency and the output matches what a browser will actually draw.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const icons = join(root, 'static', 'icons');

const read = (name) => readFileSync(join(icons, name), 'utf8');

/** Raster targets. `maskable` uses its own artwork, never a copy of the `any` tile. */
const RASTERS = [
	{ source: 'icon.svg', out: 'icon-192.png', size: 192 },
	{ source: 'icon.svg', out: 'icon-512.png', size: 512 },
	{ source: 'icon-maskable.svg', out: 'icon-192-maskable.png', size: 192 },
	{ source: 'icon-maskable.svg', out: 'icon-512-maskable.png', size: 512 },
	// iOS ignores the manifest and uses this one. It is also never masked, so it takes the
	// full-bleed artwork rather than the padded version.
	{ source: 'icon.svg', out: 'apple-touch-icon.png', size: 180 }
];

const browser = await chromium.launch();

for (const { source, out, size } of RASTERS) {
	const page = await browser.newPage({ viewport: { width: size, height: size } });
	await page.setContent(
		`<style>html,body{margin:0;padding:0}svg{width:${size}px;height:${size}px;display:block}</style>` +
			read(source)
	);
	await page.screenshot({ path: join(icons, out), omitBackground: true });
	await page.close();
	console.log(`${out}  ${size}x${size}`);
}

/*
 * The social card. Text belongs here and nowhere else in the icon set: this is a fixed-size
 * raster that is never scaled down, so a wordmark stays legible. Rendered rather than drawn
 * so the type is the real font at the real size.
 */
const lockupInverse = readFileSync(join(root, 'static', 'lockup-inverse.svg'), 'utf8');

const card = `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; display: flex; align-items: center; justify-content: center;
    box-sizing: border-box; background: #1f6f4a; color: #fff;
    font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .stack { display: flex; flex-direction: column; align-items: center; gap: 44px; }
  /* The lockup asset itself, so the card cannot drift from the header or the print files. */
  .lock svg { height: 168px; width: auto; display: block; }
  p { font-size: 38px; line-height: 1.3; margin: 0; opacity: 0.92; text-align: center; }
</style>
<div class="stack">
  <div class="lock">${lockupInverse}</div>
  <p>Medication and refill tracking for transplant recipients</p>
</div>`;

const cardPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await cardPage.setContent(card);
await cardPage.screenshot({ path: join(root, 'static', 'og-image.png') });
await cardPage.close();
console.log('og-image.png  1200x630');

/*
 * iOS launch images.
 *
 * Safari ignores the manifest's `background_color` when launching from the home screen, so
 * without these there is a white flash on every cold start — jarring on a dark phone, and
 * the first thing anyone notices about an installed app.
 *
 * Every device needs its own exact pixel size and its own media query; there is no scaling
 * and no fallback. That is why this list exists and why the markup is generated from it
 * rather than typed: the images and the `<link>` tags cannot be allowed to disagree.
 *
 * Each device declares which orientations it can launch in, and that is the interesting
 * decision here.
 *
 * An iPhone launches a home-screen web app in **portrait**, whatever way the phone is being
 * held — iOS does not honour a landscape launch there. So an iPhone landscape media query can
 * never match at the moment a launch image is chosen, and its image is never drawn. Those tags
 * were pure weight: eight of them in every prerendered shell, and because HTML is served
 * `no-transform` to stop Cloudflare injecting a script (see `static/_headers` and
 * `DECISIONS.md`) nothing compresses them, so the full cost is paid on the wire.
 *
 * iPads do launch in either orientation, and keep both.
 *
 * Every device *size* stays. The audience skews older, so an iPhone X or an SE is a phone
 * somebody is using today rather than a legacy size worth dropping — the saving here comes
 * from removing tags that cannot fire, not from narrowing which devices are covered.
 */
const BOTH = ['portrait', 'landscape'];
const PORTRAIT_ONLY = ['portrait'];

const DEVICES = [
	[1024, 1366, 2, 'ipad-pro-12', BOTH],
	[834, 1194, 2, 'ipad-pro-11', BOTH],
	[820, 1180, 2, 'ipad-air', BOTH],
	[768, 1024, 2, 'ipad', BOTH],
	[440, 956, 3, 'iphone-16-pro-max', PORTRAIT_ONLY],
	[430, 932, 3, 'iphone-15-pro-max', PORTRAIT_ONLY],
	[428, 926, 3, 'iphone-14-plus', PORTRAIT_ONLY],
	[402, 874, 3, 'iphone-16-pro', PORTRAIT_ONLY],
	[393, 852, 3, 'iphone-15', PORTRAIT_ONLY],
	[390, 844, 3, 'iphone-14', PORTRAIT_ONLY],
	[375, 812, 3, 'iphone-x', PORTRAIT_ONLY],
	[375, 667, 2, 'iphone-se', PORTRAIT_ONLY]
];

const splashDir = join(icons, 'splash');
mkdirSync(splashDir, { recursive: true });

const splashPage = (w, h) => {
	const unit = Math.min(w, h);
	return `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: ${w}px; height: ${h}px; background: #1f6f4a; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: ${Math.round(unit * 0.05)}px;
    font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .lock svg { height: ${Math.round(unit * 0.19)}px; width: auto; display: block; }
</style>
<div class="lock">${lockupInverse}</div>`;
};

const links = [];
for (const [cw, ch, dpr, label, orientations] of DEVICES) {
	for (const orientation of orientations) {
		const [w, h] = orientation === 'portrait' ? [cw, ch] : [ch, cw];
		const file = `splash-${label}-${orientation}.png`;
		const page = await browser.newPage({
			viewport: { width: w, height: h },
			deviceScaleFactor: dpr
		});
		await page.setContent(splashPage(w, h));
		await page.screenshot({ path: join(splashDir, file) });
		await page.close();
		links.push(
			`\t\t<link\n` +
				`\t\t\trel="apple-touch-startup-image"\n` +
				`\t\t\thref="/icons/splash/${file}"\n` +
				`\t\t\tmedia="(device-width: ${cw}px) and (device-height: ${ch}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: ${orientation})"\n` +
				`\t\t/>`
		);
	}
}
/*
 * This writes; it never deletes. Narrowing the list above leaves the old PNGs in place, where
 * they ship as unreferenced payload — so remove them by hand in the same change.
 */
console.log(`${links.length} splash images`);

/*
 * Rewrite the launch-image markup in place, between markers, so the list above stays the
 * only place a device is added or removed.
 */
const shell = join(root, 'src', 'app.html');
const html = readFileSync(shell, 'utf8');
const start = '<!-- ios-splash:start -->';
const end = '<!-- ios-splash:end -->';
if (!html.includes(start)) throw new Error(`${shell} is missing the ${start} marker`);
writeFileSync(
	shell,
	html.slice(0, html.indexOf(start) + start.length) +
		'\n' +
		links.join('\n') +
		'\n\t\t' +
		html.slice(html.indexOf(end))
);

/* Rasters of the lockup: the header's <img> fallback, plus a large one for print. */
for (const [source, out, height] of [
	['lockup.svg', 'lockup-52.png', 52],
	['lockup.svg', 'lockup-104.png', 104],
	['lockup-inverse.svg', 'lockup-inverse-624.png', 624]
]) {
	const svg = readFileSync(join(root, 'static', source), 'utf8');
	const width = Math.round(height * (853 / 228.3));
	const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
	await page.setContent(
		`<style>html,body{margin:0;padding:0}svg{height:${height}px;width:${width}px;display:block}</style>${svg}`
	);
	await page.screenshot({ path: join(root, 'static', out), omitBackground: true });
	await page.close();
	console.log(`${out}  ${width}x${height}`);
}

/*
 * favicon.ico, packed by hand.
 *
 * Browsers request /favicon.ico unconditionally, before and regardless of any <link rel="icon">
 * in the document — so without this file every visit logs a 404. It is also what shows up in
 * bookmark lists, history entries and some feed readers that ignore the SVG.
 *
 * ICO has allowed embedded PNGs since Vista, which every browser this app supports understands,
 * so this is a container around the same rasters rather than the old BMP encoding.
 */
async function renderPng(source, size) {
	const page = await browser.newPage({ viewport: { width: size, height: size } });
	await page.setContent(
		`<style>html,body{margin:0;padding:0}svg{width:${size}px;height:${size}px;display:block}</style>` +
			read(source)
	);
	const buffer = await page.screenshot({ omitBackground: true });
	await page.close();
	return buffer;
}

function packIco(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // 1 = icon
	header.writeUInt16LE(images.length, 4);

	let offset = 6 + images.length * 16;
	const entries = [];
	for (const { size, buffer } of images) {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
		entry.writeUInt8(size >= 256 ? 0 : size, 1);
		entry.writeUInt8(0, 2); // palette size
		entry.writeUInt8(0, 3); // reserved
		entry.writeUInt16LE(1, 4); // colour planes
		entry.writeUInt16LE(32, 6); // bits per pixel
		entry.writeUInt32LE(buffer.length, 8);
		entry.writeUInt32LE(offset, 12);
		entries.push(entry);
		offset += buffer.length;
	}

	return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
	icoImages.push({ size, buffer: await renderPng('icon.svg', size) });
}
writeFileSync(join(root, 'static', 'favicon.ico'), packIco(icoImages));
console.log(`favicon.ico  ${icoSizes.join(', ')}px`);

await browser.close();
