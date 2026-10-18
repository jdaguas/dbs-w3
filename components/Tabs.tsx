"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

// A segmented switch between lists, built as ARIA tabs: arrow keys (and Home/End)
// move between tabs, Tab moves into the list. A highlight slides under the active tab.

export function tabId(id: string, value: string) {
  return `${id}-tab-${value}`;
}

export function panelId(id: string, value: string) {
  return `${id}-panel-${value}`;
}

export function Tabs<T extends string>({
  id,
  label,
  tabs,
  value,
  onValueChange,
}: {
  id: string;
  label: string;
  tabs: { value: T; label: ReactNode }[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, tabs.findIndex((t) => t.value === value));

  function onKeyDown(e: KeyboardEvent) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onValueChange(tabs[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="relative flex rounded-full bg-zinc-100 p-1">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-white shadow-sm ring-1 ring-zinc-200 transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `calc((100% - 0.5rem) / ${tabs.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {tabs.map((tab, i) => {
        const selected = i === index;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(id, tab.value)}
            aria-selected={selected}
            aria-controls={panelId(id, tab.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(tab.value)}
            className={
              "relative flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors " +
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 " +
              (selected ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** The list shown for the active tab. */
export function TabPanel({ id, value, children }: { id: string; value: string; children: ReactNode }) {
  return (
    <div
      role="tabpanel"
      id={panelId(id, value)}
      aria-labelledby={tabId(id, value)}
      tabIndex={0}
      className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700"
    >
      {children}
    </div>
  );
}
