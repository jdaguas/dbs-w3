import Link from "next/link";
import { Avatar } from "./Avatar";
import { BoostButton } from "./BoostButton";
import { ChannelIcon } from "./ChannelIcon";
import { Tag } from "./Tag";
import { TimeBar } from "./TimeBar";
import {
  canBoost,
  isDrafting,
  isFollowUpDue,
  isOverdue,
  receivedLabel,
  replyByLabel,
  statusLine,
  type Item,
} from "@/lib/items";

// One item in a list. The whole card opens the item page (the name is a link stretched over
// the card), so the Boost button can sit on top of it without nesting a button in a link.

/**
 * To reply: "Received 10/12 → Reply by 10/20 · 2 days left" (or "· No rush").
 * Waiting and done: "Sent 3 days ago. Follow up?". Shared with the item page.
 */
export function StatusLine({ item, now, className = "" }: { item: Item; now: Date; className?: string }) {
  if (item.status !== "needs") return <p className={className}>{statusLine(item, now)}</p>;
  const by = replyByLabel(item, now);
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
  const boostable = !example && canBoost(item, now);
  const className =
    "relative flex gap-3.5 rounded-card border px-4 py-3.5 " +
    (example
      ? "border-dashed border-line-strong bg-surface"
      : "transition-[border-color,box-shadow] hover:border-line-hover hover:shadow-raised has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus " +
        // Past the date: greyed out (flat, no shadow) but still readable.
        (overdue ? "border-line-strong bg-canvas" : followUp ? "border-warn-line bg-surface shadow-card" : "border-line bg-surface shadow-card"));

  const name = <span className={`truncate font-semibold ${overdue ? "text-ink-soft" : "text-ink"}`}>{item.who}</span>;

  return (
    <div className={className}>
      <Avatar name={item.who} muted={overdue} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          {example ? (
            <p className="truncate">{name}</p>
          ) : (
            <Link
              href={`/item/${item.id}`}
              className="truncate outline-none after:absolute after:inset-0 after:z-[1] after:rounded-card"
            >
              {name}
            </Link>
          )}
          <ChannelIcon item={item} />
        </div>

        {item.message && (
          <p className="mt-0.5 truncate text-sm text-ink-soft">{item.message.replace(/\s+/g, " ").trim()}</p>
        )}

        <StatusLine item={item} now={now} className="mt-1.5 text-sm text-ink-muted" />
        {item.status !== "done" && (
          <div className="mt-1.5">
            <TimeBar item={item} now={now} />
          </div>
        )}

        {(overdue || followUp || drafting || example || boostable) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {overdue && <Tag>Past your date</Tag>}
            {followUp && <Tag tone="warn">No reply yet</Tag>}
            {drafting && <Tag tone="accent">Draft started</Tag>}
            {example && <Tag>Example</Tag>}
            {boostable && <BoostButton item={item} className="relative z-[2] ml-auto" />}
          </div>
        )}
      </div>
    </div>
  );
}
