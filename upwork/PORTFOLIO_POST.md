# Upwork Portfolio Post

Copy/paste each section into the Upwork portfolio item form.

---

## Title (max 70 chars)

```
Headless Odoo E-commerce with AI Search, Product Q&A & Recommendations
```

## Category

```
Web Development → E-commerce Development
```

## Skills (paste, comma-separated)

```
Odoo, Odoo Development, Odoo Module Development, Next.js, React, TypeScript,
Tailwind CSS, REST API, Headless Commerce, Anthropic Claude, OpenAI, AI Integration,
Vector Search, PostgreSQL, Docker, Vercel
```

## Short description (max 200 chars — the hover/preview text)

```
A production-grade headless storefront: Odoo 17 backend (REST module + admin UI)
+ Next.js 15 frontend with AI semantic search, product Q&A, and recommendations.
```

## Full description (the body)

```
THE PROBLEM
Odoo gives merchants industry-best operations — inventory, accounting, manufacturing,
multi-warehouse, all in one place. But its default storefront looks dated, ranks
poorly in Google, and can't compete with Shopify on customer experience.

THE SOLUTION
A headless architecture that keeps Odoo as the source of truth for operations,
and adds a modern Next.js storefront with three AI features that no Shopify
template can match:

  1. AI semantic search — customers describe what they need in plain English
     ("warm jacket for winter hiking" or "gift for a coffee-obsessed dad")
     and Claude picks the right products with a short explanation.

  2. Product Q&A — every product page has an "Ask AI" widget. Customers ask
     "is this waterproof?" or "will it fit my 16-inch laptop?" and get an
     answer grounded in the real product data. No hallucinations: the system
     prompt explicitly tells Claude to say "I don't know" if the data doesn't
     contain the answer.

  3. AI recommendations — instead of "people who bought X also bought Y" based
     on weak collaborative-filtering signals, Claude curates 3-4 cross-sell
     items per product and writes a one-line theme for the picks.

WHAT THE MERCHANT SEES
Nothing changes. Products, inventory, orders, reports — all in the Odoo Web
UI they already use. New orders from the Next.js storefront appear as normal
sale.order records, kicking off the same fulfilment workflow.

TECH STACK
• Frontend: Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui
• Backend: Odoo 17 + custom headless_shop_api module · PostgreSQL 15
• AI: Anthropic Claude Sonnet 4.6 + OpenAI text-embedding-3-small
• Infra: Docker Compose · Vercel · DigitalOcean / Odoo.sh

WHAT'S INCLUDED
✓ Odoo module with 14 REST endpoints (products, cart, checkout, orders,
  embeddings export) — bearer auth, CORS, per-IP rate limiting built in
✓ Extended product.template with api_id, api_slug, ai_description,
  embedding_vector fields — no breaking changes to standard Odoo views
✓ Next.js storefront: home, product list with filters, product detail,
  AI search page, cart, guest checkout, order tracking
✓ Server-side API proxies — your API key never leaves Node runtime
✓ Graceful AI degradation — keyword fallback when AI keys aren't configured,
  so the demo never errors out
✓ Production Dockerfile + docker-compose for one-command local setup
✓ Architecture doc + deploy guide for Vercel, Odoo.sh, and self-hosted

DELIVERABLES YOU GET
• Two GitHub repos (Odoo module + Next.js storefront) — yours to keep
• Vercel deploy of the storefront, custom domain attached
• Odoo deployment (Odoo.sh subscription or self-hosted on your VPS)
• 30-day post-launch support included
• Loom walkthrough of the codebase so your team can take over

PRICING TIERS
• Storefront customisation only (use your existing Odoo): $5K – $15K
• Full headless setup (Odoo + storefront + AI): $15K – $30K
• Enterprise (B2B pricing, ERP integrations, multi-language): $30K – $50K
• Ongoing support: $500 – $2K / month

TYPICAL TIMELINE
• Discovery + design: 1 week
• Build: 2 – 4 weeks
• QA + launch: 1 week

WHO THIS FITS
• D2C brands running Odoo who want Shopify-quality customer experience
• B2B catalogues with 1000+ SKUs where semantic search drives discovery
• Multi-channel retailers (POS + online + mobile) who need one source of truth
• Companies migrating off Magento/WooCommerce to a modern stack
```

## Links to attach

| Label                   | URL                                                            |
|-------------------------|----------------------------------------------------------------|
| Live demo               | `https://YOUR-PROJECT.vercel.app`                              |
| GitHub — full project   | `https://github.com/YOUR-USERNAME/headless-shop-ai`            |
| Architecture deep-dive  | `https://github.com/YOUR-USERNAME/headless-shop-ai/blob/main/ARCHITECTURE.md` |
| Loom walkthrough        | _your 5-minute Loom URL — see LOOM_SCRIPT.md_                  |

## Screenshots to upload (in this order)

1. **Hero/Home** — full-width capture of `/` with the AI search bar
2. **AI search result** — `/search?q=warm+jacket+for+winter+hiking` with Claude's reasoning visible
3. **Product detail w/ AI chat open** — show a Q&A answer in the chat panel
4. **AI recommendations** — bottom-of-product-page "You might also like" with reasoning
5. **Cart** — populated cart with quantity controls
6. **Checkout** — form filled with order summary on the right
7. **Order tracking** — post-checkout confirmation with timeline
8. **Odoo admin** — `Sales → Orders` showing the order that just came through (the "merchant view")
9. **Mobile views** — phone-width captures of home + product detail (proves mobile-first)
10. **Architecture diagram** — the ASCII diagram from ARCHITECTURE.md, rendered

> Use the `pnpm dlx playwright screenshot` workflow in SCREENSHOTS.md to capture these consistently.
