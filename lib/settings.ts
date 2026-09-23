import { notifyLive } from "@/lib/live";

const KEY = "makola-settings-v1";

export type AppSettings = {
  momoName: string;
  momoNumber: string;
};

const DEFAULTS: AppSettings = {
  momoName: "MAKOLA COMPANY LIMITED",
  momoNumber: "0548161539",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  notifyLive("settings");
}
