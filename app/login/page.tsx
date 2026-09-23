"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = login(identifier, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Login failed");
      return;
    }
    const role = res.user?.role;
    const next = searchParams.get("next");
    if (role === "SUPER_ADMIN" || role === "ADMIN") router.push("/admin");
    else if (role === "RIDER") router.push("/rider");
    else if (next && next.startsWith("/")) router.push(next);
    else router.push("/shop");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-orange-50 to-makola-cream px-4 py-8 dark:from-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo href="/" size="lg" />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-zinc-900 sm:p-8">
          <h1 className="text-center text-2xl font-extrabold text-makola-green dark:text-green-400 sm:text-3xl">
            Welcome back!
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500 sm:text-base">
            Sign in with phone or email and password
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green dark:text-green-400">
                Phone Number or Email
              </label>
              <input
                className="input-lg"
                placeholder="0548161539 or you@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green dark:text-green-400">
                Password
              </label>
              <div className="relative">
                <input
                  className="input-lg pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPw(!showPw)}
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-semibold text-makola-orange hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-orange w-full text-lg">
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">
            New here?{" "}
            <Link href="/signup" className="font-bold text-makola-green underline dark:text-green-400">
              Create account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-gray-400">
            Staff?{" "}
            <Link href="/admin/login" className="font-semibold text-makola-orange hover:underline">
              Admin login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
