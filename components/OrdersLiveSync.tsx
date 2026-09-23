"use client";

import { useEffect } from "react";
import { onOrdersChanged } from "@/lib/orders";

/** Full page reload after complete order reset so every screen is empty. */
export function OrdersLiveSync() {
  useEffect(() => {
    let lastBump = localStorage.getItem("makola-orders-bump") || "";

    return onOrdersChanged(() => {
      const bump = localStorage.getItem("makola-orders-bump") || "";
      if (bump && bump !== lastBump) {
        lastBump = bump;
        try {
          const admin = localStorage.getItem("makola-admin-orders");
          const user = localStorage.getItem("makola-orders");
          const adminEmpty = !admin || admin === "[]" || admin === "null";
          const userEmpty = !user || user === "[]" || user === "null";
          if (adminEmpty && userEmpty) {
            setTimeout(() => {
              if (!window.location.pathname.startsWith("/admin/login")) {
                window.location.reload();
              }
            }, 400);
          }
        } catch { /* ignore */ }
      }
    });
  }, []);

  return null;
}
