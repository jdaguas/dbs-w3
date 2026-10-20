<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Drafts

Replies you owe, in one place. Log a message you can't answer yet, start the reply when you have a minute, copy it into the real app, and check it off.

Built for Design, Build, Ship (MPCS 51238), Assignment 3: Patterns & Flows. The brief is in `docs/`. The flows are in `flows.md`.

## Rules
- Next.js (App Router) + Tailwind CSS only. Data is saved in the browser with localStorage.
- No database, accounts, backend, or external APIs. Push back on packages we don't need.
- Build step by step and keep changes small. The user makes the git commits.

## Product decisions
- Item states: Needs reply → Drafting (has unsent draft text) → Sent → Waiting on them (ongoing conversations only).
- "Keep tracking after I reply" checkbox (default off = one-time: sent → resolved; on: sent → Waiting on them). Can be changed on the item page.
- Where: Text / Email / Slack / DM / Other. Picking Email shows an optional "Which email app?" (Gmail / Mail (iOS) / Outlook / Yahoo / Other); cards then show the app name.
- The add form has two optional text boxes: "What's it about?" (free text: a quick note or the whole pasted email/text) and "Your reply" (start the draft now or later; a draft makes the item Drafting). No file upload. Both stay editable on the item page (autosaves). Cards preview "What's it about?" on one line.
- Reply by: Today / Tomorrow / This week / No rush / Pick a date. Default: This week.
- Home adds with the full form in a "+ Add someone" panel (no quick-add). On return visits the list comes first and the panel sits below it, collapsed (open when nothing is left to reply to). `/add` is the same form on its own page.
- First visit: "Who do you owe a reply?" with the "+ Add someone" panel open, starter chips (+ Mom, + Group chat, + Recruiter), and one sample item that shows a draft. No tour, never an empty screen. "Saved only in this browser" appears after the first save.
- Coming back: "Welcome back" greeting with who's waiting. Follow-ups quiet 3+ days come back to the top of Home ("Sent 3 days ago. Follow up?"). To reply is sorted most urgent first: soonest deadline → No rush → past the date (most recently missed first). The order holds still while you're on Home and refreshes on add/remove or the next visit. Drafts restored.
- Cards, in three levels: app icon on the left (where a contact photo would go; no initials). Name on top. Then a one-line preview of "What's it about?", cut short so the date always fits after it, much smaller and in parentheses: "Dinner Sunday? Dad's making… (Received 10/13)" ("Received today, 10/18" / "yesterday, 10/17"; "Sent 10/16" once replied). Then "Reply by 10/20 · 2 days left" (due today shows hours left; No rush shows "No rush") above the time bar. Waiting shows "Waiting on them" / "No reply yet. Follow up?". Calm tone; past the reply-by date = the card and its icon grey out (still AA-readable) and the line says "2 days past". The only pills are "Draft started" and the Boost button. Counts are computed from the visible list.
- Time bar, with an arrow on its moving edge. To reply: drains from the left, so the arrow moves left → right toward the reply-by date (amber at ≤25% left, solid with no arrow for No rush, empty with a grey arrow at the end when past). Waiting: counts down the 3 days to a follow-up and drains from the right, so the arrow moves right → left (empty with the arrow at the start once a follow-up is due).

- Boost: a past-due reply shows a "+4 hours" button (on the card and the item page). Each tap gives more than the last (4 hours → 8 hours → 1 day at a time), sets an exact deadline (`dueAt`), and refills the time bar. "They replied" and reopening clear the boost.

- Waiting items: opening one only shows it (nothing is pre-selected or changed). The item page shows the Conversation (their messages left, yours right, each with a date) and asks "Action taken?": I followed up (optional "What did you send?"; resets the sent date and the 3-day countdown), They replied (optional "What did they say?", then "Do you want to reply?": Yes → back to To reply with a fresh draft, received today, due this week; No → done), or Resolve. The history is stored per item in `log`.

## Pages
`/login` mock login (one shared demo account, mpcs@gmail.com / P@s#word, shown as hints under the fields; anything else shows "Incorrect email or password" under Password; nothing is stored but a flag; Home sends you here until it's passed, flag `drafts:signedIn`) · `/` home: a sliding To reply | Waiting switch (tabs) over the list, then "+ Add someone" · `/add` full form · `/item/[id]` draft. No separate `/waiting` page. `/demo` (not linked) replaces saved data with sample drafts from `lib/demo.ts` for testing and walkthroughs; `/demo/fresh` (not linked) clears everything so Home shows the first visit. Shared header: a "Drafts" link home and, while logged in, "Log out" (clears only the login flag; drafts stay) back to `/login`.

## Design requirements
- Forms: one column, a real label on every field, errors next to the field that say what to do next ("Enter who you need to reply to.", not "Invalid input"), and keep what the person typed.
- Shared components (`components/`) used everywhere: Button, TextField, ChipGroup, Field, Nav, ItemCard, Banner.
- Chip groups are radio groups: keyboard operable, labeled.
- Everything works with a keyboard; text contrast meets WCAG AA.
- Keep it simple: remove unnecessary steps, fields, and interactions.

## Design system ("calm modern")
- Tokens live in `app/globals.css` (`@theme`). Use semantic classes, never raw palette colors: `bg-canvas` / `bg-surface` / `bg-subtle`, `text-ink` / `text-ink-soft` / `text-ink-muted`, `border-line` / `border-line-strong`, `bg-accent` (deep teal: primary actions, selection), `outline-focus`, `warn-*` (low time / no reply), `track` / `open` (time bar), `danger`, `success-*`; `rounded-card`, `rounded-field`, `shadow-card`, `shadow-raised`.
- All text token pairs are checked to meet WCAG AA; graphics (time bar fills, icons) are ≥ 3:1 against white.
- Shared pieces: Tag (neutral / accent / warn pills), Tabs (sliding To reply | Waiting switch), TimeBar (reply-window health bar), ChannelIcon (app tiles: Text, Email, Gmail, Mail (iOS), Outlook, Yahoo, Slack, DM, Other; the name is the label), plus the components listed above.

## Storage
- `drafts:v1`: array of items. `drafts:lastVisit`: ISO timestamp for the greeting.
- Corrupt or missing data → start fresh. If localStorage is blocked, show a banner saying drafts won't be saved.
