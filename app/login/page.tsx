"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STUDENT_EMAIL_DOMAIN } from "@/lib/constants";
import { LogoMark } from "@/components/ui/Logo";
import PasswordInput from "@/components/ui/PasswordInput";
import Toast from "@/components/ui/Toast";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(params.get("error"));
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim().toLowerCase(),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(/not confirmed/i.test(error.message) ? "Verify your email first. Check your student inbox." : error.message);
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true" />
      {params.get("verified") && <Toast title="Email verified" message="You can log in now." />}
      <form className="auth-card animate-in" onSubmit={onSubmit}>
        <div className="auth-head">
          <LogoMark size="lg" />
          <h1>Welcome back</h1>
          <p>Log in to see who&apos;s studying on campus.</p>
        </div>
        <div className="stack">
          {params.get("verified") && (
            <p className="alert success">
              <CircleCheck size={18} aria-hidden="true" />
              <span>Email verified. You can log in now.</span>
            </p>
          )}
          <label>
            Student email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={`you@${STUDENT_EMAIL_DOMAIN}`}
              aria-invalid={error ? true : undefined}
            />
          </label>
          <label>
            Password
            <PasswordInput name="password" required autoComplete="current-password" aria-invalid={error ? true : undefined} />
          </label>
          {error && (
            <p className="alert error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          <button type="submit" className="btn-lg btn-block" disabled={pending} aria-busy={pending}>
            {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
            {pending ? "Logging in..." : "Log in"}
            {!pending && <ArrowRight className="arrow" aria-hidden="true" />}
          </button>
        </div>
        <p className="auth-foot">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </form>
      <p className="auth-trust">
        <Lock size={14} aria-hidden="true" />
        For HCC students only, verified by student email.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
