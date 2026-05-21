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

  const activeCategory = categories.find((c) => c.id === category);
  const title = activeCategory ? activeCategory.name : 'Shop all';

  return (
    <div className="container mx-auto space-y-10 py-12">
      <header className="space-y-5">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Shop</Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-foreground">{activeCategory.name}</span>
            </>
          )}
        </nav>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? 'item' : 'items'} · Sorted by newest
            </p>
          </div>
          <div className="md:max-w-md md:flex-1">
            <AISearchBar size="md" />
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Categories
            </p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href="/products"
                  className={!category ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}
                >
                  All products
                </Link>
              </li>
              {categories
                .filter((c) => c.product_count > 0)
                .map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.id}`}
                      className={
                        category === c.id
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }
                    >
                      {c.name}{' '}
                      <span className="text-xs text-muted-foreground">({c.product_count})</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">AI shortcut</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Stuck? Tell our AI what you're looking for in your own words.
            </p>
            <Link href="/search" className="mt-3 inline-flex text-sm font-medium hover:text-accent">
              Try AI search →
            </Link>
          </div>
        </aside>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
