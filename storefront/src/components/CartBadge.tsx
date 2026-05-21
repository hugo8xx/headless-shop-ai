'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getCartToken, subscribe } from '@/lib/cart-store';

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const token = getCartToken();
      if (!token) {
        if (!cancelled) setCount(0);
        return;
      }
      try {
        const res = await fetch(`/api/cart?token=${token}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          setCount(json.data.item_count ?? 0);
        }
      } catch {
        if (!cancelled) setCount(0);
      }
    }

    refresh();
    const unsub = subscribe(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
