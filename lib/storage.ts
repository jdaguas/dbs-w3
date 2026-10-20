"use client";

// localStorage-backed store shared by every page. The server (and the first
// hydration pass) sees `null`, so pages render a loading state instead of a
// mismatch; the browser then fills in the saved items.

import { useSyncExternalStore } from "react";
import type { Item } from "./items";

const ITEMS_KEY = "drafts:v1";
const LAST_VISIT_KEY = "drafts:lastVisit";
const SAVED_NOTE_KEY = "drafts:savedNoteShown";
const SIGNED_IN_KEY = "drafts:signedIn";

export type Store = {
  items: Item[];
  /** Nothing has ever been saved on this device: show the first visit. */
  isNew: boolean;
  /** False when the browser blocks localStorage (e.g. some private modes). */
  canSave: boolean;
  /** Passed the mock login screen on this device (no real account). */
  signedIn: boolean;
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
    const signedIn = window.localStorage.getItem(SIGNED_IN_KEY) === "1";
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (raw === null) return { items: [], isNew: true, canSave: true, signedIn };
    const parsed: unknown = JSON.parse(raw);
    // Corrupt or unexpected data → start fresh rather than crash.
    if (!Array.isArray(parsed)) return { items: [], isNew: true, canSave: true, signedIn };
    const items = parsed.filter(isItem).map((i) => ({ ...i, draft: i.draft ?? "", ongoing: !!i.ongoing }));
    return { items, isNew: false, canSave: true, signedIn };
  } catch {
    // Storage blocked: the login still works for this tab, it just isn't remembered.
    return { items: [], isNew: true, canSave: false, signedIn: cache?.signedIn ?? false };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === ITEMS_KEY || e.key === SIGNED_IN_KEY || e.key === null) {
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
  cache = { items, isNew: false, canSave, signedIn: getSnapshot().signedIn };
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

/** Swap in a whole list (used by /demo to load sample drafts). */
export function replaceItems(items: Item[]) {
  save(items);
}

/** Forget everything saved on this device, as if Drafts was never opened (used by /demo/fresh). */
export function resetAll() {
  let canSave = true;
  try {
    [ITEMS_KEY, LAST_VISIT_KEY, SAVED_NOTE_KEY, SIGNED_IN_KEY].forEach((key) => window.localStorage.removeItem(key));
  } catch {
    canSave = false;
  }
  // Behave like a real first load: no previous visit now, but this one is recorded for next time.
  previousVisit = null;
  writeFlag(LAST_VISIT_KEY, new Date().toISOString());
  flash = null;
  cache = { items: [], isNew: true, canSave, signedIn: false };
  emit();
}

/** Mock login: nothing is checked or sent anywhere, it just remembers that the screen was passed. */
export function signIn() {
  writeFlag(SIGNED_IN_KEY, "1");
  cache = { ...getSnapshot(), signedIn: true };
  emit();
}

/** Back to the login screen. Saved drafts stay, so logging in again picks up where you left off. */
export function signOut() {
  try {
    window.localStorage.removeItem(SIGNED_IN_KEY);
  } catch {
    // Storage blocked: forgetting it for this tab is enough.
  }
  cache = { ...getSnapshot(), signedIn: false };
  emit();
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

let previousVisit: string | null | undefined;

/**
 * When the person last opened Drafts before this page load (or null), for the
 * welcome-back greeting. Records this visit once per page load, so repeated
 * renders and client navigations all see the same answer.
 */
export function getPreviousVisit(): string | null {
  if (previousVisit === undefined) {
    previousVisit = readFlag(LAST_VISIT_KEY);
    writeFlag(LAST_VISIT_KEY, new Date().toISOString());
  }
  return previousVisit;
}

/** True only the first time it's called on this device: "Saved only in this browser." */
export function takeSavedNote(): boolean {
  if (readFlag(SAVED_NOTE_KEY)) return false;
  writeFlag(SAVED_NOTE_KEY, "1");
  return true;
}

// ---- One-time confirmation shown on Home after leaving another page ----

export type Flash = { title: string; detail?: string };

/** "Added Mom." plus, the first time ever, where it's saved. */
export function addedFlash(who: string): Flash {
  return {
    title: `Added ${who}.`,
    detail: takeSavedNote()
      ? "Saved only in this browser, so it'll be here next time you open Drafts on this device."
      : undefined,
  };
}
let flash: Flash | null = null;

export function setFlash(value: Flash) {
  flash = value;
}

export function peekFlash() {
  return flash;
}

export function clearFlash() {
  flash = null;
}
