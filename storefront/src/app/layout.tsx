import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Northshelf — Better goods, found by AI',
    template: '%s · Northshelf',
  },
  description:
    'Curated electronics, apparel, home, and outdoor essentials. Ask our AI for picks in plain English — shipped from Bangkok with free 2-day delivery over ฿1,500.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Northshelf — Better goods, found by AI',
    description: 'Curated everyday essentials with AI-powered search. Ships from Bangkok.',
    siteName: 'Northshelf',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
