# Upwork Submission Checklist

What's already done (✅) vs. what you need to do yourself (👤). The 👤 steps are short — total ~45 minutes of clicking.

---

## ✅ Already done by Claude

- [x] Full codebase written: Odoo module + Next.js 15 storefront + AI features
- [x] `npm install` runs clean (no peer-dep errors)
- [x] `npm run build` passes — all 13 routes compile
- [x] Git repo initialised with 6 logical commits
- [x] Code pushed to **https://github.com/hugo8xx/headless-shop-ai** (public)
- [x] Documentation written: README, ARCHITECTURE, DEPLOY, LOOM_SCRIPT
- [x] Upwork portfolio post drafted: `upwork/PORTFOLIO_POST.md`
- [x] 3 cover letter templates: `upwork/COVER_LETTERS.md`
- [x] Discovery-call FAQ: `upwork/FAQ.md`
- [x] Screenshot capture guide: `upwork/SCREENSHOTS.md`

---

## 👤 What you need to do (in order)

### 1 · Deploy the storefront to Vercel  · ~5 min

The Vercel CLI here couldn't run non-interactively. Run these from your normal terminal:

```bash
cd /Users/somboon/Desktop/ODOO/headless-shop-ai/storefront
vercel link             # accept defaults → links to project "headless-shop-ai"
vercel env add ODOO_URL                # paste a placeholder for now, e.g. https://example.com
vercel env add ODOO_API_KEY            # any value — replace after step 2
vercel env add ANTHROPIC_API_KEY       # your real Anthropic key
vercel env add ANTHROPIC_MODEL         # claude-sonnet-4-6
vercel env add OPENAI_API_KEY          # your real OpenAI key (optional)
vercel env add OPENAI_EMBEDDING_MODEL  # text-embedding-3-small
vercel --prod
```

Note your Vercel URL (e.g. `https://headless-shop-ai-hugo8xx.vercel.app`).

> The first deploy will show the home page with no products (Odoo isn't connected yet). Step 2 fixes that.

### 2 · Stand up Odoo somewhere reachable  · ~15 min

Three options — pick whichever you prefer:

| Option | Cost | Setup time | Best for |
|--------|------|------------|----------|
| **Localhost** (Docker) | $0 | 2 min | Quick screenshots + Loom only |
| **DigitalOcean droplet** | $12/mo | 15 min | Permanent demo URL |
| **Odoo.sh staging** | $25/mo | 10 min | If you sell to Odoo Enterprise shops |

**Localhost route** (recommended for first submission):

```bash
cd /Users/somboon/Desktop/ODOO/headless-shop-ai/docker
cp .env.example .env       # edit if you want, fine as-is
docker compose up -d
open http://localhost:8069
```

1. Create database name `shop`, master password `admin`, demo data ON
2. Apps → search "Headless Shop REST API" → Install
3. Settings → Headless Shop API → fill in:
   - Headless API Key: paste a random string (use `openssl rand -hex 16`)
   - Allowed CORS Origins: `*` (tighten later)
   - OpenAI / Anthropic keys (same as Vercel)
4. Save

> For the Vercel demo to talk to localhost Odoo, you'll need a tunnel:
> ```bash
> brew install ngrok    # one-time
> ngrok http 8069       # gives you a public https URL
> ```
> Update `ODOO_URL` in Vercel to the ngrok URL, redeploy.

**DigitalOcean route** (if you want a permanent demo): see [DEPLOY.md](../DEPLOY.md) section "Option B".

### 3 · Capture screenshots  · ~15 min

Follow [SCREENSHOTS.md](./SCREENSHOTS.md). Aim for 8–10 shots:

1. Hero (desktop, 1920×1080)
2. AI search result with reasoning
3. Product page with AI chat open
4. Recommendations row
5. Cart
6. Checkout
7. Order confirmation
8. **Odoo admin showing the order arrived** (the killer shot)
9. Mobile home
10. Mobile product

Optimise with `pngquant *.png` then upload to Upwork.

### 4 · Record the Loom  · ~10 min

Use [LOOM_SCRIPT.md](../LOOM_SCRIPT.md) as the teleprompter. 5 minutes max.

Upload to https://www.loom.com/ — copy the share URL.

### 5 · Post on Upwork  · ~10 min

1. Log in → "Find Work" → top-right "Promote yourself" → "Add portfolio item"
2. Open [PORTFOLIO_POST.md](./PORTFOLIO_POST.md) and copy/paste each field:
   - **Title:** the line in PORTFOLIO_POST.md
   - **Category:** Web Development → E-commerce Development
   - **Skills:** the comma-separated list
   - **Description:** the full prose block
3. Add the **screenshots** captured in step 3
4. Add **links** at the bottom:
   - Live demo: your Vercel URL
   - GitHub: https://github.com/hugo8xx/headless-shop-ai
   - Loom: your Loom URL
   - Architecture doc: https://github.com/hugo8xx/headless-shop-ai/blob/main/ARCHITECTURE.md
5. **Publish** — it goes live immediately

### 6 · Send your first 3 bids  · ~30 min total

1. Search Upwork for one of these queries:
   - `Odoo headless`
   - `Odoo Next.js`
   - `Odoo storefront`
   - `Odoo Shopify migration`
2. Filter: posted in last 7 days, $5K+, verified payment
3. For each job, open [COVER_LETTERS.md](./COVER_LETTERS.md), pick the closest template, customise the bracketed parts, submit
4. **Don't apply** to jobs where the budget is $500 or less — they'll dilute your profile

### 7 · Update your Upwork profile headline

Change your headline to something specific:

> Headless Odoo + Next.js + AI · Built Shopify-grade storefronts on your Odoo backend

Generic headlines ("Full-stack developer") get filtered out by clients searching for Odoo specialists.

---

## Done — what to expect

- First inbound reply: typically 24–72 hours after publishing
- First paying client: 2–4 weeks if you bid 3+ jobs/week
- First "Headless Odoo + AI" project size: $8K–$30K based on the rates this niche commands

If you don't get replies in 2 weeks, the most common fix is **better screenshots**. Reviewers spend 7 seconds on a portfolio item — the screenshots have to do the work.

Good luck.
