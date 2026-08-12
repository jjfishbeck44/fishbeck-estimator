# Fishbeck Innovations — Project Estimator Deployment Guide

This guide covers how to deploy the AI Project Estimator to Vercel (free tier) and embed it on your website.

---

## What You Need Before Starting

- A [Vercel account](https://vercel.com) (free)
- An [Anthropic API key](https://console.anthropic.com) (pay-as-you-go, ~$0.01 per estimate)
- An [Upstash Redis database](https://upstash.com) (free tier, for rate limiting)
- Git installed and this project pushed to GitHub

---

## Step 1: Push to GitHub

If you haven't already:

```bash
# From inside the fishbeck-estimator/ folder
git remote add origin https://github.com/YOUR_USERNAME/fishbeck-estimator.git
git push -u origin master
```

---

## Step 2: Get Your API Keys

### Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

### Upstash Redis Credentials
1. Go to [console.upstash.com](https://console.upstash.com)
2. Click **Create Database** → pick a region close to your users (e.g., US East)
3. Once created, click the database → **REST API** tab
4. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your GitHub repo
3. Leave all build settings as default (no framework preset needed)
4. Click **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | your token |

5. Click **Deploy**

Vercel will build and deploy in ~30 seconds. You'll get a URL like `fishbeck-estimator.vercel.app`.

---

## Step 4: Test the Live Site

1. Visit your Vercel URL
2. Type a test project description, e.g.:
   > "I have a 6-unit building in Minneapolis. Need to turn 2 units — repaint, new flooring, clean."
3. You should see a detailed scope breakdown with cost ranges within 10 seconds.

**If something goes wrong:** Check Vercel's **Functions** tab in your dashboard — it shows real-time logs from the API function.

---

## Step 5: Embed on fishbeckinnovations.com

### Option A — Link to it (easiest)
Add a button or link anywhere on your site:

```html
<a href="https://fishbeck-estimator.vercel.app" target="_blank">
  Get an Instant Estimate
</a>
```

### Option B — Embed in an iframe

```html
<iframe
  src="https://fishbeck-estimator.vercel.app"
  width="100%"
  height="900"
  style="border: none; border-radius: 12px;"
  title="Fishbeck Project Estimator"
></iframe>
```

The `frame-ancestors` CSP header in `vercel.json` is already set to allow embedding from `*.fishbeckinnovations.com`.

### Option C — Custom domain on Vercel
1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add `estimate.fishbeckinnovations.com`
3. Follow Vercel's DNS instructions (add a CNAME record at your registrar)
4. The page will be live at `https://estimate.fishbeckinnovations.com`

---

## Optional: Custom-Quote Email (Resend)

The **Request a Custom Quote** tool (`/tools/custom-quote`) emails project requests to
`jimmy@fishbeckinnovations.com` through [Resend](https://resend.com). It's optional — if you
don't set it up, the form automatically falls back to opening the visitor's own email app
(`mailto:`), so nothing breaks.

To enable server-side sending:

1. Create a free [Resend account](https://resend.com) (100 emails/day free).
2. **API Keys** → **Create API Key**, copy it (starts with `re_...`).
3. In Vercel → project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_...` |
| `RESEND_FROM` *(optional)* | `Fishbeck Innovations <quotes@fishbeckinnovations.com>` |

4. Until you verify your own domain in Resend, leave `RESEND_FROM` unset — it defaults to
   Resend's `onboarding@resend.dev` sender, which works immediately for testing. To send from
   your own domain, verify it in Resend (**Domains** → add DNS records) then set `RESEND_FROM`.

Customer replies go straight to them (the email's reply-to is the customer's address), so they
can attach photos/plans/PDFs in their reply — no file storage needed.

The **Property Assessment** tool (`/tools/property-assessment-calculator`) needs **no key** — it
geocodes addresses via OpenStreetMap to estimate travel distance from St. Paul.

---

## Updating the Estimator

To update pricing, service categories, or Claude's behavior — edit `lib/prompt.js`. Then:

```bash
git add lib/prompt.js
git commit -m "update pricing reference"
git push
```

Vercel auto-deploys on every push to `master`.

---

## Cost Estimate

| Service | Cost |
|---------|------|
| Vercel hosting | **Free** |
| Upstash Redis | **Free** (10k requests/day) |
| Anthropic API | ~$0.01–$0.02 per estimate |

At 100 estimates/month, expect **~$1–2/month** in API costs.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "Something went wrong" error | Missing API key | Check Vercel env vars |
| Very slow responses (>15s) | Normal on first cold start | Wait — subsequent calls are fast |
| Rate limited | >10 requests from same IP in 60s | Wait 60 seconds |
| Estimate seems off | Pricing in prompt needs tuning | Edit `lib/prompt.js` |
