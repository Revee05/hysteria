import { NextResponse } from "next/server";
import { respondSuccess, respondError, AppError } from "../../../../lib/response";
import * as heroService from "../../../../modules/admin/hero/services/hero.service.js";

// GET - Fetch active hero section (public endpoint)
export async function GET(request) {
  try {
    const hero = await heroService.getActiveHero();
    return respondSuccess(hero, 200);
  } catch (error) {
    console.error("Error fetching active hero:", error);
    return respondError(new AppError("Failed to fetch active hero", 500));
  }
}
