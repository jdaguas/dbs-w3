"use client";

// localStorage-backed store shared by every page. The server (and the first
// hydration pass) sees `null`, so pages render a loading state instead of a
// mismatch; the browser then fills in the saved items.

import { useSyncExternalStore } from "react";
import type { Item } from "./items";

const ITEMS_KEY = "drafts:v1";
const LAST_VISIT_KEY = "drafts:lastVisit";
const SAVED_NOTE_KEY = "drafts:savedNoteShown";

export type Store = {
  items: Item[];
  /** Nothing has ever been saved on this device: show the first visit. */
  isNew: boolean;
  /** False when the browser blocks localStorage (e.g. some private modes). */
  canSave: boolean;
};

let cache: Store | null = null;
const listeners = new Set<() => void>();

function isItem(value: unknown): value is Item {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.who === "string" &&
    typeof v.channel === "string" &&
    typeof v.status === "string" &&
    typeof v.createdAt === "string"
  );
}

function load(): Store {
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (raw === null) return { items: [], isNew: true, canSave: true };
    const parsed: unknown = JSON.parse(raw);
    // Corrupt or unexpected data → start fresh rather than crash.
    if (!Array.isArray(parsed)) return { items: [], isNew: true, canSave: true };
    const items = parsed.filter(isItem).map((i) => ({ ...i, draft: i.draft ?? "", ongoing: !!i.ongoing }));
    return { items, isNew: false, canSave: true };
  } catch {
    return { items: [], isNew: true, canSave: false };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === ITEMS_KEY || e.key === null) {
      cache = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Store {
  if (cache === null) cache = load();
  return cache;
}

function getServerSnapshot(): Store | null {
  return null;
}

/** Saved items, or `null` while rendering on the server / before hydration. */
export function useStore(): Store | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function save(items: Item[]) {
  let canSave = true;
  try {
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    canSave = false;
  }
  cache = { items, isNew: false, canSave };
  emit();
}

export function addItem(item: Item) {
  save([...getSnapshot().items, item]);
}

export function updateItem(id: string, patch: Partial<Item>) {
  save(getSnapshot().items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function removeItem(id: string) {
  save(getSnapshot().items.filter((i) => i.id !== id));
}

// ---- Small flags (not part of the item list) ----

function readFlag(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the canSave banner already explains this.
  }
}

/** Returns the previous visit time (or null) and records this visit. */
export function recordVisit(now = new Date()): string | null {
  const previous = readFlag(LAST_VISIT_KEY);
  writeFlag(LAST_VISIT_KEY, now.toISOString());
  return previous;
}

/** True only the first time it's called on this device: "Saved only in this browser." */
export function takeSavedNote(): boolean {
  if (readFlag(SAVED_NOTE_KEY)) return false;
  writeFlag(SAVED_NOTE_KEY, "1");
  return true;
}
