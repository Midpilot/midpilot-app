"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Don't initialize PostHog in development
      if (
        typeof window === "undefined" ||
        !process.env.NEXT_PUBLIC_POSTHOG_KEY ||
        !process.env.NEXT_PUBLIC_POSTHOG_HOST ||
        process.env.NODE_ENV === "development"
      )
        return;
      
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',  // Updated default host
        person_profiles: "always",
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
