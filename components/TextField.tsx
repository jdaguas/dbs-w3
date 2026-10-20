import type { ComponentProps, Ref } from "react";
import { describedBy, Field } from "./Field";

const inputClass =
  "w-full rounded-field border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted " +
  "focus:outline-2 focus:outline-offset-1 focus:outline-focus";

type Shared = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  optional?: boolean;
  hint?: string;
  hintBelow?: boolean;
  error?: string;
};

export function TextField({
  id,
  label,
  value,
  onValueChange,
  optional,
  hint,
  hintBelow,
  error,
  inputRef,
  ...props
}: Shared & { inputRef?: Ref<HTMLInputElement> } & Omit<ComponentProps<"input">, "id" | "value" | "onChange">) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} hintBelow={hintBelow} error={error}>
      <input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} ${error ? "border-danger" : "border-line-strong"}`}
        {...props}
      />
    </Field>
  );
}

export function TextArea({
  id,
  label,
  value,
  onValueChange,
  optional,
  hint,
  hintBelow,
  error,
  ...props
}: Shared & Omit<ComponentProps<"textarea">, "id" | "value" | "onChange">) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} hintBelow={hintBelow} error={error}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} min-h-28 resize-y leading-relaxed ${error ? "border-danger" : "border-line-strong"}`}
        {...props}
      />
    </Field>
  );
}
