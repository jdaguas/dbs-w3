# Drafts: User Flows

## Main task

> I get a message I can't answer yet → I add it to Drafts → I start a reply when I have a minute → I copy it, send it, and check it off → when I come back, my half-finished drafts and who's waiting are still there.

## Full flow

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
  List -- "More options" --> Form["/add: Who, Where, About, Reply by,<br/>☐ Keep tracking after I reply"]
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

## Item states

```mermaid
stateDiagram-v2
  [*] --> NeedsReply: Add
  NeedsReply --> Drafting: Start typing a reply
  Drafting --> NeedsReply: Clear the draft
  NeedsReply --> Resolved: Mark sent (one-time)
  Drafting --> Resolved: Mark sent (one-time)
  NeedsReply --> Waiting: Mark sent (keep tracking)
  Drafting --> Waiting: Mark sent (keep tracking)
  Waiting --> FollowUpDue: 3+ days, no reply
  FollowUpDue --> Drafting: Follow up
  Waiting --> NeedsReply: They replied, I need to answer
  FollowUpDue --> NeedsReply: They replied, I need to answer
  Waiting --> Resolved: Resolve conversation
  FollowUpDue --> Resolved: Resolve conversation
  Resolved --> [*]
```

## Pages

| Route | What's on it |
|---|---|
| `/` | Quick-add (Who + Where, Enter) on every visit. First visit: prompt, starter chips, sample item. Coming back: welcome greeting, then follow-ups due ("Sent 3 days ago. Follow up?"), overdue, and the Needs reply / Drafting list |
| `/add` | The full add form ("More options") |
| `/item/[id]` | Write the draft, Copy reply, Mark sent, toggle Keep tracking after I reply, Delete |
| `/waiting` | All conversations waiting on the other person (quiet 3+ days ones also surface on Home), "Sent this week" |

Shared nav on every page: **Drafts · Waiting**, with the current page highlighted. Adding happens from Home (quick-add, or "More options" for the full form), so there is one way in, not two.

## The form and its errors

| Field | Input | Error |
|---|---|---|
| Who (required) | Text | "Enter who you need to reply to." · "Keep the name under 40 characters." |
| Where (required) | Text / Email / Slack / DM / Other | "Pick where the message came from." |
| Which email app? (optional, only when Where = Email) | Gmail / Mail (iOS) / Outlook / Yahoo / Other | None. Cards show the app ("Gmail") instead of "Email" |
| About (optional) | Text | "Keep this under 80 characters." |
| Reply by (required) | Today / Tomorrow / This week / No rush / Pick a date (default: This week) | "Choose a date, or pick one of the options above." · "Pick today or a later date." |
| Keep tracking after I reply | Checkbox beside Reply by (default: off = one-time) | None |

Errors sit next to the field, focus moves to the first problem, and nothing the person typed is cleared.

**Quick-add on Home** uses the same Who and Where fields and the same errors, with Reply by = This week and one-time. "More options" opens `/add` with whatever was typed carried over. After the first item ever is saved, a note appears: "Saved only in this browser."

## Wording

- Needs reply: "Received 3 days ago. Reply?" plus why it's here: "You said by Fri."
- Follow-up due: "Sent 3 days ago. Follow up?"
- Overdue uses one accent color **and** a text label ("Past your date"), never alarm wording.
- Counts ("3 people waiting") are computed from the list on screen, so they always match.

## Other states and errors

- **Item not found** (`/item/bad-id`): "This draft isn't here anymore," with a link home.
- **Storage blocked:** "This browser isn't saving. Your drafts will disappear when you close the tab."
- **Corrupt saved data:** start fresh with the first-visit screen.
- **Nothing left to reply to:** "You're all caught up," with the add prompt still visible. Never a dead end.
