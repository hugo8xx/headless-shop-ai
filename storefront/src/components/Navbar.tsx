import Link from 'next/link';
import { Search } from 'lucide-react';
import { CartBadge } from './CartBadge';

export function Navbar() {
  return (
    <>
      <div className="bg-zinc-900 px-4 py-2 text-center text-xs font-medium text-zinc-100">
        Free shipping over ฿1,500 · 30-day returns · AI-powered product search
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold tracking-tight">Northshelf</span>
            <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              Goods
            </span>
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-foreground/80 md:flex">
            <Link href="/products" className="transition-colors hover:text-foreground">
              Shop all
            </Link>
            <Link href="/products?category=audio" className="transition-colors hover:text-foreground">
              Audio
            </Link>
            <Link href="/products?category=fashion" className="transition-colors hover:text-foreground">
              Apparel
            </Link>
            <Link href="/products?category=home" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/products?category=sports" className="transition-colors hover:text-foreground">
              Outdoor
            </Link>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
              aria-label="AI search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <CartBadge />
          </div>
        </div>
      </header>
    </>
  );
}
