import Link from "next/link";
import { BoostButton } from "./BoostButton";
import { ChannelIcon } from "./ChannelIcon";
import { Tag } from "./Tag";
import { TimeBar } from "./TimeBar";
import { canBoost, dateLabel, isDrafting, isFollowUpDue, isOverdue, replyByLabel, statusLine, type Item } from "@/lib/items";

// One item in a list, in three levels:
//   [app icon]  Name
//               What it's about, cut short… (Received 10/12)
//               Reply by 10/20 · 2 days left
//               ▬▬▬▬▬▬▬▬▬▬▬▬▬ (time bar)             [Draft started] [+4 hours]
// The whole card opens the item page (the name is a link stretched over the card),
// so the Boost button can sit on top of it without nesting a button in a link.

/**
 * The line above the bar. To reply: "Reply by 10/20 · 2 days left" or "No rush".
 * Waiting: "Waiting on them" / "No reply yet. Follow up?". Shared with the item page.
 */
export function StatusLine({ item, now, className = "" }: { item: Item; now: Date; className?: string }) {
  if (item.status !== "needs") {
    const followUp = isFollowUpDue(item, now);
    return <p className={`${className} ${followUp ? "font-medium text-warn-ink" : ""}`}>{statusLine(item, now)}</p>;
  }
  const by = replyByLabel(item, now);
  if (!by) return <p className={className}>No rush</p>;
  return (
    <p className={className}>
      Reply by {by.date} ·{" "}
      <span className={isOverdue(item, now) ? "font-semibold text-ink-soft" : "font-semibold text-ink"}>{by.left}</span>
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

  const name = <span className={`font-semibold ${overdue ? "text-ink-soft" : "text-ink"}`}>{item.who}</span>;

  return (
    <div className={className}>
      <ChannelIcon item={item} muted={overdue} />
      <div className="min-w-0 flex-1">
        <div className="flex">
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
        </div>

        {/* The preview gives way so the date always fits after it. */}
        <p className="flex items-baseline gap-1.5 text-sm text-ink-soft">
          {item.message && <span className="min-w-0 truncate">{item.message.replace(/\s+/g, " ").trim()}</span>}
          <span className="shrink-0 text-[11px] text-ink-muted">
            {item.message ? `(${dateLabel(item, now)})` : dateLabel(item, now)}
          </span>
        </p>

        {item.status !== "done" && (
          <div className="mt-2.5">
            <StatusLine item={item} now={now} className="text-xs text-ink-muted" />
            <TimeBar item={item} now={now} />
          </div>
        )}

        {(drafting || example || boostable) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {drafting && <Tag tone="accent">Draft started</Tag>}
            {example && <Tag>Example</Tag>}
            {boostable && <BoostButton item={item} className="relative z-[2] ml-auto" />}
          </div>
        )}
      </div>
    </div>
  );
}
