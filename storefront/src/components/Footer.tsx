import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-zinc-50">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <p className="text-xl font-semibold tracking-tight">Northshelf</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Better goods, sent daily. Curated electronics, apparel, home, and outdoor essentials —
            shipped from Bangkok with care.
          </p>
          <div className="flex gap-2 pt-1 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="rounded-full p-2 hover:bg-zinc-200 hover:text-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="rounded-full p-2 hover:bg-zinc-200 hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="rounded-full p-2 hover:bg-zinc-200 hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/products" className="hover:underline">All products</Link></li>
            <li><Link href="/products?category=audio" className="hover:underline">Audio</Link></li>
            <li><Link href="/products?category=fashion" className="hover:underline">Apparel</Link></li>
            <li><Link href="/products?category=home" className="hover:underline">Home</Link></li>
            <li><Link href="/products?category=sports" className="hover:underline">Outdoor</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Help</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/orders" className="hover:underline">Track an order</Link></li>
            <li><Link href="/search" className="hover:underline">AI product finder</Link></li>
            <li><a href="#" className="hover:underline">Shipping & returns</a></li>
            <li><a href="#" className="hover:underline">Contact us</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stay in the loop</p>
          <p className="text-sm text-muted-foreground">New drops, early access, and a 10% welcome code.</p>
          <form className="flex gap-2">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <button type="submit" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Northshelf Goods Co., Ltd. · Bangkok, Thailand</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
