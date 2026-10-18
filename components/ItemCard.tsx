import Link from "next/link";
import {
  isDrafting,
  isFollowUpDue,
  isOverdue,
  receivedLabel,
  replyByLabel,
  sourceLabel,
  statusLine,
  type Item,
} from "@/lib/items";

// One item in a list. The whole card links to the item page.

/**
 * To reply: "Received 10/12 → Reply by 10/20 · 2 days left" (or "· No rush").
 * Waiting and done: "Sent 3 days ago. Follow up?". Shared with the item page.
 */
export function StatusLine({ item, now, className = "" }: { item: Item; now: Date; className?: string }) {
  if (item.status !== "needs") return <p className={className}>{statusLine(item, now)}</p>;
  const by = item.dueDate ? replyByLabel(item.dueDate, now) : null;
  return (
    <p className={className}>
      Received {receivedLabel(item.createdAt, now)}{" "}
      <span aria-hidden="true" className="text-zinc-500">
        →
      </span>
      <span className="sr-only">,</span>{" "}
      {by ? (
        <>
          Reply by {by.date} ·{" "}
          <span className={isOverdue(item, now) ? "font-semibold text-amber-900" : "font-medium text-zinc-900"}>
            {by.left}
          </span>
        </>
      ) : (
        "No rush"
      )}
    </p>
  );
}

/** `example` renders a non-clickable sample for the first visit. */
export function ItemCard({ item, now = new Date(), example = false }: { item: Item; now?: Date; example?: boolean }) {
  const overdue = isOverdue(item, now);
  const followUp = isFollowUpDue(item, now);
  const drafting = isDrafting(item);
  const className =
    "block rounded-2xl border bg-white px-4 py-3.5 " +
    (example
      ? "border-dashed border-zinc-300"
      : "transition-colors hover:border-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 " +
        (overdue || followUp ? "border-amber-300" : "border-zinc-200"));

  const content = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate font-semibold text-zinc-900">{item.who}</p>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
          {sourceLabel(item)}
        </span>
      </div>

      {item.message && (
        <p className="mt-0.5 truncate text-sm text-zinc-700">{item.message.replace(/\s+/g, " ").trim()}</p>
      )}

      <StatusLine item={item} now={now} className="mt-1.5 text-sm text-zinc-700" />

      {(overdue || followUp || drafting || example) && (
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
          {example && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">Example</span>
          )}
        </div>
      )}
    </>
  );

  if (example) return <div className={className}>{content}</div>;
  return (
    <Link href={`/item/${item.id}`} className={className}>
      {content}
    </Link>
  );
}
