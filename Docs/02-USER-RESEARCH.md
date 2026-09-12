# CivicProof — User Research

> **Source:** `docs/01-PROBLEM.md`
>
> This document is based only on the problem analysis already established. Any item that is not directly established is marked as an **assumption**.

---

## 1. Primary Users

### 1.1 Citizens / Reporters

People who experience or observe a civic, public-service, or safety-related incident and need to report it.

Examples within the defined problem scope:
- Citizens reporting civic infrastructure problems.
- Citizens reporting public-service problems.
- People reporting harassment or safety incidents in public spaces or public transport.
- Witnesses reporting incidents they observed.

### 1.2 Victims of Sensitive Incidents

A subset of reporters who are directly affected by incidents such as harassment, stalking, assault, threats, or similar safety problems.

**Important:** These users may have heightened privacy and safety requirements.

### 1.3 Authority / Complaint-Handling Users

Officials or staff responsible for receiving, reviewing, assigning, investigating, updating, and resolving cases.

---

## 2. Secondary Users

Potential secondary users include:

- Staff responsible for complaint administration.
- Personnel responsible for public transport or public-facing services.
- Government departments handling relevant civic complaints.
- Utility/service providers.
- Educational institutions where an institutional complaint is relevant.
- Support personnel assisting with complaint processing.

> **Assumption:** The exact secondary-user roles will depend on the incident category and the authority responsible for it.

---

## 3. Stakeholders

- Citizens and reporters
- Victims of safety incidents
- Local government authorities
- Police and relevant safety authorities
- Public transport authorities/operators
- Government departments
- Utility/service providers
- Educational institutions where relevant
- Complaint/grievance-handling staff
- Community/public-service organizations

> The responsible stakeholder varies by incident type and jurisdiction.

---

# 4. User Goals

## 4.1 Citizen / Reporter Goals

- Report what happened.
- Provide relevant details about the incident.
- Attach available evidence.
- Understand what information is important.
- Identify the appropriate authority or reporting direction.
- Create a clear formal complaint.
- Obtain a case/reference ID.
- Know whether the complaint has been received or handed off.
- Track the status of the case.
- Know what to do next if there is no response.
- Determine whether the reported problem has been resolved.

---

## 4.2 Victim Goals

In addition to the general reporter goals:

- Report the incident without unnecessary exposure.
- Keep sensitive information and evidence private.
- Understand available next steps.
- Access appropriate safety/emergency guidance when necessary.
- Avoid publicly identifying or accusing the alleged offender.
- Maintain visibility into the case without compromising personal safety.

> **Assumption:** Victims may prioritize privacy and safety over convenience, particularly for harassment and other sensitive incidents.

---

## 4.3 Authority User Goals

- Receive understandable case information.
- Review evidence associated with a case.
- Understand the incident quickly.
- Identify cases requiring attention.
- Assign cases to the appropriate person/team.
- Update case status.
- Add progress information.
- Request additional information where needed.
- Record resolution information.
- Provide evidence of resolution where appropriate.
- Manage cases efficiently.

---

# 5. User Frustrations

## 5.1 Citizen / Reporter Frustrations

Based on the problem analysis:

- Not knowing where to report a problem.
- Not knowing which reporting channel is appropriate.
- Difficulty converting an experience into a formal complaint.
- Difficulty organizing evidence.
- Uncertainty about what information should be included.
- Uncertainty about what happens after reporting.
- Lack of clear case tracking.
- Difficulty following up.
- Uncertainty about escalation when there is no response.

---

## 5.2 Victim Frustrations

- Fear of unnecessary exposure.
- Concern about privacy of sensitive evidence.
- Concern about retaliation or additional harm.
- Uncertainty about the appropriate authority.
- Difficulty knowing what to do during or after a safety incident.
- Risk of accidentally making sensitive information public.

> **Assumption:** Fear of retaliation and similar concerns are plausible for sensitive incidents but are not quantified in the problem analysis.

---

## 5.3 Authority Frustrations

- Unstructured reports may require additional interpretation.
- Evidence and case information may be fragmented.
- Related incidents may be difficult to identify.
- Case progress may require manual updates.
- Lack of structured information can increase processing effort.

> **Assumption:** The extent of these operational difficulties has not been quantified.

---

# 6. Current Workflow — Without CivicProof

The exact workflows used by different authorities are not fully established. The following is the **known/generalized workflow implied by the problem analysis**, not a claim that every authority follows the same process.

## 6.1 General Civic Complaint

```text
Problem occurs
      ↓
Citizen decides to report
      ↓
Citizen identifies a possible authority/channel
      ↓
Citizen prepares description/evidence
      ↓
Citizen submits complaint through the available channel
      ↓
Authority receives/reviews complaint
      ↓
Possible assignment/investigation
      ↓
Citizen follows up if necessary
      ↓
Authority provides/update status
      ↓
Problem may be resolved
```

### Current Friction

```text
"Who do I report this to?"
          ↓
"What information do they need?"
          ↓
"How do I explain it properly?"
          ↓
"Did they receive it?"
          ↓
"What is happening now?"
          ↓
"What should I do if nothing happens?"
```

---

## 6.2 Sensitive Safety / Harassment Incident

A person may need to:

```text
Incident occurs
      ↓
Assess immediate safety
      ↓
Seek emergency/support help if necessary
      ↓
Preserve available evidence
      ↓
Identify an appropriate reporting channel
      ↓
Describe the incident
      ↓
Submit/report
      ↓
Follow up
```

> The exact reporting process depends on the incident and responsible authority and is not defined in `01-PROBLEM.md`.

### Critical difference

Sensitive incidents cannot be treated like ordinary public complaints because:

- Evidence may contain sensitive personal information.
- Public exposure can create additional harm.
- The alleged offender should not be publicly identified or shamed.
- Immediate safety may take priority over completing a digital workflow.

---

# 7. Desired / Proposed Workflow — With CivicProof

## 7.1 General Case

```text
Problem / incident occurs
        ↓
Create incident
        ↓
Provide structured details
        ↓
Attach evidence
        ↓
AI-assisted structuring
        ↓
Severity suggestion
        ↓
Potentially relevant regulatory context
        ↓
Recommended reporting direction
        ↓
Generate formal complaint
        ↓
Official submission / handoff
        ↓
Case ID
        ↓
Case timeline
        ↓
Authority review
        ↓
Assignment / investigation
        ↓
Status updates
        ↓
Resolution
        ↓
Resolution evidence / verification
```

---

## 7.2 Sensitive Incident

```text
Incident occurs
        ↓
Immediate safety guidance
        ↓
Private incident creation
        ↓
Sensitive evidence handling
        ↓
Structured incident description
        ↓
AI-assisted organization
        ↓
Potentially relevant regulatory context
        ↓
Appropriate reporting direction
        ↓
Complaint generation
        ↓
Official reporting / handoff
        ↓
Private case tracking
```

The system should **not** require a victim to make sensitive information publicly visible.

---

# 8. Important Use Cases

## UC-01 — Report a Civic Problem

**User:** Citizen

**Goal:** Create a structured report about a civic problem.

Examples:
- Pothole
- Garbage dumping
- Blocked drain
- Waterlogging
- Broken streetlight
- Water leak
- Damaged public property
- Unsafe public space

---

## UC-02 — Report Public-Service Failure

**User:** Citizen

**Goal:** Report a problem involving a public-facing service or institution.

---

## UC-03 — Report Harassment / Safety Incident

**User:** Victim or witness

**Goal:** Report a sensitive safety incident while preserving privacy.

Examples:
- Harassment
- Stalking
- Threats
- Assault
- Unsafe public transport incident

---

## UC-04 — Upload Evidence

**User:** Reporter

**Goal:** Attach available evidence to support the case.

Potential evidence types:
- Images
- Videos
- Documents
- Other supported files

---

## UC-05 — Understand Next Steps

**User:** Reporter

**Goal:** Understand which reporting direction or authority may be relevant.

---

## UC-06 — Generate a Formal Complaint

**User:** Reporter

**Goal:** Convert the incident description and structured information into a clear complaint draft.

---

## UC-07 — Track a Case

**User:** Reporter

**Goal:** View the case ID, status, and timeline.

---

## UC-08 — Authority Reviews Case

**User:** Authority staff

**Goal:** Understand the case, review evidence, and determine the next operational step.

---

## UC-09 — Authority Updates Case

**User:** Authority staff

**Goal:** Record progress, request information, change status, and eventually record resolution.

---

## UC-10 — Resolution Verification

**User:** Reporter / Authority

**Goal:** Establish whether the reported problem appears to have been addressed.

> **Assumption:** The exact verification process will depend on the incident type.

---

# 9. Edge Cases

## Safety and Sensitive Information

1. **Immediate danger**
   - The user may need emergency assistance before completing a report.
   - The product must not delay access to emergency/support channels.

2. **Highly sensitive evidence**
   - Evidence may contain explicit, personal, or otherwise sensitive material.
   - Such evidence should not become publicly visible by default.

3. **Minor involved**
   - Additional privacy and safeguarding requirements may apply.
   - Exact requirements need verification.

4. **Alleged offender identified**
   - The system must not publicly label the person as guilty.
   - Person-related reports should remain private by default.

5. **Victim does not want public disclosure**
   - The workflow must support private reporting.

---

## Evidence

6. **No evidence available**
   - A user may need to report using a description alone.

7. **Evidence is unclear or incomplete**
   - The system should not treat AI interpretation as proof.

8. **Multiple evidence files**
   - Evidence may need to be organized under the same case.

9. **Potentially altered or unreliable evidence**
   - The system should not automatically treat uploaded media as authentic merely because it was uploaded.

---

## Reporting

10. **Wrong authority**
    - The initially suggested authority may not be responsible.
    - The system should allow correction or alternative reporting directions.

11. **No digital API**
    - The system may need to provide an official handoff instead of pretending to submit the complaint.

12. **Official service unavailable**
    - The user may need an alternative official channel.

13. **Duplicate report**
    - Multiple citizens may report the same underlying issue.

14. **Related incidents**
    - Several reports may concern the same location/problem.

---

## User and Data

15. **User abandons report**
    - The case may remain incomplete.

16. **Insufficient information**
    - The system should clearly indicate what is missing rather than inventing information.

17. **Location unavailable**
    - A report may need manual location entry.

18. **Privacy-sensitive location**
    - Precise location may be inappropriate for some sensitive cases.

19. **Network interruption**
    - Upload/submission may fail or be interrupted.

20. **AI unavailable**
    - The core reporting workflow should not falsely imply that an AI result exists when the AI service fails.

---

# 10. User Research Gaps

The current problem analysis does not establish:

- Exact user demographics.
- Most common complaint categories.
- Exact existing workflows for each authority.
- Most commonly used reporting channels.
- Actual complaint completion rates.
- Actual response and resolution times.
- Exact information authorities require for every category.
- Exact user preferences for privacy and evidence retention.
- Whether users prefer mobile web, native mobile, or other interfaces.
- Whether authorities would accept AI-generated complaint drafts.
- Which official APIs/integrations are available.

These should be treated as **research questions**, not facts.

---

# Research Principle

CivicProof should be designed around the user's actual journey:

> **"Something happened. What do I do now?"**

The product should reduce uncertainty without pretending to replace the authority responsible for resolving the incident.
