'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCartToken, setCartToken, notify } from '@/lib/cart-store';

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function add() {
    setLoading(true);
    try {
      let token = getCartToken();
      if (!token) {
        const r = await fetch('/api/cart', { method: 'POST' });
        const j = await r.json();
        if (!j.success) throw new Error(j.error?.message || 'cart create failed');
        token = j.data.token as string;
        setCartToken(token);
      }
      const r = await fetch(`/api/cart/${token}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, qty: 1 }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.error?.message || 'add failed');
      notify();
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={add} disabled={disabled || loading} variant="accent" size="lg" className="w-full md:w-auto">
      <ShoppingBag className="h-4 w-4" />
      {loading ? 'Adding…' : done ? 'Added!' : 'Add to cart'}
    </Button>
  );
}
