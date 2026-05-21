# Screenshot capture guide

Reviewers spend more time on screenshots than on prose. Aim for 8–10 clean shots.

## Setup

1. `cd docker && docker compose up -d` — start Odoo + Postgres + storefront
2. Open Odoo at http://localhost:8069, create database, install the module
3. Configure the Headless Shop API panel (set an API key, paste AI keys)
4. Restart storefront: `docker compose restart storefront`
5. Open http://localhost:3000

## Capture sizes

| Surface      | Width  | Notes                                       |
|--------------|--------|---------------------------------------------|
| Desktop      | 1440px | Cmd+Shift+5 → "Capture Selected Window"     |
| Mobile       | 390px  | Chrome DevTools → iPhone 14 Pro             |
| Hero/landing | 1920px | Full-bleed, used as the portfolio thumbnail |

## Shot list (in display order)

1. **Hero** — `/` desktop · 1920×1080
   - Frame so the AI search bar is centered and one example pill is visible
   - Filename: `01-hero-desktop.png`

2. **AI semantic search** — `/search?q=warm+jacket+for+winter+hiking` desktop · 1440×900
   - Wait for results to load before capturing
   - Make sure Claude's reasoning paragraph is visible above the grid
   - Filename: `02-ai-search.png`

3. **Product detail with chat open** — `/products/aura-pro-wireless-headphones` desktop · 1440×1200
   - Open the "Ask AI" widget, type "Is this good for travel?", wait for answer
   - Crop to show the question + answer in the chat panel
   - Filename: `03-product-qa.png`

4. **AI recommendations** — scroll to bottom of same product page · 1440×600
   - Capture the "You might also like" row with Claude's one-line reasoning
   - Filename: `04-ai-recommendations.png`

5. **Cart** — `/cart` with 3 items desktop · 1440×900
   - Add a few products first so the summary sidebar has interesting numbers
   - Filename: `05-cart.png`

6. **Checkout** — `/checkout` desktop · 1440×1200
   - Fill all fields with believable data before capturing
   - Filename: `06-checkout.png`

7. **Order confirmation** — `/orders/[token]` desktop · 1440×900
   - The success page with timeline, items, and shipping address
   - Filename: `07-order-confirmation.png`

8. **Odoo admin — order arrived** — Odoo Web UI · 1440×900
   - Navigate to Sales → Orders, open the just-placed order
   - This is the money shot: proves the headless integration round-trips
   - Filename: `08-odoo-admin.png`

9. **Mobile home** — `/` iPhone 14 Pro · 390×844
   - Hero section, fully visible search bar
   - Filename: `09-mobile-home.png`

10. **Mobile product** — `/products/[slug]` iPhone 14 Pro · 390×900
    - Show the product image, price, add-to-cart, and chat widget
    - Filename: `10-mobile-product.png`

## Optimisation

```bash
# After capturing, optimise PNGs (loseless ~70% smaller)
brew install pngquant
pngquant --quality=85-95 --skip-if-larger --output 01-hero-desktop.opt.png 01-hero-desktop.png

# Or batch:
for f in *.png; do pngquant --quality=85-95 --skip-if-larger --ext .opt.png "$f"; done
```

Upwork accepts JPG/PNG up to ~10MB each.

## Stuck on no products?

If Odoo's demo data didn't auto-load:

```bash
docker compose exec odoo odoo -d shop -i headless_shop_api --no-http --stop-after-init
docker compose restart odoo
```
