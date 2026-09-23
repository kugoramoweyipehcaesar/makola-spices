import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGhs(n: number) {
  return `GHS ${Number(n).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

export function waLink(phone: string, text?: string) {
  const p = phone.replace(/\D/g, "");
  const msg = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${p}${msg}`;
}
