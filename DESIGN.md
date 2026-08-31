# Design

What the mark means, why the pieces are the way they are, and the rules that keep them
consistent. The mechanical side — which file to edit, which command to run — is in
[`static/icons/README.md`](static/icons/README.md).

## The mark

Two strokes: a stem that carries on, and new growth joining it from the side.

**`graft` is a horticultural word before it is a surgical one.** That is the whole idea. It
says the name without a syringe, a cross, a pill or an organ in it, and it works for any
organ — this app is not a kidney app, and nothing in it should imply otherwise.

**The join is off-axis on purpose.** A graft is not put where the original was: a
transplanted kidney is placed in the front of the abdomen, not back where the originals sit.
A symmetrical fork would say _replaced in place_, which is not what happens. The asymmetry
says _joined somewhere new_, which is.

**It also reads as a raised hand making a V**, and that second reading is welcome rather
than accidental. Making peace with the graft — and with the pills that come with it — is
most of what living with one actually is.

### What it deliberately is not

- Not a kidney, or any organ silhouette. The app is organ-agnostic.
- Not a medical cross, caduceus, heartbeat line or pill capsule. This is not a clinical
  instrument and should not dress like one.
- Not a letter. An early candidate was a symmetrical fork that read as a plain **Y**, which
  says nothing.

### Why this one

Four candidates were drawn and judged at 192, 96, 48 and 32 px, and circle-cropped, because
small sizes decide it — an icon lives on a home screen, not on a presentation slide.

| Candidate            | Why it lost                                                       |
| -------------------- | ----------------------------------------------------------------- |
| Symmetrical fork     | Read as the letter Y; the union vanished into the strokes.        |
| Fork, lighter stroke | Union disappeared entirely below about 48 px.                     |
| Bound graft, outline | Three near-parallel edges merged into a blob when small.          |
| Bound graft, bar     | Read as a **strikethrough** — a poor thing to imply on a med app. |

The surviving form keeps its join legible at 32 px and reads as growth rather than a glyph.

### Constraints any future revision must keep

- One shape, thick strokes, no text, no fine detail.
- Legible at 32 px and inside a circular crop.
- No fill-only detail that disappears when the mark is a single flat colour.

## The lockup

`static/lockup.svg` holds the mark and the name **as one asset**, with the spacing fixed
inside the file.

That is not a convenience. Composed from two elements — an SVG next to a text node — the gap
between them depends on the reader's font metrics and the name renders in whatever font they
happen to have, so the header, a link preview and a printed flyer would each look slightly
different. One file removes the question.

**The name is outlined into paths, not set as `<text>`.** So no font is downloaded, none is
shipped, and the file renders identically anywhere an SVG opens — a browser, a print shop's
layout tool, a t-shirt printer. Set as text it would silently fall back to a substitute font,
which is exactly the incoherence a lockup exists to prevent.

### Rules

- **Minimum size.** Lockup: 22 px tall. Mark alone: 32 px. Below that the join stops reading.
- **Clear space.** Keep free space on all sides of at least half the mark's height. The small
  padding inside the SVG is optical breathing room, not clear space.
- **Do not rebuild it.** Never place the mark beside live text to recreate the lockup, and
  never retype the name in another font next to the mark.
- **Do not distort, rotate, recolour per-part, add effects,** or place it on a busy
  background. Two colourways exist; use one of them.
- **Two colourways only.** `lockup.svg` is `--accent` on light. `lockup-inverse.svg` is white
  on `--accent` or another dark ground.

## Colour

One accent, a warm off-white ground, and two states. Nothing decorative.

| Token           | Value     | Use                                    | Contrast          |
| --------------- | --------- | -------------------------------------- | ----------------- |
| `--accent`      | `#1f6f4a` | Mark, wordmark, primary actions, links | 5.91:1 on `--bg`  |
| `--accent-soft` | `#e6f2eb` | Selected and success backgrounds       | —                 |
| `--ink`         | `#1a1a1a` | Body text                              | 16.80:1 on `--bg` |
| `--ink-soft`    | `#5a5f5c` | Secondary text                         | 6.28:1 on `--bg`  |
| `--bg`          | `#fbfbf9` | Page ground                            | —                 |
| `--surface`     | `#ffffff` | Cards                                  | —                 |
| `--line`        | `#e2e4e1` | Borders and separators                 | —                 |
| `--warn`        | `#8a5a00` | Running low                            | 5.38:1 on soft    |
| `--alert`       | `#a32020` | Order now, and validation errors       | 6.60:1 on soft    |

Every text pair clears WCAG AA for normal text with room to spare. That is a floor, not a
target: this app is used by people who take medication that affects their eyes, in bathroom
light, at half past six in the morning.

**Green, not blue or white-coat.** Green belongs to the horticultural reading of the name and
reads as growing rather than clinical. It is also not the colour of any hospital system this
app might sit beside, which keeps it clear that Graftful is not one.

**Status is never colour alone.** "Running low" and "order now" always carry words as well.
Colour-blindness is common, and so is a phone in bright sunlight.

## Typography

**The interface uses the system font**: `system-ui, -apple-system, 'Segoe UI', sans-serif`.
No webfont is downloaded. That means nothing to wait for, no invisible or shifting text on a
slow connection, and type that already matches the phone it is on. For an app whose first
screen is what to take this morning, a font that arrives late is a worse trade than a font
that is bespoke.

**The wordmark is Lato Bold**, outlined into paths and living only inside the lockup files. It
is not available to the interface and should not be — one is a logo, the other is text.

Lato is licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL). Only its
outlines are used; no font file is distributed with this project.

## Layout and interaction

| Token      | Value          | Meaning                                       |
| ---------- | -------------- | --------------------------------------------- |
| `--radius` | `0.625rem`     | Corner radius for cards, inputs and buttons   |
| `--tap`    | `2.75rem`/44px | Minimum tap target on every interactive thing |

44 px is the floor for anything tappable. Primary navigation stays permanently visible at the
bottom of the screen; nothing needed daily is behind a menu. Sizes are in `rem` so everything
scales when someone raises their text size — which people on lifelong medication do.

## Where each asset is used

| Asset                            | Used by                                          |
| -------------------------------- | ------------------------------------------------ |
| `static/lockup.svg`              | App header. Precached.                           |
| `static/lockup-52/104.png`       | Header fallback where SVG cannot render.         |
| `static/lockup-inverse.svg`      | Social card and launch images are built from it. |
| `static/lockup-inverse-624.png`  | Print and handouts. Not precached.               |
| `static/icons/mark.svg`          | The mark alone, for icon-only contexts.          |
| `static/icons/icon.svg`          | Favicon, and source for the `any` PWA icons.     |
| `static/icons/icon-maskable.svg` | Source for the `maskable` PWA icons.             |
| `static/icons/splash/*`          | iOS launch images. Not precached.                |
| `static/og-image.png`            | Link previews. Not precached.                    |

The launch images, print lockup and social card are excluded from the service worker
precache: nothing in the app renders them, and two dozen launch images would inflate every
install for no offline benefit.

## Changing any of it

The mark's path coordinates are duplicated across `mark.svg`, `icon.svg` and
`icon-maskable.svg`, and again in `scripts/build-lockup.mjs`. Change one, change all four,
then:

```sh
npm run lockup   # rebuild static/lockup.svg and lockup-inverse.svg
npm run icons    # rebuild every raster, launch image and the social card
```

Judge the result at 32 px and circle-cropped before deciding it works.
