import type { ReactNode } from "react";

// Label, hint, and error wrappers used by every form control, so labels and
// error messages look and behave the same everywhere.

export function hintId(id: string) {
  return `${id}-hint`;
}

export function errorId(id: string) {
  return `${id}-error`;
}

export function describedBy(id: string, hint?: string, error?: string) {
  return [hint && hintId(id), error && errorId(id)].filter(Boolean).join(" ") || undefined;
}

export function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={hintId(id)} className="text-sm text-ink-muted">
      {children}
    </p>
  );
}

export function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={errorId(id)} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white"
      >
        !
      </span>
      {children}
    </p>
  );
}

function LabelText({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <>
      {label}
      {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
    </>
  );
}

/** A labeled single control (input, textarea). */
export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        <LabelText label={label} optional={optional} />
      </label>
      {hint && <Hint id={id}>{hint}</Hint>}
      {children}
      {error && <ErrorText id={id}>{error}</ErrorText>}
    </div>
  );
}

/** A labeled group of controls (chips, radios) using fieldset + legend. */
export function Fieldset({
  id,
  legend,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  legend: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={describedBy(id, hint, error)}>
      <legend className="mb-1.5 text-sm font-semibold text-ink">
        <LabelText label={legend} optional={optional} />
      </legend>
      {hint && <Hint id={id}>{hint}</Hint>}
      {children}
      {error && <ErrorText id={id}>{error}</ErrorText>}
    </fieldset>
  );
}
