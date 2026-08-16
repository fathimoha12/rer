import { type EmailOtpType, createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function safeRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = request.nextUrl.searchParams.get("next") || "/login?confirmed=1";

  if (!tokenHash || !type || !supabaseUrl || !supabaseAnonKey) {
    return safeRedirect(request, "/login?auth_error=missing-confirmation");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return safeRedirect(request, "/login?auth_error=confirmation-failed");
  }

  const redirectUrl = new URL(next, request.nextUrl.origin);
  if (redirectUrl.origin !== request.nextUrl.origin) {
    return safeRedirect(request, "/login?confirmed=1");
  }

  return NextResponse.redirect(redirectUrl);
}
