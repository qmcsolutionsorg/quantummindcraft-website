# Architecture

A static site with no framework and no bundler. The only moving part is a Node
script that turns a folder tree into a JSON manifest at deploy time.

## The one idea

**Content lives in folders, not in code.**

```
public/content/<feature>/<module>/<image> + <image>.txt
```

`tools/build-content.js` walks that tree and writes `public/content.json`.
The browser fetches that manifest and builds the navigation, the feature
sections, the module buttons and the fullscreen viewer from it.

Nobody edits HTML to add a module. Nobody edits `content.json` by hand.

## Why a manifest exists at all

Static hosting **cannot list a directory over HTTP**. There is no server-side
code and no directory index, so the browser has no way to ask "what files are
in this folder?" — unlike, say, the GitHub API.

The manifest is that missing directory listing, computed at deploy time.

## Data flow

```
   you add a folder + images + .txt
                │
                ▼
   firebase deploy --only hosting
                │
                ├── predeploy hook (firebase.json)
                │     └── node tools/build-content.js
                │           scans public/content/
                │           writes public/content.json
                │
                └── uploads public/ to Firebase Hosting
                              │
                              ▼
                    browser loads index.html
                              │
                    script.js fetches content.json
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        nav links      feature sections   fullscreen stage
                       + module buttons   (on button click)
```

## Files

| Path | Role |
|---|---|
| `public/index.html` | Page shell: nav, hero, value strip, roadmap, CTA, contact, footer, and the empty `<div id="featureSections">` the features are injected into |
| `public/styles.css` | All styling. No preprocessor |
| `public/script.js` | Fetches the manifest, renders nav + sections + chips, runs the fullscreen stage. **Contains no feature data** |
| `public/content.json` | **Generated.** Never edit |
| `public/content/` | All editable content |
| `tools/build-content.js` | The generator |
| `firebase.json` | Hosting config, cache headers, and the `predeploy` hook |

## Content folder contract

```
content/
  4-health/                    feature; the N- prefix sets order
    _feature.txt               name / color / icon / desc / bgopacity
    _background.jpg            optional section backdrop
    _extra.html                optional hand-written markup for this section
    2-tracker/                 module; the N- prefix sets order
      _module.txt              optional; name: Tracker
      01-vitals.jpeg           a screen
      01-vitals.txt            line 1 = title, remaining lines = description
```

Rules the generator follows:

- `N-` prefixes set ordering and are **stripped** for display. Sorting is
  natural, so `10-` comes after `9-`.
- Anything starting with `_` or `.` is config, never a slide.
- A `.txt` is matched to an image by **base filename**. Missing `.txt` falls
  back to a prettified filename.
- A module folder with **no images** renders a disabled "soon" button. That is
  how 33 of the 42 modules currently behave.
- Stray `.txt` files with no matching image produce a **build warning** —
  usually a typo.

## The fullscreen stage

Clicking a module button opens a fixed overlay at `z-index: 90`. The navbar is
at `100`, so **the menu stays visible and usable** on top of it.

- The current screenshot, blurred and darkened, is the section backdrop
- The crisp phone sits right, the title and description left
- Screens **crossfade** — nothing translates, so nothing can drift
- Advance by scroll wheel, swipe, arrow keys, buttons, or 5s autoplay
- `01 ─── 09` counter whose separator line fills as autoplay runs
- Any nav link closes it; Home also returns to the top of the page

## Caching

Set in `firebase.json`, and it matters more than it sounds:

| Asset | Cache-Control |
|---|---|
| HTML, `content.json` | `no-cache, must-revalidate` |
| `styles.css`, `script.js` | `public, max-age=300` |
| Images | `public, max-age=31536000, immutable` |

Two cache-busting mechanisms, for two different problems:

1. **`?v=N` on css/js**, hand-bumped in `index.html`. Bump it whenever you edit
   either file.
2. **`?v=<md5>` on image URLs**, added automatically by the generator. Lets
   images cache for a year while still updating instantly when replaced.

## Traps that already bit us

Recorded so nobody rediscovers them the hard way.

**`[hidden]` loses to `display:`.** `.feature-grid { display: grid }` overrode
the browser's `[hidden] { display: none }`, so hiding the old tiles in JS did
nothing. Any element you hide via the attribute needs an explicit
`.thing[hidden] { display: none }`.

**Flex `min-width: auto` breaks carousels.** In the old coverflow, the phone was
wider than its slot, so each flex item silently stretched to fit while the JS
kept translating by the *intended* width. The active slide drifted further right
every step. Fixed by `min-width: 0`, then removed entirely in favour of
crossfading.

**Cached JS + fresh HTML is a silent killer.** A deploy changed `index.html` and
`script.js` together; browsers kept the old cached JS, which looked for a DOM
element the new HTML no longer had, bailed out early, and left every feature
card unclickable with no error. Hence the `?v=` discipline.

**`cleanUrls` breaks path-specific headers.** A rule targeting `/index.html`
never matched, because the page is served at `/`. Cache headers now use a
catch-all with overrides.

**Filenames with spaces and apostrophes break paths.** `Poster - Mom's Diary.png`
had to be renamed. The generator handles any filename now, but kebab-case is
still the safe habit.
