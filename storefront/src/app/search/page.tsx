import { Sparkles } from 'lucide-react';
import { AISearchBar } from '@/components/AISearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import type { Product } from '@/lib/types';

type SearchParams = Promise<{ q?: string }>;

async function callSemanticSearch(query: string): Promise<{ products: Product[]; reasoning: string }> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!json.success) return { products: [], reasoning: '' };
  return { products: json.data.products || [], reasoning: json.data.reasoning || '' };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = q?.trim();

  let products: Product[] = [];
  let reasoning = '';
  if (query) {
    try {
      ({ products, reasoning } = await callSemanticSearch(query));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">AI semantic search</h1>
        <p className="text-muted-foreground">
          Describe what you need. Our AI reads the catalogue, picks the best matches, and explains its choices.
        </p>
        <AISearchBar size="md" />
      </header>

      {query && (
        <section className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-accent" />
              You asked: <span className="font-mono text-muted-foreground">"{query}"</span>
            </div>
            {reasoning ? (
              <p className="mt-3 text-sm text-muted-foreground">{reasoning}</p>
            ) : products.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No matches found — try rephrasing or browse the catalogue.
              </p>
            ) : null}
          </div>
          <ProductGrid products={products} />
        </section>
      )}

      {!query && (
        <section className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
          Type a question above to start.
        </section>
      )}
    </div>
  );
}
