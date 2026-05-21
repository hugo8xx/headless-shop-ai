import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield, MessageSquare } from 'lucide-react';
import { AISearchBar } from '@/components/AISearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import { odooApi } from '@/lib/odoo-api';

export const revalidate = 60;

export default async function HomePage() {
  let featured = [] as Awaited<ReturnType<typeof odooApi.listProducts>>;
  let categories = [] as Awaited<ReturnType<typeof odooApi.listCategories>>;
  try {
    [featured, categories] = await Promise.all([
      odooApi.listProducts({ limit: 8 }),
      odooApi.listCategories(),
    ]);
  } catch (err) {
    console.error('Failed to load home data', err);
  }

  return (
    <>
      <section className="container mx-auto pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-powered storefront, Odoo-powered backend
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Shop smarter. <span className="text-accent">Ask anything.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe what you need in plain English and our AI will surface the right products,
            answer your questions, and explain why each pick fits.
          </p>
          <AISearchBar />
        </div>
      </section>

      <section className="container mx-auto space-y-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Semantic AI search', body: 'Find products by describing the problem, not the SKU.' },
            { icon: MessageSquare, title: 'Product Q&A', body: 'Ask AI questions about any item — answered from real data.' },
            { icon: Truck, title: 'Fast & reliable', body: 'Backed by Odoo for real-time inventory and order management.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <f.icon className="mb-3 h-5 w-5 text-accent" />
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured products</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {categories.length > 0 && (
        <section className="container mx-auto space-y-6 pb-20">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="rounded-2xl border bg-card p-4 text-center text-sm font-medium transition-shadow hover:shadow-md"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto pb-20">
        <div className="rounded-3xl border bg-gradient-to-br from-muted to-background p-8 md:p-12">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Shield className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Built on the Odoo you already trust.
              </h2>
              <p className="text-muted-foreground">
                The merchant manages products, inventory, and orders in Odoo Web UI exactly as before.
                Customers get a modern Next.js storefront. No workflow disruption.
              </p>
            </div>
            <div className="rounded-2xl bg-card p-4 font-mono text-xs leading-relaxed shadow-sm">
              <p className="text-muted-foreground">// Customers see this →</p>
              <p>Next.js · Tailwind · AI search · Mobile-first</p>
              <p className="mt-2 text-muted-foreground">// Admin sees this →</p>
              <p>Odoo Web UI · Inventory · Orders · Reports</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
