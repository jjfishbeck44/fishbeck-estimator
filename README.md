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

All pricing lives in one file: `lib/prompt.js`. Open it and edit the `PRICING REFERENCE` section:

```
- Unit turn, standard (paint touch-up, clean, patch, hardware): $800-$1,500 per unit
- Unit turn, heavy (flooring, full repaint, appliances): $1,500-$3,500 per unit
- Bathroom remodel, cosmetic: $2,500-$5,000 per bath
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

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| "Something went wrong" error | Are all 3 environment variables set in Vercel? |
| First request is slow (10-15s) | Normal -- cold starts are slow, subsequent requests are fast |
| "Too many requests" message | You've hit the rate limit (10/min). Wait 60 seconds. |
| Estimates seem too high or low | Adjust the pricing ranges in `lib/prompt.js` |
