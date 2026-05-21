# Deploy

Three deployment shapes are supported. Pick whichever fits your audience.

## Option A — Localhost demo (free, fastest)

Best for a portfolio recording or local development.

```bash
cp docker/.env.example docker/.env
cp storefront/.env.example storefront/.env.local
cd docker && docker compose up -d
```

1. Open http://localhost:8069, create database `shop` (master password from compose env), install **Headless Shop REST API**.
2. Settings → Headless Shop API → set an API key and CORS origins (`http://localhost:3000`), paste your `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`.
3. Copy the API key into `docker/.env` (`ODOO_API_KEY=...`) and restart the storefront container:
   ```bash
   docker compose restart storefront
   ```
4. Open http://localhost:3000.

## Option B — Vercel (storefront) + DigitalOcean droplet (Odoo)

Cheapest production-grade setup (~$12/month).

### 1. Push two repos to GitHub

```bash
gh repo create headless-shop-odoo-module --public --source=odoo-module --push
gh repo create headless-shop-storefront --public --source=storefront --push
```

### 2. Spin up an Odoo droplet

```bash
# 4GB / 2vCPU Ubuntu 22.04, ~$12/month
ssh root@<droplet-ip>
apt update && apt install -y docker.io docker-compose-plugin git
git clone https://github.com/<you>/headless-shop-odoo-module.git
docker compose -f /path/to/docker-compose.yml up -d
```

Then:
- Point a subdomain (e.g. `admin.yourshop.com`) at the droplet
- Install **Caddy** or **nginx** for HTTPS termination
- Configure the Odoo Headless Shop API settings panel as in Option A

### 3. Deploy the storefront to Vercel

```bash
vercel link
vercel env add ODOO_URL              # https://admin.yourshop.com
vercel env add ODOO_API_KEY          # paste from Odoo settings
vercel env add ANTHROPIC_API_KEY     # sk-ant-...
vercel env add OPENAI_API_KEY        # sk-proj-...
vercel env add NEXT_PUBLIC_SITE_URL  # https://yourshop.com
vercel --prod
```

Add a custom domain in the Vercel dashboard, then update Odoo's **Allowed CORS Origins** to include it.

## Option C — Odoo.sh + Vercel

Best if you need automated Odoo upgrades and snapshots.

1. Push `odoo-module/` to a private GitHub repo and connect it to your Odoo.sh staging branch.
2. Install **Headless Shop REST API** via the Odoo.sh shell:
   ```bash
   odoo-bin -d staging -i headless_shop_api
   ```
3. Configure the settings panel (as above).
4. Deploy the storefront to Vercel pointing `ODOO_URL` at your Odoo.sh staging URL.

## Connection checklist

After connecting frontend ⇆ Odoo:

- [ ] `GET /api/v1/products` returns 20+ demo products
- [ ] CORS preflight (`OPTIONS /api/v1/products`) returns 204 with the right origin header
- [ ] Bearer token is sent only server-side (verify in Network tab: no `Authorization` header on requests from the browser to Odoo)
- [ ] Visit `/search?q=warm+jacket` — Claude returns a reasoning paragraph + ranked products
- [ ] Open a product page — Q&A widget returns answers
- [ ] Add to cart, checkout — the order shows up in Odoo's Sales app immediately
