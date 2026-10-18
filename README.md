# Drafts

**Replies you owe, in one place.**

You see a message you can't answer yet. Log it in a few seconds, start the reply when you have a minute, copy it into Messages or Gmail, and check it off. When you come back, your half-finished drafts and the people you're waiting on are still there.

Built for Design, Build, Ship (MPCS 51238), Assignment 3: Patterns & Flows.

- **Live:** _coming soon_
- **Stack:** Next.js + Tailwind CSS. Everything is saved in your browser (localStorage). No accounts, database, or APIs.

## Main task

> I get a message I can't answer yet → I add it to Drafts → I start a reply when I have a minute → I copy it, send it, and check it off → when I come back, my half-finished drafts and who's waiting are still there.

## Flows

```mermaid
flowchart TD
  Open([Open Drafts]) --> Saved{Anything saved?}
  Saved -- No --> First["First visit: 'Who do you owe a reply?'<br/>input + chips (+ Mom, + Group chat, + Recruiter)<br/>+ 1 sample item with a draft"]
  Saved -- Yes --> Back["Welcome back: '3 people waiting, Mom for 4 days'<br/>overdue at top, drafts restored"]
  First -- tap chip --> List
  First -- type name / Add --> Form
  Back --> List

  List["Home: Needs reply + Drafting"] -- "+ Add" --> Form
  Form["/add: Who, Where, About, Reply by, One-time or Ongoing"] -- invalid --> Err["Error next to the field, input kept"] --> Form
  Form -- valid --> List

  List -- open item --> Item["/item/[id]: write draft (autosaves)"]
  Item -- Copy reply --> Copied{Copied?}
  Copied -- No --> CopyErr["'Couldn't copy. Select the text and copy it yourself.'"] --> Item
  Copied -- Yes --> Sent
  Item -- Mark sent --> Sent["Sent"]
  Sent --> Kind{One-time or ongoing?}
  Kind -- One-time --> Done([Resolved: counted in 'Sent this week'])
  Kind -- Ongoing --> Waiting["/waiting: Waiting on them"]
  Waiting -- Resolve conversation --> Done
  Waiting -- "3+ days quiet" --> Nudge["'No answer from Sam in 3 days'"]
  Nudge -- Follow up --> Item
  Waiting -- They replied --> Reply{Need to answer back?}
  Reply -- Yes --> List
  Reply -- No --> Done
```

Item states, pages, and every form error are in [flows.md](flows.md).

## Onboarding research

_To do: how three similar tools welcome someone new, and what Drafts borrows._

## First-run check

_To do: the agent's usability feedback after trying the deployed app as a brand-new user, and what changed._

## Run it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
