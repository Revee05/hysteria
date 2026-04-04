import { NextResponse } from "next/server";
import { getDashboardData } from "@/modules/admin/dashboard/services/dashboard.service";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "weekly";

    const data = await getDashboardData(range);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}