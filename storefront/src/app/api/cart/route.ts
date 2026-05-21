import { NextRequest, NextResponse } from 'next/server';
import { odooApi } from '@/lib/odoo-api';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_TOKEN', message: 'token required' } },
      { status: 400 },
    );
  }
  try {
    const data = await odooApi.getCart(token);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'CART_FETCH_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}

export async function POST() {
  try {
    const data = await odooApi.createCart();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'CART_CREATE_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}
