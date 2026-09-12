# CivicProof — Requirements Specification

> **Sources:** `docs/01-PROBLEM.md` and `docs/02-USER-RESEARCH.md`
>
> Requirements below are derived only from those documents. P0 = essential for the MVP/demo, P1 = important but not essential for the core demo, P2 = later enhancement.

---

# Functional Requirements

## FR-001 — Create an Incident

- **Requirement ID:** FR-001
- **Description:** The system must allow a citizen/reporter to create a structured incident or civic-problem report.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A user can start a new incident.
  - The user can provide the available incident details.
  - The system creates a case from the submitted information.
  - The system does not require information that is not relevant to the incident.

---

## FR-002 — Support Multiple Incident Categories

- **Requirement ID:** FR-002
- **Description:** The system must support civic problems, public-service problems, and sensitive safety/person-related incidents within the defined product scope.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A user can identify the general type of incident.
  - The workflow can accommodate both ordinary civic issues and sensitive incidents.
  - The system does not expose sensitive incidents as public complaints by default.

---

## FR-003 — Provide Incident Details

- **Requirement ID:** FR-003
- **Description:** The system must allow reporters to provide relevant information about what happened, including a description and available contextual information.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A reporter can describe the incident.
  - The reporter can provide available date/time and location information where relevant.
  - The reporter can provide additional incident-specific information where applicable.
  - The system does not invent missing information.

---

## FR-004 — Upload Evidence

- **Requirement ID:** FR-004
- **Description:** The system must allow reporters to attach available evidence to a case.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A reporter can attach supported evidence files.
  - Evidence is associated with the correct case.
  - Multiple evidence items can belong to one case.
  - A report can still be created when no evidence is available.

---

## FR-005 — Organize Case Evidence

- **Requirement ID:** FR-005
- **Description:** The system should organize evidence so that it can be understood in the context of the case.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P1
- **Acceptance Criteria:**
  - Evidence is displayed as belonging to a specific case.
  - The authority-side case view can access associated evidence.
  - Evidence is not presented as automatically authentic or conclusive merely because it was uploaded.

---

## FR-006 — AI-Assisted Incident Structuring

- **Requirement ID:** FR-006
- **Description:** The system should use AI to help structure and summarize the information supplied by the reporter.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - The system can produce a structured summary from the supplied information.
  - The analysis is clearly presented as AI-assisted.
  - The system does not invent facts that were not supplied or verified.
  - AI output does not determine guilt or criminal liability.

---

## FR-007 — Provide Severity Suggestion

- **Requirement ID:** FR-007
- **Description:** The system should provide a severity suggestion for a case based on the available incident information.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - A severity level can be displayed for a case.
  - The result is presented as a suggestion/assessment rather than an authoritative legal determination.
  - Missing information does not get fabricated to justify a severity level.

---

## FR-008 — Provide Potentially Relevant Regulatory Context

- **Requirement ID:** FR-008
- **Description:** The system should provide potentially relevant regulatory/legal context when supported by the available incident information.
- **User it serves:** Citizen / Reporter
- **Priority:** P1
- **Acceptance Criteria:**
  - Relevant context can be displayed when available.
  - The interface does not present the result as definitive legal advice.
  - The system does not invent laws or provisions.
  - The context does not determine guilt or criminal liability.

---

## FR-009 — Recommend Reporting Direction

- **Requirement ID:** FR-009
- **Description:** The system should help the reporter identify an appropriate reporting direction, authority, or channel based on the incident.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - The system provides a recommended reporting direction when enough information is available.
  - The recommendation can account for incident category and jurisdiction where known.
  - The system can acknowledge uncertainty rather than presenting an unverified authority as certain.
  - The user can be directed toward an official reporting channel where available.

---

## FR-010 — Generate Formal Complaint

- **Requirement ID:** FR-010
- **Description:** The system should transform the reporter's supplied information into a clear formal complaint draft.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A complaint draft can be generated from the case information.
  - The draft reflects information actually supplied by the reporter.
  - The system does not fabricate facts, evidence, or events.
  - The reporter can review the complaint before using it.

---

## FR-011 — Official Reporting / Handoff

- **Requirement ID:** FR-011
- **Description:** The system must provide a legitimate path toward the appropriate official reporting channel, either through an actual integration or an explicit handoff.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - The system clearly distinguishes between generating a complaint and officially submitting it.
  - Where no direct integration exists, the user receives an official-channel handoff.
  - The system never claims a complaint was officially submitted when it was not.

---

## FR-012 — Generate a Case ID

- **Requirement ID:** FR-012
- **Description:** The system must create a unique case/reference ID for a created report.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - A newly created case receives an identifier.
  - The identifier can be displayed to the reporter.
  - The identifier identifies the corresponding case.

---

## FR-013 — Case Status and Timeline

- **Requirement ID:** FR-013
- **Description:** The system must provide a case status and timeline showing the progress of a report.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A reporter can view the case status.
  - The case contains chronological progress information.
  - Status changes are represented clearly.
  - The system does not imply progress that has not actually occurred.

---

## FR-014 — Authority Case Review

- **Requirement ID:** FR-014
- **Description:** Authority users must be able to review submitted cases and understand the incident information and associated evidence.
- **User it serves:** Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - An authority user can view assigned/available cases.
  - Case details are presented in an understandable structure.
  - Associated evidence can be accessed according to permissions.

---

## FR-015 — Authority Assignment

- **Requirement ID:** FR-015
- **Description:** The authority workflow should allow a case to be assigned for handling.
- **User it serves:** Authority User
- **Priority:** P1
- **Acceptance Criteria:**
  - An authorized authority user can assign a case.
  - The assignment is visible in the case state.
  - The system does not expose assignment information to unauthorized users.

---

## FR-016 — Authority Status Updates

- **Requirement ID:** FR-016
- **Description:** Authority users must be able to update case progress and status.
- **User it serves:** Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - An authorized authority user can change the case status.
  - Progress information can be added.
  - Updates appear in the case timeline.
  - Updates identify that they came from the authority workflow.

---

## FR-017 — Request Additional Information

- **Requirement ID:** FR-017
- **Description:** The authority workflow should support requesting additional information when a case is incomplete.
- **User it serves:** Authority User; Citizen / Reporter
- **Priority:** P1
- **Acceptance Criteria:**
  - An authority user can indicate that additional information is required.
  - The request is associated with the case.
  - The reporter can understand what information is requested.

---

## FR-018 — Record Resolution

- **Requirement ID:** FR-018
- **Description:** The authority workflow must allow a case to be marked as resolved and record resolution information.
- **User it serves:** Authority User; Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - An authorized authority user can mark a case as resolved.
  - Resolution information can be recorded.
  - The final status is visible to the reporter.
  - The system does not claim resolution without an actual recorded resolution state.

---

## FR-019 — Resolution Evidence / Verification

- **Requirement ID:** FR-019
- **Description:** The system should support recording or reviewing evidence associated with resolution where appropriate.
- **User it serves:** Authority User; Citizen / Reporter
- **Priority:** P1
- **Acceptance Criteria:**
  - Resolution evidence can be associated with the case where applicable.
  - The system distinguishes evidence from AI-generated interpretation.
  - Verification does not automatically establish facts beyond the available evidence.

---

## FR-020 — Immediate Safety Guidance

- **Requirement ID:** FR-020
- **Description:** For incidents involving immediate danger, the system must prioritize access to appropriate emergency/support guidance rather than forcing the user through the normal reporting workflow first.
- **User it serves:** Victim / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - A user can identify that an incident requires immediate help.
  - Emergency/support guidance is presented before or alongside normal reporting.
  - The user is not required to complete the full digital report before accessing urgent guidance.

---

## FR-021 — Private Handling of Sensitive Cases

- **Requirement ID:** FR-021
- **Description:** Sensitive person-related and safety incidents must be private by default.
- **User it serves:** Victim / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - Sensitive reports are not publicly displayed by default.
  - Sensitive evidence is not publicly exposed by default.
  - The system does not provide a public alleged-offender feed.
  - Access to sensitive case information is restricted to appropriate users.

---

## FR-022 — Case Search / Retrieval

- **Requirement ID:** FR-022
- **Description:** A reporter should be able to retrieve a case using its case/reference ID.
- **User it serves:** Citizen / Reporter
- **Priority:** P1
- **Acceptance Criteria:**
  - A valid case ID can retrieve the corresponding case.
  - An invalid/nonexistent ID produces an appropriate result.
  - Sensitive case information is not exposed merely by guessing an identifier.

---

# Non-Functional Requirements

## NFR-001 — Privacy

- **Requirement ID:** NFR-001
- **Description:** The system must protect the privacy of reporters, victims, and sensitive evidence.
- **User it serves:** Citizen / Reporter; Victim
- **Priority:** P0
- **Acceptance Criteria:**
  - Sensitive cases are private by default.
  - Personal information is not unnecessarily displayed.
  - Sensitive evidence is not publicly accessible by default.
  - The system does not expose alleged offenders publicly.

---

## NFR-002 — Safety

- **Requirement ID:** NFR-002
- **Description:** The system must avoid creating additional risk for users reporting sensitive incidents.
- **User it serves:** Victim / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - Immediate-danger users can access urgent guidance without completing the full workflow.
  - The interface does not encourage public accusations or naming alleged offenders.
  - Sensitive reports are handled privately by default.

---

## NFR-003 — Accuracy and Truthfulness

- **Requirement ID:** NFR-003
- **Description:** The system must distinguish user-provided information, AI-generated interpretation, and verified information.
- **User it serves:** All users
- **Priority:** P0
- **Acceptance Criteria:**
  - AI-generated content is identifiable as AI-assisted.
  - The system does not fabricate missing facts.
  - The system does not present AI output as independent evidence.
  - The system does not claim an official action occurred unless it actually occurred.

---

## NFR-004 — Legal/Regulatory Caution

- **Requirement ID:** NFR-004
- **Description:** Regulatory context must be presented cautiously and must not be represented as definitive legal advice or a determination of liability.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - Regulatory information is labeled as potentially relevant context.
  - The system does not determine guilt or criminal liability.
  - The system does not invent laws or legal provisions.

---

## NFR-005 — Reliability

- **Requirement ID:** NFR-005
- **Description:** The core reporting and case-tracking workflow should remain usable when optional AI functionality is unavailable.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P1
- **Acceptance Criteria:**
  - An AI failure does not falsely produce an AI result.
  - Users receive a clear error/fallback state.
  - Core case information remains accessible.

---

## NFR-006 — Usability

- **Requirement ID:** NFR-006
- **Description:** The reporting workflow should minimize uncertainty and make the next action clear.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - The user can understand the purpose of each major step.
  - The next action is clear.
  - Error and incomplete states provide understandable guidance.
  - The workflow does not require unnecessary information.

---

## NFR-007 — Mobile-Friendly Experience

- **Requirement ID:** NFR-007
- **Description:** The citizen-facing experience should be usable on a mobile device because reporting may occur in real-world situations.
- **User it serves:** Citizen / Reporter; Victim
- **Priority:** P0
- **Acceptance Criteria:**
  - Core reporting actions are usable on a phone-sized screen.
  - Evidence upload is accessible from the mobile workflow.
  - Case status can be viewed without requiring a desktop interface.

---

## NFR-008 — Accessibility

- **Requirement ID:** NFR-008
- **Description:** The user-facing workflow should be accessible and understandable to users with different needs.
- **User it serves:** All users
- **Priority:** P1
- **Acceptance Criteria:**
  - Form controls have understandable labels.
  - Important information is not communicated through color alone.
  - Interactive elements are usable with standard accessibility mechanisms.
  - Text remains readable across supported screen sizes.

---

## NFR-009 — Data Integrity

- **Requirement ID:** NFR-009
- **Description:** Case information, evidence associations, and status updates must remain associated with the correct case.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - Evidence belongs to the correct case.
  - Updates belong to the correct case.
  - Case IDs consistently identify their corresponding case.
  - A case status change does not modify unrelated cases.

---

## NFR-010 — Permission-Aware Access

- **Requirement ID:** NFR-010
- **Description:** Access to case and evidence information must depend on the user's role and the sensitivity of the case.
- **User it serves:** Citizen / Reporter; Authority User
- **Priority:** P0
- **Acceptance Criteria:**
  - Unauthorized users cannot access restricted case information.
  - Sensitive case information is not exposed through public views.
  - Authority-only operations are restricted to authority users.

---

## NFR-011 — Transparent External Submission State

- **Requirement ID:** NFR-011
- **Description:** The system must clearly distinguish between a generated complaint, an official handoff, and a confirmed official submission.
- **User it serves:** Citizen / Reporter
- **Priority:** P0
- **Acceptance Criteria:**
  - Each state is explicitly represented.
  - The system never labels a generated draft as submitted.
  - The system never claims an external authority acknowledged a case without confirmation.

---

# Requirement Priority Summary

| Priority | Meaning | MVP Treatment |
|---|---|---|
| **P0** | Essential to the core problem and safe demo | Must be implemented |
| **P1** | Important supporting capability | Implement if time permits |
| **P2** | Future enhancement / lower priority | Not required for the initial hackathon MVP |

---

# Requirements Not Included

The following are intentionally **NOT REQUIRED at the requirements stage** because they are not sufficiently supported by the problem/user research:

- Offline capability: **NOT REQUIRED**
  - Reason: The problem research identifies mobile usability and network interruptions as an edge case, but does not establish offline operation as a required user need.

- Real-time chat: **NOT REQUIRED**
  - Reason: The problem and user research require case communication/status updates but do not establish real-time messaging as necessary.

- Public social feed: **NOT REQUIRED**
  - Reason: Sensitive cases must be private by default and public accusation is explicitly outside the product boundary.

- Payments: **NOT REQUIRED**
  - Reason: No payment-related user need exists in the problem or user research.

- Native mobile application: **NOT REQUIRED**
  - Reason: The user research establishes the need for a mobile-friendly citizen workflow, not a native mobile application.

- Automated legal decision-making: **NOT REQUIRED**
  - Reason: The product must provide contextual regulatory information without determining guilt or liability.

- Automatic official submission for every authority: **NOT REQUIRED**
  - Reason: Availability of official APIs and submission mechanisms is unknown; the supported requirement is an official handoff or legitimate integration where available.

