import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
        No products to show.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
