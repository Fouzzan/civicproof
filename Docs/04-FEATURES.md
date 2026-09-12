# CivicProof — Feature Specification

> **Sources:** `docs/01-PROBLEM.md`, `docs/02-USER-RESEARCH.md`, and `docs/03-REQUIREMENTS.md`.
>
> Every feature in this document maps to one or more requirements from `03-REQUIREMENTS.md`. No standalone feature is included merely because it sounds useful.
>
> **Priority:** P0 = must have for the hackathon MVP, P1 = important if time permits, P2 = nice to have / future enhancement.

---

# P0 Features

## F-001 — Create Incident

- **Feature Name:** Create Incident
- **Problem it solves:** Citizens need a structured way to turn an incident or civic problem into a case instead of starting with an unstructured complaint.
- **User:** Citizen / Reporter
- **Input:**
  - Incident type/category
  - Description
  - Available date/time
  - Available location
  - Other relevant incident-specific details
- **Processing:**
  - Validate the supplied information.
  - Create a case from the submitted information.
  - Do not require irrelevant information.
- **Output:**
  - Newly created case
  - Case identifier
- **Dependencies:**
  - FR-001
  - FR-002
  - FR-003
  - FR-012
- **Priority:** P0
- **Acceptance criteria:**
  - User can start a new incident.
  - User can provide relevant details.
  - A case is created from the submitted information.
  - Missing information is not fabricated.

---

## F-002 — Incident Type Selection

- **Feature Name:** Incident Type Selection
- **Problem it solves:** Different incidents require different reporting and privacy handling.
- **User:** Citizen / Reporter
- **Input:**
  - Selected incident category/type
- **Processing:**
  - Identify whether the report is a civic, public-service, or sensitive safety/person-related case.
  - Apply the appropriate workflow and privacy behavior.
- **Output:**
  - Categorized incident
  - Appropriate reporting flow
- **Dependencies:**
  - FR-002
- **Priority:** P0
- **Acceptance criteria:**
  - User can identify the general type of incident.
  - Civic and sensitive incidents can be handled within the system.
  - Sensitive incidents are not treated as public complaints by default.

---

## F-003 — Evidence Upload

- **Feature Name:** Evidence Upload
- **Problem it solves:** Citizens may have evidence but need a way to attach it to their case.
- **User:** Citizen / Reporter
- **Input:**
  - Supported evidence files
  - Optional multiple files
- **Processing:**
  - Associate uploaded evidence with the correct case.
  - Preserve the distinction between uploaded evidence and AI interpretation.
- **Output:**
  - Evidence associated with the case
- **Dependencies:**
  - FR-004
  - NFR-009
- **Priority:** P0
- **Acceptance criteria:**
  - User can attach supported evidence.
  - Multiple evidence items can belong to one case.
  - A case can exist without evidence.
  - Uploaded evidence is not automatically treated as authentic or conclusive.

---

## F-004 — AI-Assisted Case Analysis

- **Feature Name:** AI-Assisted Case Analysis
- **Problem it solves:** Unstructured reports can be difficult for citizens to formulate and for authorities to interpret.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - Incident description
  - Structured incident information
  - Available evidence/context
- **Processing:**
  - Analyze supplied information.
  - Structure the incident.
  - Generate a concise summary.
  - Clearly distinguish AI interpretation from user-provided information.
- **Output:**
  - Structured case summary
  - AI-assisted analysis
- **Dependencies:**
  - FR-003
  - FR-006
  - NFR-003
- **Priority:** P0
- **Acceptance criteria:**
  - A structured summary can be generated.
  - AI output is clearly identified as AI-assisted.
  - AI does not invent facts.
  - AI does not determine guilt or criminal liability.

---

## F-005 — Severity Assessment

- **Feature Name:** Severity Suggestion
- **Problem it solves:** Users and authorities need an indication of how urgently a case may require attention.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - Available incident information
  - AI-assisted case analysis
- **Processing:**
  - Assess the supplied information.
  - Produce a severity suggestion.
  - Avoid inventing missing information.
- **Output:**
  - Severity suggestion/level
- **Dependencies:**
  - FR-007
  - FR-006
  - NFR-003
- **Priority:** P0
- **Acceptance criteria:**
  - A severity level can be displayed.
  - It is presented as a suggestion/assessment.
  - Missing information is not fabricated.

---

## F-006 — Reporting Direction Recommendation

- **Feature Name:** Reporting Direction Recommendation
- **Problem it solves:** Citizens may not know which authority or reporting channel is appropriate.
- **User:** Citizen / Reporter
- **Input:**
  - Incident category
  - Location/jurisdiction where available
  - Incident details
- **Processing:**
  - Determine a potential reporting direction based on known information.
  - Identify uncertainty where authority responsibility is not established.
  - Provide an official reporting channel when available.
- **Output:**
  - Recommended authority/reporting direction
  - Reporting channel or next step
- **Dependencies:**
  - FR-009
  - FR-002
  - FR-003
- **Priority:** P0
- **Acceptance criteria:**
  - A reporting direction is provided when enough information exists.
  - Category and jurisdiction can influence the recommendation where known.
  - Uncertainty is explicitly acknowledged.
  - An official channel can be presented where available.

---

## F-007 — Formal Complaint Generator

- **Feature Name:** Formal Complaint Generator
- **Problem it solves:** Citizens may struggle to convert an experience into a clear formal complaint.
- **User:** Citizen / Reporter
- **Input:**
  - Case information
  - Incident description
  - Structured analysis
  - Relevant contextual information
- **Processing:**
  - Convert supplied information into a clear complaint draft.
  - Preserve the distinction between facts supplied by the user and generated wording.
  - Do not add unsupported claims.
- **Output:**
  - Reviewable formal complaint draft
- **Dependencies:**
  - FR-003
  - FR-006
  - FR-010
  - NFR-003
  - NFR-004
- **Priority:** P0
- **Acceptance criteria:**
  - Complaint draft can be generated.
  - Draft reflects supplied information.
  - No facts, evidence, or events are fabricated.
  - Reporter can review the draft before using it.

---

## F-008 — Official Reporting Handoff

- **Feature Name:** Official Reporting / Handoff
- **Problem it solves:** A citizen needs a legitimate path from the generated complaint to the responsible official reporting channel.
- **User:** Citizen / Reporter
- **Input:**
  - Final/reviewed complaint
  - Recommended authority/channel
- **Processing:**
  - Provide an actual official integration if one exists and is legitimately supported.
  - Otherwise provide a clear handoff to the official channel.
  - Track the state honestly.
- **Output:**
  - Official-channel handoff or confirmed submission state
- **Dependencies:**
  - FR-009
  - FR-010
  - FR-011
  - NFR-011
- **Priority:** P0
- **Acceptance criteria:**
  - Generated and submitted states are distinct.
  - User receives an official-channel handoff where no integration exists.
  - The system never claims submission without actual confirmation.

---

## F-009 — Case ID

- **Feature Name:** Case ID
- **Problem it solves:** Citizens and authorities need a reference that identifies a specific case.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - Newly created case
- **Processing:**
  - Generate a unique case/reference identifier.
  - Associate it with the case.
- **Output:**
  - Unique case ID
- **Dependencies:**
  - FR-012
  - NFR-009
- **Priority:** P0
- **Acceptance criteria:**
  - Every newly created case receives an identifier.
  - The identifier is shown to the reporter.
  - The identifier consistently refers to the corresponding case.

---

## F-010 — Case Status and Timeline

- **Feature Name:** Case Status & Timeline
- **Problem it solves:** Citizens may not know whether a complaint was received, what is happening, or whether it has progressed.
- **User:** Citizen / Reporter
- **Input:**
  - Case ID
  - Recorded case events/status updates
- **Processing:**
  - Build a chronological view of case progress.
  - Display only actual recorded states/events.
- **Output:**
  - Current case status
  - Chronological case timeline
- **Dependencies:**
  - FR-013
  - FR-012
  - NFR-003
  - NFR-009
- **Priority:** P0
- **Acceptance criteria:**
  - Reporter can view the case status.
  - Timeline displays chronological progress.
  - Status changes are clear.
  - The system does not imply progress that did not occur.

---

## F-011 — Authority Case Review

- **Feature Name:** Authority Case Review
- **Problem it solves:** Authorities need understandable, organized case information and access to associated evidence.
- **User:** Authority User
- **Input:**
  - Case
  - Incident details
  - Associated evidence
  - AI-assisted summary where available
- **Processing:**
  - Present case information in an organized view.
  - Allow access to evidence according to permissions.
- **Output:**
  - Authority case detail view
- **Dependencies:**
  - FR-014
  - FR-005
  - NFR-010
- **Priority:** P0
- **Acceptance criteria:**
  - Authority user can view relevant cases.
  - Case information is understandable and structured.
  - Associated evidence can be accessed according to permissions.

---

## F-012 — Authority Status Update

- **Feature Name:** Authority Status Updates
- **Problem it solves:** Citizens need visibility into what happens after a case reaches an authority.
- **User:** Authority User; Citizen / Reporter
- **Input:**
  - Case
  - New status
  - Progress message
- **Processing:**
  - Validate authority permissions.
  - Update the case status.
  - Add the update to the case timeline.
- **Output:**
  - Updated case status
  - New timeline event
- **Dependencies:**
  - FR-016
  - FR-013
  - NFR-009
  - NFR-010
- **Priority:** P0
- **Acceptance criteria:**
  - Authorized authority user can change status.
  - Progress information can be added.
  - Update appears in the timeline.
  - Unauthorized users cannot perform authority-only operations.

---

## F-013 — Record Resolution

- **Feature Name:** Record Resolution
- **Problem it solves:** The case needs a clear end state so the reporter can know whether it was resolved.
- **User:** Authority User; Citizen / Reporter
- **Input:**
  - Case
  - Resolution information
- **Processing:**
  - Validate authority permissions.
  - Record the resolution.
  - Change the case to a resolved state.
  - Add the resolution to the case timeline.
- **Output:**
  - Resolved case
  - Resolution information visible to the reporter
- **Dependencies:**
  - FR-018
  - FR-016
  - FR-013
  - NFR-003
- **Priority:** P0
- **Acceptance criteria:**
  - Authorized authority user can mark a case resolved.
  - Resolution information can be recorded.
  - Reporter can see the final status.
  - The system does not claim resolution without a recorded resolution state.

---

## F-014 — Immediate Safety Guidance

- **Feature Name:** Immediate Safety Guidance
- **Problem it solves:** A person facing immediate danger may need urgent help before completing a normal complaint workflow.
- **User:** Victim / Reporter
- **Input:**
  - User indication that immediate help is required
  - Incident context where available
- **Processing:**
  - Prioritize emergency/support guidance.
  - Keep urgent guidance accessible without requiring full report completion.
- **Output:**
  - Appropriate emergency/support guidance
  - Option to continue with reporting
- **Dependencies:**
  - FR-020
  - NFR-002
- **Priority:** P0
- **Acceptance criteria:**
  - User can indicate immediate danger.
  - Urgent guidance appears before or alongside normal reporting.
  - User does not need to complete the full report to access urgent guidance.

---

## F-015 — Private Sensitive Case Handling

- **Feature Name:** Private Sensitive Case Handling
- **Problem it solves:** Harassment and other person-related incidents may contain sensitive information and evidence that should not become public.
- **User:** Victim / Reporter
- **Input:**
  - Sensitive incident
  - Personal information
  - Sensitive evidence
- **Processing:**
  - Mark sensitive cases as private by default.
  - Restrict access according to permissions.
  - Prevent public alleged-offender exposure.
- **Output:**
  - Private case and restricted evidence
- **Dependencies:**
  - FR-021
  - NFR-001
  - NFR-002
  - NFR-010
- **Priority:** P0
- **Acceptance criteria:**
  - Sensitive reports are not publicly displayed by default.
  - Sensitive evidence is not publicly exposed by default.
  - No public alleged-offender feed exists.
  - Restricted case information is accessible only to appropriate users.

---

# P1 Features

## F-016 — Organized Case Evidence View

- **Feature Name:** Organized Case Evidence
- **Problem it solves:** Evidence and case information can otherwise be fragmented or difficult to understand.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - Case evidence
  - Case information
- **Processing:**
  - Group evidence under the relevant case.
  - Present evidence in context.
- **Output:**
  - Organized evidence section in the case view
- **Dependencies:**
  - FR-005
  - FR-004
  - NFR-009
- **Priority:** P1
- **Acceptance criteria:**
  - Evidence is visibly associated with its case.
  - Authority case view can access associated evidence.
  - Evidence is not presented as automatically authentic or conclusive.

---

## F-017 — Potentially Relevant Regulatory Context

- **Feature Name:** Potentially Relevant Regulatory Context
- **Problem it solves:** Reporters may need contextual information about potentially relevant rules or regulations.
- **User:** Citizen / Reporter
- **Input:**
  - Incident details
  - Incident category
  - Jurisdiction where known
- **Processing:**
  - Identify potentially relevant regulatory context.
  - Present it as contextual information rather than a legal conclusion.
- **Output:**
  - Potentially relevant regulatory information
  - Appropriate disclaimer/context
- **Dependencies:**
  - FR-008
  - NFR-004
  - NFR-003
- **Priority:** P1
- **Acceptance criteria:**
  - Relevant context can be displayed when available.
  - It is not presented as definitive legal advice.
  - Laws/provisions are not invented.
  - The result does not determine guilt or liability.

---

## F-018 — Authority Case Assignment

- **Feature Name:** Authority Case Assignment
- **Problem it solves:** Authority workflows may require cases to be assigned to the appropriate person/team.
- **User:** Authority User
- **Input:**
  - Case
  - Assignment target
- **Processing:**
  - Validate authority permissions.
  - Assign the case.
  - Record the assignment in the case state.
- **Output:**
  - Assigned case
- **Dependencies:**
  - FR-015
  - NFR-010
- **Priority:** P1
- **Acceptance criteria:**
  - Authorized authority user can assign a case.
  - Assignment is visible in the case state.
  - Unauthorized users cannot perform the assignment.

---

## F-019 — Request Additional Information

- **Feature Name:** Request Additional Information
- **Problem it solves:** Authorities may need missing information before they can process a case.
- **User:** Authority User; Citizen / Reporter
- **Input:**
  - Case
  - Information request/message
- **Processing:**
  - Associate the request with the case.
  - Make the requested information understandable to the reporter.
- **Output:**
  - Additional-information request attached to the case
- **Dependencies:**
  - FR-017
  - FR-016
- **Priority:** P1
- **Acceptance criteria:**
  - Authority user can indicate that additional information is required.
  - Request is associated with the correct case.
  - Reporter can understand what information is requested.

---

## F-020 — Resolution Evidence / Verification

- **Feature Name:** Resolution Evidence & Verification
- **Problem it solves:** A resolution may need supporting evidence or a way to assess whether the reported problem appears to have been addressed.
- **User:** Authority User; Citizen / Reporter
- **Input:**
  - Resolution evidence
  - Case information
- **Processing:**
  - Associate resolution evidence with the case.
  - Distinguish evidence from AI interpretation.
  - Support verification without treating AI interpretation as conclusive fact.
- **Output:**
  - Resolution evidence
  - Verification state/information
- **Dependencies:**
  - FR-019
  - FR-018
  - NFR-003
- **Priority:** P1
- **Acceptance criteria:**
  - Resolution evidence can be associated with the case.
  - Evidence is distinguished from AI-generated interpretation.
  - Verification does not establish facts beyond available evidence.

---

## F-021 — Case Search by ID

- **Feature Name:** Case Search / Retrieval
- **Problem it solves:** Reporters need to retrieve a case using its reference ID.
- **User:** Citizen / Reporter
- **Input:**
  - Case ID
- **Processing:**
  - Find the corresponding case.
  - Apply access controls before showing information.
- **Output:**
  - Matching case or appropriate not-found result
- **Dependencies:**
  - FR-022
  - FR-012
  - NFR-010
- **Priority:** P1
- **Acceptance criteria:**
  - Valid case ID retrieves the corresponding case.
  - Invalid IDs produce an appropriate result.
  - Guessing a case ID does not expose sensitive information without authorization.

---

# Cross-Cutting Non-Functional Features

## F-022 — AI Failure Fallback

- **Feature Name:** AI Failure / Fallback Handling
- **Problem it solves:** The core reporting process should not falsely imply that AI analysis succeeded when the AI service is unavailable.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - AI request
  - AI service response/error
- **Processing:**
  - Detect AI failure.
  - Clearly communicate the failure.
  - Preserve available case information.
  - Allow the core workflow to remain usable where possible.
- **Output:**
  - Clear error/fallback state
  - Existing case information remains accessible
- **Dependencies:**
  - NFR-005
  - FR-006
- **Priority:** P1
- **Acceptance criteria:**
  - AI failure does not produce a false AI result.
  - User receives a clear fallback/error state.
  - Core case information remains accessible.

---

## F-023 — Privacy-Aware Access Control

- **Feature Name:** Permission-Aware Case Access
- **Problem it solves:** Sensitive case information must only be accessible to appropriate users.
- **User:** Citizen / Reporter; Authority User
- **Input:**
  - User role
  - Case sensitivity
  - Requested case/evidence
- **Processing:**
  - Determine whether the user is authorized to access the requested information.
  - Restrict sensitive cases and authority-only operations.
- **Output:**
  - Authorized information/action or access denial
- **Dependencies:**
  - NFR-010
  - NFR-001
  - FR-021
- **Priority:** P0
- **Acceptance criteria:**
  - Unauthorized users cannot access restricted case information.
  - Sensitive information is not exposed through public views.
  - Authority-only operations are restricted.

---

## F-024 — Honest Case State Representation

- **Feature Name:** Transparent Case State
- **Problem it solves:** Citizens need to know whether a complaint was generated, handed off, officially submitted, acknowledged, or resolved without being misled.
- **User:** Citizen / Reporter
- **Input:**
  - Complaint state
  - Handoff/submission confirmation
  - Case updates
- **Processing:**
  - Represent each state explicitly.
  - Only advance to confirmed states when there is evidence/confirmation of that state.
- **Output:**
  - Accurate case/submission status
- **Dependencies:**
  - NFR-011
  - FR-011
  - FR-013
  - FR-018
- **Priority:** P0
- **Acceptance criteria:**
  - Generated, handed-off, and confirmed-submission states are distinguishable.
  - A generated complaint is never labeled as officially submitted.
  - External acknowledgment is never claimed without confirmation.

---

## F-025 — Mobile-Friendly Reporting Experience

- **Feature Name:** Mobile-Friendly Citizen Workflow
- **Problem it solves:** Reporting may happen in real-world situations where the citizen is using a phone.
- **User:** Citizen / Reporter; Victim
- **Input:**
  - Touch/mobile interaction
  - Incident details
  - Evidence
- **Processing:**
  - Present the core reporting workflow in a mobile-usable layout.
  - Keep evidence upload and case tracking accessible on mobile.
- **Output:**
  - Mobile-usable reporting and tracking experience
- **Dependencies:**
  - NFR-007
  - FR-001
  - FR-004
  - FR-013
- **Priority:** P0
- **Acceptance criteria:**
  - Core reporting actions work on phone-sized screens.
  - Evidence upload is accessible on mobile.
  - Case status can be viewed without a desktop interface.

---

## F-026 — Accessible Interface

- **Feature Name:** Accessibility Support
- **Problem it solves:** Users with different accessibility needs should be able to understand and use the reporting workflow.
- **User:** All users
- **Input:**
  - User interaction
- **Processing:**
  - Use understandable labels.
  - Avoid conveying important information through color alone.
  - Keep interactive elements accessible.
- **Output:**
  - More accessible interface
- **Dependencies:**
  - NFR-008
- **Priority:** P1
- **Acceptance criteria:**
  - Form controls have understandable labels.
  - Important information is not communicated through color alone.
  - Interactive elements support standard accessibility mechanisms.
  - Text remains readable on supported screen sizes.

---

# Features Explicitly Excluded

The following ideas are interesting, but they are **not included as features** because the requirements document does not provide a sufficiently direct requirement for them.

## X-001 — Duplicate / Related Incident Clustering

**Status:** EXCLUDED

**Why:** User research mentions duplicate and related reports as edge cases, but `03-REQUIREMENTS.md` does not contain a requirement requiring duplicate detection or incident clustering. Adding it would violate the rule that every feature must map to a requirement.

**Possible future requirement:** If future research establishes that duplicate/related-case detection is important, add a requirement first and then define the feature.

---

## X-002 — Automatic Escalation

**Status:** EXCLUDED

**Why:** User research identifies uncertainty about escalation as a pain point, but the current requirements do not define an automated escalation capability or acceptance criteria.

**Possible future requirement:** Define when escalation should occur, who receives it, and whether it is advisory or automatic before making this a feature.

---

## X-003 — Notifications

**Status:** EXCLUDED

**Why:** Notifications were mentioned in earlier product discussions, but the current requirements do not contain a notification requirement. Case status visibility is required; a separate notification mechanism is not.

---

## X-004 — Public Incident Map

**Status:** EXCLUDED

**Why:** A public map is not required by the current problem, user research, or requirements. Public exposure is particularly inappropriate for sensitive person-related cases.

---

## X-005 — Before/After AI Image Comparison

**Status:** EXCLUDED

**Why:** Resolution verification is required, but the requirements do not specifically require AI image comparison. A narrower resolution-evidence workflow is sufficient.

---

## X-006 — Native Mobile App

**Status:** EXCLUDED

**Why:** The requirement is a mobile-friendly experience, not a native mobile application. The platform choice belongs to the later technology/design stage.

---

## X-007 — Real-Time Chat

**Status:** EXCLUDED

**Why:** The requirements support case updates and requests for additional information, but do not establish real-time chat as necessary.

---

## X-008 — Public Alleged-Offender Feed / Name-and-Shame System

**Status:** EXCLUDED

**Why:** This conflicts directly with the privacy and safety requirements. Sensitive person-related reports must remain private by default, and the product must not publicly identify or shame alleged offenders.

---

## X-009 — Automatic Legal Decision-Making

**Status:** EXCLUDED

**Why:** The requirements explicitly limit legal functionality to potentially relevant regulatory context. The system must not determine guilt, criminal liability, or provide definitive legal conclusions.

---

# Feature-to-Requirement Traceability

| Feature | Requirement IDs | Priority |
|---|---|---|
| F-001 Create Incident | FR-001, FR-002, FR-003, FR-012 | P0 |
| F-002 Incident Type Selection | FR-002 | P0 |
| F-003 Evidence Upload | FR-004, NFR-009 | P0 |
| F-004 AI-Assisted Case Analysis | FR-006, NFR-003 | P0 |
| F-005 Severity Suggestion | FR-007, NFR-003 | P0 |
| F-006 Reporting Direction Recommendation | FR-009 | P0 |
| F-007 Formal Complaint Generator | FR-010, NFR-003, NFR-004 | P0 |
| F-008 Official Reporting / Handoff | FR-011, NFR-011 | P0 |
| F-009 Case ID | FR-012, NFR-009 | P0 |
| F-010 Case Status & Timeline | FR-013, NFR-003, NFR-009 | P0 |
| F-011 Authority Case Review | FR-014, FR-005, NFR-010 | P0 |
| F-012 Authority Status Updates | FR-016, FR-013, NFR-010 | P0 |
| F-013 Record Resolution | FR-018, NFR-003 | P0 |
| F-014 Immediate Safety Guidance | FR-020, NFR-002 | P0 |
| F-015 Private Sensitive Case Handling | FR-021, NFR-001, NFR-002, NFR-010 | P0 |
| F-016 Organized Case Evidence | FR-005 | P1 |
| F-017 Regulatory Context | FR-008, NFR-004 | P1 |
| F-018 Authority Case Assignment | FR-015, NFR-010 | P1 |
| F-019 Request Additional Information | FR-017 | P1 |
| F-020 Resolution Evidence & Verification | FR-019, NFR-003 | P1 |
| F-021 Case Search / Retrieval | FR-022, NFR-010 | P1 |
| F-022 AI Failure / Fallback | NFR-005 | P1 |
| F-023 Permission-Aware Case Access | NFR-010, NFR-001 | P0 |
| F-024 Transparent Case State | NFR-011, FR-011, FR-013 | P0 |
| F-025 Mobile-Friendly Citizen Workflow | NFR-007 | P0 |
| F-026 Accessibility Support | NFR-008 | P1 |

---

# Hackathon MVP Feature Set

For a ~4-hour build, the recommended **P0 demo path** is:

```text
F-001 Create Incident
        ↓
F-002 Incident Type Selection
        ↓
F-003 Evidence Upload
        ↓
F-004 AI-Assisted Case Analysis
        ↓
F-005 Severity Suggestion
        ↓
F-006 Reporting Direction Recommendation
        ↓
F-007 Formal Complaint Generator
        ↓
F-008 Official Reporting / Handoff
        ↓
F-009 Case ID
        ↓
F-010 Case Status & Timeline
        ↓
F-011 Authority Case Review
        ↓
F-012 Authority Status Updates
        ↓
F-013 Record Resolution
```

For the **sensitive harassment/safety demo path**, the critical additional features are:

```text
F-014 Immediate Safety Guidance
        ↓
F-015 Private Sensitive Case Handling
        ↓
F-023 Permission-Aware Case Access
        ↓
F-024 Transparent Case State
```

P1 features should only be implemented after the P0 path is working reliably.

