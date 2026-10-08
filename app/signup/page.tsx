"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, LoaderCircle, Lock, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STUDENT_EMAIL_DOMAIN, isStudentEmail } from "@/lib/constants";
import { LogoMark } from "@/components/ui/Logo";
import PasswordInput from "@/components/ui/PasswordInput";
import Toast from "@/components/ui/Toast";

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
      <div className="auth-shell">
        <div className="auth-bg" aria-hidden="true" />
        <Toast title="Account created" message="Check your student email to verify it." />
        <div className="auth-card animate-in" style={{ textAlign: "center" }}>
          <div className="auth-head" style={{ marginBottom: 0 }}>
            <span className="icon-tile success" style={{ width: 56, height: 56, borderRadius: "50%", marginBottom: 24 }}>
              <MailCheck size={28} aria-hidden="true" />
            </span>
            <h1>Check your student email</h1>
            <p>
              We sent a verification link to <strong style={{ color: "var(--text)" }}>{sentTo}</strong>. Open it to
              activate your account, then come back and log in.
            </p>
          </div>
          <p className="caption" style={{ margin: "20px 0 24px" }}>Not there? Check your junk folder in Outlook.</p>
          <Link href="/login" className="btn btn-outline btn-block">Go to log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true" />
      <form className="auth-card animate-in" onSubmit={onSubmit}>
        <div className="auth-head">
          <LogoMark size="lg" />
          <h1>Create your account</h1>
          <p>Find classmates studying on your HCC campus.</p>
        </div>
        <div className="stack">
          <label>
            Display name
            <input name="display_name" required maxLength={40} placeholder="First name or nickname" autoComplete="nickname" />
          </label>
          <label>
            Student email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={`you@${STUDENT_EMAIL_DOMAIN}`}
              aria-describedby="email-hint"
            />
            <span id="email-hint" className="field-hint">Only HCC students can join. We&apos;ll email you a link to verify.</span>
          </label>
          <label>
            Password
            <PasswordInput name="password" required minLength={8} autoComplete="new-password" aria-describedby="password-hint" />
            <span id="password-hint" className="field-hint">At least 8 characters.</span>
          </label>
          {error && (
            <p className="alert error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          <button type="submit" className="btn-lg btn-block" disabled={pending} aria-busy={pending}>
            {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
            {pending ? "Creating account..." : "Create account"}
            {!pending && <ArrowRight className="arrow" aria-hidden="true" />}
          </button>
        </div>
        <p className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
      <p className="auth-trust">
        <Lock size={14} aria-hidden="true" />
        Only signed-in HCC students can see your check-ins.
      </p>
    </div>
  );
}
