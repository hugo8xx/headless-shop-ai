// Captures portfolio screenshots from the local Northshelf storefront.
// Run: node scripts/capture-screenshots.mjs (after `npm i -D playwright`)

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.SHOP_URL || 'http://localhost:3001';
const OUT = resolve(process.cwd(), 'upwork/screenshots');

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const PAGES = [
  // name, url, viewport, fullPage, optional waitForSelector, optional pre-action
  { name: '01-hero-desktop', url: '/', viewport: DESKTOP, fullPage: false },
  { name: '02-home-full-desktop', url: '/', viewport: DESKTOP, fullPage: true },
  { name: '03-products-list-desktop', url: '/products', viewport: DESKTOP, fullPage: true },
  { name: '04-product-detail-desktop', url: '/products/aura-pro-wireless-headphones', viewport: DESKTOP, fullPage: true },
  { name: '05-search-empty-desktop', url: '/search', viewport: DESKTOP, fullPage: false },
  { name: '06-search-with-query-desktop', url: '/search?q=warm+jacket+for+hokkaido', viewport: DESKTOP, fullPage: true, waitMs: 6000 },
  { name: '07-cart-empty-desktop', url: '/cart', viewport: DESKTOP, fullPage: false },
  { name: '08-checkout-desktop', url: '/checkout', viewport: DESKTOP, fullPage: false },
  { name: '09-orders-lookup-desktop', url: '/orders', viewport: DESKTOP, fullPage: false },

  { name: '10-hero-mobile', url: '/', viewport: MOBILE, fullPage: false },
  { name: '11-home-full-mobile', url: '/', viewport: MOBILE, fullPage: true },
  { name: '12-products-mobile', url: '/products', viewport: MOBILE, fullPage: true },
  { name: '13-product-detail-mobile', url: '/products/aura-pro-wireless-headphones', viewport: MOBILE, fullPage: true },
];

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  let ok = 0;
  let fail = 0;

  for (const p of PAGES) {
    const ctx = await browser.newContext({ viewport: p.viewport });
    const page = await ctx.newPage();
    const url = BASE + p.url;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      if (p.waitMs) await page.waitForTimeout(p.waitMs);
      // Give product images a moment to settle (Next/Image lazy load)
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);
      const file = resolve(OUT, `${p.name}.png`);
      await page.screenshot({ path: file, fullPage: p.fullPage });
      console.log(`✓ ${p.name}.png  (${url})`);
      ok++;
    } catch (err) {
      console.error(`✗ ${p.name}  (${url})  → ${err.message}`);
      fail++;
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
  console.log(`\nDone: ${ok} ok, ${fail} failed → ${OUT}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
