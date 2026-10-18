import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "warn";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-ink-soft",
  accent: "bg-accent-soft text-accent-ink",
  warn: "bg-warn-soft text-warn-ink",
};

/** A small label pill: where it came from, "Draft started", "Past your date". */
export function Tag({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
