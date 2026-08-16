import { NextResponse } from "next/server";
import { clearAdminCookie, isAdminLogin, setAdminCookie } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  if (!isAdminLogin(username, password)) {
    return NextResponse.json({ error: "Admin username ama password-ka waa khalad." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminCookie(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response);
  return response;
}
