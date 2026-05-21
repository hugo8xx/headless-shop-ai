/**
 * Server-side wrapper around the Odoo headless REST API.
 * This file MUST NOT be imported from a Client Component — it reads server-only env vars.
 */
import type { ApiEnvelope, Cart, Category, Order, Product } from './types';

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  cache?: RequestCache;
  revalidate?: number;
  query?: Record<string, string | number | undefined>;
};

async function odooFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = 'GET', body, cache, revalidate, query } = opts;
  const qs = query
    ? '?' +
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const url = `${ODOO_URL}${path}${qs}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ODOO_API_KEY) headers.Authorization = `Bearer ${ODOO_API_KEY}`;

  const init: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
  if (cache) init.cache = cache;
  if (revalidate !== undefined) init.next = { revalidate };

  const res = await fetch(url, init);
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success) {
    throw new Error(`Odoo API error: ${json.error.code} — ${json.error.message}`);
  }
  return json.data;
}

export const odooApi = {
  listProducts(params: {
    category?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }) {
    return odooFetch<Product[]>('/api/v1/products', { query: params, revalidate: 60 });
  },

  getProduct(id: string) {
    return odooFetch<Product>(`/api/v1/products/${encodeURIComponent(id)}`, { revalidate: 60 });
  },

  relatedProducts(id: string) {
    return odooFetch<Product[]>(`/api/v1/products/${encodeURIComponent(id)}/related`, {
      revalidate: 300,
    });
  },

  listCategories() {
    return odooFetch<Category[]>('/api/v1/categories', { revalidate: 600 });
  },

  textSearch(q: string) {
    return odooFetch<Product[]>('/api/v1/search', { query: { q }, revalidate: 30 });
  },

  embeddingsCorpus() {
    return odooFetch<
      {
        id: string;
        name: string;
        slug: string;
        price: number;
        category: string;
        text: string;
        embedding: string;
      }[]
    >('/api/v1/search/embeddings', { revalidate: 300 });
  },

  createCart() {
    return odooFetch<Cart>('/api/v1/cart', { method: 'POST', cache: 'no-store' });
  },

  getCart(token: string) {
    return odooFetch<Cart>(`/api/v1/cart/${token}`, { cache: 'no-store' });
  },

  addToCart(token: string, product_id: string, qty = 1) {
    return odooFetch<Cart>(`/api/v1/cart/${token}/items`, {
      method: 'POST',
      body: { product_id, qty },
      cache: 'no-store',
    });
  },

  updateCartLine(token: string, line_id: number, qty: number) {
    return odooFetch<Cart>(`/api/v1/cart/${token}/items/${line_id}`, {
      method: 'PATCH',
      body: { qty },
      cache: 'no-store',
    });
  },

  removeCartLine(token: string, line_id: number) {
    return odooFetch<Cart>(`/api/v1/cart/${token}/items/${line_id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
  },

  checkout(
    token: string,
    payload: {
      email: string;
      shipping: {
        name: string;
        street: string;
        city: string;
        zip: string;
        country_code: string;
        phone: string;
      };
    },
  ) {
    return odooFetch<{
      order_id: number;
      order_token: string;
      order_name: string;
      total: number;
      payment_url: string;
    }>(`/api/v1/checkout/${token}`, { method: 'POST', body: payload, cache: 'no-store' });
  },

  getOrder(token: string, email?: string) {
    return odooFetch<Order>(`/api/v1/orders/${token}`, {
      query: email ? { email } : undefined,
      cache: 'no-store',
    });
  },
};

export function odooImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${ODOO_URL}${path}`;
}

// Browser-safe variant used by client components that don't have access to ODOO_URL.
// External URLs (Unsplash etc.) pass through; relative paths are returned as-is and
// served by the Next.js dev proxy or directly by Odoo when same-origin.
export function clientImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
}
