# Site content — add modules and screens without touching code

Everything in the feature sections is generated from these folders.
Add a folder, drop images in, deploy. No code changes.

## Layout

```
content/
  4-health/                      <- a FEATURE. Number prefix sets the order.
    _feature.txt                 <- name / color / icon / desc
    _extra.html                  <- optional. Extra markup shown under this feature.
    2-tracker/                   <- a MODULE (a button). Number prefix sets the order.
      _module.txt                <- optional. name: Tracker
      01-vitals.jpeg             <- a screen
      01-vitals.txt              <- line 1 = title, rest = description
      02-trends.jpeg
      02-trends.txt
```

## To add a new module to Health

1. Make a folder, e.g. `content/4-health/10-reports/`
2. Put a `_module.txt` in it containing `name: Reports`
   *(skip it and the folder name is used — "10-reports" becomes "Reports")*
3. Drop in `01-something.jpeg`, `02-else.jpeg`, …
4. Beside each image add a matching `.txt`:
   ```
   Lab reports
   Every result stored against the right family member
   ```
5. Deploy: `firebase deploy --only hosting`

The button appears automatically. A module folder with **no images** shows as a
greyed-out "soon" button, which is how the empty ones behave today.

## To add a background image to a feature section

Drop a file called `_background` into the feature folder — any image extension:

```
content/1-personal-growth/_background.jpg
```

That's it. It's shown behind the whole section, faded back so the text stays
readable, with the page colour blended in at the top and bottom so it doesn't
look like a hard band.

To make it stronger or fainter, add a line to that feature's `_feature.txt`:

```
bgopacity: 0.35
```

Default is `0.22`. Sensible range is about `0.10`–`0.45`; past that the
heading starts to fight the picture.

Use a wide landscape image (1920x1080 or similar) and keep it under ~400 KB —
it covers the full section width.

## To add a whole new feature

Make a numbered folder with a `_feature.txt`:

```
name: Learning
color: #3B82F6
icon: school
desc: One line shown under the heading.
```

`icon` is one of: `growth`, `family`, `business`, `health`, `finance`, `school`, `doc`.
The section, its heading and its navigation link all appear on their own.

## Rules

- **Order** comes from the number prefix (`1-`, `2-`, … `10-` sorts correctly).
- **Images**: `.jpg .jpeg .png .webp .gif .avif`. Phone screenshots around
  717x1600 work best; keep them under ~200 KB.
- **Text is optional.** With no `.txt`, the filename becomes the title.
- Folders starting with `_` or `.` are ignored.

## How it works

`tools/build-content.js` scans this folder and writes `public/content.json`,
which the site reads at load. It runs automatically on every
`firebase deploy` via the `predeploy` hook in `firebase.json`.

Static hosting can't list a directory over HTTP, which is why the manifest
exists. To regenerate it by hand: `node tools/build-content.js`
