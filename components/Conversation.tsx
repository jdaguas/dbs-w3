import { dayLabel, type LogEntry } from "@/lib/items";

// The back-and-forth on the item page, like a message thread: theirs on the left, yours on
// the right. Steps with no saved text show just the label and date.

const labels: Record<LogEntry["kind"], string> = {
  received: "They wrote",
  sent: "You replied",
  followUp: "You followed up",
  theyReplied: "They replied",
};

export function Conversation({ history, now }: { history: LogEntry[]; now: Date }) {
  return (
    <ol className="flex flex-col gap-3">
      {history.map((entry, i) => {
        const mine = entry.kind === "sent" || entry.kind === "followUp";
        return (
          <li key={i} className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
            <p className="text-xs text-ink-muted">
              <span className="font-semibold text-ink-soft">{labels[entry.kind]}</span> · {dayLabel(entry.at, now)}
            </p>
            {entry.text && (
              <p
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm " +
                  (mine ? "rounded-br-md bg-accent-soft text-ink" : "rounded-bl-md border border-line bg-surface text-ink")
                }
              >
                {entry.text}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
