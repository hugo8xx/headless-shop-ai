import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { AISearchBar } from '@/components/AISearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import { odooApi } from '@/lib/odoo-api';

export const revalidate = 60;

const TRUST_ITEMS = [
  { icon: Truck, title: 'Free shipping over ฿1,500', body: 'Standard 2-day delivery across Thailand' },
  { icon: RotateCcw, title: '30-day returns', body: 'No questions, no restocking fees' },
  { icon: ShieldCheck, title: 'Secure checkout', body: 'PromptPay, credit, and bank transfer' },
  { icon: Leaf, title: 'Curated, not crowded', body: 'Every product hand-picked by our team' },
];

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof odooApi.listProducts>> = [];
  let categories: Awaited<ReturnType<typeof odooApi.listCategories>> = [];
  try {
    [featured, categories] = await Promise.all([
      odooApi.listProducts({ limit: 8 }),
      odooApi.listCategories(),
    ]);
  } catch (err) {
    console.error('Failed to load home data', err);
  }

  const featuredHero = featured[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-zinc-50">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-zinc-200">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              New: AI product finder
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Better goods,<br />
              <span className="text-accent">found by AI.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Describe what you're looking for in your own words — our AI reads the catalogue and surfaces
              the right picks with a short explanation. No more guessing at search terms.
            </p>
            <AISearchBar size="lg" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Live inventory from Odoo
              </span>
              <span>Ships from Bangkok</span>
            </div>
          </div>

          {featuredHero && (
            <Link
              href={`/products/${featuredHero.slug || featuredHero.id}`}
              className="group relative aspect-[5/6] overflow-hidden rounded-3xl bg-zinc-200 shadow-xl"
            >
              <Image
                src={featuredHero.image_url || ''}
                alt={featuredHero.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">Editor's pick</p>
                <p className="mt-1 text-lg font-semibold">{featuredHero.name}</p>
                <p className="mt-1 text-sm opacity-90">From ฿{featuredHero.price.toLocaleString()}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-white">
        <div className="container grid gap-6 py-8 md:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto space-y-7 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">This week</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Featured drops</h2>
          </div>
          <Link href="/products" className="hidden items-center gap-1 text-sm font-medium hover:text-accent md:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* CATEGORY TILES */}
      {categories.length > 0 && (
        <section className="bg-zinc-50">
          <div className="container space-y-7 py-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Shop by category</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Find your shelf</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className="group rounded-2xl border bg-white p-5 text-center transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-medium group-hover:text-accent">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.product_count} items</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI BANNER */}
      <section className="container py-16">
        <div className="overflow-hidden rounded-3xl bg-zinc-900 text-white">
          <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Ask anything. Get the right answer.
              </h2>
              <p className="text-zinc-300">
                Every product page has an "Ask AI" widget grounded in real product data.
                "Is this waterproof?", "will it fit my 16-inch laptop?", "good for travel?" —
                ask honestly, get honest answers.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Try AI search <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <p className="text-xs text-zinc-400">You</p>
              <p className="mt-1 text-sm">Is the Drift Down Jacket warm enough for Hokkaido in February?</p>
              <p className="mt-4 text-xs text-zinc-400">Northshelf AI</p>
              <p className="mt-1 text-sm">
                Yes — it's an 800-fill down jacket tested to -10°C, which matches typical Hokkaido February
                lows. Pair it with a thermal layer for windier days. <span className="text-zinc-500">— grounded in product description</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
