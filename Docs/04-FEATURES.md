# 04 — Features

This document translates the requirements in `03-REQUIREMENTS.md` into a concrete MVP feature set.

> **Scope decision:** The problem and requirements documents currently constrain the MVP to **1–2 supported schemes**. The draft feature list mentioned 2–3 schemes; this document follows the established 1–2 scheme constraint rather than expanding scope.

> **Mapping rule:** Every MVP feature below maps to at least one requirement. Features from the draft that do not map to an existing requirement are explicitly flagged rather than introducing unsupported scope.

---

# P0 — Core MVP Features

## F-001 — Plain-Language Need Chat

| Field | Details |
|---|---|
| **Name** | Plain-Language Need Chat |
| **Problem it solves** | Citizens may understand their situation but not know which government scheme or procedure applies. Starting with a conversational description avoids forcing them to understand government forms first. |
| **User** | Primary user — citizen |
| **Input** | A free-form description of the user's situation and need for government assistance. |
| **Processing** | The service interprets the user's description as the starting point for determining what supported scheme may be relevant and what information is needed next. |
| **Output** | A conversational response and, when necessary, follow-up questions. |
| **Dependencies** | REQ-001, REQ-003, NFR-001 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. User can start by describing their situation in their own words. <br>2. User does not need to select or understand a raw government form first. <br>3. The interaction can continue into scheme discovery and eligibility assessment. <br>4. User-facing language is simple and understandable. |

---

## F-002 — Scheme Matching

| Field | Details |
|---|---|
| **Name** | Supported Scheme Matching |
| **Problem it solves** | Citizens may not know which welfare scheme is relevant to their situation because scheme information is difficult to navigate. |
| **User** | Primary user — citizen |
| **Input** | User's plain-language situation and relevant answers collected during the conversation. |
| **Processing** | The service compares the available user information against the eligibility rules of the supported MVP schemes. |
| **Output** | One or more relevant supported scheme matches, or an indication that no supported scheme appears applicable. |
| **Dependencies** | REQ-002, REQ-003, REQ-010, REQ-011, NFR-003 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Matching uses the defined rules for supported schemes. <br>2. The result does not depend on an unsupported scheme being invented. <br>3. The user receives an understandable explanation of the match. <br>4. If no supported scheme matches, the service handles the negative path explicitly. |

### Scope note

The MVP should support **1–2 schemes**, not a broad scheme catalog.

---

## F-003 — Guided Eligibility Check

| Field | Details |
|---|---|
| **Name** | Guided Eligibility Checker |
| **Problem it solves** | Citizens may find eligibility requirements difficult to understand and may not know what information is needed. |
| **User** | Primary user — citizen |
| **Input** | Information already provided by the user plus answers to targeted follow-up questions. |
| **Processing** | The service identifies missing information, asks necessary questions, and evaluates the collected information against the supported scheme's eligibility rules. |
| **Output** | An understandable eligibility result: likely eligible, not eligible, or more information needed. |
| **Dependencies** | REQ-002, REQ-003, REQ-004, NFR-001, NFR-003 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The service detects when required information is missing. <br>2. It asks targeted follow-up questions. <br>3. It evaluates the collected information against the defined scheme rules. <br>4. It explains the important reason behind the result. <br>5. It does not present unsupported or uncertain conclusions as confirmed facts. |

---

## F-004 — Eligibility Explanation

| Field | Details |
|---|---|
| **Name** | Explain Eligibility Result |
| **Problem it solves** | A simple yes/no result does not help a citizen understand why they qualify, do not qualify, or need to provide more information. |
| **User** | Primary user — citizen |
| **Input** | Eligibility evaluation and the relevant eligibility conditions. |
| **Processing** | The service translates the relevant eligibility result and conditions into understandable language. |
| **Output** | A plain-language explanation of the result and, when applicable, the missing information or relevant condition. |
| **Dependencies** | REQ-004, REQ-010, NFR-001, NFR-003 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The result is understandable to the target user. <br>2. Important eligibility conditions are explained. <br>3. Missing information is identified when necessary. <br>4. The explanation does not fabricate rules or requirements. |

---

## F-005 — Application Autofill

| Field | Details |
|---|---|
| **Name** | Application Autofill |
| **Problem it solves** | Government forms can be confusing and may require users to repeatedly enter information they have already provided. |
| **User** | Primary user — citizen |
| **Input** | User information collected during the conversation and the selected supported scheme. |
| **Processing** | The service maps collected information into the relevant application information. |
| **Output** | A prepared application containing the information that can be populated from the conversation, with missing or confirmation-required information identified. |
| **Dependencies** | REQ-005, REQ-003, NFR-001, NFR-003 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Application information is derived from information supplied by the user. <br>2. Previously supplied information can be reused where appropriate. <br>3. Missing or confirmation-required information is visible. <br>4. The prepared application is associated with the selected scheme. |

---

## F-006 — Human Confirmation and Application Review

| Field | Details |
|---|---|
| **Name** | Application Review & Confirmation |
| **Problem it solves** | Automatically prepared information may need correction or confirmation by the citizen before submission. |
| **User** | Primary user — citizen |
| **Input** | Prepared application. |
| **Processing** | The service presents the application for review and accepts user corrections or confirmation. |
| **Output** | A user-confirmed application ready for simulated submission. |
| **Dependencies** | REQ-006, REQ-005 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. User can see the prepared application before submission. <br>2. User can correct information. <br>3. User must confirm before submission. <br>4. Corrected information is used for the submitted application. |

---

## F-007 — Simulated Application Submission

| Field | Details |
|---|---|
| **Name** | Simulated Submission |
| **Problem it solves** | The hackathon cannot connect to real government backend systems, but the product must demonstrate the complete submission journey. |
| **User** | Primary user — citizen |
| **Input** | User-confirmed application. |
| **Processing** | The prototype creates a simulated application submission record. |
| **Output** | Submission confirmation and tracking ID. |
| **Dependencies** | REQ-007, REQ-008, NFR-002 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Only a confirmed application can be submitted. <br>2. Submission is explicitly identified as simulated. <br>3. A simulated application record is created. <br>4. A tracking ID is returned to the user. <br>5. The prototype does not imply that a real government submission occurred. |

---

## F-008 — Tracking ID

| Field | Details |
|---|---|
| **Name** | Application Tracking ID |
| **Problem it solves** | Citizens need a way to identify and refer back to an application after submission. |
| **User** | Primary user — citizen |
| **Input** | Successfully submitted simulated application. |
| **Processing** | The service associates a unique tracking identifier with the simulated application. |
| **Output** | Tracking ID displayed to the user. |
| **Dependencies** | REQ-008, REQ-007 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. A tracking ID is generated/displayed after submission. <br>2. It identifies the user's simulated application. <br>3. It can be used to retrieve the application later. |

---

## F-009 — Application Status Lookup

| Field | Details |
|---|---|
| **Name** | Conversational Status Lookup |
| **Problem it solves** | Citizens currently have little visibility after submission and may need to visit an office again to ask about status. |
| **User** | Primary user — citizen |
| **Input** | A later status request, such as "What's my status?", together with enough information to identify the user's application. |
| **Processing** | The service finds the matching simulated application and retrieves its current simulated status. |
| **Output** | Current simulated application status and relevant tracking information. |
| **Dependencies** | REQ-009, REQ-008, NFR-002 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. A submitted simulated application has a retrievable status. <br>2. User can request status in plain language. <br>3. The matching application's status is returned. <br>4. No status is invented when no matching application exists. <br>5. Status is clearly identified as simulated. |

---

# P1 — Important Supporting Features

## F-010 — Clear Non-Eligibility Path

| Field | Details |
|---|---|
| **Name** | Non-Eligibility Guidance |
| **Problem it solves** | A citizen who does not qualify should not receive a dead-end rejection without understanding why. |
| **User** | Primary user — citizen |
| **Input** | User situation and eligibility evaluation showing that no supported scheme appears applicable. |
| **Processing** | The service identifies the relevant eligibility condition(s) and explains the result. |
| **Output** | Clear non-eligibility explanation and, where supported by the rules, what would need to be different. |
| **Dependencies** | REQ-010, REQ-004, NFR-003 |
| **Priority** | **P1** |
| **Acceptance Criteria** | 1. User is clearly told when no supported scheme appears applicable. <br>2. Relevant reasons are explained when known. <br>3. The service explains what could change the result when supported by the defined rules. <br>4. The interaction does not simply terminate. <br>5. The service does not invent alternative schemes or conditions. |

---

## F-011 — Unsupported Request Handling

| Field | Details |
|---|---|
| **Name** | Out-of-Scope Request Handling |
| **Problem it solves** | The MVP only supports a small number of schemes, so users may ask for services outside its scope. |
| **User** | Primary user — citizen |
| **Input** | A request or situation that does not correspond to a supported MVP scheme. |
| **Processing** | The service determines that the request is outside the supported scope. |
| **Output** | A clear explanation that the requested service is not currently supported. |
| **Dependencies** | REQ-011, NFR-003 |
| **Priority** | **P1** |
| **Acceptance Criteria** | 1. Unsupported services are not presented as supported. <br>2. The limitation is clearly communicated. <br>3. The service does not fabricate eligibility rules, requirements, or procedures. |

---

# Cross-Cutting Experience Features

These are not separate user journeys; they are qualities that apply across the core features.

## F-012 — Plain-Language Conversation

| Field | Details |
|---|---|
| **Name** | Plain-Language Conversation |
| **Problem it solves** | Government terminology and administrative language can make the process difficult for the target user. |
| **User** | Primary user — citizen |
| **Input** | All citizen-facing questions, responses, eligibility explanations, and application guidance. |
| **Processing** | Information is communicated in simple, non-technical language, with necessary government terminology explained. |
| **Output** | Understandable citizen-facing conversation and guidance. |
| **Dependencies** | NFR-001 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Citizen-facing interactions avoid unnecessary jargon. <br>2. Necessary government terms are explained. <br>3. The core journey can be completed without prior knowledge of government procedures. |

---

## F-013 — Simulation Transparency

| Field | Details |
|---|---|
| **Name** | Simulation Transparency |
| **Problem it solves** | Without clear disclosure, a user could mistake the prototype's simulated submission or status for a real government transaction. |
| **User** | Primary user — citizen |
| **Input** | Submission and status interactions. |
| **Processing** | The service clearly labels simulated actions and information. |
| **Output** | Clear indication that submission and status are simulated. |
| **Dependencies** | NFR-002 |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Simulated submission is clearly disclosed. <br>2. Simulated status is clearly disclosed. <br>3. The service never claims to have submitted to a real government department. |

---

# Draft Features Without Current Requirement Mapping

The following items appeared in the supplied draft feature list but **do not currently map to a requirement in `03-REQUIREMENTS.md`**.

They should **not be added to the MVP implementation scope yet**.

| Draft Feature | Draft Priority | Mapping Status | Reason |
|---|---:|---|---|
| Proactive follow-up reminder | P1 | ⚠️ **Unmapped** | No requirement currently specifies agent-initiated reminders. |
| Voice input | P2 | ⚠️ **Unmapped** | No requirement currently requires voice interaction. |
| Multilingual support | P2 | ⚠️ **Unmapped** | No requirement currently requires multilingual interaction. |
| Document OCR | P2 | ⚠️ **Unmapped** | No requirement currently requires document OCR. |

### Product decision

These features are reasonable future ideas, but adding them to the current feature scope would expand the product beyond what the problem, user research, and requirements currently establish.

If the team later decides that one of them is important enough for the hackathon, the correct sequence is:

**Feature decision → requirement update → feature mapping → implementation**

rather than implementing the feature first.

---

# Feature-to-Requirement Traceability

| Feature | Requirement(s) | Priority |
|---|---|---:|
| F-001 Plain-Language Need Chat | REQ-001, REQ-003, NFR-001 | P0 |
| F-002 Supported Scheme Matching | REQ-002, REQ-010, REQ-011, NFR-003 | P0 |
| F-003 Guided Eligibility Checker | REQ-002, REQ-003, REQ-004, NFR-001, NFR-003 | P0 |
| F-004 Eligibility Explanation | REQ-004, REQ-010, NFR-001, NFR-003 | P0 |
| F-005 Application Autofill | REQ-005, REQ-003, NFR-003 | P0 |
| F-006 Application Review & Confirmation | REQ-006, REQ-005 | P0 |
| F-007 Simulated Submission | REQ-007, REQ-008, NFR-002 | P0 |
| F-008 Application Tracking ID | REQ-008, REQ-007 | P0 |
| F-009 Conversational Status Lookup | REQ-009, REQ-008, NFR-002 | P0 |
| F-010 Non-Eligibility Guidance | REQ-010, REQ-004, NFR-003 | P1 |
| F-011 Out-of-Scope Request Handling | REQ-011, NFR-003 | P1 |
| F-012 Plain-Language Conversation | NFR-001 | P0 |
| F-013 Simulation Transparency | NFR-002 | P0 |

---

# Recommended Hackathon MVP

The **P0 critical path** is:

```text
Describe situation
       ↓
Match supported scheme
       ↓
Ask necessary questions
       ↓
Check eligibility
       ↓
Explain result
       ↓
Generate application
       ↓
Review + confirm
       ↓
Simulated submission
       ↓
Tracking ID
       ↓
Ask "What's my status?"
       ↓
Show simulated status
```

The MVP should also demonstrate at least one meaningful negative path:

```text
Describe situation
       ↓
Ask necessary questions
       ↓
No supported scheme / not eligible
       ↓
Explain why
       ↓
Explain what would need to change, when supported
       ↓
Do not dead-end or fabricate another scheme
```

## Explicitly out of MVP scope

Unless a later requirement is added, the following remain outside the MVP:

- Agent-initiated reminders
- Voice input
- Multilingual support
- Document OCR
- A large government scheme catalog
- Real government backend submission
- Real government application status

This keeps the hackathon build focused on demonstrating the core Public Services & Civic Agents journey end-to-end.
