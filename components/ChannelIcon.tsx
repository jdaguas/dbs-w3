import type { ReactNode } from "react";
import { sourceLabel, type Item } from "@/lib/items";

// Where the message came from, as an app tile (Gmail, Slack, Text…).
// The name is the accessible label and the hover tooltip.

type Key = "text" | "email" | "gmail" | "apple" | "outlook" | "yahoo" | "slack" | "dm" | "other";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const envelope = (
  <>
    <rect x="3" y="5" width="14" height="10" rx="1.8" {...stroke} />
    <path d="m3.6 6 6.4 5 6.4-5" {...stroke} />
  </>
);

function letters(text: string) {
  return (
    <text x="10" y="14.2" textAnchor="middle" fontSize={text.length > 1 ? 10 : 11.5} fontWeight={800} fill="currentColor">
      {text}
    </text>
  );
}

const icons: Record<Key, { tile: string; glyph: ReactNode }> = {
  text: {
    tile: "bg-[#1f9d55]",
    glyph: <path d="M10 4c3.9 0 7 2.5 7 5.6s-3.1 5.6-7 5.6c-.8 0-1.5-.1-2.2-.3L4.5 16l.9-2.8C4 12.2 3 11 3 9.6 3 6.5 6.1 4 10 4Z" {...stroke} />,
  },
  email: { tile: "bg-[#526070]", glyph: envelope },
  gmail: {
    tile: "bg-[#d93025]",
    glyph: (
      <>
        <rect x="3" y="5" width="14" height="10" rx="1.8" {...stroke} />
        <path d="M3.6 6.2 10 11l6.4-4.8M5.5 15V8.6M14.5 15V8.6" {...stroke} />
      </>
    ),
  },
  apple: { tile: "bg-gradient-to-b from-[#3aa0ff] to-[#1662d6]", glyph: envelope },
  outlook: { tile: "bg-[#0a5fb4]", glyph: letters("O") },
  yahoo: { tile: "bg-[#5f01d1]", glyph: letters("Y!") },
  slack: {
    tile: "bg-[#4a154b]",
    glyph: <path d="M8 3.5 6.5 16.5M13.5 3.5 12 16.5M4 7.5h12.5M3.5 12.5H16" {...stroke} />,
  },
  dm: {
    tile: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    glyph: <path d="M16.5 3.5 3.5 8.6l5.4 2.5 2.5 5.4 5.1-13ZM8.9 11.1l3.4-3.4" {...stroke} />,
  },
  other: {
    tile: "bg-[#64748b]",
    glyph: (
      <g fill="currentColor">
        <circle cx="5.5" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="14.5" cy="10" r="1.5" />
      </g>
    ),
  },
};

function keyFor(item: Pick<Item, "channel" | "emailApp">): Key {
  if (item.channel !== "email") return item.channel;
  return !item.emailApp || item.emailApp === "other" ? "email" : item.emailApp;
}

/** Sits where a contact photo would. `muted` greys it out (past the reply-by date). */
export function ChannelIcon({
  item,
  size = "md",
  muted = false,
}: {
  item: Pick<Item, "channel" | "emailApp">;
  size?: "md" | "lg";
  muted?: boolean;
}) {
  const { tile, glyph } = icons[keyFor(item)];
  const label = sourceLabel(item);
  return (
    <span
      role="img"
      aria-label={`From ${label}`}
      title={label}
      className={
        `flex shrink-0 items-center justify-center text-white shadow-card ${tile} ` +
        (size === "lg" ? "size-12 rounded-[14px] " : "size-10 rounded-[12px] ") +
        (muted ? "grayscale" : "")
      }
    >
      <svg viewBox="0 0 20 20" className={size === "lg" ? "size-7" : "size-6"} aria-hidden="true">
        {glyph}
      </svg>
    </span>
  );
}
