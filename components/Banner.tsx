import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning";

const tones: Record<Tone, string> = {
  info: "border-indigo-200 bg-indigo-50 text-indigo-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
};

/** A short message block. `live` announces it to screen readers when it appears. */
export function Banner({
  tone = "info",
  title,
  live = false,
  children,
}: {
  tone?: Tone;
  title?: string;
  live?: boolean;
  children?: ReactNode;
}) {
  return (
    <div role={live ? "status" : undefined} className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
    </div>
  );
}
