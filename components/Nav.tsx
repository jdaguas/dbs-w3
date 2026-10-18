"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "./Button";

const tabs = [
  { href: "/", label: "Drafts" },
  { href: "/waiting", label: "Waiting" },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/item") : pathname.startsWith(href));

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-xl items-center gap-1 px-4 py-3">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 " +
                (active ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:text-zinc-900")
              }
            >
              {tab.label}
            </Link>
          );
        })}
        <Link
          href="/add"
          aria-current={pathname === "/add" ? "page" : undefined}
          className={buttonClass({ variant: "primary", className: "ml-auto min-h-10 px-4" })}
        >
          <span aria-hidden="true">+</span> Add
        </Link>
      </nav>
    </header>
  );
}
