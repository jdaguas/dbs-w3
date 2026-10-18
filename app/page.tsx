"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { ItemCard } from "@/components/ItemCard";
import { QuickAdd } from "@/components/QuickAdd";
import { TabPanel, Tabs } from "@/components/Tabs";
import { AddForm } from "./add/AddForm";
import { createItem, daysSince, dueDateFor, followUpsDue, sentThisWeek, sortNeedsReply, waitingOn, type Channel, type Item } from "@/lib/items";
import { addItem, addedFlash, clearFlash, getPreviousVisit, peekFlash, useStore, type Store } from "@/lib/storage";

// Home: the first visit (nothing saved), coming back (welcome + who's waiting),
// and the main list. Saved data only exists in the browser, so the server
// renders the loading line and the browser fills in the rest.

export default function Home() {
  const store = useStore();
  if (!store) return <p className="text-ink-muted">Loading your drafts…</p>;
  return <HomeContent store={store} />;
}

const STARTERS: { who: string; channel: Channel }[] = [
  { who: "Mom", channel: "text" },
  { who: "Group chat", channel: "text" },
  { who: "Recruiter", channel: "email" },
  { who: "Landlord", channel: "email" },
];

// The example card on the first visit: shows what a drafting item looks like. Not saved.
function exampleItem(now: Date): Item {
  return {
    ...createItem({
      who: "Sam",
      channel: "text",
      message: "Are you still coming Saturday?",
      dueDate: dueDateFor("tomorrow", "", now),
      ongoing: false,
      draft: "Yes! Running a bit late, see you at 7.",
    }),
    id: "example",
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function welcomeSummary(needs: Item[], followUps: Item[], now: Date) {
  const parts: string[] = [];
  if (needs.length > 0) {
    const oldest = needs.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
    const days = daysSince(oldest.createdAt, now);
    const since = days >= 2 ? `, ${oldest.who} for ${days} days` : days === 1 ? `, ${oldest.who} since yesterday` : "";
    parts.push(`${plural(needs.length, "person is", "people are")} waiting on a reply${since}.`);
  }
  if (followUps.length > 0) {
    parts.push(`${plural(followUps.length, "conversation has", "conversations have")} gone quiet.`);
  }
  return parts.length > 0 ? parts.join(" ") : "You're all caught up.";
}

// Which list was showing, kept across visits to an item page and back (not saved).
type List = "reply" | "waiting";
let lastList: List = "reply";

function Count({ n }: { n: number }) {
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-xs font-semibold text-accent-ink">
      {n}
    </span>
  );
}

function EmptyList({ children }: { children: ReactNode }) {
  return <p className="rounded-card border border-line bg-surface px-4 py-6 text-center text-ink-soft">{children}</p>;
}

function CardList({ items, now }: { items: Item[]; now: Date }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} now={now} />
        </li>
      ))}
    </ul>
  );
}

function HomeContent({ store }: { store: Store }) {
  const [now] = useState(() => new Date());
  const [previousVisit] = useState(() => getPreviousVisit());
  // Confirmation after adding or sending (from another page via flash, or from quick-add/starters directly).
  const [flash, setFlash] = useState(() => peekFlash());
  useEffect(() => clearFlash(), []);

  // Most urgent first. Boosting doesn't reshuffle the list while you're looking at it (so you can
  // tap again in place); the order refreshes when items are added or removed, or on the next visit.
  const sorted = sortNeedsReply(store.items, now);
  const [order, setOrder] = useState(() => sorted.map((i) => i.id));
  const sameItems = sorted.length === order.length && sorted.every((i) => order.includes(i.id));
  if (!sameItems) setOrder(sorted.map((i) => i.id));
  const needs = sameItems ? order.map((id) => sorted.find((i) => i.id === id)!) : sorted;
  const followUps = followUpsDue(store.items, now);
  // Includes the quiet ones also shown under Follow up, so the count matches the list.
  const waiting = waitingOn(store.items);
  const [list, setList] = useState<List>(lastList);

  function chooseList(next: List) {
    lastList = next;
    setList(next);
  }
  const isFirstVisit = store.isNew;
  const showWelcome = !isFirstVisit && previousVisit !== null;

  // Add someone starts closed when there's a list to look at.
  const [addOpen, setAddOpen] = useState(() => needs.length === 0 && followUps.length === 0);

  function toggleAdd(open: boolean) {
    setAddOpen(open);
    if (open) requestAnimationFrame(() => document.getElementById("who")?.focus());
  }

  // Close the panel and confirm at the top, above the list where the new card appears.
  function closeAdd(item?: Item) {
    if (item) setFlash(addedFlash(item.who));
    setAddOpen(false);
    document.getElementById("add-summary")?.focus();
    if (item) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirm(item: Item) {
    setFlash(addedFlash(item.who));
  }

  function addStarter(starter: (typeof STARTERS)[number]) {
    const item = createItem({ ...starter, dueDate: dueDateFor("week", "", now), ongoing: false });
    addItem(item);
    confirm(item);
  }

  const warning = !store.canSave && (
    <Banner tone="warning" title="This browser isn't saving.">
      Your drafts will disappear when you close the tab.
    </Banner>
  );
  const flashBanner = flash && (
    <Banner tone="success" live title={flash.title}>
      {flash.detail}
    </Banner>
  );

  if (isFirstVisit) {
    return (
      <div className="flex flex-col gap-8">
        {warning}
        <section aria-labelledby="add-heading" className="flex flex-col gap-4">
          <div>
            <h1 id="add-heading" className="text-2xl font-semibold tracking-tight text-ink">
              Who do you owe a reply?
            </h1>
            <p className="mt-1 text-ink-soft">
              Log messages you can&apos;t answer yet. Write back when you have a minute.
            </p>
          </div>
          <QuickAdd onAdded={confirm} />
          {flashBanner}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-ink">Or start with:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <Button key={s.who} variant="secondary" className="min-h-10 px-4" onClick={() => addStarter(s)}>
                  <span aria-hidden="true">+</span> {s.who}
                </Button>
              ))}
            </div>
            <p className="text-sm text-ink-muted">Tap one and it&apos;s on your list.</p>
          </div>
        </section>

        <section aria-labelledby="example-heading" className="flex flex-col gap-3">
          <h2 id="example-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            What an item looks like
          </h2>
          <ItemCard item={exampleItem(now)} now={now} example />
          <p className="text-sm text-ink-muted">
            Start a reply whenever you have a minute, copy it into the real app, then mark it sent.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {warning}
      <h1 className="sr-only">Drafts</h1>
      {(showWelcome || flash) && (
        <div className="flex flex-col gap-3">
          {showWelcome && <Banner title="Welcome back.">{welcomeSummary(needs, followUps, now)}</Banner>}
          {flashBanner}
        </div>
      )}

      {followUps.length > 0 && (
        <section aria-labelledby="followup-heading" className="flex flex-col gap-3">
          <h2 id="followup-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Follow up · {followUps.length}
          </h2>
          <CardList items={followUps} now={now} />
        </section>
      )}

      <section aria-label="Your lists" className="flex flex-col gap-4">
        <Tabs
          id="lists"
          label="Lists"
          value={list}
          onValueChange={chooseList}
          tabs={[
            { value: "reply", label: <>To reply <Count n={needs.length} /></> },
            { value: "waiting", label: <>Waiting <Count n={waiting.length} /></> },
          ]}
        />
        <TabPanel id="lists" value={list}>
          {list === "reply" ? (
            needs.length === 0 ? (
              <EmptyList>You&apos;re all caught up. Add someone below when a message comes in.</EmptyList>
            ) : (
              <CardList items={needs} now={now} />
            )
          ) : waiting.length === 0 ? (
            <EmptyList>
              No one owes you a reply right now. Turn on &ldquo;Keep tracking after I reply&rdquo; on an item to follow
              the conversation here.
            </EmptyList>
          ) : (
            <div className="flex flex-col gap-3">
              <CardList items={waiting} now={now} />
              <p className="text-sm text-ink-muted">
                {plural(sentThisWeek(store.items, now), "reply", "replies")} sent this week.
              </p>
            </div>
          )}
        </TabPanel>
      </section>

      {/* The full form, tucked away so the list comes first; opens on its own when there's nothing to reply to. */}
      <details
        open={addOpen}
        onToggle={(e) => e.currentTarget.open !== addOpen && toggleAdd(e.currentTarget.open)}
        className="group rounded-card border border-line bg-surface shadow-card"
      >
        <summary id="add-summary" className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 font-semibold text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-accent text-base leading-none text-white">
              +
            </span>
            Add someone
          </span>
          <span aria-hidden="true" className="text-ink-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="flex flex-col gap-4 border-t border-line px-4 pb-4 pt-4">
          {/* Mounted only while open, so it starts empty each time. */}
          {addOpen && <AddForm onAdded={closeAdd} onCancel={() => closeAdd()} />}
        </div>
      </details>
    </div>
  );
}
