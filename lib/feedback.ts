export type Feedback = {
  id: string;
  name: string;
  phone?: string;
  type: "suggestion" | "complaint";
  message: string;
  createdAt: string;
};

const KEY = "makola-feedback-v1";

export function loadFeedback(): Feedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function addFeedback(f: Omit<Feedback, "id" | "createdAt">): Feedback[] {
  const item: Feedback = {
    ...f,
    id: "fb-" + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  const next = [item, ...loadFeedback()];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
