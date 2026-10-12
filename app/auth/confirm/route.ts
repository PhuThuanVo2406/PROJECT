import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALREADY_USED =
  "This verification link was already used or has expired. If you verified already, just log in.";

function toLogin(origin: string, params: Record<string, string>) {
  return NextResponse.redirect(`${origin}/login?${new URLSearchParams(params)}`);
}

// Email security scanners (e.g. Outlook Safe Links) send HEAD requests to
// links before the student clicks. Answer them without using up the token.
export function HEAD() {
  return new NextResponse(null, { status: 200 });
}

// Landing URL for the verification email. Supports both the token_hash
// template and the default PKCE code link.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  // Supabase sends people here with an error when the link expired or was reused.
  if (searchParams.get("error")) {
    return toLogin(origin, { error: ALREADY_USED });
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return toLogin(origin, { error: ALREADY_USED });
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Supabase only issues a code after it has confirmed the email. The exchange
    // fails when the link is opened in a different browser or device than the
    // one used to sign up, but the account is verified either way.
    if (error) return toLogin(origin, { verified: "1" });
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return toLogin(origin, { error: "That verification link is not valid. Try signing up again." });
}
