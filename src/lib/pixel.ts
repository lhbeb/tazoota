/**
 * Safely fires a Meta Pixel event, retrying until fbq is available.
 * This fixes the race condition where page useEffects run before the pixel script loads.
 */
export function trackPixelEvent(
  eventName: string,
  params?: Record<string, any>,
  maxRetries = 20
): void {
  if (typeof window === "undefined") return;

  let attempts = 0;

  const attempt = () => {
    if ((window as any).fbq) {
      if (params) {
        (window as any).fbq("track", eventName, params);
      } else {
        (window as any).fbq("track", eventName);
      }
    } else if (attempts < maxRetries) {
      attempts++;
      setTimeout(attempt, 100); // retry every 100ms, up to 2 seconds
    }
  };

  attempt();
}
