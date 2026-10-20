import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning";

const tones: Record<Tone, string> = {
  info: "border-info-line bg-info-soft text-info-ink",
  success: "border-success-line bg-success-soft text-success-ink",
  warning: "border-warn-line bg-warn-soft text-warn-ink",
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
    <div role={live ? "status" : undefined} className={`rounded-card border px-4 py-3 text-sm ${tones[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
    </div>
  );
}
