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
- Each item is a **one-time reply** (sent → resolved) or **ongoing** (sent → Waiting on them). Default: one-time. Can be changed on the item page.
- Reply by: Today / This week / No rush / Pick a date. Default: This week.
- First visit: "Who do you owe a reply?" with quick-add chips plus one sample item that shows a draft. Never an empty screen.
- Coming back: "Welcome back" greeting with who's waiting, overdue first, drafts restored.

## Pages
`/` home · `/add` form · `/item/[id]` draft · `/waiting` waiting on them. Shared nav: Drafts · Waiting · + Add.

## Design requirements
- Forms: one column, a real label on every field, errors next to the field that say what to do next ("Enter who you need to reply to.", not "Invalid input"), and keep what the person typed.
- Shared components (`components/`) used everywhere: Button, TextField, ChipGroup, Field, Nav, ItemCard, Banner.
- Chip groups are radio groups: keyboard operable, labeled.
- Everything works with a keyboard; text contrast meets WCAG AA.
- Keep it simple: remove unnecessary steps, fields, and interactions.

## Storage
- `drafts:v1`: array of items. `drafts:lastVisit`: ISO timestamp for the greeting.
- Corrupt or missing data → start fresh. If localStorage is blocked, show a banner saying drafts won't be saved.
