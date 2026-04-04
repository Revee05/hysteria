"use server";

import { trackEventView } from "../services/event.service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Server action to increment views for an event
 * @param {string} slug 
 */
export async function trackEventViewAction(slug) {
  if (!slug) return null;
  
  try {
    // Direct update to ensure it hits the DB
    const result = await prisma.event.update({
      where: { slug },
      data: { views: { increment: 1 } }
    });
    
    console.log(`[ACTION] Views incremented for ${slug}: ${result.views}`);
    
    // Force Next.js to clear cache for this page
    revalidatePath(`/event/${slug}`);
    
    return result;
  } catch (error) {
    console.error(`[ACTION ERROR] Failed to increment views for ${slug}:`, error.message);
    // Fallback to service if direct update fails for some reason
    return await trackEventView(slug);
  }
}
