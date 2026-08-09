# Feature screenshots

Drop app screenshots here, one folder per feature card:

```
screens/
  health/        01.jpg  02.jpg  03.jpg ...
  finance/
  business/
  employees/
  school/
  parenting/
  moms-diary/
  assets/
  payables/
  travel/
  documents/
  collaborations/
  growth/
```

Then list them in the `GALLERIES` object at the top of `public/script.js`:

```js
health: {
  slides: [
    { src: "assets/images/screens/health/01.jpg", caption: "Health dashboard" },
    { src: "assets/images/screens/health/02.jpg", caption: "Medical record per family member" }
  ]
}
```

Rules:
- A card whose `slides` array is empty is **not clickable** — no broken images on the site.
- Folder name must match the card's `data-gallery` value in `index.html`.
- Slides are shown in the order listed here, not alphabetically.

Image tips:
- Landscape ~1600x1000 works best (the slide area is 16:10). Phone screenshots are fine —
  they're letterboxed with `object-fit: contain`, never cropped.
- Compress before committing. Aim under ~300 KB each; these load over the CDN.
- `.jpg` for photos/screens, `.png` only if you need transparency.
