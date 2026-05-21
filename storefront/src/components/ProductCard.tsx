import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { odooImageUrl } from '@/lib/odoo-api';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug || product.id}`;
  const img = odooImageUrl(product.image_url) || `https://source.unsplash.com/600x600/?${encodeURIComponent(product.name)}`;
  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden rounded-2xl border bg-card transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              Out of stock
            </Badge>
          )}
        </div>
        <div className="space-y-1.5 p-4">
          {product.category && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category.name}</p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
          <p className="font-mono text-base font-semibold text-accent">{formatPrice(product.price, product.currency)}</p>
        </div>
      </article>
    </Link>
  );
}
