# Fishbeck Project Estimator

An AI-powered tool that turns plain-English project descriptions into detailed cost estimates. Built for [Fishbeck Innovations LLC](mailto:jimmy@fishbeckinnovations.com), a construction and property maintenance company in the Twin Cities, MN.

**How it works:** A property manager types something like *"I need to turn 4 units — repaint, new flooring, clean appliances"* and gets back a line-by-line cost breakdown in seconds.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your environment

```bash
cp .env.example .env
```

Open `.env` and fill in your three keys:

| Key | Where to get it |
|-----|-----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) &rarr; API Keys &rarr; Create Key |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) &rarr; Create Database &rarr; REST API tab |
| `UPSTASH_REDIS_REST_TOKEN` | Same page as the URL above |

### 3. Deploy to Vercel

Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new). Add your three environment variables and click **Deploy**. That's it.

For detailed step-by-step instructions, see [DEPLOY.md](DEPLOY.md).

---

## How It Works

```
User types a project description
        |
        v
  POST /api/estimate
        |
        v
  Rate limit check (10 requests per minute per IP)
        |
        v
  Input validation (non-empty, under 1,000 characters)
        |
        v
  Claude AI generates a cost estimate using built-in pricing data
        |
        v
  Structured JSON response with line items, totals, and notes
```

The estimator knows Fishbeck's pricing for common services like unit turns, bathroom and kitchen remodels, roofing, demolition, flooring, and painting. If a request is too vague, it asks for more detail. If something is outside Fishbeck's services (like HVAC or structural engineering), it flags it separately.

---

## Project Structure

```
fishbeck-estimator/
|
|-- api/
|   |-- estimate.js        # The API endpoint (handles requests)
|
|-- lib/
|   |-- claude.js           # Talks to the Claude AI API
|   |-- prompt.js           # Pricing data and instructions for Claude
|   |-- ratelimit.js        # Prevents abuse (10 requests/min per IP)
|
|-- public/
|   |-- index.html          # The web page users see
|   |-- favicon.svg         # Browser tab icon (FI logo)
|   |-- css/style.css       # Styling (navy + gold brand colors)
|   |-- js/estimator.js     # Frontend behavior (form, loading, results)
|
|-- tests/
|   |-- estimate.test.js    # API endpoint tests
|   |-- claude.test.js      # Claude wrapper tests
|   |-- prompt.test.js      # Pricing data tests
|   |-- ratelimit.test.js   # Rate limiter tests
|
|-- .env.example            # Template for environment variables
|-- vercel.json             # Vercel deployment settings
|-- DEPLOY.md               # Step-by-step deployment guide
|-- CLAUDE.md               # Technical reference for AI assistants
```

---

## Running Tests

```bash
npm test
```

All tests run locally with mocked dependencies -- no API keys needed, no network calls made.

---

## Updating Pricing

All pricing lives in one file: `lib/prompt.js`. Open it and edit the `PRICING REFERENCE` section. Pricing is organized by category (unit turns, bathroom, kitchen, roofing, demolition, flooring & painting, drywall, fixtures, exterior, general):

```
Unit Turns:
- Unit turn, standard (paint touch-up, clean, patch, hardware): $800–$1,500 per unit
- Unit turn, heavy (flooring, full repaint, appliances): $1,500–$3,500 per unit
...
```

After saving, commit and push to `master`. Vercel auto-deploys in about 30 seconds.

---

## What It Costs to Run

| Service | Monthly Cost |
|---------|-------------|
| Vercel hosting | Free |
| Upstash Redis (rate limiting) | Free (up to 10k requests/day) |
| Claude API | ~$0.01-$0.02 per estimate |

At 100 estimates per month, expect roughly **$1-2/month** total.

---

## Features

- **Example templates** — One-click project examples (unit turns, kitchen remodel, etc.) so users don't start from a blank page
- **Estimate history** — Last 10 estimates saved locally, viewable and clearable from the input screen
- **Print and copy** — Print button with clean print styles, copy button for plain-text clipboard
- **CSV export** — Download the estimate as a `.csv` spreadsheet for accounting or record-keeping
- **Smart proposal email** — "Request My Proposal" pre-fills the email with the full formatted estimate
- **Share button** — Native sharing on mobile (Web Share API), clipboard fallback on desktop
- **Project name labels** — Optional label for each estimate (e.g., "123 Main St") shown in history and results
- **Cost breakdown chart** — Visual bar chart showing where the money goes across line items
- **Re-estimate** — One-click button to re-submit the same description for a fresh estimate
- **Project summary** — Results view shows the original project description for context
- **FAQ section** — Common questions about estimates, service area, and Fishbeck's capabilities
- **Dark mode** — Automatic dark theme based on system preference, with print styles that always use light colors
- **Auto-resize textarea** — Input field grows as you type, no manual resizing needed
- **Loading progress** — Animated progress bar with rotating messages during the 5-10 second AI processing time
- **Network retry** — Automatic retry on network failure before showing an error
- **Draft persistence** — Refreshing the page doesn't lose your in-progress description
- **Keyboard shortcuts** — Ctrl+Enter submits, Escape dismisses errors
- **Mobile-optimized** — Responsive layout with touch-friendly targets, prevents iOS auto-zoom
- **Accessibility** — Skip-to-content link, focus management, ARIA attributes, reduced-motion support
- **PWA support** — Add to Home Screen on mobile devices
- **SEO** — Open Graph tags, JSON-LD structured data, sitemap, robots.txt

---

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| "Something went wrong" error | Are all 3 environment variables set in Vercel? |
| First request is slow (10-15s) | Normal -- cold starts are slow, subsequent requests are fast |
| "Too many requests" message | You've hit the rate limit (10/min). Wait 60 seconds. |
| Estimates seem too high or low | Adjust the pricing ranges in `lib/prompt.js` |
