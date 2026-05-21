'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

export function AIRecommendations({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, limit: 4 }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setProducts(json.data.products || []);
          setReasoning(json.data.reasoning || '');
        } else {
          setProducts([]);
        }
      })
      .catch(() => !cancelled && setProducts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          AI is finding similar items…
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-accent" />
          You might also like
        </div>
        {reasoning && <p className="text-sm text-muted-foreground">{reasoning}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
