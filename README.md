# Ally Perkinson — digital business card

A one-page contact card to drop in an email signature. Static HTML/CSS/JS,
no build step, no dependencies. Deploys to GitHub Pages as-is.

## Preview locally

```bash
./serve.sh          # → http://localhost:4000
```

(Use the server rather than opening `index.html` directly — the "Save my
contact" button embeds the photo via `fetch`, which `file://` blocks.)

## Fill in the real details

Her name, title, specialty, location, bio, and links are already in from her
LinkedIn. Six things still need real values — search `index.html` for
**`EDIT:`**, they're numbered 1&ndash;6:

| # | What | Currently |
|---|------|-----------|
| 1 | Final domain — `canonical` + `og:url` | `https://allyperkinson.com/` |
| 2 | Her photo | `assets/ally.jpg` is a placeholder — overwrite it |
| 3 | Direct phone — `tel:` + visible text | `(919) 555-0123` |
| 4 | Work email — `mailto:` + visible text | `alexandra.perkinson@…` |
| 5 | Scheduling link (hero button) | `https://calendly.com/your-link` |
| 6 | Scheduling link (the embed, same URL) | `https://calendly.com/your-link` |

Phone and email also appear once more in the `application/ld+json` block at
the bottom of the file — update them there too so search results and link
previews match.

### One thing for her to settle

Her LinkedIn **headline** says "Associate Consultant" but her **experience
entry** says "Associate Recruiter." I used *Associate Recruiter · Anesthesiology*
because that's the official job-title field. If Weatherby uses "Consultant"
with clients, change the `.role` line in the hero and `jobTitle` in the
`ld+json`.

The anesthesiology subspecialty chips (Cardiac, Pediatric, Obstetric, Pain
Management, Critical Care) are my reasonable guess at her desk's coverage —
worth a glance from her.

## Scheduling

Paste a Calendly or Microsoft Bookings link into the two `EDIT:` spots and
the calendar embeds itself inline — no third-party script, just an iframe.
While the placeholder is still there, the section shows an "Email me
instead" button so the page never looks broken.

## What the buttons do

- **Schedule a call** → the scheduling link.
- **Save my contact** → builds a `.vcf` in the browser, photo included, and
  downloads it. Adds her to a client's phone in one tap. It reads its data
  out of the page, so there is nothing extra to keep in sync.
- **Share / QR** → the native share sheet on phones, a QR code on desktop
  (handy at conferences). Falls back to "copy link" if offline.

## Deploy to GitHub Pages

```bash
git init && git add -A && git commit -m "Ally's contact card"
gh repo create ally-perkinson --public --source=. --push
```

Then **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

### Custom domain

1. Put the domain in `CNAME` (currently `allyperkinson.com`). Delete the file
   if you're using the default `<user>.github.io/ally-perkinson` URL.
2. At your registrar, for an apex domain add four `A` records:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (or a single `ALIAS`/`ANAME` to `<user>.github.io`).
   For `www`, one `CNAME` → `<user>.github.io`.
3. Settings → Pages → Custom domain, then tick **Enforce HTTPS** once the
   certificate provisions (usually under an hour).

## Brand notes

Colors and the logo come from Weatherby's own stylesheet
(`app-BfoPyvSX.css`) — brand red `#dc0032`, ink `#202938`, maroon `#a03058`,
mint `#74c9b9`. The diagonal wedge is their "angle" motif, rebuilt in CSS
because their SVG endpoints return 500.

Weatherby licenses **Whitney** (Hoefler & Co) locked to their own domain, so
it can't be reused here. The stack asks for Whitney first and falls back to
**Source Sans 3**, the closest free humanist match.

One thing worth checking: Weatherby/CHG may have rules about employees using
the corporate logo on personal sites. The footer already carries a
trademark-attribution line, but it's worth a quick ask to her manager or
marketing before this goes in her signature.
