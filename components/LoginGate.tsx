"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/storage";

// Mock login, on every page: until someone passes /login on this device, any page sends them there.
// /login itself and the unlinked /demo tools stay open.
const OPEN_PATHS = ["/login", "/demo", "/demo/fresh"];

export function LoginGate({ children }: { children: ReactNode }) {
  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = store !== null && !store.signedIn && !OPEN_PATHS.includes(pathname);

  useEffect(() => {
    if (blocked) router.replace("/login");
  }, [blocked, router]);

  if (blocked) return <p className="text-ink-muted">Taking you to log in…</p>;
  return children;
}
