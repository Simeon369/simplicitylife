import { create } from "zustand";

const AUTH_TOKEN_KEY = "auth_token";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: "user" | "admin";
}

interface Profile {
  id: string;
  name: string;
  role: "user" | "admin";
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  bootstrap: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  /** Clear token and auth state without redirecting (e.g. on 401). */
  clearSession: () => void;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    user?: AuthUser;
  }>;
  getToken: () => string | null;
}

function userToProfile(user: AuthUser): Profile {
  return {
    id: user.id,
    name: user.name ?? "",
    role: user.role ?? "user",
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,

  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  bootstrap: async () => {
    set({ loading: true });
    try {
      if (typeof window === "undefined") {
        set({ loading: false });
        return;
      }
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        set({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        set({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
        return;
      }
      const user = data.user as AuthUser;
      const profile = userToProfile(user);
      set({
        user,
        profile,
        loading: false,
        isAuthenticated: true,
        isAdmin: profile.role === "admin",
      });
    } catch (err) {
      console.error("Auth bootstrap error:", err);
      if (typeof window !== "undefined") localStorage.removeItem(AUTH_TOKEN_KEY);
      set({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        set({ loading: false });
        return {
          success: false,
          error: data.error ?? "Login failed. Check your credentials.",
        };
      }

      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }

      const user = data.user as AuthUser;
      const profile = userToProfile(user);
      set({
        user,
        profile,
        loading: false,
        isAuthenticated: true,
        isAdmin: profile.role === "admin",
      });

      return { success: true, user };
    } catch (err: unknown) {
      console.error("Login error:", err);
      set({ loading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Login failed",
      };
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = "/";
    }
    set({
      user: null,
      profile: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  clearSession: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    set({
      user: null,
      profile: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  register: async (name: string, email: string, password: string) => {
    const { supabase } = await import("@/lib/supabase/client");
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        const loginResult = await get().login(email, password);
        if (loginResult.success) {
          return { success: true, user: loginResult.user };
        }
      }

      set({ loading: false });
      return {
        success: true,
        message: "Please check your email to confirm your account.",
        user: data.user ? { id: data.user.id, email: data.user.email } : undefined,
      };
    } catch (err: unknown) {
      console.error("Register error:", err);
      set({ loading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Registration failed",
      };
    }
  },
}));
