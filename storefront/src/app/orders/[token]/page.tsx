import { notFound } from 'next/navigation';
import { Check, Package, Truck } from 'lucide-react';
import { odooApi } from '@/lib/odoo-api';
import { formatPrice } from '@/lib/utils';

type Params = Promise<{ token: string }>;

export const dynamic = 'force-dynamic';

export default async function OrderTrackingPage({ params }: { params: Params }) {
  const { token } = await params;
  let order;
  try {
    order = await odooApi.getOrder(token);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8 py-10">
      <header className="space-y-2 text-center">
        <Check className="mx-auto h-10 w-10 rounded-full bg-accent/10 p-2 text-accent" />
        <h1 className="text-3xl font-semibold tracking-tight">Thank you — order placed!</h1>
        <p className="text-muted-foreground">
          Order <span className="font-mono">{order.order_name}</span> · We've emailed a confirmation to{' '}
          <span className="font-mono">{order.shipping.name}</span>.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {order.timeline.map((step) => (
            <li key={step.state} className="flex items-start gap-3">
              <span
                className={
                  step.done
                    ? 'mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground'
                    : 'mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground'
                }
              >
                {step.state === 'sale' ? <Package className="h-3 w-3" /> : step.state === 'done' ? <Truck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </span>
              <div>
                <p className={step.done ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>{step.label}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="mb-3 text-sm font-semibold">Items</h3>
          <ul className="space-y-2 text-sm">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>{it.product_name} × {it.qty}</span>
                <span className="font-mono">{formatPrice(it.subtotal, order.currency)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(order.total, order.currency)}</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="mb-3 text-sm font-semibold">Shipping to</h3>
          <address className="not-italic text-sm leading-relaxed text-muted-foreground">
            {order.shipping.name}<br />
            {order.shipping.street}<br />
            {order.shipping.city} {order.shipping.zip}<br />
            {order.shipping.country}
          </address>
        </div>
      </section>
    </div>
  );
}
