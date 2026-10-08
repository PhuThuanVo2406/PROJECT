"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <form className="card stack" onSubmit={onSubmit} style={{ maxWidth: 440, margin: "0 auto" }}>
      <h1>Log in</h1>
      {params.get("verified") && <p className="notice">Email verified. You can log in now.</p>}
      <label>
        Student email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "Logging in..." : "Log in"}</button>
      <p className="muted">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
