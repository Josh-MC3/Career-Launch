# Career Launch Academy

A free, evidence-based career-preparation platform. The premise: most career advice online sells fear ("beat the bots or stay invisible"), and a lot of it is false. This site tells people what the research actually shows — sourced, dated, and with no sales pitch. Everything is free; nothing is uploaded to a server.

It's a static site — plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no backend. Drop the folder on any static host (GitHub Pages, Netlify, S3, or just open `index.html`).

## Run it locally

```bash
cd career-launch-academy
python3 -m http.server 8000
# then open http://localhost:8000
```

That's it. The only external dependency is the Inter font from Google Fonts (loaded via `<link>`); the site degrades gracefully to system fonts offline.

## The six hubs

| Page | Hub | What's interactive |
|------|-----|--------------------|
| `index.html` | Home | scroll reveals |
| `start.html` | Start Here | diagnostic → personalized roadmap, progress saved to `localStorage` |
| `truth.html` | Recruiter Truth & Resources | myth cards, free/paid resource directory toggle |
| `profile.html` | Profile & Presence (dark studio) | headline example swapper, weak/strong experience toggle |
| `resume.html` | Resume Lab | client-side resume scorer, 10-persona example library |
| `interview.html` | Interview Center | STAR trainer (drafts saved to `localStorage`), filterable question bank |
| `strategy.html` | Job Search Strategy | application-funnel calculator, copy-able networking templates, Veteran Transition Hub |

## Files

- `styles.css` — one shared stylesheet. Two theme "worlds": the professional-blue base (most pages) and a charcoal/scarlet **dark studio** scoped under `.studio` (Profile & Presence). Both meet WCAG AA contrast.
- `app.js` — shared across every page: mobile nav, scroll reveal (fails safe — content is never permanently hidden if JS is slow), date stamps, and the **citations registry**.
- `diagnostic.js`, `profile.js`, `resume.js`, `interview.js`, `strategy.js`, `resources.js` — per-page logic. Each is self-contained and only runs if its page elements are present.

## Editing content

**Sources / citations.** Every footer source list is generated from one object — `CITATIONS` at the top of `app.js`. Add or edit a source there and it updates everywhere. Inline source chips in the page bodies are plain `<a class="chip chip--data">` links.

**The resume scorer rubric** lives in `scoreResume()` in `resume.js`. It's a transparent heuristic for a *skimming human* (quantified impact, action verbs, length fit, clear sections, contact basics, bullets, clichés) — deliberately **not** a fake "ATS scanner," consistent with the site's anti-myth stance. Adjust weights in the `checks.push([...])` calls.

**The example library** (`PERSONAS` in `resume.js`), **interview questions** (`QUESTIONS_BANK` in `interview.js`), **STAR models** (`STAR_EXAMPLES`), and the **resource directory** (`FREE_RESOURCES` / `PAID_RESOURCES` in `resources.js`) are all plain data arrays/objects — edit in place.

**The diagnostic logic** that maps answers → bottleneck → roadmap is `diagnose()` in `diagnostic.js`.

## A note on accuracy

Two kinds of facts here will drift over time:

- **Tool prices** in the resource directory (`resources.js`) are as of mid-2026 and are given as ranges with a "verify at the source" caveat. Re-check before relying on them.
- **Funnel conversion rates** in the calculator are adjustable illustrative defaults, not hard statistics — the point is the *shape* of the funnel, not exact numbers.

The research-backed claims (the 6-second-scan and 75%-ATS myths, where recruiters look) are cited to named, dated sources in the registry. If you update a claim, update its source.

## Principles baked in

- **Free, no gate, no upsell** — there's nothing to sell, so the advice has no reason to mislead.
- **Evidence over fear** — sourced claims, honest uncertainty (e.g. the LinkedIn algorithm section flags what's established vs. merely claimed).
- **Privacy** — the scorer, diagnostic, and STAR drafts all run in the browser; nothing is uploaded.
- **Veterans as a respected specialized audience** — woven through the Resume Lab, Interview Center, and a dedicated Transition Hub, not tokenized.
