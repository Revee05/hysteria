import { NextResponse } from 'next/server';
import { trackView } from '@/modules/public/platform/services/platform.public.service.js';

/**
 * Endpoint publik untuk catat view konten platform.
 * Menggunakan method PATCH (parsial update).
 */
export async function PATCH(request, { params }) {
  const { id } = (await params) || {};

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 });
  }

  try {
    const updated = await trackView(id);
    return NextResponse.json({ success: true, count: updated?.views });
  } catch (error) {
    console.error('[API][PublicView] Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mencatat view' }, { status: 500 });
  }
}
