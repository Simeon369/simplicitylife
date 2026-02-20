"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, type AuthState } from "@/store/authStore";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const loading = useAuthStore((s: AuthState) => s.loading);
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated);
  const isAdmin = useAuthStore((s: AuthState) => s.isAdmin);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !isAdmin) {
      const redirect = encodeURIComponent(pathname ?? "/admin");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, isAuthenticated, isAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
