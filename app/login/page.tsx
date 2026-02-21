"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore, type AuthState } from "@/store/authStore";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Loader from "@/components/Loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state: AuthState) => state.login);
  const bootstrap = useAuthStore((state: AuthState) => state.bootstrap);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect URL from query (used for admins when they were sent to login from a protected page)
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Verify token with server, then send admin to admin page and regular user to home
        await bootstrap();
        const state = useAuthStore.getState();
        if (!state.isAuthenticated) {
          setError("Something went wrong. Please try again.");
          return;
        }
        if (state.isAdmin) {
          router.push(redirect || "/admin");
        } else {
          router.push("/");
        }
        return;
      } else {
        setError(
          result.error || "Login failed. Please check your credentials.",
        );
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-center mb-10">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to access your account
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-black text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader size="sm" className="text-white" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-black font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <Link href="/" className="block text-center mt-8">
          <span
            className="text-gray-400 text-sm font-medium tracking-wider"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            SIMPLICITY
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
