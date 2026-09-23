"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, Trash2, User as UserIcon, Check, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { addFeedback } from "@/lib/feedback";

function roleLabel(role: string) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  if (role === "RIDER") return "Rider";
  return "Buyer";
}

export default function AccountPage() {
  const { user, ready, updateProfile, deleteAccount, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stall, setStall] = useState("");
  const [toast, setToast] = useState("");
  const [fbType, setFbType] = useState<"suggestion" | "complaint">("suggestion");
  const [fbMsg, setFbMsg] = useState("");

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/account");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setStall(user.stall || "");
    }
  }, [user]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function saveProfile() {
    const res = updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      stall: stall.trim() || undefined,
    });
    if (res.ok) {
      setEditing(false);
      showToast("Profile updated");
    } else {
      showToast(res.error || "Could not save");
    }
  }

  function cancelEdit() {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setStall(user.stall || "");
    }
    setEditing(false);
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-makola-cream dark:bg-zinc-950">
        <p className="text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-makola-cream pb-28 dark:bg-zinc-950">
      <header className="flex items-center justify-between bg-makola-orange px-4 py-3 text-white">
        <BrandLogo href="/" light size="sm" />
        <ThemeToggle />
      </header>

      <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-6">
        {toast && (
          <div className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
            {toast}
          </div>
        )}

        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-makola-orange/15 text-makola-orange">
                <UserIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-makola-green dark:text-green-400">
                  My Profile
                </h1>
                <p className="mt-1">
                  <span className="inline-block rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">
                    Role: {roleLabel(user.role)}
                  </span>
                </p>
              </div>
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-makola-orange dark:bg-zinc-800"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={saveProfile}
                  className="inline-flex items-center gap-1 rounded-xl bg-makola-green px-3 py-2 text-sm font-bold text-white"
                >
                  <Check className="h-4 w-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600 dark:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Full name</p>
              {editing ? (
                <input
                  className="input-lg mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              ) : (
                <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">
                  {user.name || "—"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
              {editing ? (
                <input
                  className="input-lg mt-1"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              ) : (
                <p className="mt-0.5 text-base font-medium text-gray-800 dark:text-zinc-200">
                  {user.email || "No email set — tap Edit to add one"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
              {editing ? (
                <input
                  className="input-lg mt-1"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="054…"
                />
              ) : (
                <p className="mt-0.5 text-base font-medium text-gray-800 dark:text-zinc-200">
                  {user.phone || "—"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Stall / location</p>
              {editing ? (
                <input
                  className="input-lg mt-1"
                  value={stall}
                  onChange={(e) => setStall(e.target.value)}
                  placeholder="e.g. Lane 3, Makola"
                />
              ) : (
                <p className="mt-0.5 text-base font-medium text-gray-800 dark:text-zinc-200">
                  {user.stall || "Not set"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Role</p>
              <p className="mt-0.5 text-base font-bold text-makola-orange">{roleLabel(user.role)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="font-bold text-makola-green dark:text-green-400">
            Send feedback to admin
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFbType("suggestion")}
              className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                fbType === "suggestion"
                  ? "bg-makola-orange text-white"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              Suggestion
            </button>
            <button
              type="button"
              onClick={() => setFbType("complaint")}
              className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                fbType === "complaint"
                  ? "bg-makola-orange text-white"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              Complaint
            </button>
          </div>
          <textarea
            className="input-lg min-h-[90px]"
            placeholder="Your message…"
            value={fbMsg}
            onChange={(e) => setFbMsg(e.target.value)}
          />
          <button
            type="button"
            className="btn-green w-full"
            onClick={() => {
              if (!fbMsg.trim()) return;
              addFeedback({
                name: user.name,
                phone: user.phone,
                type: fbType,
                message: fbMsg.trim(),
              });
              setFbMsg("");
              showToast("Feedback sent to admin");
            }}
          >
            Submit to admin
          </button>
        </div>

        <button
          type="button"
          className="btn-outline flex w-full items-center justify-center gap-2"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-300 bg-red-50 py-3.5 font-bold text-red-600 dark:border-red-800 dark:bg-red-950/40"
          onClick={() => {
            if (!confirm("Delete your account permanently? This cannot be undone.")) return;
            const res = deleteAccount();
            if (res.ok) {
              router.push("/");
            } else {
              showToast(res.error || "Could not delete account");
            }
          }}
        >
          <Trash2 className="h-5 w-5" />
          Delete account
        </button>

        <p className="text-center text-xs text-gray-400">
          Not you?{" "}
          <Link href="/login" className="font-semibold text-makola-orange">
            Switch account
          </Link>
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
