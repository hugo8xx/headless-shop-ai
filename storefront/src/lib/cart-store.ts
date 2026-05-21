'use client';

/**
 * Lightweight cart-token persistence. The cart itself lives in Odoo (sale.order
 * in draft state); we only persist the token in localStorage and expose a
 * tiny pub/sub so cart widgets re-render after mutations.
 */
const KEY = 'headless_cart_token';
type Listener = () => void;
const listeners = new Set<Listener>();

export function getCartToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY);
}

export function setCartToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, token);
  listeners.forEach((l) => l());
}

export function clearCartToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  listeners.forEach((l) => l());
}
