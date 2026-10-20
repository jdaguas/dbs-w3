"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { resetAll } from "@/lib/storage";

// Not linked from the app: open /demo/fresh to see Drafts exactly as a brand-new visitor would.
export default function FreshDemoPage() {
  const router = useRouter();

  function start() {
    resetAll();
    router.push("/");
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Start as a new visitor</h1>
      <p className="text-ink-soft">
        Clears everything Drafts saved in this browser so Home shows the first visit: the quick-add, starter chips,
        and the sample item. This erases anything saved here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={start}>Clear and start fresh</Button>
        <ButtonLink href="/demo" variant="ghost">
          Load sample drafts instead
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Cancel
        </ButtonLink>
      </div>
    </div>
  );
}
