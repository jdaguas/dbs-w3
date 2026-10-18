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
  message?: string; // "What's it about?": a quick note or the whole pasted message
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
export const TEXT_MAX = 5000; // pasted message and reply draft
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
  const d = fromISODate(iso);
  return toLocalISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
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

function fromISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "10/18" (day and month in the person's own order). */
export function shortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

/** "today (10/18)", "yesterday (10/17)", or just "10/12". */
export function receivedLabel(createdAt: string, now = new Date()) {
  const date = shortDate(new Date(createdAt));
  const days = daysSince(createdAt, now);
  if (days === 0) return `today (${date})`;
  if (days === 1) return `yesterday (${date})`;
  return date;
}

/** The reply-by date and how long is left: { date: "10/20", left: "2 days left" }. */
export function replyByLabel(dueDate: string, now = new Date()) {
  const days = Math.round((fromISODate(dueDate).getTime() - fromISODate(todayISO(now)).getTime()) / DAY);
  let left: string;
  if (days < 0) left = `${-days} ${days === -1 ? "day" : "days"} past`;
  else if (days > 0) left = `${days} ${days === 1 ? "day" : "days"} left`;
  else {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const hours = Math.floor((endOfDay.getTime() - now.getTime()) / (60 * 60 * 1000));
    left = hours < 1 ? "under an hour left" : `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  }
  return { date: shortDate(fromISODate(dueDate)), left };
}

/**
 * How much of the reply window is left, for the time bar: 1 = just received,
 * 0 = past the date (the window ends at midnight after the reply-by day). null = No rush.
 */
export function timeLeftFraction(item: Pick<Item, "dueDate" | "createdAt">, now = new Date()) {
  if (!item.dueDate) return null;
  const due = fromISODate(item.dueDate);
  const end = new Date(due.getFullYear(), due.getMonth(), due.getDate() + 1).getTime();
  const total = end - new Date(item.createdAt).getTime();
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (end - now.getTime()) / total));
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

/** For waiting and done items: "Sent 3 days ago. Follow up?" (To reply items show dates instead.) */
export function statusLine(item: Item, now = new Date()) {
  if (item.status === "waiting") {
    const sent = agoLabel(item.waitingSince ?? item.sentAt ?? item.createdAt, now);
    return isFollowUpDue(item, now) ? `Sent ${sent}. Follow up?` : `Sent ${sent}. Waiting on them.`;
  }
  return `Sent ${agoLabel(item.sentAt ?? item.createdAt, now)}.`;
}

export function followUpsDue(items: Item[], now = new Date()) {
  return items
    .filter((i) => isFollowUpDue(i, now))
    .sort((a, b) => ((a.waitingSince ?? "") < (b.waitingSince ?? "") ? -1 : 1));
}

/** Waiting on them, longest quiet first. */
export function waitingOn(items: Item[]) {
  return items
    .filter((i) => i.status === "waiting")
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
  message?: string;
  dueDate: string | null;
  ongoing: boolean;
  draft?: string;
}): Item {
  return {
    id: newId(),
    who: input.who.trim(),
    channel: input.channel,
    emailApp: input.channel === "email" && input.emailApp ? input.emailApp : undefined,
    message: input.message?.trim() || undefined,
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
  message: string;
  draft: string;
  replyBy: ReplyBy;
  pickedDate: string;
};

export type ItemErrors = Partial<Record<"who" | "channel" | "message" | "draft" | "replyBy", string>>;

export function validateItem(input: ItemInput, now = new Date()): ItemErrors {
  const errors: ItemErrors = {};
  const who = input.who.trim();
  if (!who) errors.who = "Enter who you need to reply to.";
  else if (who.length > WHO_MAX) errors.who = `Keep the name under ${WHO_MAX} characters.`;

  if (!input.channel) errors.channel = "Pick where the message came from.";

  if (input.message.trim().length > TEXT_MAX)
    errors.message = `Paste just the part you're replying to (under ${TEXT_MAX.toLocaleString()} characters).`;
  if (input.draft.trim().length > TEXT_MAX)
    errors.draft = `Shorten your reply to under ${TEXT_MAX.toLocaleString()} characters.`;

  if (input.replyBy === "date") {
    if (!input.pickedDate) errors.replyBy = "Choose a date, or pick one of the options above.";
    else if (input.pickedDate < todayISO(now)) errors.replyBy = "Pick today or a later date.";
  }
  return errors;
}
