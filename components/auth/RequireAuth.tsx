"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, type AuthState } from "@/store/authStore";
import { FullPageLoader } from "@/components/Loader";

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
    return <FullPageLoader />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
