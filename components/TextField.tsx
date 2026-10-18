import type { ComponentProps, Ref } from "react";
import { describedBy, Field } from "./Field";

const inputClass =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-zinc-900 placeholder:text-zinc-500 " +
  "focus:outline-2 focus:outline-offset-1 focus:outline-indigo-700";

type Shared = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  optional?: boolean;
  hint?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  value,
  onValueChange,
  optional,
  hint,
  error,
  inputRef,
  ...props
}: Shared & { inputRef?: Ref<HTMLInputElement> } & Omit<ComponentProps<"input">, "id" | "value" | "onChange">) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} ${error ? "border-red-700" : "border-zinc-300"}`}
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
  error,
  ...props
}: Shared & Omit<ComponentProps<"textarea">, "id" | "value" | "onChange">) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint} error={error}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} min-h-28 resize-y leading-relaxed ${error ? "border-red-700" : "border-zinc-300"}`}
        {...props}
      />
    </Field>
  );
}
