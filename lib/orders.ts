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
  updatedAt?: string;
};

export const ADMIN_ORDERS_KEY = "makola-admin-orders";
export const USER_ORDERS_KEY = "makola-orders";
export const ORDERS_EVENT = "makola-orders-updated";

export function formatOrderDate(iso?: string): string {
  if (!iso) return "\u2014";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function loadAdminOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveAdminOrders(list: StoredOrder[]) {
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(list));
  notifyOrdersChanged();
}

export function loadUserOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_ORDERS_KEY);
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
        updatedAt: o.updatedAt,
      }));
    }
  } catch { /* ignore */ }
  return [];
}

function saveUserOrdersRaw(list: any[]) {
  localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(list));
}

export function notifyOrdersChanged() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(ORDERS_EVENT));
    localStorage.setItem("makola-orders-bump", String(Date.now()));
  } catch { /* ignore */ }
}

export function updateOrderStatus(id: string, status: string): StoredOrder[] {
  const now = new Date().toISOString();
  const admin = loadAdminOrders().map((o) =>
    o.id === id ? { ...o, status, updatedAt: now } : o
  );
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(admin));

  try {
    const raw = localStorage.getItem(USER_ORDERS_KEY);
    if (raw) {
      const list = JSON.parse(raw) as any[];
      const next = list.map((o) =>
        o.id === id ? { ...o, status, updatedAt: now } : o
      );
      saveUserOrdersRaw(next);
    }
  } catch { /* ignore */ }

  notifyOrdersChanged();
  return admin;
}

export function resetAllOrders() {
  localStorage.removeItem(ADMIN_ORDERS_KEY);
  localStorage.removeItem(USER_ORDERS_KEY);
  try {
    localStorage.removeItem("makola-admin-orders");
    localStorage.removeItem("makola-orders");
  } catch { /* ignore */ }
  notifyOrdersChanged();
  try {
    localStorage.setItem("makola-orders-bump", String(Date.now()));
    window.dispatchEvent(new Event(ORDERS_EVENT));
  } catch { /* ignore */ }
}

export function findOrderById(id: string): StoredOrder | null {
  const q = id.trim().toLowerCase();
  if (!q) return null;
  const all = [...loadAdminOrders(), ...loadUserOrders()];
  return all.find((o) => o.id.toLowerCase() === q || o.id.toLowerCase().includes(q)) || null;
}

export function onOrdersChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (
      e.key === ADMIN_ORDERS_KEY ||
      e.key === USER_ORDERS_KEY ||
      e.key === "makola-orders-bump"
    ) {
      cb();
    }
  };
  window.addEventListener(ORDERS_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(ORDERS_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
