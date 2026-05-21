'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OrderLookupPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  return (
    <div className="container mx-auto max-w-md space-y-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Track your order</h1>
      <p className="text-muted-foreground">Enter the order token you received at checkout.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (token.trim()) router.push(`/orders/${encodeURIComponent(token.trim())}`);
        }}
        className="space-y-3"
      >
        <Label htmlFor="token">Order token</Label>
        <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="abc123…" />
        <Button type="submit" variant="accent" className="w-full">
          Look up order
        </Button>
      </form>
    </div>
  );
}
