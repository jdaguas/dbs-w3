"use client";

import { useState } from "react";
import { boostPatch, nextBoost, replyByLabel, type Item } from "@/lib/items";
import { updateItem } from "@/lib/storage";

// "+4 hours" for a reply that's past its date. Each tap gives more than the last
// (4 hours → 8 hours → a day at a time) and refills the time bar.

export function BoostButton({ item, className = "" }: { item: Item; className?: string }) {
  const [announcement, setAnnouncement] = useState("");
  const step = nextBoost(item);

  function boost() {
    const now = new Date();
    const patch = boostPatch(item, now);
    updateItem(item.id, patch);
    const by = replyByLabel({ ...item, ...patch }, now);
    setAnnouncement(`Added ${step.label}. Reply by ${by?.date}.`);
  }

  return (
    <>
      <button
        type="button"
        onClick={boost}
        aria-label={`Give ${item.who} ${step.label} more`}
        className={
          "inline-flex min-h-8 items-center gap-1 rounded-full bg-accent-soft px-3 text-xs font-semibold text-accent-ink transition-colors " +
          "hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
          className
        }
      >
        <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
          <path d="M6.8 1 2.5 7h3l-.8 4L9.5 5h-3l.3-4Z" fill="currentColor" />
        </svg>
        +{step.label}
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
