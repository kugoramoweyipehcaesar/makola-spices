"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Force RIDER accounts onto /rider only (except login). */
export function RoleGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role !== "RIDER") return;
    const allowed =
      path.startsWith("/rider") ||
      path.startsWith("/login") ||
      path.startsWith("/admin/login");
    if (!allowed) {
      router.replace("/rider");
    }
  }, [user, ready, path, router]);

  return <>{children}</>;
}
