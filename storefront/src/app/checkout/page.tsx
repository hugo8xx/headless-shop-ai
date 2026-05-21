'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { clearCartToken, getCartToken, notify } from '@/lib/cart-store';
import type { Cart } from '@/lib/types';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(2, 'Required'),
  street: z.string().min(3, 'Required'),
  city: z.string().min(2, 'Required'),
  zip: z.string().min(3, 'Required'),
  country_code: z.string().min(2, 'Required').default('TH'),
  phone: z.string().min(6, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country_code: 'TH' },
  });

  useEffect(() => {
    const token = getCartToken();
    if (!token) {
      router.push('/cart');
      return;
    }
    fetch(`/api/cart?token=${token}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCart(j.data);
        else router.push('/cart');
      });
  }, [router]);

  async function onSubmit(values: FormValues) {
    const token = getCartToken();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/checkout/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          shipping: {
            name: values.name,
            street: values.street,
            city: values.city,
            zip: values.zip,
            country_code: values.country_code,
            phone: values.phone,
          },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || 'Checkout failed');
        return;
      }
      clearCartToken();
      notify();
      router.push(`/orders/${json.data.order_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <fieldset className="space-y-3 rounded-2xl border bg-card p-6">
            <legend className="px-2 text-sm font-semibold">Contact</legend>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="you@example.com" />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border bg-card p-6">
            <legend className="px-2 text-sm font-semibold">Shipping address</legend>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...form.register('name')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="street">Street address</Label>
                <Input id="street" {...form.register('street')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register('city')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip">Postal code</Label>
                <Input id="zip" {...form.register('zip')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country_code">Country code (ISO-2)</Label>
                <Input id="country_code" {...form.register('country_code')} defaultValue="TH" />
              </div>
            </div>
          </fieldset>

          <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Payment is mocked for this portfolio demo — confirming the order will mark it as paid in Odoo.
          </div>

          {error && <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="accent" size="lg" disabled={submitting} className="w-full md:w-auto">
            {submitting ? 'Placing order…' : 'Place order'}
          </Button>
        </form>
      </section>

      {cart && (
        <aside className="h-fit space-y-3 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Summary</h2>
          {cart.items.map((l) => (
            <div key={l.id} className="flex justify-between text-sm">
              <span>{l.product_name} × {l.qty}</span>
              <span className="font-mono">{formatPrice(l.subtotal, cart.currency)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatPrice(cart.total, cart.currency)}</span>
          </div>
        </aside>
      )}
    </div>
  );
}
