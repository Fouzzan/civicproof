# CivicProof — Problem Analysis

## 1. Problem

### Facts / Current Context
- Citizens can experience problems involving public infrastructure, public services, public transport, harassment, safety incidents, and other civic issues.
- Reporting a problem does not necessarily create a clear, evidence-backed, trackable path from the initial incident to action and resolution.
- Person-related safety complaints, including harassment faced by women in public transport, require particular care because reports and evidence can be sensitive.
- The product must support both ordinary civic problems and sensitive incidents without publicly exposing or accusing individuals.

### Problem Summary

Citizens need a reliable way to turn an incident or civic problem into a **structured, evidence-backed, actionable, and trackable case** that can be directed toward an appropriate authority and followed through to resolution.

CivicProof is intended to address the gap between:

`Incident → Evidence → Complaint → Responsible Authority → Follow-up → Resolution`

---

## 2. Root Cause

### Facts
The problem statement/context identifies a gap between experiencing or reporting a problem and having a clear, actionable, trackable process for addressing it.

### Assumptions
- Citizens may not know which authority or reporting channel is appropriate.
- Unstructured descriptions may make complaints harder to process.
- Citizens may have difficulty presenting evidence in a useful, organized format.
- Citizens may not know what information should be included in a formal complaint.
- Lack of visibility after submission may make citizens uncertain about progress.

### Unknowns
- How often complaints are lost, delayed, rejected, or redirected.
- Average response/resolution times for different categories.
- Which reporting channels are most commonly used.
- Which authorities can provide APIs or digital integrations.
- Whether existing government systems expose sufficient status information for automated tracking.

---

## 3. Why the Problem Matters

### Facts
- Civic problems can affect public safety, accessibility, infrastructure, public services, and quality of life.
- Harassment and safety incidents can have serious consequences for victims.
- Sensitive incidents may involve evidence that should not be publicly exposed.

### Assumptions
- A clearer reporting and tracking process could reduce friction for citizens.
- Better structured evidence could help authorities understand cases faster.
- Transparent status tracking could improve accountability and citizen confidence.

### Unknowns
- Quantifiable reduction in response time.
- Quantifiable increase in successful resolution.
- Actual scale of the reporting/accountability gap across Kerala or India.

---

## 4. Target Users

### Primary Users
1. **Citizens**
   - People reporting civic problems.
   - People reporting public-service failures.
   - People reporting safety incidents or harassment.

2. **Authorities / Responsible Organizations**
   - Officials or staff who receive, review, assign, investigate, update, and resolve cases.

### Secondary Users
- Organizations responsible for public transport, utilities, institutions, or other public-facing services.
- Support personnel handling complaints.

### Sensitive-incident users
For harassment, stalking, assault, threats, or similar incidents, the victim/reporter is a protected user and their information/evidence should be treated as private by default.

---

## 5. Stakeholders

- Citizens and victims/reporters
- Local government authorities
- Police and relevant safety authorities
- Public transport authorities/operators
- Government departments
- Utility/service providers
- Educational institutions where relevant
- Complaint/grievance-handling staff
- Community/public-service organizations

> Exact authority responsibility depends on the type and location of the incident and must not be assumed without verification.

---

## 6. Current Situation

A citizen may currently need to determine:
1. What happened and how to describe it.
2. What evidence is useful.
3. Which authority should receive the complaint.
4. Which reporting channel to use.
5. How to formulate the complaint.
6. Whether the complaint was acknowledged.
7. What its current status is.
8. What to do if there is no response.

For sensitive incidents, the process also needs to account for:
- privacy,
- personal safety,
- sensitive evidence,
- appropriate emergency/support channels,
- and avoiding public accusations.

---

## 7. Pain Points

### Citizen Pain Points
- Uncertainty about where to report.
- Difficulty converting an unstructured experience into a formal complaint.
- Evidence may be scattered or poorly organized.
- Uncertainty about what information matters.
- Lack of a single case view/timeline.
- Difficulty knowing what to do after submitting a complaint.
- Difficulty following up or escalating when appropriate.

### Authority Pain Points
- Unstructured reports can require manual interpretation.
- Evidence and case information may be fragmented.
- Related reports may be difficult to identify.
- Case status and resolution information may require manual updates.

### Sensitive-incident Pain Points
- Victims may fear exposure or retaliation.
- Sensitive evidence requires stronger privacy controls.
- Public accusation or identification can create additional harm.
- Immediate-danger situations require fast access to appropriate help.

---

## 8. Desired Outcome

The desired outcome is a system where a citizen can:

`Report → Add Evidence → Structure the Incident → Understand Next Steps → Generate Complaint → Reach/Hand Off to Appropriate Authority → Receive Case ID → Track Progress → Verify Resolution`

For authorities:

`Receive → Review → Assign → Investigate → Update → Resolve`

The system should make the journey **clearer, more structured, and more accountable** without pretending to replace official authorities.

---

## 9. Constraints

### Known Product Constraints
- The hackathon build time is approximately **4 hours**.
- The MVP must prioritize a complete, reliable demonstration over breadth.
- The application should support both civic issues and person-related safety complaints.
- Sensitive incidents must be private by default.
- The system must not publicly identify or shame alleged offenders.
- The AI must not determine guilt or criminal liability.
- Legal information must be presented as potentially relevant regulatory context, not definitive legal advice.
- The system must not invent laws, authorities, complaint outcomes, or government submissions.
- The product must not claim that a complaint was officially submitted unless an actual submission occurred.
- Emergency situations must not be delayed by the application's workflow.

### Assumptions
- A prototype/demo may use mock data or simulated authority workflows where real integrations are unavailable.
- Official reporting channels can be represented as hand-offs when direct integration is unavailable.

### Unknowns
- Availability of official APIs for each authority.
- Authentication and identity requirements for actual government submissions.
- Data-retention requirements for sensitive evidence.
- Exact legal and organizational requirements for production deployment.

---

## 10. Unknown Information

The following must be validated before treating the prototype as a production system:

- Which authorities are responsible for each incident category and jurisdiction.
- Which official reporting channels are available.
- Whether those channels provide APIs.
- What constitutes sufficient evidence for each type of complaint.
- Required retention/deletion periods for evidence.
- Exact response expectations for each authority.
- Requirements for handling reports involving minors.
- Requirements for handling highly sensitive personal information.
- Whether AI-generated complaint text is acceptable for specific official submission channels.

---

## 11. Questions We Need Answered

### Problem
1. Which types of incidents are most important for the MVP?
2. Which single user journey best demonstrates the problem?

### Users
1. What information do citizens currently struggle to provide?
2. What information do authorities need to process a case?
3. What privacy expectations do victims have?

### Reporting
1. Which authority should handle each major category?
2. Which official reporting channels exist?
3. Can complaints be submitted digitally or must the user be handed off to an official portal/channel?

### Safety
1. What situations require immediate emergency guidance?
2. What information should never be made public?
3. How should evidence involving minors or explicit/sensitive material be handled?

### Legal / Regulatory Context
1. Which official laws/rules are relevant to each supported category?
2. Which provisions can be safely shown as contextual information?
3. How frequently must the regulatory knowledge base be verified?

### Success
1. Can a citizen create a complete structured case quickly?
2. Can the system identify an appropriate next step?
3. Can the user clearly see what happened to their case?
4. Can an authority understand and update the case efficiently?

---

## 12. Success Criteria

### Hackathon MVP — Must Have
- Citizen can create an incident.
- Citizen can provide structured incident information.
- Citizen can attach evidence.
- System produces a structured AI-assisted analysis.
- System provides a severity suggestion.
- System recommends an appropriate reporting direction/channel.
- System can generate a clear formal complaint.
- System creates a unique case ID.
- Citizen can view a case timeline/status.
- Authority can view and update a case.
- Sensitive/person-related reports are private by default.
- Demo never falsely claims an official government submission.

### Strong Demo Success
- One complete incident flows from creation to authority resolution.
- AI visibly reduces the work required from the citizen.
- Evidence and case information are organized clearly.
- The case timeline demonstrates accountability.
- The interface is usable on a phone.
- The authority dashboard makes the same case useful from the receiver's perspective.

### Longer-Term Success Metrics
These are targets to validate rather than claimed results:
- Reduced time required to create a complete complaint.
- Higher percentage of reports containing required information.
- Reduced time for authorities to understand a case.
- Increased visibility into complaint status.
- Improved resolution/response tracking.

---

# Facts vs Assumptions vs Unknowns

| Category | Meaning | Rule |
|---|---|---|
| **Facts** | Information explicitly established by the available problem/context | May be treated as established |
| **Assumptions** | Reasonable interpretations that have not been verified | Must be labeled |
| **Unknowns** | Information not currently available | Must not be invented |

---

# Problem Boundary

CivicProof is **not** intended to:

- Replace police, courts, government authorities, or emergency services.
- Decide whether an accused person is guilty.
- Act as a lawyer.
- Publicly expose alleged offenders.
- Guarantee that an authority will act.
- Claim an official complaint was filed when it was only generated or handed off.
- Treat AI output as factual evidence by itself.

CivicProof's role is to help transform a citizen's report and available evidence into a **structured, actionable, trackable case**.

---

# Core Problem Statement

> **Citizens often know that something is wrong but lack a simple, reliable path to turn that experience into an evidence-backed complaint, reach the appropriate authority, and track what happens next. This becomes especially difficult for sensitive incidents such as harassment in public spaces or public transport, where privacy, safety, evidence handling, and appropriate reporting channels are critical.**

