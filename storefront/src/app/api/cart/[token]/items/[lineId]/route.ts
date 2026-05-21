import { NextRequest, NextResponse } from 'next/server';
import { odooApi } from '@/lib/odoo-api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; lineId: string }> },
) {
  const { token, lineId } = await params;
  const body = await req.json();
  try {
    const data = await odooApi.updateCartLine(token, Number(lineId), Number(body.qty));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; lineId: string }> },
) {
  const { token, lineId } = await params;
  try {
    const data = await odooApi.removeCartLine(token, Number(lineId));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message: String(err) } },
      { status: 502 },
    );
  }
}
