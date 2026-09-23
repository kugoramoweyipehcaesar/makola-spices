export type StoredOrder = {
  id: string;
  customer: string;
  stall: string;
  item: string;
  amount: number;
  status: string;
  delivery?: string;
  fee?: number;
  pay?: string;
  phone?: string;
  momoTransactionId?: string;
  momoReference?: string;
  productIds?: string[];
  createdAt?: string;
};

const ADMIN_KEY = "makola-admin-orders";
const USER_KEY = "makola-orders";

export function loadAdminOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveAdminOrders(list: StoredOrder[]) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(list));
}

export function loadUserOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return (parsed as any[]).map((o) => ({
        id: o.id,
        customer: o.customer || "Customer",
        stall: o.stall || "",
        item: o.items
          ? (o.items as any[]).map((i: any) => `${i.spice?.name || i.name} x${i.qty}`).join(", ")
          : o.item || "",
        amount: o.total ?? o.amount ?? 0,
        status: o.status || "Pending",
        delivery: o.delivery,
        fee: o.fee,
        pay: o.pay,
        phone: o.phone,
        momoTransactionId: o.momoTransactionId,
        momoReference: o.momoReference,
        createdAt: o.createdAt,
      }));
    }
  } catch { /* ignore */ }
  return [];
}

export function resetAllOrders() {
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function findOrderById(id: string): StoredOrder | null {
  const q = id.trim().toLowerCase();
  if (!q) return null;
  const all = [...loadAdminOrders(), ...loadUserOrders()];
  return all.find((o) => o.id.toLowerCase() === q || o.id.toLowerCase().includes(q)) || null;
}
