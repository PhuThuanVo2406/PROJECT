import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    isAdmin = Boolean(data?.is_admin);
  }

  return (
    <nav className="nav">
      <Link href={user ? "/dashboard" : "/"} className="brand">
        HCC Study Buddy
      </Link>
      {user ? (
        <>
          <Link href="/dashboard">Check in</Link>
          <Link href="/study-now">Studying now</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/profile">Profile</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          <form action="/auth/signout" method="post">
            <button className="secondary" type="submit">Sign out</button>
          </form>
        </>
      ) : (
        <>
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="button">Sign up</Link>
        </>
      )}
    </nav>
  );
}
