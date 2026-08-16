import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const adminUsername = "tet";
const adminPassword = "tet123";
const adminSessionCookie = "tet_admin_session";
const adminSessionValue = "tet-admin-session-v1";

export async function isAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get(adminSessionCookie)?.value === adminSessionValue;
}

export function isAdminLogin(username: string, password: string) {
  return username.trim().toLowerCase() === adminUsername && password === adminPassword;
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set(adminSessionCookie, adminSessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(adminSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
