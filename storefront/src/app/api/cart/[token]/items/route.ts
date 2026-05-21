import { NextRequest, NextResponse } from 'next/server';
import { odooApi } from '@/lib/odoo-api';

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  try {
    const data = await odooApi.addToCart(token, String(body.product_id), Number(body.qty ?? 1));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'ADD_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}
