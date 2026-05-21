/**
 * Server-only wrapper around the Anthropic SDK.
 * Centralises model selection, prompt caching, and a small retry helper so each
 * AI route reads naturally.
 */
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

type Block = { type: 'text'; text: string };

export type ChatOptions = {
  system?: string;
  cacheSystem?: boolean;
  maxTokens?: number;
  temperature?: number;
};

export async function chat(prompt: string, opts: ChatOptions = {}) {
  const { system, cacheSystem = false, maxTokens = 1024, temperature = 0.4 } = opts;
  const systemBlocks: Block[] | string | undefined = system
    ? cacheSystem
      ? ([{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] as unknown as Block[])
      : system
    : undefined;

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    system: systemBlocks as unknown as string,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return { text, usage: res.usage };
}

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const EMBED_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

export async function embed(text: string): Promise<number[]> {
  if (!OPENAI_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI embeddings error: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0]?.embedding ?? [];
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
