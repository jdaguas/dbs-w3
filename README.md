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
  Saved -- No --> First["First visit: 'Who do you owe a reply?'<br/>quick-add (Who + Where) + chips (+ Mom, + Group chat, + Recruiter)<br/>+ 1 sample item with a draft"]
  Saved -- Yes --> Back["Welcome back: '3 people waiting, Mom for 4 days'<br/>follow-ups and overdue at top, drafts restored"]
  First --> List
  Back --> List

  List["Home: quick-add, follow-ups due,<br/>Needs reply + Drafting"] -- "Quick-add: Who + Where, Enter" --> QCheck{Valid?}
  QCheck -- No --> QErr["Error next to the field, input kept"] --> List
  QCheck -- "Yes (This week, one-time)" --> Toast["Added. First time: 'Saved only in this browser'"] --> List
  List -- "More options / + Add" --> Form["/add: Who, Where, About, Reply by,<br/>☐ Keep tracking after I reply"]
  Form -- invalid --> Err["Error next to the field, input kept"] --> Form
  Form -- valid --> List

  List -- open item --> Item["/item/[id]: write draft (autosaves)"]
  Item -- Copy reply --> Copied{Copied?}
  Copied -- No --> CopyErr["'Couldn't copy. Select the text and copy it yourself.'"] --> Item
  Copied -- Yes --> Sent
  Item -- Mark sent --> Sent["Sent"]
  Sent --> Kind{Keep tracking?}
  Kind -- No --> Done([Resolved: counted in 'Sent this week'])
  Kind -- Yes --> Waiting["/waiting: Waiting on them"]
  Waiting -- Resolve conversation --> Done
  Waiting -- "3+ days quiet" --> Nudge["Back on top of Home:<br/>'Sent 3 days ago. Follow up?'"]
  Nudge -- Follow up --> Item
  Nudge -- They replied --> Reply{Need to answer back?}
  Waiting -- They replied --> Reply
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
