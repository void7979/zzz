import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminSession = {
  adminId: number;
  username: string;
  exp: number;
};

const COOKIE_NAME = "rupiya_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? undefined : "rupiya-dev-secret");

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }

  return sessionSecret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(adminId: number, username: string) {
  const payload: AdminSession = {
    adminId,
    username,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSession(admin: { id: number; username: string }) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createSessionToken(admin.id, admin.username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_TTL_MS),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
