# Discovery-Call FAQ

Questions clients will likely ask, with rehearsed answers. Skim before every call.

---

### "Why headless? Why not just customise the standard Odoo website?"

The standard Odoo website ties presentation tightly to the backend. Every layout
change is an XML view inheritance, every interactive feature is QWeb + jQuery.
That's fine for an internal portal but slow to iterate and hard to make
Lighthouse-fast.

Headless lets you:

1. Ship UI changes without touching the backend or doing an Odoo upgrade
2. Deploy the storefront to a global edge network (Vercel, Cloudflare)
3. A/B test design changes freely
4. Use modern frontend tooling (React, Tailwind, shadcn)
5. Replace the storefront with a mobile app later without re-architecting

---

### "How does the merchant manage products?"

Exactly as today, in the Odoo Web UI. The headless module only **extends**
`product.template` with four new fields — it doesn't touch the existing
product list, form view, or any workflow. New products appear on the
storefront on the next ISR refresh (default 60 seconds).

---

### "What happens if Odoo goes down?"

The storefront degrades gracefully:
- ISR-cached pages keep serving for the duration of their stale window
- AI search has a fallback path that still returns cached embeddings
- Cart/checkout endpoints surface a clean error envelope, the UI shows a
  retry banner
- Order tracking continues to work for already-placed orders that are in
  the page cache

For genuine high-availability you'd run a hot-standby Odoo replica.

---

### "Can we keep our existing payment processor?"

Yes. The checkout endpoint (`POST /api/v1/checkout/:token`) is the integration
point. Today it confirms the order directly (mocked payment); swapping in
Stripe / Omise / 2C2P / PromptPay is a one-day change. I'd put the integration
in front of `action_confirm()` so unpaid orders stay in `draft`.

---

### "How much do the AI features cost to run?"

Rough operating cost per 1,000 customer interactions:

| Feature        | API cost (approx.)   |
|----------------|----------------------|
| Semantic search| $0.10 – $0.30        |
| Product Q&A    | $0.05 – $0.15        |
| Recommendations| $0.05 – $0.10        |

System prompts are marked for prompt caching, so repeated questions about the
same product reuse cached tokens at 1/10 the price. For a store doing 10k
sessions/month, expect $30 – $100/month in API bills.

---

### "Can the AI lie about our products?"

The Q&A system prompt is explicit: *"Use ONLY the data below. If the data
doesn't contain the answer, say so. Never invent specs, certifications, or
claims."* Combined with a low temperature (0.3), Claude refuses to speculate.

I can also add a **citation mode** that highlights which part of the product
description sourced each claim, useful for regulated industries (cosmetics,
supplements, medical devices).

---

### "Will this work for B2B?"

Yes — Odoo's pricelist / fiscal-position rules carry through. The REST
controller calls `_get_pricelist_for_partner()` so each customer sees their
contracted price. For login-protected B2B you'd add an auth layer (JWT
issued from `auth.login`) on top of the public endpoints.

---

### "How long until launch?"

Greenfield with no special integrations: **5 weeks** total — 1 week discovery,
3 weeks build, 1 week UAT + launch.

Migration from an existing platform (Magento/Shopify/Woo): **8–12 weeks**
depending on data quality and integration count.

---

### "What about SEO?"

The storefront uses Next.js Server Components, so product pages render fully
on the server with structured data (JSON-LD), proper canonical tags, and
Open Graph metadata. Google indexes them like any static site. ISR keeps
pages fresh without sacrificing Core Web Vitals.

The headless module also exposes a `/sitemap.xml`-friendly product listing
endpoint that the Next.js app can pipe straight into its sitemap route.

---

### "Can we self-host or do we need Vercel?"

Either works. The Dockerfile in the repo runs the storefront on any container
host (DigitalOcean App Platform, Fly.io, Railway, your own VPS). Vercel is
the easiest for ISR + edge functions, but it's not required.

---

### "Who owns the code?"

You do, on delivery. I keep no rights, license, or commercial restrictions
on what you ship. The repos transfer to your GitHub org at handoff.

---

### "Do you do ongoing support?"

Yes — three tiers:

| Tier       | Monthly | What you get                                            |
|------------|---------|---------------------------------------------------------|
| Light      | $500    | Bug fixes, security patches, < 5h/month                 |
| Standard   | $1,000  | Above + minor feature work, < 12h/month, 1 monthly call |
| Embedded   | $2,000  | Above + 1 standing weekly call, priority response       |

All tiers include monitoring (Sentry + Uptime Kuma) and quarterly Odoo
upgrade testing.
