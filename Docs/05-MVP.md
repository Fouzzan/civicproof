# CivicProof — MVP Specification

## MVP Objective

> **Prove that CivicProof can turn a citizen's real-world incident into a structured, evidence-backed, AI-assisted, actionable, and trackable case that reaches the appropriate reporting direction without falsely claiming official action.**

The MVP is intentionally narrow: **one complete end-to-end case journey is more valuable than many partially working features.**

---

# 1. MVP Scope

## P0 Features Included

The following P0 features are required for the MVP:

| Feature | Why it is in the MVP |
|---|---|
| **F-001 — Create Incident** | Core entry point for turning a real-world problem into a case |
| **F-002 — Incident Type Selection** | Allows the workflow to distinguish civic and sensitive incidents |
| **F-003 — Evidence Upload** | Demonstrates evidence-backed reporting |
| **F-004 — AI-Assisted Case Analysis** | Demonstrates the main AI value proposition |
| **F-005 — Severity Suggestion** | Shows how the system helps prioritize a case |
| **F-006 — Reporting Direction Recommendation** | Solves the "where do I report this?" problem |
| **F-007 — Formal Complaint Generator** | Solves the difficulty of writing a clear complaint |
| **F-008 — Official Reporting / Handoff** | Creates a legitimate path toward the responsible authority |
| **F-009 — Case ID** | Gives the citizen a persistent reference |
| **F-010 — Case Status & Timeline** | Demonstrates accountability after reporting |
| **F-011 — Authority Case Review** | Demonstrates the receiving side of the product |
| **F-012 — Authority Status Updates** | Demonstrates progress tracking |
| **F-013 — Record Resolution** | Completes the end-to-end journey |
| **F-014 — Immediate Safety Guidance** | Required for the sensitive harassment/safety scenario |
| **F-015 — Private Sensitive Case Handling** | Required to safely demonstrate person-related complaints |
| **F-023 — Permission-Aware Case Access** | Required to prevent inappropriate access to sensitive cases |
| **F-024 — Transparent Case State** | Prevents the prototype from falsely claiming official submission or resolution |
| **F-025 — Mobile-Friendly Citizen Workflow** | Required for the citizen-facing real-world reporting experience |

---

# 2. Primary MVP User Flow

The MVP should demonstrate **one complete journey** from incident to resolution.

## Citizen Flow

```text
1. Open CivicProof
       ↓
2. Choose "Report an Incident"
       ↓
3. Select incident type
       ↓
4. Enter what happened
       ↓
5. Add relevant date/time/location
       ↓
6. Upload evidence (optional)
       ↓
7. Submit for AI-assisted analysis
       ↓
8. Review:
      - Incident summary
      - Severity suggestion
      - Potentially relevant context
      - Recommended reporting direction
       ↓
9. Generate formal complaint
       ↓
10. Review/edit complaint
       ↓
11. Continue to official reporting channel / handoff
       ↓
12. CivicProof creates a case reference
       ↓
13. Citizen sees case status + timeline
```

## Authority Flow

```text
14. Authority opens assigned case
       ↓
15. Reviews:
      - Incident details
      - Evidence
      - AI-assisted summary
      - Severity
       ↓
16. Updates case status
       ↓
17. Adds progress information
       ↓
18. Marks case resolved
       ↓
19. Adds resolution information
       ↓
20. Citizen sees updated timeline + resolved status
```

---

# 3. Required Inputs

## Citizen Inputs

### Minimum

- Incident category/type
- Description of what happened

### When relevant/available

- Date/time
- Location
- Incident-specific details
- Evidence files

### Sensitive incident

For harassment/safety reports, the user may provide:

- Description of the incident
- Available date/time
- Relevant location
- Relevant contextual details
- Available evidence

The workflow must not require unnecessary sensitive information.

---

# 4. Expected Outputs

After the citizen submits the incident, the MVP should produce:

### Case Understanding

- Structured incident summary
- AI-assisted analysis
- Severity suggestion

### Action Guidance

- Recommended reporting direction
- Appropriate next step
- Official reporting/handoff information where available

### Complaint

- Clear formal complaint draft
- Reviewable before use

### Case

- Unique case ID
- Current status
- Chronological timeline

### Authority View

- Structured case details
- Associated evidence
- AI-assisted summary
- Severity
- Case status
- Progress updates
- Resolution state

---

# 5. Sensitive Incident Behavior

The MVP must support the harassment/safety scenario without turning it into a public accusation system.

## Required behavior

```text
Sensitive incident detected
        ↓
Private case workflow
        ↓
Immediate safety option available
        ↓
Evidence remains private
        ↓
No public alleged-offender identification
        ↓
Appropriate reporting direction
        ↓
Private case tracking
```

## Immediate danger

If the user indicates immediate danger:

- Show urgent emergency/support guidance immediately.
- Do not force the user to complete the entire report first.
- Allow the user to continue reporting afterward if appropriate.

The MVP must **not** position CivicProof as a replacement for emergency services, police, courts, or other responsible authorities.

---

# 6. Evidence Behavior

Evidence is important to proving the core idea, but the MVP should keep evidence handling simple.

## MVP evidence workflow

```text
Select evidence
      ↓
Attach to case
      ↓
Display evidence in case
      ↓
Authority can access according to permissions
```

The MVP should not claim that uploaded evidence is automatically authentic, legally admissible, or conclusive.

If no evidence is available:

```text
No evidence
    ↓
Continue using the incident description
```

---

# 7. AI Behavior

AI is a major demonstration component, but it must remain an assistant rather than an authority.

## AI should do

- Structure the user's description.
- Summarize the incident.
- Suggest severity.
- Help identify a reporting direction based on known information.
- Generate a complaint draft.

## AI should NOT do

- Decide guilt.
- Determine criminal liability.
- Invent facts.
- Invent evidence.
- Invent laws.
- Invent an authority.
- Claim an official complaint was submitted.
- Claim an authority acknowledged or resolved a case when that did not happen.

AI-generated information must be distinguishable from verified/user-provided information.

---

# 8. Official Reporting Behavior

The MVP does **not** need to integrate with every government or authority system.

The essential requirement is a truthful path toward the official channel.

## MVP states

```text
Complaint Draft
      ↓
Ready for Official Handoff
      ↓
Official Channel / Handoff
      ↓
[Confirmed Submission only if genuinely confirmed]
```

The demo must never simulate a real government submission while presenting it as genuine.

If the MVP uses a simulated authority workflow for demonstration, it must be clear that it is a **prototype/demo workflow**.

---

# 9. Case Tracking

The citizen must be able to see:

```text
Case ID
   ↓
Current Status
   ↓
Timeline
   ├── Report created
   ├── Analysis completed
   ├── Complaint prepared
   ├── Handoff/submission state
   ├── Authority review
   ├── Progress update
   └── Resolution
```

Only states that actually occurred in the prototype should be displayed as completed.

---

# 10. What Will NOT Be Built for the MVP

The following are explicitly outside the MVP.

## NOT REQUIRED — Advanced Evidence Management

**Reason:** The MVP only needs to demonstrate attaching and reviewing evidence. Advanced evidence verification is not necessary to prove the core concept.

- Cryptographic evidence-chain system
- Forensic authenticity verification
- Automatic deepfake detection
- Advanced image/video analysis
- Legal admissibility assessment

---

## NOT REQUIRED — Full Government Integration

**Reason:** Official API availability is unknown, and building multiple integrations would consume the limited hackathon time.

- Direct integration with every government portal
- Automatic submission to every authority
- Automatic synchronization with government case systems

---

## NOT REQUIRED — Complete Legal Knowledge System

**Reason:** Regulatory context is useful, but a comprehensive legal database is not required to demonstrate the core workflow.

- Complete national/state legal corpus
- Automated legal reasoning
- Legal decision-making
- Definitive legal advice

---

## NOT REQUIRED — Advanced Authority Operations

**Reason:** The MVP needs only enough authority functionality to demonstrate the receiving and resolution side.

- Complex organizational hierarchy
- Advanced officer management
- Complex workload optimization
- Advanced analytics
- Department-wide reporting systems

---

## NOT REQUIRED — Social/Public Features

**Reason:** Public exposure conflicts with the privacy and safety requirements for sensitive cases.

- Public incident feed
- Public alleged-offender profiles
- Public naming/shaming
- Social reactions/comments
- Public case discussions

---

## NOT REQUIRED — Advanced Communication

**Reason:** Case status and updates are sufficient to demonstrate accountability.

- Real-time chat
- Video calls
- Voice calls inside the platform
- Complex messaging system

---

## NOT REQUIRED — Advanced Automation

**Reason:** These are useful future capabilities but are not necessary to prove the core idea.

- Automatic escalation engine
- Automatic duplicate-case clustering
- Predictive incident detection
- Automatic authority reassignment

---

## NOT REQUIRED — Native Mobile Application

**Reason:** The MVP only needs a mobile-friendly citizen experience. A separate native application would add unnecessary development overhead.

---

## NOT REQUIRED — Offline Mode

**Reason:** Offline capability is an edge case rather than an established core requirement.

---

# 11. Demo Scenario

## Recommended Scenario: Harassment on Public Transport

This scenario demonstrates more of CivicProof's value than a simple pothole report because it exercises:

- Sensitive reporting
- Privacy
- Immediate safety guidance
- Evidence
- AI structuring
- Severity
- Reporting direction
- Complaint generation
- Case tracking
- Authority workflow

### Demo Story

> A woman experiences harassment while travelling on a public bus. She wants to report what happened but is unsure what information is important, where she should report it, and how to formulate the complaint. She also does not want the incident or sensitive evidence publicly exposed.

### Demo Flow

```text
1. User opens CivicProof
             ↓
2. Selects "Safety / Harassment"
             ↓
3. Privacy notice appears
             ↓
4. User describes the incident
             ↓
5. Adds:
      - Approximate location
      - Date/time
      - Bus/route information if available
             ↓
6. Uploads available evidence
             ↓
7. CivicProof analyzes the report
             ↓
8. Shows:
      ✓ Structured summary
      ✓ Severity suggestion
      ✓ Potentially relevant context
      ✓ Recommended reporting direction
             ↓
9. Generates formal complaint
             ↓
10. User reviews complaint
             ↓
11. CivicProof provides official reporting handoff
             ↓
12. Case ID generated
             ↓
13. Citizen opens case timeline
             ↓
14. Switch to Authority view
             ↓
15. Authority reviews the case
             ↓
16. Authority updates status:
      "Under Review"
             ↓
17. Authority records resolution
             ↓
18. Citizen sees:
      "Resolved"
      + resolution information
```

### The "Aha!" Moment

The strongest demo moment should be:

> **A messy, emotional, unstructured description becomes a clear case, complaint, recommended next step, and trackable timeline in seconds.**

That demonstrates the product's central value without requiring unrealistic automation.

---

# 12. Alternative Demo Scenario

If the hackathon judges prefer a non-sensitive civic example, use:

### Blocked Drain / Waterlogging

```text
Citizen sees severe waterlogging
        ↓
Creates civic incident
        ↓
Adds photo
        ↓
AI structures report
        ↓
Severity suggestion
        ↓
Recommended reporting direction
        ↓
Complaint generated
        ↓
Official handoff
        ↓
Case ID
        ↓
Authority review
        ↓
Status update
        ↓
Resolution evidence
        ↓
Resolved
```

This is safer to demonstrate publicly and still proves the core incident-to-resolution workflow.

---

# 13. MVP Success Criteria

The MVP is successful if all of the following work in a single end-to-end demonstration.

## Core Citizen Journey

- [ ] Citizen can create an incident.
- [ ] Citizen can select an incident category.
- [ ] Citizen can provide incident details.
- [ ] Citizen can optionally attach evidence.
- [ ] AI produces a structured summary.
- [ ] AI produces a severity suggestion.
- [ ] System provides a reporting direction.
- [ ] System generates a complaint draft.
- [ ] Citizen can review the complaint.
- [ ] System provides a truthful official handoff.
- [ ] Case receives a unique ID.
- [ ] Citizen can see case status and timeline.

## Authority Journey

- [ ] Authority can open the case.
- [ ] Authority can understand the structured case.
- [ ] Authority can access permitted evidence.
- [ ] Authority can update status.
- [ ] Authority can add progress information.
- [ ] Authority can mark the case resolved.
- [ ] Citizen can see the updated status.

## Safety / Privacy

- [ ] Sensitive cases are private by default.
- [ ] Sensitive evidence is not publicly exposed.
- [ ] No alleged offender is publicly identified or shamed.
- [ ] Immediate-danger guidance is available without completing the full report.
- [ ] AI does not determine guilt or liability.

## Truthfulness

- [ ] AI output is distinguishable from user-provided/verified information.
- [ ] Missing information is not fabricated.
- [ ] The prototype does not claim a real official submission unless one actually occurred.
- [ ] The prototype does not claim a real authority action unless it actually occurred within the demonstrated workflow.

---

# 14. MVP Definition of Done

The MVP is **done** when a judge can watch this without developer intervention:

```text
REAL-WORLD INCIDENT
       ↓
CREATE REPORT
       ↓
ADD EVIDENCE
       ↓
AI STRUCTURES IT
       ↓
SEVERITY + NEXT STEP
       ↓
COMPLAINT GENERATED
       ↓
OFFICIAL HANDOFF
       ↓
CASE ID
       ↓
TRACK CASE
       ↓
AUTHORITY REVIEWS
       ↓
STATUS UPDATE
       ↓
RESOLUTION
       ↓
CITIZEN SEES RESULT
```

If this complete loop works reliably, **the MVP is successful even if every P1 feature is absent**.

