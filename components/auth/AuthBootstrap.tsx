"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const AuthBootstrap = () => {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return null;
};

export default AuthBootstrap;
