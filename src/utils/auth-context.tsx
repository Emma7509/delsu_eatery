import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase-client";
import type { Session } from "@supabase/supabase-js";

export type User = { id: string; name: string; email: string; phone: string; address: string };
type SignUpData = { name: string; email: string; phone: string; password: string };
type Result = { ok: true } | { ok: false; error: string };

type Ctx = {
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  authReady: boolean;
  signUp: (data: SignUpData) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  signInAdmin: (email: string, password: string) => Promise<Result>;
  signOut: () => void;
  updateUser: (u: Partial<User>) => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

function buildUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    name: meta.name ?? "",
    email: session.user.email ?? "",
    phone: meta.phone ?? "",
    address: meta.address ?? "",
  };
}

function isAdminSession(session: Session | null): boolean {
  return session?.user?.app_metadata?.role === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(buildUser(data.session));
      setIsAdmin(isAdminSession(data.session));
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(buildUser(session));
      setIsAdmin(isAdminSession(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp: Ctx["signUp"] = async (data) => {
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, phone: data.phone, address: "" } },
    });
    if (error) return { ok: false, error: error.message };
    if (!res.session) {
      return { ok: false, error: "Check your email to confirm your account, then sign in." };
    }
    return { ok: true };
  };

  const signIn: Ctx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Incorrect email or password" };
    return { ok: true };
  };

  const signInAdmin: Ctx["signInAdmin"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, error: "Invalid admin credentials" };
    if (!isAdminSession(data.session)) {
      await supabase.auth.signOut();
      return { ok: false, error: "This account does not have admin access" };
    }
    return { ok: true };
  };

  const signOut = () => {
    supabase.auth.signOut();
  };

  const updateUser: Ctx["updateUser"] = async (patch) => {
    await supabase.auth.updateUser({ data: patch });
  };

  const isGuest = authReady && !user;

  return (
    <AuthCtx.Provider
      value={{
        user,
        isAdmin,
        isGuest,
        authReady,
        signUp,
        signIn,
        signInAdmin,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be in AuthProvider");
  return c;
};
