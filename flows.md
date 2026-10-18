# Drafts: User Flows

## Main task

> I get a message I can't answer yet → I add it to Drafts → I start a reply when I have a minute → I copy it, send it, and check it off → when I come back, my half-finished drafts and who's waiting are still there.

## Full flow

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

## Item states

```mermaid
stateDiagram-v2
  [*] --> NeedsReply: Add
  NeedsReply --> Drafting: Start typing a reply
  Drafting --> NeedsReply: Clear the draft
  NeedsReply --> Resolved: Mark sent (one-time)
  Drafting --> Resolved: Mark sent (one-time)
  NeedsReply --> Waiting: Mark sent (ongoing)
  Drafting --> Waiting: Mark sent (ongoing)
  Waiting --> NeedsReply: They replied, I need to answer
  Waiting --> Resolved: Resolve conversation
  Resolved --> [*]
```

## Pages

| Route | What's on it |
|---|---|
| `/` | First visit (prompt, quick-add chips, sample item) or welcome back + Needs reply / Drafting list, overdue first |
| `/add` | The add form |
| `/item/[id]` | Write the draft, Copy reply, Mark sent, switch One-time ↔ Ongoing, Delete |
| `/waiting` | Ongoing conversations waiting on the other person, nudges, "Sent this week" |

Shared nav on every page: **Drafts · Waiting · + Add**, with the current page highlighted.

## The form and its errors

| Field | Input | Error |
|---|---|---|
| Who (required) | Text | "Enter who you need to reply to." · "Keep the name under 40 characters." |
| Where (required) | Text / Email / Slack / DM / Other | "Pick where the message came from." |
| About (optional) | Text | "Keep this under 80 characters." |
| Reply by (required) | Today / This week / No rush / Pick a date | "Choose a date, or pick Today, This week, or No rush." · "Pick today or a later date." |
| Conversation | One-time reply / Ongoing | Always has a value (default: One-time) |

Errors sit next to the field, focus moves to the first problem, and nothing the person typed is cleared.

## Other states and errors

- **Item not found** (`/item/bad-id`): "This draft isn't here anymore," with a link home.
- **Storage blocked:** "This browser isn't saving. Your drafts will disappear when you close the tab."
- **Corrupt saved data:** start fresh with the first-visit screen.
- **Nothing left to reply to:** "You're all caught up," with the add prompt still visible. Never a dead end.
