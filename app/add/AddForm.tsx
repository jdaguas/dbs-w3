"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ChipGroup, chipId } from "@/components/ChipGroup";
import { TextArea, TextField } from "@/components/TextField";
import {
  CHANNELS,
  createItem,
  dueDateFor,
  EMAIL_APPS,
  REPLY_BY,
  todayISO,
  validateItem,
  type Channel,
  type Item,
  type ItemErrors,
  type ItemInput,
  type ReplyBy,
} from "@/lib/items";
import { addItem, addedFlash, setFlash } from "@/lib/storage";

// The full add form. On /add it saves and goes Home; inside Home's "Add someone"
// panel it hands the new item to `onAdded` and Cancel closes the panel.
export function AddForm({
  initialWho = "",
  initialChannel = "",
  onAdded,
  onCancel,
}: {
  initialWho?: string;
  initialChannel?: Channel | "";
  onAdded?: (item: Item) => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState<ItemInput>({
    who: initialWho,
    channel: initialChannel,
    emailApp: "",
    message: "",
    draft: "",
    replyBy: "week",
    pickedDate: "",
  });
  const [ongoing, setOngoing] = useState(false);
  const [errors, setErrors] = useState<ItemErrors>({});
  const [triedSubmit, setTriedSubmit] = useState(false);

  // After the first submit, errors update as the person fixes them.
  function update(patch: Partial<ItemInput>) {
    const next = { ...input, ...patch };
    setInput(next);
    if (triedSubmit) setErrors(validateItem(next));
  }

  function focusFirstError(errs: ItemErrors) {
    const target = errs.who
      ? "who"
      : errs.channel
        ? chipId("channel", input.channel || CHANNELS[0].value)
        : errs.message
            ? "message"
            : errs.draft
              ? "draft"
              : errs.replyBy
                ? "pickedDate"
                : null;
    if (target) document.getElementById(target)?.focus();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
    const errs = validateItem(input);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return; // Everything typed stays in the form.
    }
    const item = createItem({
      who: input.who,
      channel: input.channel as Channel,
      emailApp: input.emailApp,
      message: input.message,
      draft: input.draft.trim() ? input.draft : "",
      dueDate: dueDateFor(input.replyBy, input.pickedDate),
      ongoing,
    });
    addItem(item);
    if (onAdded) return onAdded(item);
    setFlash(addedFlash(item.who));
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <TextField
        id="who"
        label="Who"
        hint="A name is enough: Mom, Professor Lee, landlord."
        value={input.who}
        onValueChange={(who) => update({ who })}
        error={errors.who}
        autoComplete="off"
        autoFocus={!onAdded && !initialWho}
      />

      <ChipGroup
        name="channel"
        legend="Where did it come from?"
        options={CHANNELS}
        value={input.channel}
        onValueChange={(channel) => update({ channel })}
        error={errors.channel}
      />

      {input.channel === "email" && (
        <ChipGroup
          name="emailApp"
          legend="Which email app?"
          optional
          options={EMAIL_APPS}
          value={input.emailApp}
          onValueChange={(emailApp) => update({ emailApp })}
        />
      )}

      <TextArea
        id="message"
        label="What's it about?"
        optional
        hint="A quick note like “Dinner Sunday?”, or paste the whole email or text."
        value={input.message}
        onValueChange={(message) => update({ message })}
        error={errors.message}
      />

      <TextArea
        id="draft"
        label="Your reply"
        optional
        hint="Start it now, or leave it for later."
        value={input.draft}
        onValueChange={(draft) => update({ draft })}
        error={errors.draft}
      />

      <div className="flex flex-col gap-3">
        <ChipGroup<ReplyBy>
          name="replyBy"
          legend="Reply by"
          options={REPLY_BY}
          value={input.replyBy}
          onValueChange={(replyBy) => update({ replyBy })}
          error={input.replyBy === "date" ? undefined : errors.replyBy}
        />
        {input.replyBy === "date" && (
          <TextField
            id="pickedDate"
            label="Date"
            type="date"
            min={todayISO()}
            value={input.pickedDate}
            onValueChange={(pickedDate) => update({ pickedDate })}
            error={errors.replyBy}
          />
        )}
        <Checkbox
          id="ongoing"
          label="Keep tracking after I reply"
          hint="For back-and-forth conversations. After you send, it moves to Waiting until they answer."
          checked={ongoing}
          onCheckedChange={setOngoing}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
        <Button type="submit" full className="sm:w-auto">
          Add to Drafts
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} full className="sm:w-auto">
            Cancel
          </Button>
        ) : (
          <ButtonLink href="/" variant="ghost" full className="sm:w-auto">
            Cancel
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
