import Link from 'next/link';

/**
 * Shell for the plain-text trust pages (/about, /contact, /privacy).
 *
 * The global body style is uppercase — deliberate on the terminal, unreadable
 * for 500+ characters of prose — so this shell resets to normal-case. Agents
 * and humans both read these; keep them server-rendered and JS-free.
 */
export function ProsePage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-neutral-300">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="text-xs tracking-widest text-neutral-500 hover:text-neutral-300"
        >
          &larr; SHADOWMODE
        </Link>

        <h1 className="mt-10 text-2xl font-semibold tracking-widest text-neutral-100">
          {title}
        </h1>
        <p className="mt-2 text-xs tracking-widest text-neutral-600">
          LAST UPDATED {updated}
        </p>

        <div className="prose-shadowmode mt-10 normal-case leading-relaxed text-neutral-400">
          {children}
        </div>

        <nav className="mt-16 flex gap-6 border-t border-neutral-900 pt-6 text-xs tracking-widest text-neutral-600">
          <Link href="/about" className="hover:text-neutral-400">ABOUT</Link>
          <Link href="/contact" className="hover:text-neutral-400">CONTACT</Link>
          <Link href="/privacy" className="hover:text-neutral-400">PRIVACY</Link>
          <a href="/openapi.json" className="hover:text-neutral-400">API</a>
        </nav>
      </div>
    </main>
  );
}
