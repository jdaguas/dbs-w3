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
- Reply by: Today / Tomorrow / This week / No rush / Pick a date. Default: This week.
- Home has a quick-add (Who + Where, Enter; defaults This week, one-time). "More options" opens `/add` with typed values carried over.
- First visit: "Who do you owe a reply?" quick-add, starter chips (+ Mom, + Group chat, + Recruiter), and one sample item that shows a draft. No tour, never an empty screen. "Saved only in this browser" appears after the first save.
- Coming back: "Welcome back" greeting with who's waiting. Follow-ups quiet 3+ days come back to the top of Home ("Sent 3 days ago. Follow up?"), then overdue, then the rest. Drafts restored.
- Wording: "Received 3 days ago. Reply?" + "You said by Fri." Calm tone; overdue = one accent color plus a text label. Counts are computed from the visible list.

## Pages
`/` home (quick-add + list) · `/add` full form · `/item/[id]` draft · `/waiting` waiting on them. Shared nav: Drafts · Waiting (no Add button in the nav; adding starts from Home quick-add / "More options").

## Design requirements
- Forms: one column, a real label on every field, errors next to the field that say what to do next ("Enter who you need to reply to.", not "Invalid input"), and keep what the person typed.
- Shared components (`components/`) used everywhere: Button, TextField, ChipGroup, Field, Nav, ItemCard, Banner.
- Chip groups are radio groups: keyboard operable, labeled.
- Everything works with a keyboard; text contrast meets WCAG AA.
- Keep it simple: remove unnecessary steps, fields, and interactions.

## Storage
- `drafts:v1`: array of items. `drafts:lastVisit`: ISO timestamp for the greeting.
- Corrupt or missing data → start fresh. If localStorage is blocked, show a banner saying drafts won't be saved.
