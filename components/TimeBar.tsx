import { timeLeftFraction, type Item } from "@/lib/items";

// A "health bar" for the reply window. It drains from the left as the reply-by date
// gets closer, turns amber when a quarter or less is left, and greys out once it's past.
// No rush stays solid. Decorative: the status line already says how long is left.

export function TimeBar({ item, now }: { item: Item; now: Date }) {
  const left = timeLeftFraction(item, now);
  const fill =
    left === null ? "bg-accent/35" : left === 0 ? "" : left <= 0.25 ? "bg-warn" : "bg-accent";
  return (
    <div aria-hidden="true" className={`relative h-1.5 overflow-hidden rounded-full ${left === 0 ? "bg-line" : "bg-subtle"}`}>
      {left !== 0 && (
        <div
          className={`absolute inset-y-0 right-0 rounded-full transition-[width] duration-500 motion-reduce:transition-none ${fill}`}
          style={{ width: `${(left ?? 1) * 100}%` }}
        />
      )}
    </div>
  );
}
