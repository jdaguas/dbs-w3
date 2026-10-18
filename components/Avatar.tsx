// Initials for the person you owe a reply ("Professor Lee" → "PL"). Decorative: the name is always shown beside it.
/** `muted` greys it out (past the reply-by date). */
export function Avatar({ name, size = "md", muted = false }: { name: string; size?: "md" | "lg"; muted?: boolean }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <span
      aria-hidden="true"
      className={
        "flex shrink-0 items-center justify-center rounded-full font-semibold " +
        (muted ? "bg-subtle text-ink-muted " : "bg-accent-soft text-accent-ink ") +
        (size === "lg" ? "size-12 text-base" : "size-10 text-sm")
      }
    >
      {initials}
    </span>
  );
}
