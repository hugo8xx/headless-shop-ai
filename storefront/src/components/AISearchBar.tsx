'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EXAMPLES = [
  'warm jacket for winter hiking',
  'gift for a coffee-obsessed dad',
  'something quiet for late-night work',
  'minimalist desk setup under ฿10,000',
];

export function AISearchBar({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(q: string) {
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className={size === 'lg' ? 'space-y-4' : 'space-y-2'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className={
          size === 'lg'
            ? 'flex items-center gap-2 rounded-full border-2 border-foreground/10 bg-background px-2 py-2 shadow-lg ring-4 ring-accent/10 transition focus-within:ring-accent/30'
            : 'flex items-center gap-2 rounded-full border bg-background px-2 py-1.5'
        }
      >
        <Sparkles className="ml-3 h-5 w-5 text-accent" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe what you need — AI will find it"
          className={
            size === 'lg'
              ? 'flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground'
              : 'flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          }
        />
        <Button type="submit" size={size === 'lg' ? 'lg' : 'sm'} variant="accent">
          <Search className="h-4 w-4" />
          {size === 'lg' && 'Ask AI'}
        </Button>
      </form>
      {size === 'lg' && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => submit(ex)}
              className="rounded-full border bg-background px-3 py-1 transition hover:bg-muted"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
