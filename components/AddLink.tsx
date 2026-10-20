"use client";

import { usePathname } from "next/navigation";
import { useStore } from "@/lib/storage";
import { ButtonLink } from "./Button";

// "+ Add someone" in the shared header, so adding is one click from anywhere, however long the list.
// Opens the full form at /add. Hidden until you're logged in, like Log out.
export function AddLink() {
  const store = useStore();
  const pathname = usePathname();
  if (!store?.signedIn) return null;

  return (
    <ButtonLink href="/add" className="min-h-10 px-4" aria-current={pathname === "/add" ? "page" : undefined}>
      <span aria-hidden="true">+</span> Add someone
    </ButtonLink>
  );
}
