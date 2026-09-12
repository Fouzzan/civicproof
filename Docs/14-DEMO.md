# CivicProof — 5-Minute Demo Script

## Demo Goal

Show one complete journey:

> **A citizen has a real-world problem → CivicProof turns it into a structured case → AI reduces the reporting work → the case reaches the responsible workflow → an authority updates it → the citizen sees resolution.**

Target presentation time: **~5 minutes**.

---

# 1. Problem — ~40 seconds

### Say

> "Something happens in our community, and usually the problem isn't just *how do I report it?* The bigger problem is everything around it: **Who do I report it to? What information should I provide? How do I turn my experience into a proper complaint? Did anyone actually receive it? And what happens after that?**
>
> For sensitive incidents like harassment, there's another problem: **privacy and safety**. People need a way to report without exposing themselves or publicly accusing someone.
>
> Today, CivicProof is our answer to that gap."

### Show

On the landing page, point to:

```text
Incident → Evidence → AI → Case → Resolution
```

---

# 2. Who It Affects — ~20 seconds

### Say

> "Our primary users are **citizens and reporters**, including people facing sensitive safety incidents. On the other side are **authorities and complaint-handling staff** who need structured information, evidence, and a clear case history."

### Show

Briefly point to the citizen-facing interface.

Do **not** spend time listing every possible stakeholder.

---

# 3. Our Solution — ~30 seconds

### Say

> "CivicProof creates a bridge between an incident and resolution. Instead of giving someone another place to write a complaint, we turn their report into an **evidence-backed, AI-assisted, actionable and trackable case**.
>
> The important part is that CivicProof doesn't replace the authority. It helps the citizen get to the right workflow and then keeps the process transparent."

### Show

Point across the product flow:

```text
Report
  ↓
Evidence
  ↓
AI assistance
  ↓
Complaint
  ↓
Case ID
  ↓
Authority
  ↓
Resolution
```

---

# 4. Live Workflow — ~2 minutes 30 seconds

## Step 1 — Start a report

### Click

**Report an Incident**

### Say

> "Let's take a simple real-world example: a large pothole near a busy bus stop."

---

## Step 2 — Enter the incident

### Click / enter

- Incident type: **Pothole**
- Description:
  > "There is a large pothole near the main bus stop. Motorcycles are having difficulty passing safely."
- Add approximate location.
- Add date/time if available.

### Say

> "The citizen doesn't need to know how to write a government-style complaint. They simply describe what happened and provide the information they actually know."

---

## Step 3 — Add evidence

### Click

**Upload Photo**

Select the prepared demo pothole image.

### Say

> "They can attach evidence directly to the case. Evidence is associated with this case and isn't automatically treated as proof or authenticity just because it was uploaded."

**Keep this explanation to one sentence.**

---

## Step 4 — Run AI analysis

### Click

**Analyze my report**

### Say

> "Now CivicProof uses AI to reduce the cognitive work."

### Show

The generated:

- structured summary;
- severity suggestion;
- reporting direction.

### Say

> "Instead of making the citizen figure out how to structure this, AI turns the description into a concise case summary, suggests a severity level, and recommends a reporting direction."

### Important visual point

Point at the **AI-assisted** label.

> "Notice that these are suggestions, not official decisions."

---

## Step 5 — Generate the complaint

### Click

**Generate Complaint**

### Show

The generated formal complaint.

### Say

> "With one action, the citizen gets a formal complaint based on the information they actually provided."

Then point to the edit/review area:

> "But AI doesn't submit it blindly. **The human reviews the complaint first.**"

---

## Step 6 — Official handoff

### Click

**Continue to Official Reporting / Handoff**

### Say

> "CivicProof then provides the appropriate official reporting path. If we don't have a real government integration, we don't pretend that we do."

Point at the state:

> "**Ready for official handoff**"

or

> "**Handed off — official submission not claimed**"

### Key line

> "That distinction is important: **a generated complaint is not the same thing as an officially submitted complaint.**"

---

## Step 7 — Case ID and tracking

### Show

The generated case ID, for example:

```text
CP-2026-000184
```

### Say

> "The citizen now has a persistent case reference and a timeline instead of losing visibility after the complaint is created."

---

## Step 8 — Switch to authority view

### Click

**Authority View**

Open the same case.

### Show

- incident details;
- evidence;
- AI-assisted summary;
- severity;
- case status.

### Say

> "Now let's switch perspectives. The authority receives the same case in a structured format instead of having to interpret a scattered complaint."

---

## Step 9 — Update the case

### Click

**Update Status**

Choose something like:

```text
IN REVIEW
```

Add:

> "Road condition reviewed and forwarded for repair."

### Say

> "The authority can update the status, and that action becomes part of the case timeline."

---

## Step 10 — Resolve

### Click

**Resolve Case**

Enter:

> "Pothole repair completed and road condition addressed."

### Show

The resolved state and timeline.

### Say

> "Finally, the authority records the resolution. When the citizen opens the case again, they can actually see what happened."

---

# 5. Sensitive-Case Safety — ~20 seconds

If the demo UI supports the sensitive flow cleanly, briefly show the **Harassment / Safety Incident** category.

### Say

> "The same system can handle sensitive incidents differently. These cases are **private by default**, sensitive evidence is access-controlled, and immediate-danger guidance is available without forcing someone through the normal reporting flow."

### Show

- privacy indicator;
- immediate safety option;
- private-case indicator.

### Do not

Spend time demonstrating a real sensitive incident or real person's data.

Use synthetic demo data only.

---

# 6. Technology / AI — ~20 seconds

### Say

> "Technically, this is a modular Next.js application with a PostgreSQL database, secure authentication, object storage for evidence, and server-side AI calls.
>
> The interesting part isn't the stack. **AI is deliberately bounded:** it structures reports, suggests severity and reporting direction, and drafts complaints. It doesn't decide guilt, change authority state, or submit complaints autonomously."

That is enough.

---

# 7. Result — ~20 seconds

### Say

> "So what changed in this demonstration?"

Point through the completed timeline:

```text
Unstructured problem
        ↓
Structured case
        ↓
Evidence
        ↓
AI-assisted understanding
        ↓
Formal complaint
        ↓
Official reporting path
        ↓
Case ID
        ↓
Authority action
        ↓
Resolution
```

> "We didn't just create a form. We demonstrated a complete path from **something going wrong to a visible resolution state**."

---

# 8. Impact — ~30 seconds

### Say

> "The potential impact is broader than potholes.
>
> The same infrastructure can support public-service failures, unsafe public spaces, harassment, public transport issues, and other civic problems.
>
> Our goal is to reduce the uncertainty around reporting, help people create better-structured complaints, give authorities clearer information, and most importantly, give citizens visibility into what happens after they report."

### Strong closing line

> "**CivicProof turns 'Something is wrong' into 'Here is my case, here is the evidence, here is what happens next, and here is what happened to it.'**"

---

# 9. Future Scope — ~20 seconds

### Say

> "Beyond the MVP, we can connect CivicProof to verified government and institutional reporting channels, add trusted regulatory context, improve resolution verification, support more authorities and jurisdictions, and eventually add smarter case routing and escalation.
>
> But the foundation stays the same: **a secure, human-controlled path from incident to accountability.**"

---

# 10. Final 5-Minute Timing

| Section | Target |
|---|---:|
| Problem | 40 sec |
| Who it affects | 20 sec |
| Solution | 30 sec |
| Live workflow | 2 min 30 sec |
| Sensitive safety | 20 sec |
| Technology/AI | 20 sec |
| Result | 20 sec |
| Impact | 30 sec |
| Future scope | 20 sec |
| **Total** | **~5 min 50 sec** |

## If the actual limit is strictly 5 minutes

Cut the sensitive-case section from the spoken pitch unless judges specifically ask about it, and shorten the live workflow narration.

Target:

```text
Problem + users + solution     ~1:15
Live demo                       ~2:30
Tech/AI                         ~0:15
Result + impact                 ~0:40
Future + closing                ~0:20
------------------------------------
Total                           ~5:00
```

---

# 11. Demo Operator Cheat Sheet

During the actual demo, do not read the entire script.

Use this sequence:

```text
1. LANDING PAGE
   ↓
   "Reporting is fragmented."

2. REPORT INCIDENT
   ↓
   Select Pothole
   Enter description + location

3. UPLOAD PHOTO
   ↓
   Show evidence

4. ANALYZE
   ↓
   Show summary
   Show severity
   Show reporting direction

5. GENERATE COMPLAINT
   ↓
   Show draft
   "Human reviews this."

6. OFFICIAL HANDOFF
   ↓
   Show truthful handoff state

7. CASE ID
   ↓
   Show CP-2026-000184

8. TRACKING
   ↓
   Show timeline

9. AUTHORITY VIEW
   ↓
   Show same case

10. UPDATE
    ↓
    IN REVIEW

11. RESOLVE
    ↓
    Resolution recorded

12. CITIZEN VIEW
    ↓
    Show final timeline

13. CLOSE
    ↓
    "From incident to accountability."
```

---

# 12. What NOT to Say

Avoid claims that the MVP cannot prove:

- "AI detects whether someone committed a crime."
- "AI determines the correct legal section."
- "CivicProof automatically files every complaint with the government."
- "The government has accepted this complaint."
- "The AI verifies that the evidence is authentic."
- "CivicProof guarantees resolution."
- "We reduced complaint resolution time by X%."

The project documentation explicitly treats these as unsupported or outside the MVP.

Instead say:

- **"AI-assisted"**
- **"suggested severity"**
- **"recommended reporting direction"**
- **"formal complaint draft"**
- **"official handoff"**
- **"authority-recorded resolution"**
- **"potential future integration"**

---

# 13. The One Sentence Judges Should Remember

> ## **"CivicProof doesn't just help you report a problem — it creates a secure, evidence-backed path from incident to accountability."**
