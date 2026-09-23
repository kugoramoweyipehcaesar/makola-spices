import { SPICES, type Spice } from "@/data/spices";
import { notifyLive } from "@/lib/live";

export type Product = Spice & { image?: string };

const KEY = "makola-products-v1";

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return SPICES;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(KEY, JSON.stringify(SPICES));
  return [...SPICES];
}

export function saveProducts(list: Product[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  notifyLive("products");
}

export function addProduct(p: Omit<Product, "id"> & { id?: string }): Product[] {
  const list = loadProducts();
  const product: Product = {
    ...p,
    id: p.id || "p-" + Date.now().toString(36),
  };
  const next = [product, ...list];
  saveProducts(next);
  return next;
}

export function updateProduct(id: string, patch: Partial<Product>): Product[] {
  const list = loadProducts().map((x) => (x.id === id ? { ...x, ...patch } : x));
  saveProducts(list);
  return list;
}

export function deleteProduct(id: string): Product[] {
  const list = loadProducts().filter((x) => x.id !== id);
  saveProducts(list);
  return list;
}
