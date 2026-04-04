"use client";

import { useEffect, useRef } from "react";
import { trackEventViewAction } from "../../modules/public/events/actions/event.actions";

/**
 * ViewsTracker component to track page views for a specific event
 * @param {Object} props
 * @param {string} props.slug - The slug of the event to track
 */
export default function ViewsTracker({ slug }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Check if we've already tracked this event in the current browser session
    const storageKey = `tracked_event_${slug}`;
    const isTrackedInSession = sessionStorage.getItem(storageKey);

    if (slug && !isTrackedInSession && !hasTracked.current) {
      const track = async () => {
        try {
          // Pre-emptively set ref to avoid race conditions in strict mode (dev)
          hasTracked.current = true;
          
          console.log(`[VIEW TRACKER] Tracking event: ${slug}`);
          const result = await trackEventViewAction(slug);
          
          if (result) {
            // Mark as tracked in session storage persisted across refreshes
            sessionStorage.setItem(storageKey, "true");
            console.log(`[VIEW TRACKER] Successfully tracking event: ${slug}`, result);
          }
        } catch (error) {
          hasTracked.current = false; // Reset on failure
          console.error(`[VIEW TRACKER] Failed to track event: ${slug}`, error);
        }
      };
      
      track();
    }
  }, [slug]);

  return null; // This component doesn't render anything
}
