/** Site-wide live updates when admin changes anything. */

export const LIVE_EVENT = "makola-live-update";
export const LIVE_BUMP_KEY = "makola-live-bump";

export type LiveScope = "orders" | "products" | "settings" | "users" | "all";

export function notifyLive(scope: LiveScope = "all") {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ scope, at: Date.now() });
    localStorage.setItem(LIVE_BUMP_KEY, payload);
    window.dispatchEvent(new CustomEvent(LIVE_EVENT, { detail: { scope } }));
  } catch { /* ignore */ }
}

/** Subscribe to live updates (same tab + other tabs). */
export function onLiveUpdate(cb: (scope: LiveScope) => void) {
  if (typeof window === "undefined") return () => {};

  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    cb((detail?.scope as LiveScope) || "all");
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIVE_BUMP_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        cb((parsed.scope as LiveScope) || "all");
      } catch {
        cb("all");
      }
    }
  };

  window.addEventListener(LIVE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LIVE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
