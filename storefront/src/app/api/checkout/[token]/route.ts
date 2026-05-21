import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { odooApi } from '@/lib/odoo-api';

const schema = z.object({
  email: z.string().email(),
  shipping: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
    country_code: z.string().min(2),
    phone: z.string().min(1),
  }),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0]?.message ?? 'invalid' } },
      { status: 400 },
    );
  }
  try {
    const data = await odooApi.checkout(token, parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'CHECKOUT_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}
