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
  dueAt?: string; // exact deadline after a boost; overrides the end of dueDate
  boostStart?: string; // when the latest boost was given (the time bar refills from here)
  boosts?: number; // how many boosts so far; each one gives more time
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
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

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

/** When the reply window closes (ms): a boosted deadline, else midnight after the reply-by day. null = No rush. */
export function dueEnd(item: Pick<Item, "dueDate" | "dueAt">): number | null {
  if (item.dueAt) return new Date(item.dueAt).getTime();
  if (!item.dueDate) return null;
  const due = fromISODate(item.dueDate);
  return new Date(due.getFullYear(), due.getMonth(), due.getDate() + 1).getTime();
}

function count(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** "6:45 PM" today, else "10/19 6:45 PM". */
function timeLabel(t: number, now: Date) {
  const d = new Date(t);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return toLocalISODate(d) === todayISO(now) ? time : `${shortDate(d)} ${time}`;
}

/** The reply-by date and how long is left: { date: "10/20", left: "2 days left" }. null = No rush. */
export function replyByLabel(item: Pick<Item, "dueDate" | "dueAt">, now = new Date()) {
  const end = dueEnd(item);
  if (end === null) return null;

  // Boosted: an exact time, counted in hours, then days.
  if (item.dueAt) {
    const ms = end - now.getTime();
    const hours = Math.floor(Math.abs(ms) / HOUR);
    const span = hours >= 24 ? count(Math.floor(hours / 24), "day") : hours < 1 ? "under an hour" : count(hours, "hour");
    return { date: timeLabel(end, now), left: ms < 0 ? `${span} past` : `${span} left` };
  }

  // A reply-by day: counted in calendar days, or hours on the day itself.
  const dueDate = item.dueDate!;
  const days = Math.round((fromISODate(dueDate).getTime() - fromISODate(todayISO(now)).getTime()) / DAY);
  let left: string;
  if (days < 0) left = `${count(-days, "day")} past`;
  else if (days > 0) left = `${count(days, "day")} left`;
  else {
    const hours = Math.floor((end - now.getTime()) / HOUR);
    left = hours < 1 ? "under an hour left" : `${count(hours, "hour")} left`;
  }
  return { date: shortDate(fromISODate(dueDate)), left };
}

/**
 * How much of the reply window is left, for the time bar: 1 = full, 0 = past the date.
 * The window runs from when it was received (or last boosted) to dueEnd. null = No rush.
 */
export function timeLeftFraction(item: Pick<Item, "dueDate" | "dueAt" | "createdAt" | "boostStart">, now = new Date()) {
  const end = dueEnd(item);
  if (end === null) return null;
  const total = end - new Date(item.boostStart ?? item.createdAt).getTime();
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (end - now.getTime()) / total));
}

// ---- Boost: more time for a reply that's past its date ----

/** Each boost gives more than the last: 4 hours, then 8 hours, then a day at a time. */
export const BOOST_STEPS = [
  { ms: 4 * HOUR, label: "4 hours" },
  { ms: 8 * HOUR, label: "8 hours" },
  { ms: DAY, label: "1 day" },
];

export function nextBoost(item: Pick<Item, "boosts">) {
  return BOOST_STEPS[Math.min(item.boosts ?? 0, BOOST_STEPS.length - 1)];
}

/** Shown once a reply is past its date, and kept after boosting so taps can add more. */
export function canBoost(item: Item, now = new Date()) {
  return item.status === "needs" && dueEnd(item) !== null && (isOverdue(item, now) || (item.boosts ?? 0) > 0);
}

/** Adds the next boost to whatever time is left (or to now, if it's past) and refills the bar. */
export function boostPatch(item: Item, now = new Date()): Partial<Item> {
  const base = Math.max(now.getTime(), dueEnd(item) ?? now.getTime());
  return {
    dueAt: new Date(base + nextBoost(item).ms).toISOString(),
    boostStart: now.toISOString(),
    boosts: (item.boosts ?? 0) + 1,
  };
}

/** Clears a boost when the reply window starts over (they replied, or it's reopened). */
export const NO_BOOST: Partial<Item> = { dueAt: undefined, boostStart: undefined, boosts: undefined };

/**
 * Waiting items: how much is left before a follow-up is due (1 = just sent, 0 = follow up now).
 * Matches isFollowUpDue: due at midnight starting the FOLLOW_UP_DAYS-th day after sending.
 */
export function followUpFraction(item: Pick<Item, "waitingSince" | "sentAt">, now = new Date()) {
  const since = item.waitingSince ?? item.sentAt;
  if (!since) return 0;
  const start = new Date(since);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + FOLLOW_UP_DAYS).getTime();
  const total = end - start.getTime();
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (end - now.getTime()) / total));
}

// ---- Derived state ----

export function isDrafting(item: Item) {
  return item.status === "needs" && item.draft.trim().length > 0;
}

export function isOverdue(item: Item, now = new Date()) {
  const end = dueEnd(item);
  return item.status === "needs" && end !== null && end <= now.getTime();
}

export function isFollowUpDue(item: Item, now = new Date()) {
  return item.status === "waiting" && !!item.waitingSince && daysSince(item.waitingSince, now) >= FOLLOW_UP_DAYS;
}

/**
 * Home order, most urgent first: soonest deadline → No rush (oldest first) → past the date
 * (most recently missed first). Past-due ones aren't urgent anymore, so they go last.
 */
export function sortNeedsReply(items: Item[], now = new Date()) {
  const group = (i: Item) => (isOverdue(i, now) ? 2 : dueEnd(i) === null ? 1 : 0);
  return items
    .filter((i) => i.status === "needs")
    .sort((a, b) => {
      const ga = group(a);
      const gb = group(b);
      if (ga !== gb) return ga - gb;
      if (ga === 0) return dueEnd(a)! - dueEnd(b)!;
      if (ga === 2) return dueEnd(b)! - dueEnd(a)!;
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
