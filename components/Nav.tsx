import Link from "next/link";

// Shared header. Both lists (To reply, Waiting) live on Home, so there's one place to go back to.
export function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-xl items-center px-4 py-3">
        <Link
          href="/"
          className="rounded-full px-1 py-2 text-base font-semibold tracking-tight text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          Drafts
        </Link>
      </nav>
    </header>
  );
}
