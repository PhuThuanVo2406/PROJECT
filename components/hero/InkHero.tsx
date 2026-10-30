import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import InkCanvas from "./InkCanvas";

const HEADLINE = "Find someone to study with on campus";
const SUBLINE = "Check in when you are on campus, see who else is studying the same subject, and message them.";

/** Splits a line into words that rise in one after another (see .ink-word). */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={i} className="ink-word" style={{ "--i": i } as React.CSSProperties}>
      {word}
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}

/** Full-screen home hero: fluid ink behind a dark scrim, with the page copy on top. */
export default function InkHero({ total }: { total: number }) {
  return (
    <section className="ink" aria-labelledby="ink-title">
      <InkCanvas />
      <div className="ink-scrim" aria-hidden="true" />

      <header className="ink-nav ink-reveal">
        <Link href="/" className="ink-brand" aria-label="Study Buddy home">
          <LogoMark />
          <span>Study Buddy</span>
        </Link>
        <nav className="ink-links" aria-label="Home sections">
          <a href="#numbers-title">Who&apos;s studying</a>
          <a href="#now-title">By campus</a>
          <Link href="/about">About Us</Link>
        </nav>
        <div className="ink-nav-right">
          <Link href="/login" className="ink-text-link">Log in</Link>
          <Link href="/signup" className="ink-pill">Get started</Link>
        </div>
      </header>

      <div className="ink-column">
        <p className="ink-badge ink-reveal">
          {total > 0 ? (
            <>
              <span className="ink-live" aria-hidden="true" />
              {total} {total === 1 ? "student" : "students"} studying on campus now
            </>
          ) : (
            "For Houston Community College students"
          )}
        </p>
        <h1 id="ink-title" className="ink-title">
          <Words text={HEADLINE} />
        </h1>
        <p className="ink-sub">
          <Words text={SUBLINE} />
        </p>
        <div className="ink-actions ink-reveal">
          <Link href="/signup" className="ink-pill ink-pill-lg">Get started</Link>
          <Link href="/login" className="ink-pill ink-pill-glass ink-pill-lg">Log in</Link>
        </div>
      </div>

      <footer className="ink-foot ink-reveal">
        We never track your exact location. Sign up with your student email.
      </footer>
    </section>
  );
}
