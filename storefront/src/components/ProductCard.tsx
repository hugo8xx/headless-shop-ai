import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { odooImageUrl } from '@/lib/odoo-api';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug || product.id}`;
  const img = odooImageUrl(product.image_url);
  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
          {img && (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute left-3 top-3 bg-white/95 backdrop-blur">
              Sold out
            </Badge>
          )}
        </div>
        <div className="space-y-1 pt-4">
          {product.category && (
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {product.category.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
          <p className="pt-0.5 font-mono text-sm font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </article>
    </Link>
  );
}
