# 11 — UI / UX Design

This document defines the minimum user interface and experience required for the MVP described in `01-PROBLEM.md` through `10-TECH-STACK.md`.

The design principle is:

> **Make the citizen's journey feel like one simple conversation, while complex government-service work appears as understandable cards inside that conversation.**

The MVP should avoid making the user navigate between separate pages for eligibility, application forms, submission, and status.

---

# 1. UI Strategy

## Primary Screen

The MVP uses **one primary chat screen**.

Within the conversation, Sahayak can render structured inline cards for:

- Eligibility results.
- Filled application preview.
- Application review/confirmation.
- Simulated submission confirmation.
- Tracking information.
- Simulated application status.

This keeps the user's mental model simple:

> **"I tell Sahayak what I need, and Sahayak helps me complete it."**

## Optional Screen

A lightweight **My Applications** list may be added if time permits.

It is not required for the core MVP because status lookup can happen directly inside the chat.

---

# 2. Screen 1 — Sahayak Chat

## Purpose

Provide the complete citizen journey from:

```text
Situation
   ↓
Questions
   ↓
Eligibility
   ↓
Application
   ↓
Review
   ↓
Confirmation
   ↓
Simulated submission
   ↓
Tracking
   ↓
Status
```

without requiring the citizen to navigate separate screens.

## User

Primary user:

> A citizen seeking help with a supported government welfare scheme, especially someone who may understand their situation but find government forms and procedures difficult.

## Main Components

### 1. Header

Contains:

- Sahayak name/logo.
- Short value statement such as:
  > **Your guide to government support**
- Small simulation indicator where appropriate.

The header should immediately communicate what the product does without requiring the user to read instructions.

### 2. Welcome / Empty State

Shown before the first message.

Suggested content:

> **Tell me what you need help with.**
>
> You don't need to know the scheme name or fill out a form first. Just describe your situation in your own words.

Example prompts:

- "I want to know if I qualify for support."
- "I'm 62 and have a low income."
- "Help me apply for government assistance."

A prominent input box appears below.

### 3. Conversation Area

Contains:

- Citizen messages.
- Sahayak responses.
- Loading/typing indicator.
- Inline action cards.

The conversation should visually distinguish:

```text
Citizen
   ↓
Sahayak
   ↓
Structured result/card
   ↓
Citizen action
```

### 4. Message Composer

Contains:

- Text input.
- Send button.
- Disabled/loading state while the current request is processing.

The MVP does not require voice input or other input modes.

### 5. Inline Cards

Cards are rendered as part of the conversation rather than separate pages.

Required card types:

- Eligibility card.
- Application preview card.
- Confirmation card.
- Submission/tracking card.
- Status card.
- Error/information card where needed.

---

# 3. Chat — Initial State

## Purpose

Make the product's value obvious within seconds.

## Visual hierarchy

```text
┌─────────────────────────────────────────────┐
│  SAHAYAK                  Government help   │
├─────────────────────────────────────────────┤
│                                             │
│       Tell me what you need help with.      │
│                                             │
│   Describe your situation in your own      │
│   words. You don't need to know the         │
│   scheme name or fill a form first.         │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ "I want to know if I qualify..."    │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Example:                                 │
│   • "I'm 62 and need financial support."  │
│   • "Can I apply for this benefit?"       │
│                                             │
├─────────────────────────────────────────────┤
│  Type your message...                 Send │
└─────────────────────────────────────────────┘
```

The exact visual styling is an implementation decision, but the hierarchy should remain simple.

---

# 4. Chat — Eligibility Interaction

## Purpose

Collect only the information needed to evaluate the supported scheme.

## Components

- Sahayak message.
- User response.
- Optional compact "What I know" fact summary.
- Eligibility card when evaluation is complete.

### Example

```text
Sahayak

I can help you check that.

I already know:
✓ You are 62
✓ Your income is in the low-income range

I just need to know whether you meet the residency requirement.

[ User responds ]

Sahayak

Thanks. Based on the information you've provided,
you appear eligible for this scheme.
```

The interface should avoid showing a long list of raw government fields.

---

# 5. Eligibility Result Card

## Purpose

Make the eligibility decision understandable and trustworthy.

## Components

- Scheme name.
- Result.
- Short explanation.
- Criteria summary.
- Next action.

### Eligible example

```text
┌──────────────────────────────────────┐
│  Eligibility                         │
│                                      │
│  ✓ You appear eligible               │
│                                      │
│  You meet the required conditions    │
│  based on the information you gave.  │
│                                      │
│  ✓ Age requirement                   │
│  ✓ Income requirement                │
│  ✓ Residency requirement             │
│                                      │
│  [ Prepare my application ]          │
└──────────────────────────────────────┘
```

The result should use plain language such as:

> **"You appear eligible"**

rather than implying that Sahayak has made an official government decision.

## Ineligible example

```text
┌──────────────────────────────────────┐
│  Eligibility                         │
│                                      │
│  You do not appear eligible          │
│                                      │
│  The current scheme rules require    │
│  [criterion], which your information │
│  does not meet.                      │
│                                      │
│  [Explain what would need to change] │
└──────────────────────────────────────┘
```

Only conditions supported by the configured scheme rules should be displayed.

## More information needed

```text
┌──────────────────────────────────────┐
│  Eligibility                         │
│                                      │
│  More information needed              │
│                                      │
│  I need one more detail before I     │
│  can check the scheme requirements.  │
│                                      │
│  [ Continue ]                         │
└──────────────────────────────────────┘
```

---

# 6. Application Preview Card

## Purpose

Show the citizen what Sahayak has prepared before any submission occurs.

This is one of the most important trust-building components.

## Components

- Scheme name.
- Application fields.
- Values gathered from the conversation.
- Edit controls.
- Confirmation action.
- Clear "Not submitted yet" indicator.

### Example

```text
┌────────────────────────────────────────┐
│  Your application                      │
│  Demo Welfare Support                  │
│                                        │
│  Age              62             Edit  │
│  Income           Low            Edit  │
│  Residency        Qualified      Edit  │
│                                        │
│  ✓ Ready for your review               │
│                                        │
│  NOT SUBMITTED                         │
│                                        │
│  [ Confirm application ]               │
└────────────────────────────────────────┘
```

## Critical UX rule

The user must be able to review and correct information before confirmation.

The card should make the distinction obvious:

> **Prepared ≠ submitted**

---

# 7. Application Review / Confirmation

## Purpose

Create an explicit human-approval boundary.

The user should understand that the next action will perform a **simulated submission**.

## Components

- Application summary.
- Review/correction controls.
- Simulation disclosure.
- Explicit confirmation button.
- Option to continue editing.

### Example

```text
┌────────────────────────────────────────┐
│  Ready to submit?                      │
│                                        │
│  Please check your information above.  │
│                                        │
│  This will submit the application      │
│  to the CivicProof demo system only.   │
│  It will NOT be sent to a real         │
│  government department.                │
│                                        │
│  [ Confirm & submit demo application ] │
│  [ Keep editing ]                      │
└────────────────────────────────────────┘
```

The confirmation button should be explicit rather than ambiguous labels such as "Continue."

---

# 8. Submission / Tracking Card

## Purpose

Confirm that the simulated application was recorded and provide a tracking reference.

## Components

- Success indicator.
- Tracking ID.
- Simulated status.
- Clear simulation disclosure.
- Optional action to check status.

### Example

```text
┌────────────────────────────────────────┐
│  ✓ Application recorded                │
│                                        │
│  Tracking ID                           │
│  DEMO-123456                           │
│                                        │
│  Status: Simulated — Received          │
│                                        │
│  This is a hackathon simulation.       │
│  No real government application was    │
│  submitted.                            │
│                                        │
│  [ Check status ]                      │
└────────────────────────────────────────┘
```

The tracking ID should be visually prominent and easy to copy/read.

---

# 9. Status Card

## Purpose

Let the citizen understand what happened to their simulated application without leaving the conversation.

## Components

- Tracking ID.
- Scheme.
- Current simulated status.
- Submission date/time if available.
- Simulation indicator.
- Optional next-status explanation.

### Example

```text
┌────────────────────────────────────────┐
│  Application status                    │
│                                        │
│  DEMO-123456                           │
│                                        │
│  ● Under review                        │
│                                        │
│  Your application is currently shown   │
│  as under review in the demo system.  │
│                                        │
│  Simulated status                      │
└────────────────────────────────────────┘
```

The card should never make a simulated status look like a real government response.

---

# 10. My Applications — Optional Screen

## Priority

**Optional / only if time allows.**

This screen is not necessary for the primary MVP because the user can ask:

> "What's my status?"

inside the chat.

## Purpose

Provide a lightweight overview of the citizen's simulated applications.

## User

Primary citizen user.

## Components

- Page title: **My Applications**
- Small list of submitted applications.
- Scheme name.
- Tracking ID.
- Current simulated status.
- Submitted date.
- Open/view status action.
- Link/button back to Sahayak.

### Example

```text
┌─────────────────────────────────────────┐
│  My Applications                        │
│                                         │
│  Demo Welfare Support                   │
│  DEMO-123456                            │
│  ● Under review                         │
│  Submitted today                        │
│                                         │
│  [ View in Sahayak ]                    │
│                                         │
└─────────────────────────────────────────┘
```

## Why it is optional

The core product promise does not depend on a dashboard.

Adding it before the chat journey is complete risks spending valuable hackathon time on secondary navigation.

---

# 11. Screen Flow

The primary MVP should be understood as **one screen with evolving content**, not a collection of separate pages.

```text
                 ┌─────────────────────┐
                 │    SAHAYAK CHAT     │
                 │                     │
                 │ Describe situation  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Ask only missing    │
                 │ questions           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Eligibility Card    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Application Card    │
                 │ Review / Edit       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Confirmation Card   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Submission Card     │
                 │ Tracking ID         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Later in same chat: │
                 │ "What's my status?"│
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Status Card         │
                 └─────────────────────┘


        Optional, only if time allows

                 ┌─────────────────────┐
                 │  My Applications    │
                 │  lightweight list   │
                 └──────────┬──────────┘
                            │
                            ▼
                       Sahayak Chat
```

---

# 12. Loading States

Loading states should preserve the conversational feel rather than displaying technical progress.

## Initial AI response

Show:

```text
Sahayak is thinking…
```

or a subtle typing indicator.

Avoid:

```text
Calling Claude API...
Running SchemeMatcher...
Executing EligibilityChecker...
```

Those are implementation details and should not be exposed to the citizen.

## Tool execution

For short tool calls, continue the typing/loading indicator.

For a longer operation:

```text
Sahayak

I'm checking the information you provided…
```

The user should understand what is happening without seeing internal architecture.

## Application preparation

Use:

```text
Preparing your application…
```

## Submission

Use:

```text
Recording your application in the demo system…
```

The simulation should remain explicit.

---

# 13. Error States

Errors should be written in plain language and provide a next step.

## AI / agent unavailable

```text
I couldn't process that right now.

Please try sending your message again.
```

Do not expose provider-specific errors.

## Scheme data unavailable

```text
I can't check this scheme right now.

Please try again in a moment.
```

Do not substitute invented scheme information.

## Application preparation failure

```text
I couldn't prepare the application yet.

I haven't submitted anything. Let's check the missing information.
```

## Submission failure

```text
The demo application could not be recorded.

Your application was not submitted.
Please try again.
```

This distinction is important: never display a success state when persistence failed.

## Status not found

```text
I couldn't find a submitted application for that tracking ID.

Please check the ID and try again.
```

Never invent a status.

---

# 14. Empty States

## First conversation

Use the welcoming empty state described earlier.

The empty state should communicate:

1. What Sahayak does.
2. That the user can speak naturally.
3. That no form knowledge is required.

## No applications

If the optional My Applications screen is implemented:

```text
You don't have any submitted demo applications yet.

Start a conversation with Sahayak to find out what support
may apply to you.
```

Include:

```text
[ Talk to Sahayak ]
```

## No status match

Treat this as a clear information state rather than a blank screen.

```text
No application was found for that tracking ID.
```

---

# 15. Unsupported Request UX

If the citizen asks for a service outside the supported MVP scheme:

```text
Sahayak

I can currently help with the supported welfare scheme
available in this demo.

I don't want to give you incorrect information about
services I haven't been configured to support.
```

This should feel helpful rather than like a generic error.

Do not display a fabricated alternative scheme.

---

# 16. Multiple Scheme UX

If the implementation supports the broader 1–2 scheme scope and multiple schemes match, present a compact choice inside the conversation.

```text
Sahayak

Based on what you've told me, two supported schemes may fit.

┌────────────────────────────────┐
│ Scheme A                       │
│ Why it may apply               │
│ [ Choose Scheme A ]            │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Scheme B                       │
│ Why it may apply               │
│ [ Choose Scheme B ]            │
└────────────────────────────────┘
```

The user should choose rather than having the agent silently select between materially different options.

For the one-scheme hackathon demo, this state may never appear.

---

# 17. Interaction Rules

## Rule 1 — Conversation first

The user should never be forced into a form before Sahayak understands their situation.

## Rule 2 — One journey

Avoid unnecessary page navigation.

## Rule 3 — Cards for structure

Use cards when information benefits from structure:

- Eligibility.
- Application.
- Confirmation.
- Submission.
- Status.

## Rule 4 — Chat for explanation

Use normal chat messages for:

- Clarifying questions.
- Explanations.
- Guidance.
- Context.

## Rule 5 — Explicit actions

Important actions should have clear buttons:

- Prepare application.
- Edit.
- Confirm.
- Submit demo application.
- Check status.

## Rule 6 — Never hide important state

The user should always be able to tell:

```text
Eligibility → Prepared → Confirmed → Submitted
```

## Rule 7 — Simulation is always visible

Submission and status cards should clearly communicate that they are simulated.

## Rule 8 — Avoid technical language

Do not expose:

- Tool names.
- API calls.
- Model names.
- Database operations.
- Internal state names.

The architecture is for the team; the interface is for the citizen.

---

# 18. Responsive Design

The primary chat experience should work on:

- Desktop.
- Mobile.
- Tablet.

The design should be mobile-first because many target users may interact primarily through phones.

## Mobile priorities

- Large readable text.
- Large touch targets.
- Simple input area.
- Cards that fit the screen without horizontal scrolling.
- Short messages.
- Clear primary action buttons.
- Tracking ID easy to copy/read.

Avoid dense dashboards or multi-column layouts.

---

# 19. Accessibility and Trust

The target audience may include elderly or less digitally literate users, so accessibility should influence the visual design even within the hackathon scope.

Prioritize:

- Readable font sizes.
- Strong text hierarchy.
- Clear buttons.
- High enough contrast.
- Avoid relying only on color to communicate eligibility/status.
- Clear confirmation language.
- Simple sentence structure.
- Visible error messages.
- No hidden submission behavior.

The user should never need to understand the underlying AI to know what the system is doing.

---

# 20. Making the Value Obvious Within Seconds

The first screen should communicate the product's value before the user has to interact with it.

The hierarchy should be:

```text
WHO?
Sahayak — your guide to government support

WHAT?
Describe your situation in your own words.

WHY IS THIS DIFFERENT?
You don't need to know the scheme name or fill out
a government form first.

WHAT HAPPENS NEXT?
Sahayak checks what may apply → asks only what's needed
→ prepares the application → lets you review it.
```

## Ideal first impression

Within approximately **5 seconds**, a user or judge should understand:

> **"I can tell this assistant about my situation, and it will figure out the relevant government support and help me apply without making me fill the form myself."**

That is the core product value.

---

# 21. Why Inline Cards Are the Right MVP Choice

Inline cards provide the structure of a traditional government workflow without forcing the user to navigate a traditional government interface.

Traditional model:

```text
Scheme page
   ↓
Eligibility page
   ↓
Application form
   ↓
Confirmation page
   ↓
Tracking page
```

Sahayak model:

```text
                 ONE CONVERSATION
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Eligibility      Application       Tracking
    Card              Card             Card
```

This makes the experience feel continuous.

The citizen does not need to understand the application's internal stages. Sahayak handles the complexity and surfaces only the information/action relevant to the current step.

---

# 22. MVP Screen Priority

| Screen / Component | Priority | Required? |
|---|---:|---:|
| Sahayak Chat | P0 | **Yes** |
| Welcome / empty state | P0 | **Yes** |
| Chat messages | P0 | **Yes** |
| Message composer | P0 | **Yes** |
| Eligibility card | P0 | **Yes** |
| Application preview card | P0 | **Yes** |
| Review/edit controls | P0 | **Yes** |
| Confirmation card | P0 | **Yes** |
| Submission/tracking card | P0 | **Yes** |
| Status card | P0 | **Yes** |
| Loading states | P0 | **Yes** |
| Error states | P0 | **Yes** |
| Unsupported request state | P1 | Recommended |
| Multiple-scheme choice | P1 | Only if multiple schemes are supported |
| My Applications | P2 | **Only if time allows** |
| Separate dashboard | — | **No** |
| Separate eligibility page | — | **No** |
| Separate application page | — | **No** |
| Separate submission page | — | **No** |
| Separate status page | — | **No** |

---

# 23. Final UI / UX Decision

The MVP should be built around **one polished Sahayak chat screen**.

The screen progressively transforms the conversation:

```text
"What do you need?"
        ↓
"Tell me more."
        ↓
"Here's what I understand."
        ↓
"You're likely eligible because..."
        ↓
"Here's your prepared application."
        ↓
"Please review and confirm."
        ↓
"Your demo application was recorded."
        ↓
"Your tracking ID is..."
        ↓
"Here's your simulated status."
```

The complexity of government-service interaction stays behind the interface.

The citizen experiences only:

> **Tell me → Ask me → Explain → Prepare → Let me review → Submit → Track**

That is the UI expression of CivicProof/Sahayak's core value.

---

# 24. Implementation Guardrail

Do not build separate pages simply because the backend has separate stages.

The product architecture may contain:

```text
SchemeMatcher
EligibilityChecker
FormFiller
ApplicationSubmitter
StatusTracker
```

but the user interface should primarily present them as one continuous experience.

> **Backend complexity should enable a simple frontend experience, not leak into it.**
