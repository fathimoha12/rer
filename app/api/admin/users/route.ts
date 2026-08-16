import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminSession } from "@/lib/admin-auth";

const ownerEmail = "fathimhmmd418@gmail.com";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("User management is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, anonKey, serviceRoleKey };
}

export async function POST(request: Request) {
  try {
    const { url, anonKey, serviceRoleKey } = getConfig();
    const hasAdminSession = await isAdminSession();

    if (!hasAdminSession) {
      const authHeader = request.headers.get("authorization") ?? "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token) return NextResponse.json({ error: "Owner or admin login is required." }, { status: 401 });

      const userClient = createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const userResponse = await userClient.auth.getUser(token);
      const signedInEmail = userResponse.data.user?.email?.toLowerCase();

      if (userResponse.error || signedInEmail !== ownerEmail) {
        return NextResponse.json({ error: "Only the owner/admin can create users." }, { status: 403 });
      }
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const createResponse = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { created_by: hasAdminSession ? "tet-admin" : ownerEmail },
    });

    if (createResponse.error) {
      return NextResponse.json({ error: createResponse.error.message }, { status: 400 });
    }

    return NextResponse.json({ email: createResponse.data.user?.email ?? email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "User could not be created." },
      { status: 500 },
    );
  }
}
