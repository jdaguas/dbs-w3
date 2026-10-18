"use client";

// Temporary Home: lists what's saved so the add form can be tried end to end.
// The full Home (quick-add, first visit, welcome back) is the next step.

import { ButtonLink } from "@/components/Button";
import { Banner } from "@/components/Banner";
import { ItemCard } from "@/components/ItemCard";
import { sortNeedsReply } from "@/lib/items";
import { useStore } from "@/lib/storage";

export default function Home() {
  const store = useStore();
  const items = store ? sortNeedsReply(store.items) : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">To reply</h1>
      {store && !store.canSave && (
        <Banner tone="warning" title="This browser isn't saving.">
          Your drafts will disappear when you close the tab.
        </Banner>
      )}
      {items === null ? (
        <p className="text-zinc-600">Loading…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-zinc-700">Nothing saved yet.</p>
          <ButtonLink href="/add">Add a reply you owe</ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
