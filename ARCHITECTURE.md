# Architecture

A short tour of how the pieces fit together.

## Request flow (read path)

1. **Customer browser** hits a Next.js page, e.g. `/products/aura-pro-wireless-headphones`.
2. The **server component** for that route calls `odooApi.getProduct(slug)` (in `src/lib/odoo-api.ts`).
3. The client adds an `Authorization: Bearer <API_KEY>` header and hits Odoo at `/api/v1/products/<slug>`.
4. The Odoo controller (`headless_shop_api/controllers/main.py`) returns a JSON envelope. ISR cache (`revalidate: 60`) keeps subsequent renders fast.
5. The page hydrates with shadcn/ui components.

## Request flow (cart + checkout)

1. The cart token lives in `localStorage` (`src/lib/cart-store.ts`).
2. Client components call **Next.js API routes** in `src/app/api/cart/*` — these are thin proxies that authenticate to Odoo server-side, so the API key is never shipped to the browser.
3. Behind the scenes each cart is a `sale.order` in `draft` state. Checkout calls `action_confirm()` and the order appears in the merchant's normal Odoo dashboard immediately.

## AI features

### Semantic search (`/api/ai/search`)

1. The route loads the **embeddings corpus** from Odoo (`/api/v1/search/embeddings`) — name, category, description, optional pre-computed vector per product.
2. If `OPENAI_API_KEY` is set, the user query is embedded with `text-embedding-3-small` and the corpus is ranked by **cosine similarity**. Otherwise, fall back to keyword-overlap so the demo still works.
3. The top 20 candidates are passed to **Claude** with a strict JSON system prompt: `{ ids, reasoning }`. Claude picks the genuine matches and writes a one-paragraph explanation.
4. The route resolves Claude's `ids` to full product payloads from Odoo and returns them to the page.

### Product Q&A (`/api/ai/chat`)

1. Pulls a single product's full data from Odoo.
2. Sends a tightly scoped prompt to Claude with the product description, attributes, price, and stock state.
3. Strict system prompt forbids hallucinations — Claude is told to say "I don't know" if the data doesn't contain the answer.
4. System prompt is marked for **prompt caching** so repeated questions about the same product reuse cached tokens.

### Recommendations (`/api/ai/recommend`)

1. Loads anchor product + related products from Odoo (same category, in stock).
2. Claude curates 3–4 picks and writes a one-line theme. If `ANTHROPIC_API_KEY` isn't configured, the raw related list is returned (graceful degradation).

## Security model

- **Server-only API keys.** `ODOO_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` live in env vars and are only read inside Node-runtime API routes / server components.
- **CORS** is enforced by the Odoo controller (`controllers/auth.py`) — configurable from the Odoo settings panel.
- **Rate limit** of 100 requests / minute / IP on the Odoo side (in-memory sliding window; swap for Redis for multi-worker production).
- **No user accounts.** Carts are referenced by a high-entropy token; order tracking by a separate order token. Email is required at checkout and stored on the standard `res.partner` record.

## Storage / data model

- `product.template` is extended with:
  - `api_id` (UUID for public IDs)
  - `api_slug` (SEO-friendly URL segment)
  - `ai_description` (long-form marketing copy)
  - `embedding_vector` (JSON-serialised float array)
- `sale.order.access_token` (built-in Odoo field) is used as both cart token and order token.
- `res.config.settings` gets a "Headless Shop API" panel for API key + AI key configuration.

## Why headless?

The merchant doesn't have to learn a new admin tool. Every product change, inventory adjustment, refund, or report continues to happen in Odoo. Meanwhile, the customer-facing storefront can be:

- Iterated independently (new pages don't require an Odoo upgrade)
- Deployed to a global edge network (Vercel)
- A/B tested freely
- Replaced by a mobile app without touching the backend

## Extensibility hooks

- **Payments.** `POST /api/v1/checkout/:token` is the natural integration point — wire Stripe / Omise / PromptPay here, return a real payment URL.
- **Search.** Swap the in-process cosine similarity for Pinecone / Qdrant by replacing the body of `/api/ai/search/route.ts`.
- **Multilingual.** Odoo already supports translations on product fields; add a `lang` query param to controllers and read with `with_context(lang=...)`.
