# Upwork Cover Letter Templates

Three templates tuned for different job posts. Personalise the bracketed bits.
Keep each under 200 words — Upwork shows ~3 lines before "see more".

---

## Template 1 — "Need a Next.js frontend for my Odoo store"

```
Hi [Client first name],

I just built exactly this — a headless Next.js storefront on Odoo 17 — as a
portfolio project. Live demo: [vercel URL]

A few specific things that match your post:
• [Reference a detail from their post — e.g. "your mention of guest checkout"]
• The Odoo side stays untouched: products, orders, inventory all managed
  in the Odoo Web UI you already use
• Custom REST module with bearer auth + CORS + rate limiting, so security
  is solid out of the gate
• Vercel deploy keeps the storefront edge-fast and SEO-friendly

I'd want to confirm two things before quoting firmly:
1. Which Odoo version are you on, and is it Odoo.sh / self-hosted / Enterprise?
2. Do you need payment processing (Stripe / PromptPay / Omise) wired up?

For a project this size I'd estimate [$X – $Y] over [N] weeks. Happy to do a
30-minute call this week to walk you through the demo and answer questions.

Code: [github URL]
Demo: [vercel URL]
Loom walkthrough: [loom URL]

— [Your name]
```

---

## Template 2 — "Add AI search to our Odoo / Shopify store"

```
Hi [Client first name],

The AI search you're describing is one of three features I shipped in a
recent Odoo headless project. Try it: [vercel URL]/search?q=warm+jacket+for+winter+hiking

How it works:
1. Sync products from Odoo to an embeddings corpus (text-embedding-3-small)
2. Embed the user query → cosine similarity → shortlist 20 candidates
3. Send shortlist + original query to Claude with a strict JSON system prompt
4. Claude picks the genuine matches and writes one short explanation

For your store specifically I'd add:
• [Reference their catalogue size — e.g. "your 8k SKU range needs the
  Pinecone index swap I describe in the architecture doc"]
• Multilingual prompts if [Thai / German / etc.] customers buy from you

This is a 2-week build for ~$[X] including the OpenAI/Anthropic costs estimate.

Architecture doc: [github URL]/blob/main/ARCHITECTURE.md
Live demo: [vercel URL]

Want to hop on a call?

— [Your name]
```

---

## Template 3 — "Headless commerce migration" (the big one)

```
Hi [Client first name],

A full headless commerce migration off [Magento / WooCommerce / Shopify] onto
Odoo as the source of truth is exactly the work I've been building toward.

My recent portfolio piece is the spike that proves the architecture: Odoo 17
backend with a custom REST module, Next.js 15 storefront with three AI
features, guest checkout, real-time order sync. Demo: [vercel URL]

For your specific migration I'd want to understand:
• Current catalogue size and how clean the product data is
• Which order states you depend on (returns, partial shipments, B2B quotes)
• ERP integrations (accounting, 3PL, EDI) that need to keep working

Typical migration phases:
1. Discovery + data audit (1 week)
2. Odoo module + REST API customisation (3 – 4 weeks)
3. Next.js storefront (4 – 6 weeks)
4. Data migration + UAT (2 weeks)
5. Cutover + 30-day stabilisation (2 weeks)

Investment for a project this size: $[20-50K] depending on integrations.

Let's schedule a 45-minute discovery call this week. I'll share the demo,
walk through the codebase, and tell you honestly if I'm the right fit.

— [Your name]

Demo: [vercel URL]
Code: [github URL]
```

---

## General rules for every cover letter

- **First sentence must reference a specific detail** from their job post. Generic openers get ignored.
- **Lead with proof** (the demo link), not your credentials.
- **End with a clear next step** ("hop on a call this week" — not "let me know if you have questions").
- **No "I'm passionate about…"** — clients see hundreds of those.
- **Quote a range, not a single number.** Anchors the conversation without painting yourself into a corner.
- **Always include three links**: demo, GitHub, Loom. Even if one is overkill, the volume signals seriousness.
