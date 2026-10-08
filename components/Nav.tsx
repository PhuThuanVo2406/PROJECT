import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "./ui/Logo";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let name = "";
  if (user) {
    const { data } = await supabase.from("profiles").select("is_admin, display_name").eq("id", user.id).single();
    isAdmin = Boolean(data?.is_admin);
    name = data?.display_name ?? "";
  }

  return (
    <header className="nav">
      <nav className="nav-inner" aria-label="Main">
        <Link href={user ? "/dashboard" : "/"} className="brand" aria-label="HCC Study Buddy home">
          <LogoMark />
          <span className="brand-name">
            <span>HCC</span>Study Buddy
          </span>
        </Link>
        {user ? (
          <>
            <NavLinks isAdmin={isAdmin} />
            <div className="nav-right">
              <UserMenu name={name || user.email || "Student"} email={user.email ?? ""} userId={user.id} isAdmin={isAdmin} />
            </div>
          </>
        ) : (
          <div className="nav-right">
            <Link href="/about" className="btn btn-ghost nav-about">About Us</Link>
            <Link href="/login" className="btn btn-ghost">Log in</Link>
            <Link href="/signup" className="btn">Sign up</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
