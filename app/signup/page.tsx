"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { STALL_LOCATIONS } from "@/data/spices";
import { useAuth } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [stall, setStall] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || phone.replace(/\D/g, "").length < 9 || password.length < 6) {
      setError("Name, valid phone, and password (min 6 chars) are required.");
      return;
    }
    const res = register({
      name,
      phone: phone.startsWith("0") || phone.startsWith("+") ? phone : `0${phone}`,
      email: email || undefined,
      password,
      stall: stall || undefined,
    });
    if (!res.ok) {
      setError(res.error || "Registration failed");
      return;
    }
    router.push("/shop");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-makola-cream px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo href="/" size="md" />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-extrabold text-makola-green sm:text-3xl">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-makola-orange sm:text-base">
            Join MAKOLA COMPANY LIMITED — order spices for your stall
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Full Name</label>
              <input className="input-lg" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Phone Number</label>
              <div className="flex overflow-hidden rounded-2xl border-2 border-orange-200 bg-white focus-within:border-makola-orange focus-within:ring-2 focus-within:ring-orange-200">
                <span className="flex items-center border-r border-orange-100 px-3 text-sm text-gray-500">+233</span>
                <input
                  className="flex-1 border-0 px-3 py-3.5 text-base outline-none"
                  placeholder="54 816 1539"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Email (optional)</label>
              <input className="input-lg" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Password</label>
              <div className="relative">
                <input
                  className="input-lg pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-makola-green">Stall Location in Makola</label>
              <select className="input-lg" value={stall} onChange={(e) => setStall(e.target.value)}>
                <option value="">Select stall location (optional)</option>
                {STALL_LOCATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-orange w-full text-lg">
              Create My Account →
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            📞 We will call you on 0548161539 to confirm.
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have account?{" "}
            <Link href="/login" className="font-bold text-makola-green underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
