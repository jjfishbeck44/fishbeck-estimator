# Fishbeck Project Estimator — Handoff Summary

**Owner:** Fishbeck Innovations LLC (Twin Cities, MN) · **Repo:** github.com/jjfishbeck44/fishbeck-estimator
**Status:** Feature-complete and tested (357 tests passing). Deploys to Vercel from `master`.
**Last updated:** 2026-11-13

## What it is
A web tool where a property manager describes a project in plain English and gets a line-by-line cost
estimate (powered by the Claude API using Fishbeck's own pricing in `lib/prompt.js`), plus a suite of
standalone construction calculators, a bid scorer, and a work-order prep tool.

## What's included
| Area | Where | Notes |
|---|---|---|
| AI estimator | `public/index.html`, `public/js/estimator.js`, `api/estimate.js` | History, search, ref IDs, CSV/PDF export, print, share, dark mode, accessibility |
| PDF export | `public/js/pdf-export.js` | Dependency-free, self-hosted (site CSP blocks CDN scripts) |
| Estimate comparison | `estimator.js` + history checkboxes | Compare 2–4 saved estimates side by side |
| Calculators (~20) | `public/*-calculator.html`, `public/js/calculators/` | Mulch, paint, drywall, flooring, fence, snow, unit-turn, flip, etc. Edit rates only in `pricing.js` |
| Property assessment / custom quote | `api/travel-distance.js`, `api/custom-quote.js` | Distance via OpenStreetMap; quote email via Resend |
| Bid scorer, work order prep | `api/bid-score.js`, `api/work-order.js`, `bid-scorer/` | Claude-powered |
| Business docs | `Fishbeck_AI_OS/` | SEO keyword master and AI-OS notes |

## Key facts for filing
- **Stack:** vanilla JS frontend, Node serverless (Vercel), Anthropic SDK, Upstash Redis (rate limiting, fails open).
- **Secrets (NOT in the repo — set in Vercel):** `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`;
  optional `RESEND_API_KEY`, `RESEND_FROM`. See `.env.example` (placeholders only).
- **Running cost:** ~$0.01–0.02 per estimate; hosting and Redis on free tiers.
- **Change pricing:** edit `lib/prompt.js` (AI estimator) or `public/js/calculators/pricing.js` (calculators), push to `master`.
- **Run tests:** `npm install && npm test`.
- **Deploy guide:** `DEPLOY.md` · **Technical reference:** `CLAUDE.md` · **Overview:** `README.md`.

## Open items
- Latest work (PDF export + comparison) is on branch `claude/add-claude-documentation-T2goZ`; merge to `master` to go live.
- Contact/phone and branding details on the site are the owner's to confirm before public launch.
