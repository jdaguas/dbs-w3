"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ChipGroup, chipId } from "@/components/ChipGroup";
import { TextField } from "@/components/TextField";
import {
  ABOUT_MAX,
  CHANNELS,
  createItem,
  dueDateFor,
  EMAIL_APPS,
  REPLY_BY,
  todayISO,
  validateItem,
  type Channel,
  type ItemErrors,
  type ItemInput,
  type ReplyBy,
} from "@/lib/items";
import { addItem } from "@/lib/storage";

export function AddForm({ initialWho, initialChannel }: { initialWho: string; initialChannel: Channel | "" }) {
  const router = useRouter();
  const [input, setInput] = useState<ItemInput>({
    who: initialWho,
    channel: initialChannel,
    emailApp: "",
    about: "",
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
        : errs.about
          ? "about"
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
      about: input.about,
      dueDate: dueDateFor(input.replyBy, input.pickedDate),
      ongoing,
    });
    addItem(item);
    router.push(`/?added=${item.id}`);
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
        autoFocus={!initialWho}
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

      <TextField
        id="about"
        label="What's it about?"
        optional
        placeholder="Dinner Sunday?"
        value={input.about}
        onValueChange={(about) => update({ about })}
        error={errors.about}
        hint={`Up to ${ABOUT_MAX} characters.`}
        autoComplete="off"
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
        <ButtonLink href="/" variant="ghost" full className="sm:w-auto">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
