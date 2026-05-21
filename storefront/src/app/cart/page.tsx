'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { getCartToken, notify } from '@/lib/cart-store';
import type { Cart } from '@/lib/types';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = getCartToken();
    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/cart?token=${token}`);
    const json = await res.json();
    if (json.success) setCart(json.data);
    else setCart(null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function update(lineId: number, qty: number) {
    const token = getCartToken();
    if (!token) return;
    const res = await fetch(`/api/cart/${token}/items/${lineId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
    });
    const json = await res.json();
    if (json.success) {
      setCart(json.data);
      notify();
    }
  }

  async function remove(lineId: number) {
    const token = getCartToken();
    if (!token) return;
    const res = await fetch(`/api/cart/${token}/items/${lineId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      setCart(json.data);
      notify();
    }
  }

  if (loading) {
    return <div className="container mx-auto py-20 text-center text-muted-foreground">Loading cart…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl space-y-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">Browse the shop or ask the AI for a recommendation.</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/products">Shop now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Ask AI</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <div className="space-y-3">
          {cart.items.map((line) => (
            <div key={line.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                {line.image_url && (
                  <Image
                    src={line.image_url.startsWith('http') ? line.image_url : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${line.image_url}`}
                    alt={line.product_name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{line.product_name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(line.unit_price, cart.currency)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update(line.id, Math.max(1, line.qty - 1))}
                  className="h-8 w-8 rounded-full border hover:bg-muted"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono">{line.qty}</span>
                <button
                  onClick={() => update(line.id, line.qty + 1)}
                  className="h-8 w-8 rounded-full border hover:bg-muted"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-mono font-semibold">{formatPrice(line.subtotal, cart.currency)}</p>
              <button
                onClick={() => remove(line.id)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-mono">{formatPrice(cart.subtotal, cart.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="font-mono">{formatPrice(cart.tax, cart.currency)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="font-mono">{formatPrice(cart.total, cart.currency)}</dd>
          </div>
        </dl>
        <Button asChild variant="accent" size="lg" className="w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </aside>
    </div>
  );
}
