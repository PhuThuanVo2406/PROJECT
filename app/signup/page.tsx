"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STUDENT_EMAIL_DOMAIN, isStudentEmail } from "@/lib/constants";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const displayName = String(form.get("display_name")).trim();

    if (!isStudentEmail(email)) {
      setError(`Use your HCC student email (@${STUDENT_EMAIL_DOMAIN}).`);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: { display_name: displayName },
      },
    });
    setPending(false);

    if (error) {
      // The database rejects non-student emails even if this page is bypassed.
      setError(
        /database error/i.test(error.message)
          ? `Only @${STUDENT_EMAIL_DOMAIN} emails can register.`
          : error.message,
      );
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="card">
        <h1>Check your student email</h1>
        <p>
          We sent a verification link to <strong>{sentTo}</strong>. Open it to activate your account, then
          come back and log in.
        </p>
        <p className="muted">Not there? Check your junk folder in Outlook.</p>
      </div>
    );
  }

  return (
    <form className="card stack" onSubmit={onSubmit} style={{ maxWidth: 440, margin: "0 auto" }}>
      <h1>Create your account</h1>
      <p className="muted">Only HCC students can join. We will email you a link to verify.</p>
      <label>
        Display name
        <input name="display_name" required maxLength={40} placeholder="First name or nickname" />
      </label>
      <label>
        Student email
        <input name="email" type="email" required placeholder={`you@${STUDENT_EMAIL_DOMAIN}`} />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "Creating account..." : "Sign up"}</button>
      <p className="muted">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
