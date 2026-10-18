// Item model, date helpers, sorting, and the validation shared by quick-add and /add.

export type Channel = "text" | "email" | "slack" | "dm" | "other";
export type EmailApp = "gmail" | "apple" | "outlook" | "yahoo" | "other";
export type Status = "needs" | "waiting" | "done";
export type ReplyBy = "today" | "tomorrow" | "week" | "none" | "date";

export type Item = {
  id: string;
  who: string;
  channel: Channel;
  emailApp?: EmailApp; // only when channel is "email"
  about?: string;
  dueDate: string | null; // local YYYY-MM-DD; null = No rush
  draft: string; // non-empty + status "needs" ⇒ shown as Drafting
  ongoing: boolean; // "Keep tracking after I reply"
  status: Status;
  createdAt: string; // ISO timestamp
  sentAt?: string;
  waitingSince?: string;
};

export const CHANNELS: { value: Channel; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "dm", label: "DM" },
  { value: "other", label: "Other" },
];

export const EMAIL_APPS: { value: EmailApp; label: string }[] = [
  { value: "gmail", label: "Gmail" },
  { value: "apple", label: "Mail (iOS)" },
  { value: "outlook", label: "Outlook" },
  { value: "yahoo", label: "Yahoo" },
  { value: "other", label: "Other" },
];

export const REPLY_BY: { value: ReplyBy; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
  { value: "none", label: "No rush" },
  { value: "date", label: "Pick a date" },
];

export const WHO_MAX = 40;
export const ABOUT_MAX = 80;
export const FOLLOW_UP_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

export function channelLabel(channel: Channel) {
  return CHANNELS.find((c) => c.value === channel)?.label ?? "Other";
}

/** Where it came from, as shown on cards: "Gmail", "Text", or "Email" when no app was picked. */
export function sourceLabel(item: Pick<Item, "channel" | "emailApp">) {
  if (item.channel === "email" && item.emailApp && item.emailApp !== "other") {
    return EMAIL_APPS.find((a) => a.value === item.emailApp)?.label ?? "Email";
  }
  return channelLabel(item.channel);
}

// ---- Dates (local calendar days, not UTC) ----

export function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(now = new Date()) {
  return toLocalISODate(now);
}

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toLocalISODate(new Date(y, m - 1, d + days));
}

export function dueDateFor(choice: ReplyBy, pickedDate: string, now = new Date()) {
  const today = todayISO(now);
  switch (choice) {
    case "today":
      return today;
    case "tomorrow":
      return addDays(today, 1);
    case "week":
      return addDays(today, 6);
    case "none":
      return null;
    case "date":
      return pickedDate;
  }
}

/** Whole days between an ISO timestamp and now (0 = today). */
export function daysSince(iso: string, now = new Date()) {
  const then = new Date(iso);
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((b - a) / DAY));
}

export function agoLabel(iso: string, now = new Date()) {
  const days = daysSince(iso, now);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** "today", "tomorrow", "Fri", or "Nov 3" for a local YYYY-MM-DD. */
export function dueLabel(dueDate: string, now = new Date()) {
  const today = todayISO(now);
  if (dueDate === today) return "today";
  if (dueDate === addDays(today, 1)) return "tomorrow";
  const [y, m, d] = dueDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const withinWeek = dueDate > today && dueDate <= addDays(today, 6);
  return date.toLocaleDateString(undefined, withinWeek ? { weekday: "short" } : { month: "short", day: "numeric" });
}

// ---- Derived state ----

export function isDrafting(item: Item) {
  return item.status === "needs" && item.draft.trim().length > 0;
}

export function isOverdue(item: Item, now = new Date()) {
  return item.status === "needs" && item.dueDate !== null && item.dueDate < todayISO(now);
}

export function isFollowUpDue(item: Item, now = new Date()) {
  return item.status === "waiting" && !!item.waitingSince && daysSince(item.waitingSince, now) >= FOLLOW_UP_DAYS;
}

/** Home order: overdue → soonest due → no date, oldest first within each. */
export function sortNeedsReply(items: Item[], now = new Date()) {
  return items
    .filter((i) => i.status === "needs")
    .sort((a, b) => {
      const ao = isOverdue(a, now) ? 0 : 1;
      const bo = isOverdue(b, now) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      if (a.dueDate !== b.dueDate) {
        if (a.dueDate === null) return 1;
        if (b.dueDate === null) return -1;
        return a.dueDate < b.dueDate ? -1 : 1;
      }
      return a.createdAt < b.createdAt ? -1 : 1;
    });
}

export function followUpsDue(items: Item[], now = new Date()) {
  return items
    .filter((i) => isFollowUpDue(i, now))
    .sort((a, b) => ((a.waitingSince ?? "") < (b.waitingSince ?? "") ? -1 : 1));
}

export function sentThisWeek(items: Item[], now = new Date()) {
  return items.filter((i) => i.sentAt && daysSince(i.sentAt, now) < 7).length;
}

// ---- Creating ----

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createItem(input: {
  who: string;
  channel: Channel;
  emailApp?: EmailApp | "";
  about?: string;
  dueDate: string | null;
  ongoing: boolean;
  draft?: string;
}): Item {
  return {
    id: newId(),
    who: input.who.trim(),
    channel: input.channel,
    emailApp: input.channel === "email" && input.emailApp ? input.emailApp : undefined,
    about: input.about?.trim() || undefined,
    dueDate: input.dueDate,
    draft: input.draft ?? "",
    ongoing: input.ongoing,
    status: "needs",
    createdAt: new Date().toISOString(),
  };
}

// ---- Validation (errors say what to do next) ----

export type ItemInput = {
  who: string;
  channel: Channel | "";
  emailApp: EmailApp | "";
  about: string;
  replyBy: ReplyBy;
  pickedDate: string;
};

export type ItemErrors = Partial<Record<"who" | "channel" | "about" | "replyBy", string>>;

export function validateItem(input: ItemInput, now = new Date()): ItemErrors {
  const errors: ItemErrors = {};
  const who = input.who.trim();
  if (!who) errors.who = "Enter who you need to reply to.";
  else if (who.length > WHO_MAX) errors.who = `Keep the name under ${WHO_MAX} characters.`;

  if (!input.channel) errors.channel = "Pick where the message came from.";

  if (input.about.trim().length > ABOUT_MAX) errors.about = `Keep this under ${ABOUT_MAX} characters.`;

  if (input.replyBy === "date") {
    if (!input.pickedDate) errors.replyBy = "Choose a date, or pick one of the options above.";
    else if (input.pickedDate < todayISO(now)) errors.replyBy = "Pick today or a later date.";
  }
  return errors;
}
