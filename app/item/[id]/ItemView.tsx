"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner } from "@/components/Banner";
import { BoostButton } from "@/components/BoostButton";
import { ChannelIcon } from "@/components/ChannelIcon";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ChipGroup } from "@/components/ChipGroup";
import { Conversation } from "@/components/Conversation";
import { StatusLine } from "@/components/ItemCard";
import { TextArea } from "@/components/TextField";
import { TimeBar } from "@/components/TimeBar";
import {
  canBoost,
  historyOf,
  shortDate,
  withEntry,
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
  const [message, setMessage] = useState(item.message ?? "");
  const [copy, setCopy] = useState<CopyState>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const overdue = isOverdue(item, now);
  const source = sourceLabel(item);
  const history = historyOf(item);

  function changeDraft(value: string) {
    setDraft(value);
    setCopy(null);
    updateItem(item.id, { draft: value });
  }

  function changeMessage(value: string) {
    setMessage(value);
    updateItem(item.id, { message: value.trim() ? value : undefined });
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
    const at = new Date();
    const sentAt = at.toISOString();
    const log = withEntry(item, "sent", draft, at);
    if (item.ongoing) {
      updateItem(item.id, { status: "waiting", sentAt, waitingSince: sentAt, log });
      leaveWith(
        `Sent to ${item.who}. It's in Waiting now.`,
        `If ${item.who} goes quiet for ${FOLLOW_UP_DAYS} days, it comes back to the top here.`,
      );
    } else {
      updateItem(item.id, { status: "done", sentAt, log });
      leaveWith(`Replied to ${item.who}. That's off your list.`);
    }
  }

  // From "They replied → Yes": the page switches to the reply box with a fresh draft.
  function startReply(nextMessage: string) {
    setMessage(nextMessage);
    setDraft("");
    setCopy(null);
    focusDraft();
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

      {history.length > 1 && (
        <section aria-labelledby="conversation-heading" className="flex flex-col gap-3">
          <h2 id="conversation-heading" className="text-sm font-semibold text-ink">
            Conversation
          </h2>
          <Conversation history={history} now={now} />
        </section>
      )}

      {(history.length <= 1 || item.status === "needs") && (
        <TextArea
          id="message"
          label="What's it about?"
          optional
          hint="A quick note or the whole message. Saves as you type."
          value={message}
          onValueChange={changeMessage}
          error={
            message.trim().length > TEXT_MAX
              ? `Paste just the part you're replying to (under ${TEXT_MAX.toLocaleString()} characters).`
              : undefined
          }
          rows={3}
        />
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

      {item.status === "waiting" && <WaitingActions item={item} onReply={startReply} leaveWith={leaveWith} />}

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

type Action = "followUp" | "replied" | "resolve";

const ACTIONS: { value: Action; label: string }[] = [
  { value: "followUp", label: "I followed up" },
  { value: "replied", label: "They replied" },
  { value: "resolve", label: "Resolve" },
];

// Waiting: opening the item just shows it. Nothing changes until the person says what happened.
function WaitingActions({
  item,
  onReply,
  leaveWith,
}: {
  item: Item;
  onReply: (message: string) => void;
  leaveWith: (title: string, detail?: string) => void;
}) {
  const [action, setAction] = useState<Action | "">("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");
  const noteError = note.trim().length > TEXT_MAX ? `Paste just the part you need (under ${TEXT_MAX.toLocaleString()} characters).` : undefined;

  function choose(next: Action) {
    setAction(next);
    setNote("");
    setSaved("");
  }

  function cancel() {
    setAction("");
    setNote("");
  }

  function saveFollowUp() {
    if (noteError) return document.getElementById("action-note")?.focus();
    const at = new Date();
    updateItem(item.id, { log: withEntry(item, "followUp", note, at), sentAt: at.toISOString(), waitingSince: at.toISOString() });
    cancel();
    setSaved(`Follow-up saved. The sent date is now today, ${shortDate(at)}, and the ${FOLLOW_UP_DAYS}-day countdown starts over.`);
  }

  function theyReplied(wantToReply: boolean) {
    if (noteError) return document.getElementById("action-note")?.focus();
    const at = new Date();
    const log = withEntry(item, "theyReplied", note, at);
    if (wantToReply) {
      const message = note.trim() || item.message;
      updateItem(item.id, {
        status: "needs",
        log,
        message,
        createdAt: at.toISOString(),
        dueDate: dueDateFor("week", "", at),
        draft: "",
        waitingSince: undefined,
        ...NO_BOOST,
      });
      onReply(message ?? "");
    } else {
      updateItem(item.id, { status: "done", log });
      leaveWith(`All set with ${item.who}.`, "Their reply is saved in the conversation.");
    }
  }

  function resolve() {
    updateItem(item.id, { status: "done" });
    leaveWith(`Resolved your conversation with ${item.who}.`);
  }

  return (
    <section aria-label="Action taken" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 shadow-card">
      <ChipGroup
        name="action"
        legend="Action taken?"
        hint="Nothing changes until you pick one."
        options={ACTIONS}
        value={action}
        onValueChange={choose}
      />

      {action === "followUp" && (
        <div className="flex flex-col gap-3">
          <TextArea
            id="action-note"
            label="What did you send?"
            optional
            hint="Saved in the conversation so you can see it later."
            value={note}
            onValueChange={setNote}
            error={noteError}
            rows={3}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={saveFollowUp}>Save follow-up</Button>
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {action === "replied" && (
        <div className="flex flex-col gap-4">
          <TextArea
            id="action-note"
            label="What did they say?"
            optional
            hint="Paste their reply to keep it in the conversation."
            value={note}
            onValueChange={setNote}
            error={noteError}
            rows={3}
          />
          <div role="group" aria-labelledby="reply-question" className="flex flex-col gap-2">
            <p id="reply-question" className="text-sm font-semibold text-ink">
              Do you want to reply?
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => theyReplied(true)}>Yes, write a reply</Button>
              <Button variant="secondary" onClick={() => theyReplied(false)}>
                No, we&apos;re all set
              </Button>
            </div>
          </div>
        </div>
      )}

      {action === "resolve" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">This takes {item.who} off Waiting. The conversation stays saved.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={resolve}>Resolve conversation</Button>
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <p role="status" className="text-sm text-success-ink empty:hidden">
        {saved}
      </p>
    </section>
  );
}
