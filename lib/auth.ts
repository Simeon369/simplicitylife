import { NextRequest } from "next/server";
import { verifyToken, type JwtPayload } from "./jwt";

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: "user" | "admin";
}

export async function getAuthFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  return {
    userId: payload.sub,
    email: payload.email ?? "",
    name: payload.name,
    role: payload.role === "admin" ? "admin" : "user",
  };
}

export function requireAdmin(auth: AuthUser | null): boolean {
  return auth?.role === "admin";
}
