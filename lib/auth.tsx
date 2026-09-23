"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  isSuperAdmin,
  type Role,
} from "@/data/spices";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  stall?: string;
  role: Role;
  banned?: boolean;
  online?: boolean;
};

type AuthCtx = {
  user: User | null;
  users: User[];
  ready: boolean;
  login: (identifier: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    stall?: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => { ok: boolean; error?: string };
  deleteAccount: () => { ok: boolean; error?: string };
  setRole: (userId: string, role: Role) => { ok: boolean; error?: string };
  banUser: (userId: string, banned: boolean) => { ok: boolean; error?: string };
  refreshUsers: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const USERS_KEY = "makola-users-v3";
const SESSION_KEY = "makola-session-v3";

const SUPER_EMAILS = [
  SUPER_ADMIN_EMAIL.toLowerCase(),
  "piitukaduut21@gmail.com",
  "piitukaduut@gmail.com",
];

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedUsers(): User[] {
  let existing = loadUsers();
  // Remove any previous super/admin seeds so password stays correct
  existing = existing.filter(
    (u) =>
      !SUPER_EMAILS.includes((u.email || "").toLowerCase()) &&
      (u.email || "").toLowerCase() !== ADMIN_EMAIL
  );

  const next: User[] = [
    {
      id: "super-admin",
      name: "Super Admin",
      phone: "0548161539",
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: "SUPER_ADMIN",
      banned: false,
      online: true,
    },
    {
      id: "admin-default",
      name: "Admin",
      phone: "0548161539",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "ADMIN",
      banned: false,
      online: true,
    },
    ...existing,
  ];
  saveUsers(next);
  return next;
}

function stripPassword(u: User): User {
  const copy = { ...u };
  delete copy.password;
  return copy;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const list = seedUsers();
    setUsers(list);
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as User;
        const fresh = list.find((u) => u.id === session.id);
        if (fresh && !(fresh.banned && !isSuperAdmin(fresh.email))) {
          setUser(stripPassword(fresh));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  function persistSession(u: User | null) {
    setUser(u ? stripPassword(u) : null);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(stripPassword(u)));
    else localStorage.removeItem(SESSION_KEY);
  }

  function login(identifier: string, password: string) {
    const id = identifier.trim().toLowerCase();
    const pwd = password.trim();

    // CRITICAL super admin path
    if (SUPER_EMAILS.includes(id) && pwd === SUPER_ADMIN_PASSWORD) {
      const list = seedUsers();
      setUsers(list);
      const superUser = list.find((u) => isSuperAdmin(u.email) || SUPER_EMAILS.includes((u.email || "").toLowerCase()))!;
      persistSession(superUser);
      return { ok: true, user: stripPassword(superUser) };
    }

    if (id === ADMIN_EMAIL.toLowerCase() && pwd === ADMIN_PASSWORD) {
      const list = seedUsers();
      setUsers(list);
      const adminUser = list.find((u) => (u.email || "").toLowerCase() === ADMIN_EMAIL)!;
      persistSession(adminUser);
      return { ok: true, user: stripPassword(adminUser) };
    }

    const list = seedUsers();
    setUsers(list);
    const digits = id.replace(/\D/g, "");
    const found = list.find(
      (u) =>
        (u.email && u.email.toLowerCase() === id) ||
        (digits.length >= 9 && u.phone.replace(/\D/g, "").endsWith(digits)) ||
        u.phone === identifier.trim()
    );

    if (!found || found.password !== pwd) {
      return { ok: false, error: "Invalid phone/email or password" };
    }
    if (found.banned && !isSuperAdmin(found.email)) {
      return { ok: false, error: "Account is banned. Contact support." };
    }
    persistSession(found);
    return { ok: true, user: stripPassword(found) };
  }

  function register(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    stall?: string;
  }) {
    const list = seedUsers();
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (list.some((u) => u.phone.replace(/\D/g, "") === phoneDigits)) {
      return { ok: false, error: "Phone number already registered" };
    }
    if (data.email && list.some((u) => u.email?.toLowerCase() === data.email!.toLowerCase())) {
      return { ok: false, error: "Email already registered" };
    }
    const newUser: User = {
      id: "u-" + Date.now().toString(36),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      password: data.password,
      stall: data.stall,
      role: "BUYER",
      banned: false,
      online: false,
    };
    const next = [...list, newUser];
    saveUsers(next);
    setUsers(next);
    persistSession(newUser);
    return { ok: true };
  }

  function updateProfile(patch: Partial<User>) {
    if (!user) return { ok: false, error: "Not logged in" };
    const list = loadUsers();
    const next = list.map((u) => {
      if (u.id !== user.id) return u;
      const updated = { ...u, ...patch, id: u.id, role: u.role };
      if (isSuperAdmin(u.email)) {
        updated.role = "SUPER_ADMIN";
        updated.banned = false;
        updated.email = SUPER_ADMIN_EMAIL;
      }
      return updated;
    });
    saveUsers(next);
    setUsers(next);
    const me = next.find((u) => u.id === user.id)!;
    persistSession(me);
    return { ok: true };
  }

  function deleteAccount() {
    if (!user) return { ok: false, error: "Not logged in" };
    if (isSuperAdmin(user.email)) return { ok: false, error: "Super Admin cannot be deleted" };
    const next = loadUsers().filter((u) => u.id !== user.id);
    saveUsers(next);
    setUsers(next);
    persistSession(null);
    return { ok: true };
  }

  function setRole(userId: string, role: Role) {
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
      return { ok: false, error: "Only admin can change roles" };
    }
    const list = loadUsers();
    const target = list.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "User not found" };
    if (isSuperAdmin(target.email)) return { ok: false, error: "Super Admin cannot be demoted" };
    if (role === "SUPER_ADMIN") return { ok: false, error: "Cannot assign Super Admin role" };
    const next = list.map((u) =>
      u.id === userId ? { ...u, role, online: role === "RIDER" ? true : u.online } : u
    );
    saveUsers(next);
    setUsers(next);
    return { ok: true };
  }

  function banUser(userId: string, banned: boolean) {
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
      return { ok: false, error: "Only admin can ban users" };
    }
    const list = loadUsers();
    const target = list.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "User not found" };
    if (isSuperAdmin(target.email)) return { ok: false, error: "Super Admin cannot be banned" };
    const next = list.map((u) => (u.id === userId ? { ...u, banned } : u));
    saveUsers(next);
    setUsers(next);
    return { ok: true };
  }

  function logout() {
    persistSession(null);
  }

  function refreshUsers() {
    setUsers(seedUsers());
  }

  return (
    <Ctx.Provider
      value={{
        user,
        users,
        ready,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        setRole,
        banUser,
        refreshUsers,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
