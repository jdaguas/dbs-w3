"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { sampleItems } from "@/lib/demo";
import { replaceItems, setFlash } from "@/lib/storage";

// Not linked from the app: open /demo to fill Drafts with sample people for testing or a walkthrough.
export default function DemoPage() {
  const router = useRouter();

  function load() {
    const items = sampleItems();
    replaceItems(items);
    setFlash({
      title: "Loaded sample drafts.",
      detail: `${items.filter((i) => i.status === "needs").length} to reply and ${items.filter((i) => i.status === "waiting").length} waiting on them.`,
    });
    router.push("/");
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Load sample drafts</h1>
      <p className="text-ink-soft">
        Fills Drafts with made-up people so you can try every state: past due, due today, drafts in progress, no
        rush, and conversations waiting on a reply. This replaces anything saved in this browser.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={load}>Replace with samples</Button>
        <ButtonLink href="/" variant="ghost">
          Cancel
        </ButtonLink>
      </div>
    </div>
  );
}
