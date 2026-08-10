# QuantrolPlus — Landing Website

Marketing landing page for **QuantrolPlus** — *One App. Countless Possibilities.*
A product by **QuantumMindCraft**.

> **Start here if you're returning to this project after a break.**
> The one thing to know: **the site's content is not in the code.** Features,
> modules, screenshots and captions all come from folders under
> `public/content/`. To change what the site says, add or edit folders — not
> HTML. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Live

| | |
|---|---|
| Firebase URL (always works) | https://quantummindcraft.web.app |
| Custom domain | https://quantummindcraft.com — **DNS done, awaiting SSL** |
| App Store | https://apps.apple.com/in/app/quantrolplus/id6759055918 |
| Google Play | https://play.google.com/store/apps/details?id=com.mycompany.routinemashup |
| Repo | https://github.com/qmcsolutionsorg/quantummindcraft-website |

## Deploy

One command. It regenerates the content manifest and uploads:

```bash
firebase deploy --only hosting
```

Live in ~20–30 seconds. There is **no** CI/CD — deploys are manual by choice.

## Add content

```
public/content/4-health/10-reports/     <- new module folder
    _module.txt        name: Reports
    01-labs.jpeg       the screenshot
    01-labs.txt        line 1 = title, rest = description
```

Then deploy. The button appears on its own.
Full instructions: [public/content/README.md](public/content/README.md)

## Docs

| Doc | What's in it |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How it all fits together, the data flow, and the traps that already bit us |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Firebase project, DNS records, domain cutover, troubleshooting |
| [public/content/README.md](public/content/README.md) | How to add modules, screens, captions and backgrounds |

## Tech

Static HTML / CSS / vanilla JS on **Firebase Hosting**. No framework, no build
step beyond a ~150-line Node script that scans the content folders. No
dependencies, no `node_modules`.

## Local preview

```bash
firebase serve --only hosting     # http://localhost:5000
```

Opening `public/index.html` directly mostly works, but `fetch()` of
`content.json` is blocked on `file://` in some browsers, so the feature
sections may come up empty. Use `firebase serve` when testing content.
