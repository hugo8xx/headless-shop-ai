# Loom Demo Script — 5 minutes

> Use this as a teleprompter for your portfolio walkthrough. Each section is approximately one minute.

## 0:00 – 0:30 — The problem

> "Odoo has incredible backend power — inventory, accounting, manufacturing, all in one place. But the default storefront looks like 2014 and Google ranks it poorly. What if you kept everything Odoo gives you for operations and put a modern Next.js storefront with AI on top? That's what I built."

**On screen:** split-screen — Odoo backend (left) vs. Next.js storefront (right).

## 0:30 – 1:30 — Customer experience

Open the Next.js storefront on mobile dimensions.

> "Here's what a customer sees. The hero has an AI search bar — they don't have to know SKUs or category names."

Type: **"I need a gift for my dad who loves coffee"**

> "Behind the scenes, Claude looked at the catalogue, ranked candidates by semantic similarity, picked the best matches, and wrote this short explanation."

Click into a product.

> "Now on the product page, customers can ask AI questions directly. Watch."

Type into the chat widget: **"Will this keep coffee hot if I leave it in my car?"**

> "It answers from the real product description — no hallucinations. Add to cart…" *(click)* "…check out as a guest…" *(fill form)* "…done."

## 1:30 – 2:30 — Admin experience

Switch to the Odoo Web UI.

> "Now the magic: the merchant never leaves Odoo. Here's the order that just came in — it's a normal `sale.order` record. Inventory got decremented. Accounting hooks fire. Everything works exactly as before."

Navigate Sales → Orders, open the new order.

> "The merchant's team can fulfil this order using the workflow they already know. They don't need any new training."

Navigate Inventory → Products.

> "If they update the price here, the storefront picks it up on the next ISR refresh. Add a new product — same thing."

## 2:30 – 3:30 — Tech walkthrough

Open the codebase in VS Code.

> "Two pieces: an Odoo module called `headless_shop_api` exposes the REST endpoints, and a Next.js app consumes them."

Show `odoo-module/headless_shop_api/controllers/main.py`.

> "Standard JSON envelope, CORS, rate limit, bearer auth — all built in."

Show `storefront/src/app/api/ai/search/route.ts`.

> "Here's the AI search route. It pulls the catalogue from Odoo, ranks by embedding similarity, sends the top 20 to Claude with a structured JSON prompt, parses the response, and returns ranked products with reasoning."

Show `storefront/src/components/AISearchBar.tsx`.

> "Frontend is shadcn/ui and Tailwind, mobile-first, App Router. Server components for SEO, client components for interactivity."

## 3:30 – 4:30 — Use cases & pricing

> "Who is this for? Three audiences."

1. **D2C brands** running Odoo who want a Shopify-style storefront without leaving Odoo.
2. **B2B catalogues** with thousands of SKUs where semantic search dramatically improves discoverability.
3. **Multi-channel** retailers — they keep one source of truth in Odoo while running web, mobile, POS, and marketplaces on top.

> "Investment range: a basic Next.js storefront on Odoo is $5–15K. Full headless setup with AI features is $15–30K. Ongoing support runs $500–2K per month."

## 4:30 – 5:00 — CTA

> "If you're running Odoo and want a modern storefront with AI features, message me on Upwork — first 30 minutes are free. I'll review your current setup and tell you honestly if this is the right fit. Link's in the description. Thanks for watching."

**On screen:** Upwork profile URL + GitHub repos.
