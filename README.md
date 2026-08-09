# QuantrolPlus — Landing Website

Marketing landing page for **QuantrolPlus** — *One App. Countless Possibilities.*
A product by **QuantumMindCraft**.

## Live
- Custom domain: https://quantummindcraft.com
- App Store: https://apps.apple.com/in/app/quantrolplus/id6759055918
- Google Play: https://play.google.com/store/apps/details?id=com.mycompany.routinemashup

## Tech
Static single-page site (HTML / CSS / vanilla JS) hosted on **Firebase Hosting**.
Auto-deploys to Firebase on every push to `main` via GitHub Actions.

## Structure
```
public/
  index.html      # the page
  styles.css      # styles (dark premium theme)
  script.js       # nav + scroll animations
  assets/images/  # logos
firebase.json     # Firebase Hosting config
```

## Local preview
Open `public/index.html` in a browser, or run:
```bash
firebase serve --only hosting
```

## Deploy manually
```bash
firebase deploy --only hosting
```
