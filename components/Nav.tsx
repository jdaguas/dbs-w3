import Link from "next/link";
import { Suspense } from "react";
import { AddLink } from "./AddLink";
import { LogoutButton } from "./LogoutButton";

// Shared header: the logo (home) and "+ Add someone" on the left, Log out on the right.
// Both lists (To reply, Waiting) live on Home, so there's one place to go back to.
export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-full py-1.5 pr-2 text-base font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[10px] bg-accent text-white shadow-card">
              {/* A speech bubble with a pencil line: a reply in progress. */}
              <svg viewBox="0 0 20 20" fill="none" className="size-4.5">
                <path
                  d="M4 4.5h12a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3H4A1.5 1.5 0 0 1 2.5 13V6A1.5 1.5 0 0 1 4 4.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M6.5 9.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            Drafts
          </Link>
          {/* It reads the current URL, which Next.js needs inside Suspense; it only shows in the browser anyway. */}
          <Suspense fallback={null}>
            <AddLink />
          </Suspense>
        </div>
        <LogoutButton />
      </nav>
    </header>
  );
}
