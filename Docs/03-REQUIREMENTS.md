# 03 — Requirements

## Requirement Classification

This document formalizes the MVP requirements derived from `01-PROBLEM.md`, `02-USER-RESEARCH.md`, and the supplied draft requirements.

### Priority definitions

- **P0 — Must have:** Required for the core end-to-end hackathon journey.
- **P1 — Should have:** Important to the user experience, but the MVP can demonstrate the core journey without it.
- **P2 — Could have:** Useful if time permits; not required for the core demo.

---

# Functional Requirements

## REQ-001 — Describe Situation in Plain Language

| Field | Requirement |
|---|---|
| **ID** | REQ-001 |
| **Description** | The user can describe their situation and need for government assistance in plain language rather than starting with a government form or administrative terminology. |
| **User it serves** | Primary user — citizen applying for a welfare scheme |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. User can provide a free-form description of their situation. <br>2. The interaction does not require the user to understand government form fields before starting. <br>3. The provided description can be used as the starting point for scheme/eligibility guidance. |

---

## REQ-002 — Match Situation Against Scheme Eligibility Rules

| Field | Requirement |
|---|---|
| **ID** | REQ-002 |
| **Description** | The service evaluates the user's situation and collected information against the eligibility rules of the supported scheme(s) and identifies potentially relevant scheme(s). |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The service considers the user's provided information when evaluating supported scheme(s). <br>2. The result is based on the eligibility rules defined for the supported scheme(s). <br>3. The user receives an understandable result rather than an unexplained match. <br>4. The service does not claim eligibility for an unsupported scheme. |

---

## REQ-003 — Ask Clarifying Questions

| Field | Requirement |
|---|---|
| **ID** | REQ-003 |
| **Description** | The agent asks the user for missing information needed to identify a relevant scheme or evaluate eligibility. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The agent identifies when the available information is insufficient. <br>2. The agent asks for the information needed to continue. <br>3. Questions are presented in simple language. <br>4. The interaction does not immediately expose the user to a long raw form. <br>5. The user's answers can be used in the subsequent eligibility/application process. |

---

## REQ-004 — Explain Eligibility Result

| Field | Requirement |
|---|---|
| **ID** | REQ-004 |
| **Description** | The service explains whether the user appears eligible, not eligible, or still needs to provide information, including the relevant reason or missing information. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The user receives an understandable eligibility outcome. <br>2. The service explains the important eligibility condition(s) behind the outcome. <br>3. Missing information is clearly identified when eligibility cannot yet be determined. <br>4. The service does not present an unsupported or uncertain conclusion as a confirmed fact. |

---

## REQ-005 — Generate Application from User Information

| Field | Requirement |
|---|---|
| **ID** | REQ-005 |
| **Description** | After the relevant scheme and required information have been established, the service prepares an application using information already provided by the user. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Application information is derived from information supplied during the interaction. <br>2. The user is not required to manually reproduce information that has already been collected when it can be reused. <br>3. The generated application is associated with the selected supported scheme. <br>4. Information that is missing or requires confirmation is made visible to the user. |

---

## REQ-006 — Show Application Preview Before Submission

| Field | Requirement |
|---|---|
| **ID** | REQ-006 |
| **Description** | The service shows the prepared application to the user for review and confirmation before submission. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The complete prepared application information is visible before submission. <br>2. The user can review the information. <br>3. The user can correct information before submission. <br>4. Submission does not occur before the user confirms the application. |

---

## REQ-007 — Simulated Application Submission

| Field | Requirement |
|---|---|
| **ID** | REQ-007 |
| **Description** | The user can submit the reviewed application within the hackathon prototype, with the submission explicitly treated as a simulation rather than a real government submission. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. A confirmed application can be submitted through the prototype. <br>2. The prototype clearly communicates that the submission is simulated. <br>3. The service creates a record that can be referenced later in the prototype. <br>4. The user receives a tracking ID after simulated submission. |

---

## REQ-008 — Provide Tracking ID

| Field | Requirement |
|---|---|
| **ID** | REQ-008 |
| **Description** | The service provides the user with a unique tracking ID for the simulated application after submission. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. A tracking ID is displayed after successful simulated submission. <br>2. The tracking ID is associated with the user's simulated application. <br>3. The user can use the tracking information to identify the application later. |

---

## REQ-009 — Check Application Status Later

| Field | Requirement |
|---|---|
| **ID** | REQ-009 |
| **Description** | After submission, the user can return and ask for the status of their application without repeating the original application process. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. A submitted simulated application has a status that can be retrieved later. <br>2. The user can request the status in plain language, such as asking what happened to their application. <br>3. The service returns the status of the matching application. <br>4. The service does not invent a status when no matching application exists. <br>5. The displayed status is clearly identified as simulated. |

---

## REQ-010 — Handle Non-Eligibility Clearly

| Field | Requirement |
|---|---|
| **ID** | REQ-010 |
| **Description** | When the user does not appear eligible for the supported scheme(s), the service clearly communicates the result and explains the relevant reason or condition. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P1** |
| **Acceptance Criteria** | 1. The user is clearly told when no supported scheme appears applicable. <br>2. The service explains the relevant eligibility condition that prevents qualification when that information is available. <br>3. Where the rules support it, the service explains what would need to be different for the user to qualify. <br>4. The conversation does not simply end with a rejection message. <br>5. The service does not invent alternative schemes or eligibility conditions. |

---

## REQ-011 — Handle Unsupported or Out-of-Scope Requests

| Field | Requirement |
|---|---|
| **ID** | REQ-011 |
| **Description** | When a user's situation or request falls outside the schemes supported by the MVP, the service clearly communicates the limitation instead of pretending to support it. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P1** |
| **Acceptance Criteria** | 1. The service does not claim that an unsupported scheme is available. <br>2. The user is told when their request falls outside the supported scope. <br>3. The service does not fabricate eligibility rules, application requirements, or government procedures for unsupported services. |

---

# Non-Functional Requirements

## NFR-001 — Use Simple, Non-Technical Language

| Field | Requirement |
|---|---|
| **ID** | NFR-001 |
| **Description** | The citizen-facing experience uses simple, understandable language and avoids unnecessary government or technical jargon. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. User-facing questions and explanations are written in plain language. <br>2. Government terminology is explained when it is necessary. <br>3. The experience does not require prior knowledge of government procedures to complete the core journey. <br>4. Eligibility and application information is presented in a way the target user can understand. |

---

## NFR-002 — Transparency About Simulation

| Field | Requirement |
|---|---|
| **ID** | NFR-002 |
| **Description** | The prototype clearly distinguishes simulated application submission and status information from real government transactions. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. The user is informed that application submission is simulated. <br>2. The user is informed that application status is simulated. <br>3. The prototype does not imply that it has submitted information to a real government department. |

---

## NFR-003 — Trustworthy and Non-Fabricated Guidance

| Field | Requirement |
|---|---|
| **ID** | NFR-003 |
| **Description** | The service should not invent eligibility rules, scheme details, application requirements, statuses, or government procedures that are not established for the supported MVP schemes. |
| **User it serves** | Primary user — citizen |
| **Priority** | **P0** |
| **Acceptance Criteria** | 1. Eligibility outcomes are grounded in the defined rules for supported schemes. <br>2. Missing or uncertain information is identified rather than guessed. <br>3. Unsupported schemes or procedures are not presented as available facts. <br>4. Simulated information is distinguishable from real-world government information. |

---

# MVP Requirement Summary

| ID | Short Description | Type | Priority |
|---|---|---|---|
| REQ-001 | Describe situation in plain language | Functional | P0 |
| REQ-002 | Match against scheme eligibility rules | Functional | P0 |
| REQ-003 | Ask clarifying questions | Functional | P0 |
| REQ-004 | Explain eligibility result | Functional | P0 |
| REQ-005 | Generate application | Functional | P0 |
| REQ-006 | Preview and confirm application | Functional | P0 |
| REQ-007 | Simulated submission | Functional | P0 |
| REQ-008 | Provide tracking ID | Functional | P0 |
| REQ-009 | Check status later | Functional | P0 |
| REQ-010 | Handle non-eligibility clearly | Functional | P1 |
| REQ-011 | Handle unsupported requests | Functional | P1 |
| NFR-001 | Simple, non-technical language | Non-functional | P0 |
| NFR-002 | Transparency about simulation | Non-functional | P0 |
| NFR-003 | Trustworthy, non-fabricated guidance | Non-functional | P0 |

---

# End-to-End MVP Acceptance Test

A successful MVP should support the following journey:

> **A citizen describes their situation in plain language → the agent asks only the necessary clarifying questions → the service identifies a relevant supported scheme and explains the eligibility result → the application is prepared from the citizen's information → the citizen reviews and confirms it → the prototype performs a clearly simulated submission → the citizen receives a tracking ID → the citizen can later ask for the application's status.**

The MVP should also demonstrate the important negative path:

> **A citizen describes their situation → the service determines that no supported scheme appears applicable → the service clearly explains why, where supported by the known rules, instead of simply dead-ending the conversation.**

This end-to-end journey is the primary measure of whether the requirements solve the problem identified in `01-PROBLEM.md` and `02-USER-RESEARCH.md`.
