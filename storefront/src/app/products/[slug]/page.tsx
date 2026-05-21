import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { AIProductChat } from '@/components/AIProductChat';
import { AIRecommendations } from '@/components/AIRecommendations';
import { AddToCartButton } from '@/components/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import { odooApi, odooImageUrl } from '@/lib/odoo-api';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  let product;
  try {
    product = await odooApi.getProduct(slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const heroImage =
    odooImageUrl(product.images?.[0] || product.image_url) ||
    `https://source.unsplash.com/1200x1200/?${encodeURIComponent(product.name)}`;

  return (
    <div className="container mx-auto space-y-16 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
          <Image src={heroImage} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <Badge variant="secondary" className="rounded-full">
                {product.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
            <p className="font-mono text-2xl font-semibold text-accent">{formatPrice(product.price, product.currency)}</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span
              className={
                product.in_stock
                  ? 'inline-flex h-2 w-2 rounded-full bg-emerald-500'
                  : 'inline-flex h-2 w-2 rounded-full bg-red-500'
              }
            />
            {product.in_stock ? `${product.qty_available} in stock — ships within 2 days` : 'Out of stock'}
          </div>

          <AddToCartButton productId={product.id} disabled={!product.in_stock} />

          {(product.description || product.ai_description) && (
            <div className="prose prose-sm prose-zinc max-w-none pt-4">
              {product.description && <p className="text-muted-foreground">{product.description}</p>}
              {product.ai_description && (
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: product.ai_description }} />
              )}
            </div>
          )}

          <AIProductChat productId={product.id} productName={product.name} />

          {product.attributes && product.attributes.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Specifications</h3>
              <dl className="space-y-2 text-sm">
                {product.attributes.map((a) => (
                  <div key={a.name} className="flex justify-between gap-4 border-b pb-1 last:border-0">
                    <dt className="text-muted-foreground">{a.name}</dt>
                    <dd>{a.values.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <AIRecommendations productId={product.id} />
    </div>
  );
}
