import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CartBadge } from './CartBadge';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-accent" />
          Headless Shop
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/search" className="hover:text-foreground">
            AI Search
          </Link>
          <Link href="/orders" className="hover:text-foreground">
            Track order
          </Link>
        </nav>
        <CartBadge />
      </div>
    </header>
  );
}
