# 01 — Problem Definition

## 1. Problem

### Facts from the brief and initial analysis

Citizens, especially elderly, rural, or less digitally literate people, may struggle to:

- Understand which government welfare schemes they may qualify for.
- Navigate application procedures.
- Understand application forms that use administrative or government-oriented language.
- Avoid repeated office visits caused by uncertainty or incomplete applications.
- Know what happens after an application is submitted.

The broader hackathon track focuses on AI agents that help people interact with government services, including checking eligibility, filling forms, tracking complaints, or directing people to the right department.

### Assumptions / interpretation

The core product opportunity is to connect a citizen's everyday situation, expressed in plain language, with the government service or welfare scheme that may be relevant to them.

The experience should reduce the need for citizens to understand government terminology and procedures themselves.

---

## 2. Root Cause

### Facts from the brief and initial analysis

The identified root causes are:

1. Scheme information is scattered across departments.
2. Eligibility rules are difficult for ordinary applicants to interpret.
3. Application forms are written primarily for administrative purposes rather than for applicants.
4. There is no single experience that connects a citizen's personal situation to the appropriate scheme.
5. Citizens may have limited visibility into what happens after submission.

### Assumptions / interpretation

The problem is therefore not only a lack of information. It is also a **translation and navigation problem**:

> Citizens understand their situation in everyday terms, while government services are organized around schemes, eligibility rules, departments, and formal application fields.

A useful solution would bridge those two worlds.

---

## 3. Why the Problem Matters

### Facts from the brief and initial analysis

The problem affects people who need access to welfare schemes and other government services, particularly those who may have difficulty navigating digital or administrative processes.

Incomplete or incorrectly filed applications can also affect department staff who process them.

### Assumptions / interpretation

If citizens cannot easily discover relevant schemes or understand the application process, they may:

- Miss services they could potentially apply for.
- Depend on relatives, intermediaries, or repeated visits for assistance.
- Spend unnecessary time trying to understand procedures.
- Submit incomplete or incorrect information.
- Experience uncertainty after submitting an application.

Reducing these barriers could make government-service access more understandable and less intimidating.

---

## 4. Target Users

### Primary users

Citizens seeking government welfare schemes or services, including examples such as:

- Pension applicants.
- Farmers seeking agricultural subsidies.
- People seeking housing assistance.
- Elderly citizens.
- Rural citizens.
- Citizens with limited digital literacy.

The examples above come from the initial problem analysis; they are not yet a final list of schemes the product will support.

### Secondary users

Department staff who process applications and may be affected by:

- Incomplete applications.
- Incorrectly entered information.
- Misfiled applications.

### Assumptions / unknowns

The exact characteristics of the primary user group still need to be validated for the selected scheme(s).

---

## 5. Stakeholders

### Direct stakeholders

- **Citizens/applicants** — need to discover relevant services, understand eligibility, complete applications, and know the status of their submission.
- **Government department staff** — process applications and may benefit from clearer, more complete submissions.

### Indirect stakeholders

- Families or caregivers who help citizens navigate government services.
- Other people who assist citizens with applications.

### Unknowns

The exact government departments, officials, service providers, or external organizations that would be involved depend on which scheme(s) are selected for the MVP.

---

## 6. Current Situation

### Facts from the initial analysis

The current journey described is broadly:

1. A citizen has a need or situation.
2. The citizen tries to find out which scheme or service might help.
3. They may ask other people for information or assistance.
4. They try to understand eligibility requirements.
5. They complete a paper or web-based application, potentially with help.
6. They submit the application.
7. They wait without sufficient visibility into what happens next.

The initial analysis states that people may need multiple office visits and may not receive clear visibility into application progress.

### Assumptions / interpretation

The exact process differs between government schemes and departments. The product should therefore avoid assuming that every scheme follows the same real-world workflow.

---

## 7. Pain Points

### Identified pain points

| Pain point | Who is affected |
|---|---|
| Do not know which scheme is relevant | Citizens |
| Eligibility rules are difficult to understand | Citizens |
| Scheme information is scattered | Citizens |
| Forms are confusing or administrative in language | Citizens |
| Dependence on others to complete applications | Some citizens |
| Multiple office visits may be required | Citizens |
| Applications may be incomplete or incorrectly filed | Citizens and department staff |
| Little visibility after submission | Citizens |
| Processing incomplete/misfiled applications | Department staff |

### Key insight

The problem spans the **entire journey**, not just form filling:

**"What help is available to me?" → "Do I qualify?" → "How do I apply?" → "What did I submit?" → "What happens next?"**

---

## 8. Desired Outcome

### Product outcome

A citizen should be able to describe their situation in plain language and receive guided assistance that helps them:

1. Understand which supported government scheme may be relevant.
2. Understand the important eligibility requirements in simple language.
3. Provide only the information needed to determine eligibility.
4. Understand why they appear eligible, ineligible, or why more information is needed.
5. Generate an application from the information they provided.
6. Review and confirm the generated application before submission.
7. Submit a **simulated** application within the hackathon environment.
8. Receive a tracking ID.
9. See a simulated application status and understand what happens next.

### Desired experience

The citizen should **not have to start by reading or filling a raw government form**.

The intended experience is:

> **Describe your situation → Find the relevant scheme → Check eligibility → Build the application → Review → Submit → Track**

### Important boundary

The product should clearly communicate when an application or status is simulated and is **not an actual submission to a government department**.

---

## 9. Constraints

### Facts from the hackathon brief

- This is a hackathon build.
- There is no real access to government backend systems.
- Application submission must therefore be simulated.
- Application status must therefore be simulated.
- The MVP should be limited to **1–2 schemes** rather than attempting to cover a complete government scheme catalog.
- No assumptions should be made that the prototype can actually submit applications to government systems.

### Product constraints

The limited scope means the team must prioritize a complete, convincing end-to-end journey over breadth.

The selected scheme(s) need enough clearly defined information to demonstrate:

- Scheme discovery.
- Eligibility assessment.
- Application generation.
- Simulated submission.
- Tracking.

---

## 10. Unknown Information

The following information is not established by the current brief and must not be treated as fact:

### Scheme information

- Which specific scheme(s) will be supported.
- Which department owns each selected scheme.
- The authoritative eligibility rules for the selected scheme(s).
- Required documents for each scheme.
- Exact application fields.
- Actual processing stages.
- Actual application timelines.
- Actual rejection or approval rules.

### User information

- Which user group should be prioritized first.
- The most common difficulties users experience with the selected scheme(s).
- How much information users are comfortable providing through an AI interface.
- Whether users prefer text, voice, or another input method.

### Product information

- Which parts of the application can safely be generated automatically.
- Which information must always be explicitly confirmed by the citizen.
- How much explanation is needed for eligibility decisions.
- What simulated status stages will provide the most useful demonstration.

---

## 11. Questions We Need Answered

### Scheme selection

1. Which 1–2 schemes provide the strongest demonstration of the problem?
2. Can their eligibility rules be represented clearly and reliably?
3. Can we obtain sufficiently authoritative information about their requirements?
4. Are their application processes understandable enough to simulate?

### User experience

1. What is the simplest way for a citizen to describe their situation?
2. What questions are actually necessary to determine eligibility?
3. How can we avoid overwhelming users with government terminology?
4. How should missing information be explained?
5. How should users review AI-generated application information?

### AI

1. What should the AI understand from natural-language descriptions?
2. Which information should AI extract into structured facts?
3. Which tasks should remain deterministic rather than being decided by AI?
4. How should uncertainty or missing information be communicated?
5. How do we prevent the AI from inventing eligibility rules or application requirements?

### Application

1. Which application fields should be generated from the user's answers?
2. Which fields require explicit confirmation?
3. How should the application be presented before simulated submission?
4. What should the citizen receive after submission?

### Tracking

1. What simulated statuses should be shown?
2. What information should each status communicate?
3. How should the tracking ID be presented?
4. How do we make the simulated nature of the tracking system clear?

---

## 12. Success Criteria

### Primary success criterion

A demo user can:

> **Describe their situation in plain language and finish with a submitted simulated application and tracking ID without having to interact directly with a raw government application form.**

### MVP success criteria

The prototype should demonstrate that a user can:

- Start with a natural-language description of their situation.
- Be guided toward a relevant supported scheme.
- Answer the necessary eligibility questions.
- Receive an understandable eligibility result.
- See the reasoning or requirements behind that result.
- Have an application generated from their provided information.
- Review and confirm the application.
- Submit a simulated application.
- Receive a unique tracking ID.
- View a simulated application status.

### Quality criteria

The experience should be:

- **Simple** — understandable without requiring knowledge of government procedures.
- **Transparent** — clearly distinguishes confirmed information from AI interpretation and simulation.
- **Trustworthy** — does not invent eligibility rules or claim to submit to a real government system.
- **Focused** — supports only 1–2 carefully selected schemes for the hackathon.
- **End-to-end** — demonstrates the complete journey rather than only one feature such as a chatbot or form generator.

---

## Core Problem Statement

> **Citizens often know the problem they need government help with, but do not know which scheme applies to their situation, whether they qualify, or how to navigate the application process. Government information and forms are organized around departments and administrative procedures rather than the citizen's everyday situation. This creates confusion, dependence on others, repeated effort, incomplete applications, and uncertainty after submission.**

## Core Product Opportunity

> **Build an AI-assisted citizen experience that translates a person's situation into a relevant government scheme, guides them through eligibility, turns their answers into an understandable application, and provides a simulated submission and tracking experience — without requiring them to understand complicated government procedures first.**
