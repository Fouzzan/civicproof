# 02 — User Research

## 1. Primary User

### User profile

The primary user is an **adult, often 45+, applying for a government welfare scheme**, such as:

- Old-age pension
- Agricultural subsidy

The user is comfortable enough with using a phone but is **not comfortable with government forms, procedures, or administrative jargon**.

### What we know

- The user may know that they need government assistance but may not know which scheme is appropriate.
- The user can use a phone-based interface.
- Government terminology and forms create difficulty.
- The user currently relies on informal help and/or office visits to navigate the process.

### Assumptions

- The user's comfort with phones does not necessarily mean they are comfortable with chat-based AI.
- The exact age distribution, digital literacy level, language preference, accessibility needs, and frequency of welfare applications are unknown.
- The examples of old-age pension and agricultural subsidy are illustrative; the final MVP schemes have not yet been selected.

---

## 2. Secondary Users

### Department staff

Department staff are secondary users/stakeholders because they process applications.

Their workflow may be affected when applications are:

- Incomplete.
- Incorrectly filed.
- Difficult to interpret.

### What we know

The problem statement identifies department staff processing incomplete or misfiled applications as a secondary affected group.

### Assumptions

- Staff would benefit from receiving clearer or more complete applications.
- The exact staff roles, departments, and internal workflows are unknown.
- Staff are not necessarily direct users of the prototype because the hackathon does not provide real government backend access.

---

## 3. Other Stakeholders

### Citizens' families, relatives, or helpers

Citizens may currently depend on other people to help them understand or complete government applications.

**Goals:**
- Help the citizen complete the process correctly.
- Reduce unnecessary effort and repeated assistance.

**Frustrations:**
- Having to interpret complicated government procedures on behalf of someone else.
- Repeated office visits or follow-ups.

### Government departments

Government departments are the organizations responsible for the schemes and application processes represented by the prototype.

**Goals:**
- Receive applications containing the required information.
- Process applications through the appropriate workflow.

**Frustrations / affected problems:**
- Incomplete or misfiled applications can create additional processing difficulty.

### Hackathon judges / evaluators

These are stakeholders in the context of demonstrating the product, rather than end users.

**Goal:**
- See a clear demonstration that the proposed solution addresses the Public Services & Civic Agents problem.

**Assumption:**
- The strongest demonstration is likely to be an understandable end-to-end journey from citizen situation to simulated application and tracking, because this is the success criterion established in the problem definition.

---

# 4. User Goals and Frustrations

## Primary User

### Goals

The primary user wants to:

1. Understand what government help may be relevant to their situation.
2. Understand whether they qualify.
3. Avoid confusing government terminology and forms.
4. Complete the application correctly.
5. Submit the application without unnecessary procedural difficulty.
6. Receive a tracking ID after submission.
7. Later find out the status of the application without needing to repeat the entire process.

### Frustrations

The current process can involve:

- Not knowing which scheme applies.
- Asking other people for information.
- Travelling to a government office.
- Filling forms with assistance.
- Dealing with unfamiliar government terminology.
- Waiting after submission without clear status information.
- Visiting again to ask about the application.

## Secondary User — Department Staff

### Goals

- Receive applications that contain the information needed for processing.
- Reduce problems caused by incomplete or misfiled applications.

### Frustrations

- Processing incomplete applications.
- Processing applications that have been filed incorrectly.

### Assumptions

The exact operational impact on staff is unknown because the brief does not provide details about their internal processes.

---

# 5. Current Workflow

The current workflow described by the research is:

```text
Need government assistance
        ↓
Ask around informally
        ↓
Travel to government office
        ↓
Fill a form with help
        ↓
Submit
        ↓
Wait
        ↓
No clear status updates
        ↓
Visit again to ask about status
```

## Problems at each stage

| Stage | User experience / problem |
|---|---|
| Identify need | User knows their situation but may not know the relevant scheme |
| Find information | User asks around informally |
| Reach service | User may need to travel to an office |
| Complete application | User needs help with the form |
| Submit | Application is submitted, but the process afterward is unclear |
| Wait | User has little or no visibility into status |
| Follow up | User may need another office visit to ask what happened |

### Important observation

The difficulty is not limited to **filling a form**. The user journey begins before the form exists:

> **"I need help" → "What scheme is for me?" → "Do I qualify?" → "How do I apply?" → "What happened after I applied?"**

---

# 6. Desired Workflow

The proposed workflow is:

```text
Open the service
      ↓
Describe situation in plain words
      ↓
Agent asks a few clarifying questions
      ↓
Agent identifies relevant scheme(s)
      ↓
Agent explains eligibility and why
      ↓
Agent fills the application
      ↓
User reviews and confirms
      ↓
Simulated submission
      ↓
Tracking ID
      ↓
Later: "What’s my status?"
```

## Key UX principle

The user should interact with their **situation and needs**, rather than being forced to understand the structure of a government form first.

The agent acts as a bridge between:

**Citizen language** ↔ **Government service/application language**

---

# 7. Important Use Cases

## Use Case 1 — Discover a relevant scheme

**Goal:** Help a citizen identify which supported scheme may apply to their situation.

**Flow:**
1. User describes their situation in plain language.
2. Agent asks clarifying questions.
3. Agent identifies a relevant supported scheme.
4. Agent explains what the scheme is and why it may be relevant.

---

## Use Case 2 — Check eligibility

**Goal:** Help the user understand whether they qualify.

**Flow:**
1. Agent gathers the necessary information.
2. Agent evaluates the available information against the supported eligibility requirements.
3. Agent explains the result in understandable language.

Possible outcomes:

- Likely eligible.
- Not eligible.
- More information needed.

The exact eligibility rules depend on the selected scheme(s).

---

## Use Case 3 — Generate an application

**Goal:** Reduce the burden of understanding and manually completing a raw form.

**Flow:**
1. Agent uses information already provided by the user.
2. Agent fills the relevant application information.
3. User sees the generated application.
4. User confirms or corrects the information.
5. The application proceeds to simulated submission.

### Important UX requirement

The user should be able to **review the application before submission**.

---

## Use Case 4 — Simulated submission

**Goal:** Demonstrate the complete government-service journey within the hackathon constraints.

**Flow:**
1. User confirms the application.
2. System performs a simulated submission.
3. User receives a tracking ID.

The prototype must make it clear that this is a **simulation**, not an actual submission to a government department.

---

## Use Case 5 — Check application status

**Goal:** Let the user understand what happened after submission without requiring another office visit.

**Flow:**
1. User returns to the service.
2. User asks something such as:
   > "What's my status?"
3. Agent identifies the relevant application.
4. Agent presents the simulated status.

The exact status stages are an open product decision.

---

## Use Case 6 — No eligible scheme

**Goal:** Avoid dead-ending a citizen who does not qualify for the scheme(s) considered.

**Flow:**
1. User describes their situation.
2. Agent asks the necessary questions.
3. No supported scheme matches the user's situation.
4. Agent clearly explains that no currently supported scheme appears applicable.
5. Agent explains, where possible within the known rules, what eligibility condition is preventing qualification or what information is missing.
6. The conversation remains useful rather than simply ending.

### Important boundary

The agent must not invent another scheme, eligibility condition, or requirement merely to provide an answer.

---

# 8. Edge Cases

## 8.1 User does not qualify

This is a **known edge case**.

The agent should:

- Clearly communicate that the user does not appear eligible.
- Explain the relevant reason in simple language.
- Explain what would need to be different, if that is supported by the known eligibility rules.
- Avoid presenting an uncertain result as definitive.
- Avoid ending the conversation abruptly.

---

## 8.2 Insufficient information

### Assumption

A user's first message may not contain enough information to determine eligibility.

The agent should ask only the necessary clarifying questions rather than immediately presenting a long form.

The exact minimum information required depends on the selected scheme.

---

## 8.3 User provides information that does not match a supported scheme

### Assumption

The user may describe a genuine need that falls outside the 1–2 schemes supported by the MVP.

The agent should clearly communicate the scope limitation rather than pretending that an unsupported scheme is available.

---

## 8.4 User changes an answer

### Assumption

A user may correct information after the agent has interpreted it.

The application should use the user's corrected information rather than silently retaining the previous interpretation.

---

## 8.5 User rejects or edits generated application information

### Assumption

The user may disagree with information the agent inferred or generated.

The user should be able to review and correct the application before simulated submission.

---

## 8.6 User asks for status without a known application

### Assumption

A user may ask "What's my status?" without having a matching application in the simulated system.

The service should explain that it cannot find a matching application rather than inventing a status.

---

## 8.7 Ambiguous natural-language description

### Assumption

The user's description may be too vague to identify a scheme or determine eligibility.

The agent should ask a small number of clarifying questions instead of guessing.

---

## 8.8 User asks about something outside the supported scope

### Assumption

The user may ask about a government service that the MVP does not support.

The agent should clearly state the limitation rather than claiming to support the service.

---

# 9. UX Requirements Derived from the Research

The research suggests the following principles for the product:

### 1. Start with the citizen's situation

Do not make the user select a government department or understand a scheme before explaining their need.

### 2. Use plain language

The agent should explain government concepts in language the target user can understand.

### 3. Ask only necessary questions

The interaction should feel like a guided conversation rather than a raw government form.

### 4. Explain decisions

When showing an eligibility result, explain the important reason behind it.

### 5. Keep the citizen in control

AI-generated application information should be shown to the user for review before simulated submission.

### 6. Do not dead-end

A negative eligibility result should still explain what was determined and, where supported, what could change the outcome.

### 7. Make simulation explicit

The user should never mistake the hackathon prototype's submission or status for a real government transaction.

### 8. Support the full journey

The experience should connect discovery, eligibility, application, submission, and tracking rather than solving only one step.

---

# 10. Facts vs. Assumptions Summary

## Facts established by the brief/research

- The primary user is an adult, often 45+, applying for a welfare scheme.
- The user is comfortable with a phone but not government forms or jargon.
- The current workflow involves informal information seeking, office travel, form completion with help, submission, waiting, and follow-up.
- The proposed workflow uses plain-language conversation, clarifying questions, eligibility explanation, application generation, confirmation, simulated submission, and tracking.
- Users may ask for application status later.
- A known edge case is a user who does not qualify for anything they described.
- Department staff are a secondary affected group.
- The MVP is limited to 1–2 schemes.
- Real government backend access is unavailable.
- Submission and status therefore need to be simulated.

## Assumptions / unknowns

- Exact age distribution beyond "often 45+".
- Exact digital literacy levels.
- Preferred language or communication mode.
- Whether users will trust or understand an AI agent immediately.
- Exact scheme(s) selected for the MVP.
- Exact eligibility questions for those schemes.
- Exact application fields and required documents.
- Exact government department workflows.
- Exact simulated status stages.
- Whether family members/helpers will interact with the product directly.
- How department staff would interact with any resulting application data.

These should remain explicitly marked as assumptions until validated or decided by the product team.
