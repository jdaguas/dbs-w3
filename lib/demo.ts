// Sample drafts for trying the app (/demo). Dates are relative to now, so the
// list always has a mix: past due, due today, due soon, no rush, quiet follow-ups.

import { newId, toLocalISODate, type Item } from "./items";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Sample = Omit<Item, "id" | "createdAt" | "dueDate" | "draft" | "ongoing" | "sentAt" | "waitingSince"> & {
  receivedAgo: number; // hours
  dueIn?: number | null; // days from today; null = No rush
  draft?: string;
  ongoing?: boolean;
  sentAgo?: number; // hours
};

const SAMPLES: Sample[] = [
  // ---- To reply ----
  { who: "Mom", channel: "text", status: "needs", receivedAgo: 5 * 24, dueIn: -2, message: "Dinner Sunday? Dad's making lasagna" },
  { who: "Landlord", channel: "email", emailApp: "gmail", status: "needs", receivedAgo: 8 * 24, dueIn: -1, message: "Lease renewal: please confirm by end of week whether you plan to stay." },
  { who: "Professor Lee", channel: "email", emailApp: "gmail", status: "needs", receivedAgo: 20, dueIn: 0, message: "Re: thesis draft feedback\n\nNice start. Can you send a revised outline before our meeting?", draft: "Thanks so much for the notes! I'll send the revised outline by" },
  { who: "Priya", channel: "slack", status: "needs", receivedAgo: 3, dueIn: 0, message: "Can you look at the onboarding copy before standup?" },
  { who: "Design team", channel: "slack", status: "needs", receivedAgo: 6 * 24, dueIn: 1, message: "Can you review the mocks?", ongoing: true },
  { who: "Dentist", channel: "text", status: "needs", receivedAgo: 2 * 24, dueIn: 1, message: "Reply C to confirm your cleaning Tue 10/21 at 9am" },
  { who: "Neighbor", channel: "other", status: "needs", receivedAgo: 4 * 24, dueIn: 2, message: "Note on the door about the package" },
  { who: "Aunt Rosa", channel: "email", emailApp: "yahoo", status: "needs", receivedAgo: 2 * 24, dueIn: 3, message: "Photos from the reunion! Did you get the album link?", draft: "These are so good, thank you!" },
  { who: "Group chat", channel: "text", status: "needs", receivedAgo: 2, dueIn: 4, message: "Who's in for Saturday?" },
  { who: "Advisor's office", channel: "email", emailApp: "outlook", status: "needs", receivedAgo: 26, dueIn: 6, message: "Please pick a time for your registration check-in." },
  { who: "Bank", channel: "email", emailApp: "apple", status: "needs", receivedAgo: 30, dueIn: 6, message: "Verify your mailing address" },
  { who: "Jordan", channel: "dm", status: "needs", receivedAgo: 3 * 24, dueIn: null, message: "lol did you see this" },
  { who: "Old roommate", channel: "dm", status: "needs", receivedAgo: 10 * 24, dueIn: null, message: "Long time! How's Chicago treating you?" },

  // ---- Waiting on them ----
  { who: "Recruiter", channel: "email", emailApp: "outlook", status: "waiting", receivedAgo: 9 * 24, sentAgo: 4 * 24, ongoing: true, message: "Next steps", draft: "Thanks! I'm free Tue or Thu afternoon for the call." },
  { who: "Hiring manager", channel: "email", emailApp: "gmail", status: "waiting", receivedAgo: 12 * 24, sentAgo: 6 * 24, ongoing: true, message: "Take-home assignment", draft: "Attached my submission. Happy to walk through it." },
  { who: "Sam", channel: "text", status: "waiting", receivedAgo: 3 * 24, sentAgo: 26, ongoing: true, message: "Are you still coming Saturday?", draft: "Yes! What should I bring?" },
  { who: "Study group", channel: "slack", status: "waiting", receivedAgo: 2 * 24, sentAgo: 20, ongoing: true, message: "Which chapters for the midterm?", draft: "I think 4–7, but can someone confirm?" },
  { who: "Contractor", channel: "text", status: "waiting", receivedAgo: 5 * 24, sentAgo: 2 * 24, ongoing: true, message: "Quote for the bathroom", draft: "Could you send the quote in writing?" },
  { who: "Leasing office", channel: "other", status: "waiting", receivedAgo: 4 * 24, sentAgo: 5, ongoing: true, message: "Parking permit", draft: "Dropped off the form today." },

  // ---- Done this week (counts toward "sent this week") ----
  { who: "Coach", channel: "text", status: "done", receivedAgo: 3 * 24, sentAgo: 2 * 24, message: "Practice moved to 6?", draft: "Works for me." },
  { who: "Library", channel: "email", emailApp: "gmail", status: "done", receivedAgo: 4 * 24, sentAgo: 3 * 24, message: "Renew your books?" },
];

export function sampleItems(now = new Date()): Item[] {
  const t = now.getTime();
  return SAMPLES.map(({ receivedAgo, dueIn, sentAgo, draft, ongoing, ...rest }) => {
    const sent = sentAgo === undefined ? undefined : new Date(t - sentAgo * HOUR).toISOString();
    return {
      ...rest,
      id: newId(),
      createdAt: new Date(t - receivedAgo * HOUR).toISOString(),
      dueDate: dueIn === undefined || dueIn === null ? null : toLocalISODate(new Date(t + dueIn * DAY)),
      draft: draft ?? "",
      ongoing: ongoing ?? false,
      sentAt: sent,
      waitingSince: rest.status === "waiting" ? sent : undefined,
    };
  });
}
