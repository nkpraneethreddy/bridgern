import { env } from '../config/env';

type EventProperties = Record<string, string | number | boolean | null>;

/**
 * Lightweight analytics interface. PostHog SDK wiring is activated once
 * EXPO_PUBLIC_POSTHOG_API_KEY is configured in later phases.
 */
export const analytics = {
  track(event: string, properties?: EventProperties): void {
    if (!env.posthogApiKey) {
      if (__DEV__) {
        // Keep low-noise telemetry traceable in development
        console.debug(`[analytics] ${event}`, properties ?? {});
      }
      return;
    }
    // PostHog capture hook point
  },

  identify(userId: string, traits?: EventProperties): void {
    if (!env.posthogApiKey) {
      return;
    }
    void userId;
    void traits;
  },
};
