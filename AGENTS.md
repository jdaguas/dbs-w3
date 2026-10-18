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
- The add form has two optional text boxes: "What's it about?" (free text: a quick note or the whole pasted email/text) and "Your reply" (start the draft now or later; a draft makes the item Drafting). No file upload. Cards preview "What's it about?" on one line.
- Reply by: Today / Tomorrow / This week / No rush / Pick a date. Default: This week.
- Home has a quick-add (Who + Where, Enter; defaults This week, one-time). On return visits the list comes first and the full add form sits below it in a collapsed "+ Add someone" panel (open when nothing is left to reply to); no quick-add there. "More options" opens `/add` with typed values carried over.
- First visit: "Who do you owe a reply?" quick-add, starter chips (+ Mom, + Group chat, + Recruiter), and one sample item that shows a draft. No tour, never an empty screen. "Saved only in this browser" appears after the first save.
- Coming back: "Welcome back" greeting with who's waiting. Follow-ups quiet 3+ days come back to the top of Home ("Sent 3 days ago. Follow up?"), then overdue, then the rest. Drafts restored.
- Wording: "Received today (10/18) → Reply by 10/20 · 2 days left" (yesterday shows "yesterday (10/17)", older just "10/12"; due today shows hours left; No rush shows "→ No rush"). Waiting keeps "Sent 3 days ago. Follow up?". Calm tone; past the reply-by date = the card greys out (still AA-readable) plus a "Past your date" label. Each To reply card has a time bar that drains from the left toward the reply-by date (amber at ≤25% left, solid for No rush, empty grey when past). Where it came from shows as an app icon (Text, Email, Gmail, Mail (iOS), Outlook, Yahoo, Slack, DM, Other) with the name as its label. Counts are computed from the visible list.

## Pages
`/` home: a sliding To reply | Waiting switch (tabs) over the list, then "+ Add someone" · `/add` full form · `/item/[id]` draft. No separate `/waiting` page. `/demo` (not linked) replaces saved data with sample drafts from `lib/demo.ts` for testing and walkthroughs. Shared header: a "Drafts" link home.

## Design requirements
- Forms: one column, a real label on every field, errors next to the field that say what to do next ("Enter who you need to reply to.", not "Invalid input"), and keep what the person typed.
- Shared components (`components/`) used everywhere: Button, TextField, ChipGroup, Field, Nav, ItemCard, Banner.
- Chip groups are radio groups: keyboard operable, labeled.
- Everything works with a keyboard; text contrast meets WCAG AA.
- Keep it simple: remove unnecessary steps, fields, and interactions.

## Design system ("calm modern")
- Tokens live in `app/globals.css` (`@theme`). Use semantic classes, never raw palette colors: `bg-canvas` / `bg-surface` / `bg-subtle`, `text-ink` / `text-ink-soft` / `text-ink-muted`, `border-line` / `border-line-strong`, `bg-accent` (deep teal: primary actions, selection), `outline-focus`, `warn-*` (overdue / no reply), `danger`, `success-*`; `rounded-card`, `rounded-field`, `shadow-card`, `shadow-raised`.
- All text token pairs are checked to meet WCAG AA.
- Shared pieces: Avatar (initials), Tag (neutral / accent / warn pills), Tabs (sliding To reply | Waiting switch), TimeBar (reply-window health bar), ChannelIcon (app tiles), plus the components listed above.

## Storage
- `drafts:v1`: array of items. `drafts:lastVisit`: ISO timestamp for the greeting.
- Corrupt or missing data → start fresh. If localStorage is blocked, show a banner saying drafts won't be saved.
