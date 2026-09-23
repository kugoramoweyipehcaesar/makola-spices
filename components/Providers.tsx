"use client";

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { RoleGate } from "@/components/RoleGate";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RoleGate>{children}</RoleGate>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
