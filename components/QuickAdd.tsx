"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { createItem, dueDateFor, CHANNELS, validateItem, type Channel, type Item, type ItemErrors } from "@/lib/items";
import { addItem } from "@/lib/storage";
import { Button } from "./Button";
import { ChipGroup, chipId } from "./ChipGroup";
import { TextField } from "./TextField";

// Home's fast path: Who + Where, then Enter. Defaults to "This week" and one-time.
// Same validation and messages as the full form; "More options" carries what was typed to /add.

export function QuickAdd({ onAdded }: { onAdded: (item: Item) => void }) {
  const [who, setWho] = useState("");
  const [channel, setChannel] = useState<Channel | "">("");
  const [errors, setErrors] = useState<ItemErrors>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const whoRef = useRef<HTMLInputElement>(null);

  function check(nextWho: string, nextChannel: Channel | "") {
    return validateItem({ who: nextWho, channel: nextChannel, emailApp: "", message: "", draft: "", replyBy: "week", pickedDate: "" });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
    const errs = check(who, channel);
    setErrors(errs);
    if (errs.who) return whoRef.current?.focus();
    if (errs.channel) return document.getElementById(chipId("qa-channel", CHANNELS[0].value))?.focus();

    const item = createItem({ who, channel: channel as Channel, dueDate: dueDateFor("week", ""), ongoing: false });
    addItem(item);
    onAdded(item);
    setWho("");
    setChannel("");
    setTriedSubmit(false);
    whoRef.current?.focus();
  }

  const moreHref = `/add?${new URLSearchParams({ ...(who.trim() && { who: who.trim() }), ...(channel && { channel }) })}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-label="Quick add">
      <TextField
        id="qa-who"
        label="Who"
        placeholder="Mom, Professor Lee, landlord…"
        inputRef={whoRef}
        value={who}
        onValueChange={(v) => {
          setWho(v);
          if (triedSubmit) setErrors(check(v, channel));
        }}
        error={errors.who}
        autoComplete="off"
        enterKeyHint="done"
      />
      <ChipGroup
        name="qa-channel"
        legend="Where did it come from?"
        options={CHANNELS}
        value={channel}
        onValueChange={(v) => {
          setChannel(v);
          if (triedSubmit) setErrors(check(who, v));
        }}
        error={errors.channel}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit">Add</Button>
        <Link
          href={moreHref}
          className="rounded text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          More options: reply by, notes, draft
        </Link>
      </div>
      <p className="text-sm text-zinc-600">Quick adds are due this week. Use More options to pick a different date.</p>
    </form>
  );
}
