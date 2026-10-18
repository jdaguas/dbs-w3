import { followUpFraction, timeLeftFraction, type Item } from "@/lib/items";

// A "health bar" with an arrow riding its edge. Decorative: the status line says the same in words.
// - To reply: the window from received to the reply-by date. The fill drains from the left, so the
//   arrow travels left → right toward the date. Amber at ≤ 25% left; past the date the bar is empty
//   and the arrow rests, greyed, at the end. No rush: solid, no arrow.
// - Waiting: the days until a follow-up is due. The fill drains from the right, so the arrow travels
//   right → left, back toward you.

type Tone = "accent" | "warn" | "waiting" | "spent";

const fills: Record<Tone, string> = {
  accent: "bg-accent",
  warn: "bg-warn",
  waiting: "bg-ink-muted",
  spent: "",
};

const markers: Record<Tone, string> = {
  accent: "border-accent text-accent",
  warn: "border-warn text-warn",
  waiting: "border-ink-muted text-ink-muted",
  spent: "border-line-hover text-ink-muted",
};

export function TimeBar({ item, now }: { item: Item; now: Date }) {
  if (item.status === "done") return null;

  if (item.status === "waiting") {
    const left = followUpFraction(item, now);
    return <Bar left={left} tone={left === 0 ? "spent" : "waiting"} direction="left" />;
  }

  const left = timeLeftFraction(item, now);
  if (left === null) {
    return (
      <div aria-hidden="true" className="flex h-4 items-center">
        <div className="h-2 w-full rounded-full bg-open" />
      </div>
    );
  }
  return <Bar left={left} tone={left === 0 ? "spent" : left <= 0.25 ? "warn" : "accent"} direction="right" />;
}

/** `direction` is where the arrow is heading as time passes. */
function Bar({ left, tone, direction }: { left: number; tone: Tone; direction: "right" | "left" }) {
  const pct = left * 100;
  // The arrow sits on the fill's moving edge: its left edge when heading right, its right edge when heading left.
  const edge = direction === "right" ? 100 - pct : pct;
  return (
    <div aria-hidden="true" className="relative flex h-4 items-center">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-track">
        {left > 0 && (
          <div
            className={`absolute inset-y-0 rounded-full ${direction === "right" ? "right-0" : "left-0"} ${fills[tone]}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <span
        className={`absolute top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-surface ${markers[tone]}`}
        style={{ left: `clamp(0px, calc(${edge}% - 0.5rem), calc(100% - 1rem))` }}
      >
        <svg viewBox="0 0 10 10" className={`size-2.5 ${direction === "left" ? "rotate-180" : ""}`}>
          <path d="M3.5 2 6.5 5l-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
