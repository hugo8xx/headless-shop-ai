# Headless Odoo E-commerce with AI

> Modern Next.js storefront powered by Odoo 17 backend with AI semantic search, product Q&A, and recommendations.

## Live demo

- **Storefront:** _your Vercel URL here_
- **Odoo admin:** _your Odoo URL here_ (login `admin / admin` on the demo)

## Key features

- Beautiful Next.js 15 storefront — mobile-first, SSR, SEO-ready
- AI semantic search — describe what you need in plain English
- Product Q&A — customers ask AI questions about any item, answered from real product data
- AI recommendations — "you might also like" with model-written explanations
- Real-time Odoo sync — admin keeps using the Odoo Web UI for products, inventory, orders, reports
- Guest checkout — no account required, order tracking via secure token
- CORS + bearer-token gated REST API with per-IP rate limits

## Architecture

```
                                ┌────────────────────────┐
                                │  AI Services           │
                                │  • Anthropic Claude    │
                                │  • OpenAI embeddings   │
                                └──────────▲─────────────┘
                                           │
┌──────────────┐    REST     ┌─────────────┴──────────┐    REST    ┌──────────────────┐
│  Customer    │ ──────────► │  Next.js 15 (Vercel)   │ ─────────► │  Odoo 17         │
│  (browser /  │             │  • App Router pages    │            │  Custom REST     │
│   mobile)    │ ◄────────── │  • Server API routes   │ ◄───────── │  module exposes  │
└──────────────┘             │  • shadcn/ui + Tailwind│            │  /api/v1/*       │
                             └────────────────────────┘            └────────▲─────────┘
                                                                            │
                                                                  ┌─────────┴───────┐
                                                                  │  Merchant uses  │
                                                                  │  Odoo Web UI    │
                                                                  └─────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper walkthrough.

## Stack

| Layer       | Tech                                                            |
|-------------|-----------------------------------------------------------------|
| Frontend    | Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui     |
| Backend     | Odoo 17 · Custom `headless_shop_api` module · PostgreSQL 15     |
| AI          | Anthropic Claude Sonnet 4.6 · OpenAI text-embedding-3-small     |
| Deploy      | Vercel (storefront) · Odoo.sh or DigitalOcean (backend)         |

## Quick start (local Docker)

```bash
# 1. Copy env files
cp docker/.env.example docker/.env        # fill in API keys (or leave blank for keyword-only mode)
cp storefront/.env.example storefront/.env.local

# 2. Start everything
cd docker && docker compose up -d

# 3. Initialise Odoo: open http://localhost:8069, create database "shop", install "Headless Shop REST API"
#    Settings → Headless Shop API → paste your Anthropic / OpenAI keys, set an API key, save.
#    Copy that API key into ODOO_API_KEY in docker/.env (or storefront/.env.local) and restart storefront.

# 4. Open the storefront
open http://localhost:3000
```

## Repository layout

```
headless-shop-ai/
├── odoo-module/
│   └── headless_shop_api/        # Odoo custom module
│       ├── __manifest__.py
│       ├── controllers/          # REST endpoints + auth/rate-limit decorator
│       ├── models/               # product_template, sale_order, settings extensions
│       ├── security/             # access rules + bearer-auth groups
│       ├── views/                # settings UI
│       └── data/                 # 20-product demo catalogue
├── storefront/                   # Next.js 15 app
│   ├── src/app/                  # pages + API routes
│   ├── src/components/           # AI search bar, product chat, recommendations, etc.
│   ├── src/lib/                  # Odoo client, Claude wrapper, cart store
│   └── Dockerfile
├── docker/
│   └── docker-compose.yml        # Odoo + Postgres + Next.js
├── ARCHITECTURE.md
├── DEPLOY.md
└── LOOM_SCRIPT.md
```

## What customers see vs what admin sees

| Customer (Next.js)                       | Admin (Odoo Web UI)                         |
|------------------------------------------|---------------------------------------------|
| Lightning-fast SSR storefront            | Familiar Odoo product/inventory/sales apps  |
| AI semantic search and product Q&A       | All orders show up as `sale.order` records  |
| Guest checkout, order tracking           | Standard Odoo reporting, accounting hooks   |
| Mobile-first, accessible                 | No retraining needed                        |

## API reference (selected)

| Method | Path                                       | Purpose                              |
|--------|--------------------------------------------|--------------------------------------|
| GET    | `/api/v1/products`                         | List with filters + pagination       |
| GET    | `/api/v1/products/:id`                     | Product detail (slug, uuid, or id)   |
| GET    | `/api/v1/products/:id/related`             | Related products                     |
| GET    | `/api/v1/categories`                       | Category tree                        |
| GET    | `/api/v1/search?q=`                        | Text search                          |
| GET    | `/api/v1/search/embeddings`                | Export embeddings corpus for AI rerank |
| POST   | `/api/v1/cart`                             | Create cart, returns `token`         |
| GET    | `/api/v1/cart/:token`                      | Cart contents                        |
| POST   | `/api/v1/cart/:token/items`                | Add item                             |
| PATCH  | `/api/v1/cart/:token/items/:line_id`       | Update quantity                      |
| DELETE | `/api/v1/cart/:token/items/:line_id`       | Remove line                          |
| POST   | `/api/v1/checkout/:token`                  | Submit guest checkout                |
| GET    | `/api/v1/orders/:order_token`              | Track order                          |

All responses use the envelope `{ success: true, data, meta? }` or `{ success: false, error: { code, message } }`.

## Use cases

- D2C brands wanting a Shopify-like experience without leaving Odoo
- B2B catalogues with custom pricing rules
- Multi-channel commerce (POS + online + mobile share one Odoo)
- AI-enhanced product discovery for large catalogues

## Investment range

- Storefront customisation: **$5K–15K**
- Full headless setup: **$15K–30K**
- AI features add-on: **$5K–15K**
- Ongoing support: **$500–2K/month**

## Contact

Available for engagements via Upwork — DM for a free 30-minute consultation.
