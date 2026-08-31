# Icons

Three SVG sources; everything else here is generated.

| File                | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `mark.svg`          | The mark alone, green on transparent. Used directly in the header.   |
| `icon.svg`          | Full-bleed tile. Source for the `any` icons and the favicon.         |
| `icon-maskable.svg` | Same mark, scaled in. Source for the `maskable` icons.               |

All three share the same path coordinates. Change one, change all three.

There is a fourth source outside this directory: `static/lockup.svg`, the mark and the name
as one asset. See "The lockup" below.

Regenerate with:

```sh
npm run icons        # every raster here, the launch images, the social card, the lockup
                     # rasters, and static/favicon.ico
npm run lockup       # static/lockup.svg and lockup-inverse.svg, only if the name or mark changes
npm run screenshots  # static/screenshots/*, from the running app — needs a build first,
                     # and a rebuild afterwards so they reach build/
```

`favicon.ico` is packed by hand as three embedded PNGs (16, 32, 48). Browsers request
`/favicon.ico` unconditionally, whatever `<link rel="icon">` says, so without it every visit
logs a 404.

`static/screenshots/` feeds the install prompt. Chrome shows a fuller dialogue when the
manifest carries screenshots and warns in DevTools when it does not: it wants one with
`form_factor: "wide"` for desktop and one narrow for mobile. They are captured from the real
built app using the **example regimen**, whose product names are invented, because a
screenshot of a real regimen would publish somebody's medication inside an install prompt.

That rewrites every PNG here plus `static/og-image.png`, rendering through the Chromium
Playwright already installs. Edit the SVGs, never the PNGs.

## The mark

A stem that carries on, with new growth joining it from the side. What it means and why it
beat the alternatives is in [`DESIGN.md`](../../DESIGN.md); what matters here is that it must
stay one shape with thick strokes, no text and no fine detail, legible at 32 px and inside a
circular crop.

## The lockup

`static/lockup.svg` and `lockup-inverse.svg` hold the mark and the name together, with the
spacing fixed in the file. The header uses it, the social card is built from it, and
`lockup-inverse-624.png` exists for print. That is deliberate: composed from two elements —
an SVG next to a text node — the gap would depend on the reader's font metrics and the
wordmark on whatever font they happened to have, so the header, a flyer and a link preview
would each look slightly different.

The name inside those files is **outlined into paths**, not set as `<text>`. So no font is
downloaded, none is shipped, and the file renders identically anywhere an SVG opens,
including a print shop's layout tool.

The outlines came from **Lato Bold**, licensed under the SIL Open Font License 1.1. They were
produced once and committed to `scripts/wordmark.json`; neither the font nor the tool that
read it is a dependency of this project. Two things are worth knowing if the wordmark is ever
regenerated: `opentype.js` silently ignores its `letterSpacing` option and stacks every glyph
at x=0, and its `toPathData()` emitted a `NaN` coordinate for one control point of the `r` —
a single bad number that invalidates the whole path, so browsers drop it without a word.
`scripts/build-lockup.mjs` serialises the commands itself and rejects any non-finite value
for that reason.

## What else is generated

`splash/` holds the iOS launch images, one per device size and orientation. Safari ignores
the manifest's `background_color` when launching from the home screen, so without these there
is a white flash on every cold start. There is no scaling and no fallback — each device needs
its exact pixel size and its own media query — which is why the device list lives in
`scripts/generate-icons.mjs` and the `<link>` tags in `src/app.html` are rewritten from it
between the `ios-splash` markers. Edit the list, never the tags.

`static/lockup.png` and `lockup-inverse.png` are the mark beside the name, for places that
cannot style CSS: the GitHub README, printed handouts. In the app itself the header uses
`mark.svg` with the name as real text instead, so the type stays crisp and translatable.

The launch images, the lockups and the social card are all excluded from the service worker
precache in `vite.config.ts`. Nothing in the app displays them, and precaching two dozen
launch images would inflate every install for no offline benefit.

## Still missing

Nothing outstanding.
