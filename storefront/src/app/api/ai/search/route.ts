import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chat, cosineSimilarity, embed } from '@/lib/claude';
import { odooApi } from '@/lib/odoo-api';

export const runtime = 'nodejs';

const schema = z.object({
  query: z.string().min(2).max(500),
  limit: z.number().int().min(1).max(30).optional(),
});

const SYSTEM_PROMPT = `You are a friendly product assistant for an online store.
You receive a customer query and a shortlist of catalogue items. Your job:
1. Pick the items that genuinely match the customer's need.
2. Order them best-first.
3. Briefly (2-3 sentences) explain in plain language why these items fit, without listing them by ID — the UI shows them as cards next to your text.

Return strict JSON with shape: { "ids": ["id1", "id2", ...], "reasoning": "..." }`;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0]?.message ?? 'invalid' } },
      { status: 400 },
    );
  }
  const { query, limit = 8 } = parsed.data;

  let corpus;
  try {
    corpus = await odooApi.embeddingsCorpus();
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'CATALOGUE_UNAVAILABLE', message: String(err) } },
      { status: 502 },
    );
  }

  let shortlist = corpus;
  // Pre-rank via embeddings if OpenAI is configured AND we have product embeddings.
  if (process.env.OPENAI_API_KEY) {
    try {
      const queryVec = await embed(query);
      const ranked = corpus
        .map((p) => {
          const productVec = safeParseEmbedding(p.embedding);
          const sim = productVec ? cosineSimilarity(queryVec, productVec) : keywordOverlap(query, p.text);
          return { ...p, sim };
        })
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 20);
      shortlist = ranked;
    } catch (err) {
      console.warn('Embedding rerank failed, falling back to keyword overlap:', err);
      shortlist = corpus
        .map((p) => ({ ...p, sim: keywordOverlap(query, p.text) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 20);
    }
  } else {
    shortlist = corpus
      .map((p) => ({ ...p, sim: keywordOverlap(query, p.text) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 20);
  }

  const catalogueBlock = shortlist
    .map((p) => `- id=${p.id}; ${p.name}; category=${p.category}; price=${p.price}; ${truncate(p.text, 200)}`)
    .join('\n');

  const prompt = `Customer query: "${query}"

Shortlist of candidate products:
${catalogueBlock}

Respond ONLY with strict JSON: { "ids": [...], "reasoning": "..." }`;

  let answer: { ids: string[]; reasoning: string } = { ids: [], reasoning: '' };
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { text } = await chat(prompt, { system: SYSTEM_PROMPT, cacheSystem: true, maxTokens: 500 });
      answer = parseClaudeJson(text);
    } catch (err) {
      console.warn('Claude call failed, returning raw ranked list:', err);
    }
  }

  // Fallback: if Claude didn't return ids, use the top similarity slice.
  if (!answer.ids.length) {
    answer.ids = shortlist.slice(0, limit).map((p) => p.id);
    answer.reasoning = answer.reasoning || `Here are the closest matches I could find for "${query}".`;
  }

  // Resolve products via Odoo (full payload).
  const products = await Promise.all(
    answer.ids.slice(0, limit).map((id) => odooApi.getProduct(id).catch(() => null)),
  );

  return NextResponse.json({
    success: true,
    data: { products: products.filter(Boolean), reasoning: answer.reasoning },
  });
}

function safeParseEmbedding(raw: string): number[] | null {
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

function keywordOverlap(query: string, text: string): number {
  const q = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const t = text.toLowerCase();
  if (!q.length) return 0;
  return q.reduce((acc, term) => acc + (t.includes(term) ? 1 : 0), 0) / q.length;
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n) + '…';
}

function parseClaudeJson(text: string): { ids: string[]; reasoning: string } {
  // Claude sometimes wraps JSON in prose or fences — extract the first {...} block.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { ids: [], reasoning: text.trim().slice(0, 400) };
  try {
    const json = JSON.parse(match[0]);
    return {
      ids: Array.isArray(json.ids) ? json.ids.map(String) : [],
      reasoning: typeof json.reasoning === 'string' ? json.reasoning : '',
    };
  } catch {
    return { ids: [], reasoning: text.trim().slice(0, 400) };
  }
}
