"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner } from "@/components/Banner";
import { BoostButton } from "@/components/BoostButton";
import { ChannelIcon } from "@/components/ChannelIcon";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { StatusLine } from "@/components/ItemCard";
import { TextArea } from "@/components/TextField";
import { TimeBar } from "@/components/TimeBar";
import {
  canBoost,
  dateLabel,
  dueDateFor,
  NO_BOOST,
  FOLLOW_UP_DAYS,
  isOverdue,
  sourceLabel,
  TEXT_MAX,
  type Item,
} from "@/lib/items";
import { removeItem, setFlash, updateItem, useStore } from "@/lib/storage";

// The item page: write the draft (autosaves), copy it, mark it sent.
// Waiting items get follow-up / they replied / resolve; done items can be reopened.

export function ItemView({ id }: { id: string }) {
  const store = useStore();
  // Set just before navigating away after Delete, so the "not here" message doesn't flash.
  const [leaving, setLeaving] = useState(false);

  if (!store) return <p className="text-ink-muted">Loading your draft…</p>;
  const item = store.items.find((i) => i.id === id);
  if (!item) {
    if (leaving) return null;
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">This draft isn&apos;t here anymore.</h1>
        <p className="text-ink-soft">It may have been deleted, or saved in a different browser.</p>
        <ButtonLink href="/">Go to Drafts</ButtonLink>
      </div>
    );
  }

  return (
    <>
      {!store.canSave && (
        <Banner tone="warning" title="This browser isn't saving.">
          Your drafts will disappear when you close the tab.
        </Banner>
      )}
      <ItemDetail item={item} onLeave={() => setLeaving(true)} />
    </>
  );
}

type CopyState = { ok: boolean; text: string } | null;

function ItemDetail({ item, onLeave }: { item: Item; onLeave: () => void }) {
  const router = useRouter();
  const [now] = useState(() => new Date());
  const [draft, setDraft] = useState(item.draft);
  const [copy, setCopy] = useState<CopyState>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const overdue = isOverdue(item, now);
  const source = sourceLabel(item);

  function changeDraft(value: string) {
    setDraft(value);
    setCopy(null);
    updateItem(item.id, { draft: value });
  }

  function focusDraft() {
    requestAnimationFrame(() => document.getElementById("draft")?.focus());
  }

  async function copyReply() {
    if (!draft.trim()) {
      setCopy({ ok: false, text: "Write your reply first, then copy it." });
      return focusDraft();
    }
    try {
      await navigator.clipboard.writeText(draft);
      setCopy({ ok: true, text: `Copied. Paste it into ${source}, then mark it sent.` });
    } catch {
      setCopy({ ok: false, text: "Couldn't copy. Select the text and copy it yourself." });
      const box = document.getElementById("draft") as HTMLTextAreaElement | null;
      box?.focus();
      box?.select();
    }
  }

  function leaveWith(title: string, detail?: string) {
    setFlash({ title, detail });
    router.push("/");
  }

  function markSent() {
    const sentAt = new Date().toISOString();
    if (item.ongoing) {
      updateItem(item.id, { status: "waiting", sentAt, waitingSince: sentAt });
      leaveWith(
        `Sent to ${item.who}. It's in Waiting now.`,
        `If ${item.who} goes quiet for ${FOLLOW_UP_DAYS} days, it comes back to the top here.`,
      );
    } else {
      updateItem(item.id, { status: "done", sentAt });
      leaveWith(`Replied to ${item.who}. That's off your list.`);
    }
  }

  // Waiting → back to To reply with a fresh draft (a follow-up, or answering their reply).
  function backToReply(theyReplied: boolean) {
    setDraft("");
    setCopy(null);
    updateItem(item.id, {
      status: "needs",
      draft: "",
      waitingSince: undefined,
      ...(theyReplied && { createdAt: new Date().toISOString(), dueDate: dueDateFor("week", ""), ...NO_BOOST }),
    });
    focusDraft();
  }

  function resolve() {
    updateItem(item.id, { status: "done" });
    leaveWith(`Resolved your conversation with ${item.who}.`);
  }

  function reopen() {
    setDraft("");
    updateItem(item.id, { status: "needs", draft: "", sentAt: undefined, waitingSince: undefined, ...NO_BOOST });
    focusDraft();
  }

  function deleteItem() {
    onLeave();
    removeItem(item.id);
    leaveWith(`Deleted ${item.who}.`);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <ChannelIcon item={item} size="lg" muted={overdue} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">{item.who}</h1>
            <p className="text-sm text-ink-muted">{dateLabel(item, now)}</p>
          </div>
        </div>
        {item.status !== "done" && (
          <div>
            <StatusLine item={item} now={now} className="text-sm text-ink-muted" />
            <TimeBar item={item} now={now} />
          </div>
        )}
        {canBoost(item, now) && (
          <div>
            <BoostButton item={item} />
          </div>
        )}
      </header>

      {item.message && (
        <section aria-labelledby="about-heading" className="flex flex-col gap-2">
          <h2 id="about-heading" className="text-sm font-semibold text-ink">
            What it&apos;s about
          </h2>
          <div
            tabIndex={0}
            aria-labelledby="about-heading"
            className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-field border border-line bg-canvas px-3.5 py-2.5 text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
          >
            {item.message}
          </div>
        </section>
      )}

      {item.status === "needs" && (
        <section aria-label="Your reply" className="flex flex-col gap-4">
          <TextArea
            id="draft"
            label="Your reply"
            hint="Saves as you type, so you can come back to it."
            value={draft}
            onValueChange={changeDraft}
            error={
              draft.trim().length > TEXT_MAX
                ? `Shorten your reply to under ${TEXT_MAX.toLocaleString()} characters.`
                : undefined
            }
            rows={6}
          />
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            <Button onClick={markSent} full className="sm:w-auto">
              Mark sent
            </Button>
            <Button variant="secondary" onClick={copyReply} full className="sm:w-auto">
              Copy reply
            </Button>
          </div>
          <p role="status" className={copy?.ok === false ? "text-sm font-medium text-danger" : "text-sm text-ink-soft"}>
            {copy?.text}
          </p>
          <Checkbox
            id="ongoing"
            label="Keep tracking after I reply"
            hint={
              item.ongoing
                ? "After you mark it sent, it moves to Waiting until they answer."
                : "Off: marking it sent takes it off your list."
            }
            checked={item.ongoing}
            onCheckedChange={(ongoing) => updateItem(item.id, { ongoing })}
          />
        </section>
      )}

      {item.status === "waiting" && (
        <section aria-label="Waiting on them" className="flex flex-col gap-4">
          {item.draft.trim() && (
            <div className="flex flex-col gap-2">
              <h2 id="sent-heading" className="text-sm font-semibold text-ink">
                What you sent
              </h2>
              <p className="whitespace-pre-wrap rounded-field border border-line bg-canvas px-3.5 py-2.5 text-ink">
                {item.draft}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={() => backToReply(true)} full className="sm:w-auto">
              They replied. I need to answer
            </Button>
            <Button variant="secondary" onClick={() => backToReply(false)} full className="sm:w-auto">
              Write a follow-up
            </Button>
            <Button variant="secondary" onClick={resolve} full className="sm:w-auto">
              Resolve conversation
            </Button>
          </div>
        </section>
      )}

      {item.status === "done" && (
        <section aria-label="Done" className="flex flex-col items-start gap-3">
          <p className="text-ink-soft">This one&apos;s done. Need to write back again?</p>
          <Button variant="secondary" onClick={reopen}>
            Move back to To reply
          </Button>
        </section>
      )}

      <section aria-label="Delete" className="border-t border-line pt-6">
        {confirmingDelete ? (
          <div role="group" aria-labelledby="delete-question" className="flex flex-col gap-3">
            <p id="delete-question" className="text-sm font-semibold text-ink">
              Delete {item.who} and the draft? This can&apos;t be undone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="danger" onClick={deleteItem}>
                Delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)} autoFocus>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
            Delete
          </Button>
        )}
      </section>
    </div>
  );
}
