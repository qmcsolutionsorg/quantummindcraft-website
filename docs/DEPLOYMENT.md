# Deployment

## Normal deploy

From the project root:

```bash
firebase deploy --only hosting
```

That single command:

1. Runs the `predeploy` hook → `node tools/build-content.js` → regenerates
   `public/content.json`
2. Uploads everything in `public/` to Firebase Hosting
3. Goes live in ~20–30 seconds

You should see a line like `content.json: 5 features, 42 modules, 19 screens`
in the output. **If that line is missing, the hook didn't run** and your new
content will not appear.

Then commit:

```bash
git add -A
git commit -m "what changed"
git push
```

There is **no CI/CD** — this was a deliberate choice. A GitHub push does not
touch the live site, which also means a compromised GitHub account cannot
deface it.

## Firebase

| | |
|---|---|
| Account | qmcsolutionsorg@gmail.com |
| Project | `routinemashup` (shared with the Quantrol+ app) |
| Hosting site | **`quantummindcraft`** → https://quantummindcraft.web.app |
| Console | https://console.firebase.google.com/project/routinemashup/hosting/sites |

⚠️ The project contains **three other hosting sites** — `quantrolplus`,
`quantrolpluss`, `routinemashup`. They serve an unrelated 1.7 KB placeholder.
`firebase.json` pins `"site": "quantummindcraft"`, so a normal deploy cannot
touch them. Don't remove that line.

⚠️ The same Firebase project holds the **Quantrol+ app's Firestore data**.
Hosting is isolated from it, but treat that Google account as high-value.
2FA on it matters more than anything else here.

## Rollback

Firebase Console → Hosting → the `quantummindcraft` site → release history →
**Rollback** on any previous version. Every deploy is retained. Takes seconds.

## Domain

`quantummindcraft.com` is registered with **Hostinger**, using Hostinger
nameservers (`ns1.dns-parking.com` / `ns2.dns-parking.com`).

It previously served a **Hostinger Website Builder** site. That was replaced by
repointing DNS at Firebase on 2026-08-09.

### DNS records that make the site work

| Type | Name | Value |
|---|---|---|
| A | `@` | `199.36.158.100` |
| TXT | `@` | `hosting-site=quantummindcraft` |
| CNAME | `www` | `quantummindcraft.web.app` |

> **The apex used to be an `ALIAS` record**, not `A`/`AAAA` — Hostinger serves
> root domains that way. Firebase's setup screen listed the *resolved* IPs
> (`145.223.124.151`, `147.79.79.109`, two `2a02:4780:…` IPv6), but at Hostinger
> they were a single `ALIAS @ → quantummindcraft.com.cdn.hstgr.net`. Deleting
> that one row removed all four.

### 🚫 DNS records that must never be deleted

These carry email for the domain. Removing any of them breaks mail, and the
failure is silent for hours:

- `MX @ mx1.hostinger.com` (priority 5)
- `MX @ mx2.hostinger.com` (priority 10)
- `TXT @ v=spf1 include:_spf.mail.hostinger.com ~all`
- `TXT _dmarc v=DMARC1; p=none`
- `CNAME hostingermail-a._domainkey`, `-b`, `-c` (DKIM)
- `CNAME autodiscover`, `CNAME autoconfig`
- `TXT @ google-site-verification=…`

Also **never** press Hostinger's **"Reset DNS records"** button — it wipes the
email setup above.

### Current status

DNS is verified correct and propagated. Both hosts return HTTP 301 to Firebase.
**SSL certificates were still provisioning at last check** — Firebase issues
them automatically once verification completes, typically within hours and up
to 24h. Until then `https://` shows a certificate warning and the domain is
effectively down; `https://quantummindcraft.web.app` is unaffected.

To check: Firebase Console → Hosting → `quantummindcraft` → the domains should
read **Connected** rather than Pending.

## Troubleshooting

**New content didn't appear.** Check the deploy output for the
`content.json: …` line. No line means the predeploy hook didn't run — run
`node tools/build-content.js` by hand and look for an error.

**A style or script change didn't appear.** You forgot to bump `?v=` on
`styles.css` / `script.js` in `index.html`. Images don't need this; their hash
is automatic.

**Feature sections are empty.** `content.json` failed to load. Open the browser
console. On `file://` this is expected — use `firebase serve` instead.

**A module button is greyed out as "soon".** Its folder has no images in it, or
the files have an extension the generator doesn't recognise
(`.jpg .jpeg .png .webp .gif .avif`).

**Caption not showing.** The `.txt` base filename must match the image exactly:
`01-vitals.jpeg` pairs with `01-vitals.txt`. The generator prints a warning for
unmatched `.txt` files.

## Local setup on a fresh machine

```bash
git clone https://github.com/qmcsolutionsorg/quantummindcraft-website.git
cd quantummindcraft-website
firebase login          # as qmcsolutionsorg@gmail.com
firebase serve --only hosting
```

Requires Node and the Firebase CLI. No `npm install` — there are no
dependencies.

Note: this machine has **no global git identity**; it is set per-repo as
`qmcsolutionsorg` / `qmcsolutionsorg@gmail.com`. A fresh clone needs
`git config user.name` and `user.email` set before the first commit.
