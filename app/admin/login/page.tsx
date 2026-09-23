"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!ready) {
      setError("Still loading… try again in a second.");
      return;
    }
    setLoading(true);
    try {
      const res = login(identifier.trim(), password);
      if (!res.ok) {
        setError(res.error || "Login failed");
        setLoading(false);
        return;
      }
      const role = res.user?.role;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        setError("This account is not an admin. Use the customer login.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Login error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-makola-green px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-makola-orange text-2xl shadow-lg">
            <Shield className="h-7 w-7" />
          </div>
          <BrandLogo href="/" light size="md" />
          <p className="mt-2 text-sm text-green-200">Admin & Super Admin portal only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {!ready && (
            <p className="mb-3 text-center text-xs text-gray-400">Initializing secure login…</p>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Email or Phone</label>
              <input
                className="input-lg"
                placeholder="piitukaduut21@gmail.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Password</label>
              <div className="relative">
                <input
                  className="input-lg pr-12"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !ready} className="btn-orange w-full text-lg">
              {loading ? "Signing in…" : "Admin Sign In"}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Super Admin: piitukaduut21@gmail.com
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Customers:{" "}
            <Link href="/login" className="font-semibold text-makola-orange">/login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
