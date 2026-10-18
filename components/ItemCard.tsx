import Link from "next/link";
import { agoLabel, dueLabel, isDrafting, isFollowUpDue, isOverdue, sourceLabel, type Item } from "@/lib/items";

// One item in a list. The whole card links to the item page. The status line
// follows Gmail's pattern: a plain fact plus a one-word next step.

function statusLine(item: Item, now: Date) {
  if (item.status === "waiting") {
    const sent = agoLabel(item.waitingSince ?? item.sentAt ?? item.createdAt, now);
    return isFollowUpDue(item, now) ? `Sent ${sent}. Follow up?` : `Sent ${sent}. Waiting on them.`;
  }
  if (item.status === "done") return `Sent ${agoLabel(item.sentAt ?? item.createdAt, now)}.`;
  return `Received ${agoLabel(item.createdAt, now)}. Reply?`;
}

export function ItemCard({ item, now = new Date() }: { item: Item; now?: Date }) {
  const overdue = isOverdue(item, now);
  const followUp = isFollowUpDue(item, now);
  const drafting = isDrafting(item);

  return (
    <Link
      href={`/item/${item.id}`}
      className={
        "block rounded-2xl border bg-white px-4 py-3.5 transition-colors hover:border-zinc-400 " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 " +
        (overdue || followUp ? "border-amber-300" : "border-zinc-200")
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate font-semibold text-zinc-900">{item.who}</p>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
          {sourceLabel(item)}
        </span>
      </div>

      {item.message && (
        <p className="mt-0.5 truncate text-sm text-zinc-700">{item.message.replace(/\s+/g, " ").trim()}</p>
      )}

      <p className="mt-1.5 text-sm text-zinc-700">
        {statusLine(item, now)}
        {item.status === "needs" && item.dueDate && !overdue && <> You said by {dueLabel(item.dueDate, now)}.</>}
      </p>

      {(overdue || followUp || drafting) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {overdue && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              Past your date
            </span>
          )}
          {followUp && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              No reply yet
            </span>
          )}
          {drafting && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              Draft started
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
