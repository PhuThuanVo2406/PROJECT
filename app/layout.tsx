import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Study Buddy",
  description: "Find classmates studying on your campus right now.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

function SetupNeeded() {
  return (
    <main className="container">
      <div className="card stack" style={{ maxWidth: 640, margin: "0 auto" }}>
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
    <html lang="en" className={jakarta.variable}>
      <body>
        {isSupabaseConfigured ? (
          <>
            <Nav />
            <main className="container">{children}</main>
            <footer className="site-footer">
              <div className="site-footer-inner">
                <span>Study Buddy</span>
                <nav aria-label="Footer">
                  <Link href="/about">About Us</Link>
                </nav>
              </div>
            </footer>
          </>
        ) : (
          <SetupNeeded />
        )}
      </body>
    </html>
  );
}
