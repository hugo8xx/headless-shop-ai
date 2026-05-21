import Link from 'next/link';
import { AISearchBar } from '@/components/AISearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import { odooApi } from '@/lib/odoo-api';

type SearchParams = Promise<{ category?: string; search?: string; page?: string }>;

export const revalidate = 30;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const category = params.category ? Number(params.category) : undefined;

  let products: Awaited<ReturnType<typeof odooApi.listProducts>> = [];
  let categories: Awaited<ReturnType<typeof odooApi.listCategories>> = [];
  try {
    [products, categories] = await Promise.all([
      odooApi.listProducts({ category, search: params.search, page, limit: 24 }),
      odooApi.listCategories(),
    ]);
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Shop all</h1>
        <AISearchBar size="md" />
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/products" className={!category ? 'font-medium text-accent' : 'hover:underline'}>
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.id}`}
                    className={category === c.id ? 'font-medium text-accent' : 'hover:underline'}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
