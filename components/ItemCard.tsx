import Link from "next/link";
import { Avatar } from "./Avatar";
import { ChannelIcon } from "./ChannelIcon";
import { Tag } from "./Tag";
import { TimeBar } from "./TimeBar";
import {
  isDrafting,
  isFollowUpDue,
  isOverdue,
  receivedLabel,
  replyByLabel,
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
      <span className="whitespace-nowrap">Received {receivedLabel(item.createdAt, now)}</span>{" "}
      <span aria-hidden="true" className="text-ink-muted">
        →
      </span>
      <span className="sr-only">,</span>{" "}
      {by ? (
        <span className="whitespace-nowrap">
          Reply by {by.date} ·{" "}
          <span className={isOverdue(item, now) ? "font-semibold text-ink-muted" : "font-medium text-ink"}>
            {by.left}
          </span>
        </span>
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
    "flex gap-3.5 rounded-card border px-4 py-3.5 " +
    (example
      ? "border-dashed border-line-strong bg-surface"
      : "transition-[border-color,box-shadow] hover:border-line-hover hover:shadow-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
        // Past the date: greyed out (flat, no shadow) but still readable.
        (overdue ? "border-line bg-canvas" : followUp ? "border-warn-line bg-surface shadow-card" : "border-line bg-surface shadow-card"));

  const content = (
    <>
      <Avatar name={item.who} muted={overdue} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={`truncate font-semibold ${overdue ? "text-ink-soft" : "text-ink"}`}>{item.who}</p>
          <ChannelIcon item={item} />
        </div>

        {item.message && (
          <p className="mt-0.5 truncate text-sm text-ink-soft">{item.message.replace(/\s+/g, " ").trim()}</p>
        )}

        <StatusLine item={item} now={now} className="mt-1.5 text-sm text-ink-muted" />
        {item.status === "needs" && (
          <div className="mt-2">
            <TimeBar item={item} now={now} />
          </div>
        )}

        {(overdue || followUp || drafting || example) && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {overdue && <Tag>Past your date</Tag>}
            {followUp && <Tag tone="warn">No reply yet</Tag>}
            {drafting && <Tag tone="accent">Draft started</Tag>}
            {example && <Tag>Example</Tag>}
          </div>
        )}
      </div>
    </>
  );

  if (example) return <div className={className}>{content}</div>;
  return (
    <Link href={`/item/${item.id}`} className={className}>
      {content}
    </Link>
  );
}
