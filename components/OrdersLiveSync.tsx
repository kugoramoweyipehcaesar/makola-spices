"use client";

import { useEffect } from "react";
import { onOrdersChanged } from "@/lib/orders";

/** On full order reset, reload open tabs so the whole site shows empty orders. */
export function OrdersLiveSync() {
  useEffect(() => {
    let lastBump = localStorage.getItem("makola-orders-bump") || "";

    const unsub = onOrdersChanged(() => {
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

    return unsub;
  }, []);

  return null;
}
