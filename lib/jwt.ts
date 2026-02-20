import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
const alg = "HS256";

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

function getSecret(): Uint8Array {
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [alg] });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
