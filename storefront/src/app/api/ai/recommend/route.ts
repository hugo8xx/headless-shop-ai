import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chat } from '@/lib/claude';
import { odooApi } from '@/lib/odoo-api';

export const runtime = 'nodejs';

const schema = z.object({
  productId: z.string().min(1),
  limit: z.number().int().min(1).max(8).optional(),
});

const SYSTEM = `You curate cross-sell recommendations for an online store. Given the anchor product and a list of candidates, pick the items that pair best with the anchor (complementary use, similar category, comparable quality tier).
- Return strict JSON: { "ids": ["id1", ...], "reasoning": "one short sentence explaining the theme of the picks." }
- 3 to 4 picks unless the candidate pool is smaller.`;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0]?.message ?? 'invalid' } },
      { status: 400 },
    );
  }
  const { productId, limit = 4 } = parsed.data;

  let anchor;
  let candidates;
  try {
    [anchor, candidates] = await Promise.all([
      odooApi.getProduct(productId),
      odooApi.relatedProducts(productId),
    ]);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: String(err) } },
      { status: 404 },
    );
  }

  if (!candidates.length) {
    return NextResponse.json({ success: true, data: { products: [], reasoning: '' } });
  }

  // Without an API key, just return the candidates as-is.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      success: true,
      data: {
        products: candidates.slice(0, limit),
        reasoning: '',
      },
    });
  }

  const candidateBlock = candidates
    .map((p) => `- id=${p.id}; ${p.name}; ${p.category?.name ?? ''}; price=${p.price}`)
    .join('\n');

  const prompt = `Anchor product:
id=${anchor.id}; ${anchor.name}; ${anchor.category?.name ?? ''}; price=${anchor.price}
Description: ${anchor.description || anchor.ai_description || ''}

Candidate products:
${candidateBlock}

Respond ONLY with strict JSON: { "ids": [...], "reasoning": "..." }`;

  let result: { ids: string[]; reasoning: string } = { ids: [], reasoning: '' };
  try {
    const { text } = await chat(prompt, { system: SYSTEM, cacheSystem: true, maxTokens: 250, temperature: 0.4 });
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const json = JSON.parse(match[0]);
      result = {
        ids: Array.isArray(json.ids) ? json.ids.map(String) : [],
        reasoning: typeof json.reasoning === 'string' ? json.reasoning : '',
      };
    }
  } catch (err) {
    console.warn('Recommend AI failed, returning raw candidates:', err);
  }

  const byId = new Map(candidates.map((p) => [String(p.id), p]));
  const picks = result.ids.map((id) => byId.get(id)).filter(Boolean);
  const final = (picks.length ? picks : candidates).slice(0, limit);

  return NextResponse.json({
    success: true,
    data: { products: final, reasoning: result.reasoning },
  });
}
