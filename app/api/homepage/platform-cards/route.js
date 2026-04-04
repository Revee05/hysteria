import { NextResponse } from "next/server";
import { getHomepagePlatformCards } from "../../../../modules/public/platform/services/platform.public.service.js";

export async function GET() {
  try {
    const cards = await getHomepagePlatformCards();
    return NextResponse.json({ success: true, data: cards });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
