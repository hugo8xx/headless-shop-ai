'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = { role: 'user' | 'assistant'; text: string };

export function AIProductChat({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: question };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, question }),
      });
      const json = await res.json();
      const answer = json.success ? json.data.answer : `Sorry — ${json.error?.message || 'something went wrong.'}`;
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, the assistant is unavailable right now.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-medium">Ask AI about this product</span>
        </div>
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Try: <em>Is the {productName} good for travel?</em>
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground'
                    : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm'
                }
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-muted-foreground">
                Thinking…
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" disabled={loading || !input.trim()} variant="accent" size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
