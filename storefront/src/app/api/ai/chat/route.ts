import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chat } from '@/lib/claude';
import { odooApi } from '@/lib/odoo-api';

export const runtime = 'nodejs';

const schema = z.object({
  productId: z.string().min(1),
  question: z.string().min(2).max(500),
});

const SYSTEM = `You are a helpful product expert. Answer the customer's question using ONLY the product data provided below.
- Be concise (1-3 sentences).
- If the data does not contain the answer, say so honestly and suggest contacting support.
- Never invent specs, materials, certifications, or claims that aren't grounded in the data.
- Speak naturally — no markdown headings, no bullet lists unless they're truly clearer.`;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0]?.message ?? 'invalid' } },
      { status: 400 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { success: false, error: { code: 'AI_DISABLED', message: 'ANTHROPIC_API_KEY not configured' } },
      { status: 503 },
    );
  }

  let product;
  try {
    product = await odooApi.getProduct(parsed.data.productId);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: String(err) } },
      { status: 404 },
    );
  }

  const facts = [
    `Name: ${product.name}`,
    `Category: ${product.category?.name ?? 'n/a'}`,
    `Price: ${product.price} ${product.currency}`,
    `In stock: ${product.in_stock ? 'yes' : 'no'}`,
    `Description: ${product.description || product.ai_description || '(no description)'}`,
  ];
  if (product.attributes?.length) {
    facts.push('Specifications:');
    for (const a of product.attributes) {
      facts.push(`- ${a.name}: ${a.values.join(', ')}`);
    }
  }

  const prompt = `Product data:\n${facts.join('\n')}\n\nCustomer question: ${parsed.data.question}`;

  try {
    const { text } = await chat(prompt, { system: SYSTEM, cacheSystem: true, maxTokens: 300, temperature: 0.3 });
    return NextResponse.json({ success: true, data: { answer: text } });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: String(err) } },
      { status: 502 },
    );
  }
}
