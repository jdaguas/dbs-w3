"use client";

import { useRouter } from "next/navigation";
import { signOut, useStore } from "@/lib/storage";
import { Button } from "./Button";

// In the shared header, only while logged in (the mock login). Drafts stay saved.
export function LogoutButton() {
  const store = useStore();
  const router = useRouter();
  if (!store?.signedIn) return null;

  function logOut() {
    signOut();
    router.push("/login");
  }

  return (
    <Button variant="ghost" className="min-h-10 px-4" onClick={logOut}>
      Log out
    </Button>
  );
}
