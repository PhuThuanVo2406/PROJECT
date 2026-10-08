import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "HCC Study Buddy",
  description: "Find HCC classmates studying on your campus right now.",
};

function SetupNeeded() {
  return (
    <main className="container">
      <div className="card stack">
        <h1>Almost there: the site needs its Supabase settings</h1>
        <p>
          In Vercel, open this project, go to <strong>Settings &gt; Environment Variables</strong>, and add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
        <p>
          Then go to <strong>Deployments</strong>, open the menu on the newest one, and choose{" "}
          <strong>Redeploy</strong>. The settings only take effect after a redeploy.
        </p>
      </div>
    </main>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {isSupabaseConfigured ? (
          <>
            <Nav />
            <main className="container">{children}</main>
          </>
        ) : (
          <SetupNeeded />
        )}
      </body>
    </html>
  );
}
