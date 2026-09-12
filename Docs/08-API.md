# CivicProof — API Design

## Purpose

This document defines the **minimum internal API surface required by the CivicProof MVP**.

It is derived from:

- `docs/01-PROBLEM.md`
- `docs/02-USER-RESEARCH.md`
- `docs/03-REQUIREMENTS.md`
- `docs/04-FEATURES.md`
- `docs/05-MVP.md`
- `docs/06-ARCHITECTURE-DECISION.md`
- `docs/07-DATABASE.md`

The API is an **internal application API**, not a public/developer API.

The MVP follows one core journey:

```text
Create Case
    ↓
Upload Evidence
    ↓
AI Analysis
    ↓
Generate Complaint
    ↓
Official Handoff
    ↓
View Case / Timeline
    ↓
Authority Review
    ↓
Authority Status Update
    ↓
Record Resolution
```

---

# 1. API Design Principles

1. **Small internal API**
   - Only endpoints needed by the MVP are included.
   - No public API platform, versioning system, microservices, or API gateway is required.

2. **Authentication is server-controlled**
   - The backend obtains the authenticated user from the authentication layer.
   - The client must never be trusted to declare its own role.

3. **Authorization is enforced per case**
   - Citizens can access their own cases.
   - Authority users can access cases assigned/authorized to them.
   - Sensitive cases are private by default.

4. **AI is bounded**
   - AI assists with structuring, severity, reporting direction, and complaint drafting.
   - AI does not determine guilt or liability.
   - AI must not invent facts, evidence, laws, authorities, submissions, or resolutions.

5. **Official submission state is truthful**
   - Generating a complaint is not the same as submitting it.
   - A handoff is not the same as confirmed official submission.
   - The API only records states that actually occurred.

6. **Timeline events are append-oriented**
   - Important workflow actions create timeline events.
   - Historical events should not be overwritten merely to change the visible current state.

---

# 2. Authentication / Authorization Model

The MVP requires two roles:

```text
CITIZEN
AUTHORITY
```

The authentication system is responsible for establishing the current user.

The API uses that authenticated identity to enforce:

### Citizen access

```text
case.reporterId == currentUser.id
```

### Authority access

For the MVP:

```text
case.authorityUserId == currentUser.id
```

or another explicitly configured authority-access rule.

### Sensitive cases

```text
isSensitive == true
        ↓
No public access
        ↓
Reporter + explicitly authorized authority
```

A case ID by itself is **not sufficient authorization** for sensitive information.

---

# 3. Frontend → Backend API Calls

## 3.1 Create Case

### Endpoint

```http
POST /api/cases
```

### Purpose

Create a new CivicProof case from the citizen's supplied incident information.

This supports:

- F-001 Create Incident
- F-002 Incident Type Selection
- F-003 Incident Details
- F-009 Case ID
- F-015 Private Sensitive Case Handling

### Authentication / Authorization

**Required:** Authenticated user.

Allowed role:

```text
CITIZEN
```

The backend uses the authenticated user's ID as `reporterId`.

The client cannot choose another `reporterId`.

### Request shape

```json
{
  "incidentType": "POTHOLE",
  "description": "There is a large pothole near the main bus stop. Motorcycles are having difficulty passing safely.",
  "incidentDateTime": "2026-09-12T17:30:00+05:30",
  "location": "Main bus stop, Tirur",
  "isSensitive": false
}
```

Example sensitive case:

```json
{
  "incidentType": "HARASSMENT",
  "description": "I experienced repeated unwanted harassment while waiting at a bus stop.",
  "incidentDateTime": "2026-09-12T18:15:00+05:30",
  "location": "Bus stop area",
  "isSensitive": true
}
```

### Response shape

```json
{
  "case": {
    "id": "clx123abc",
    "caseId": "CP-2026-000184",
    "incidentType": "POTHOLE",
    "description": "There is a large pothole near the main bus stop. Motorcycles are having difficulty passing safely.",
    "incidentDateTime": "2026-09-12T17:30:00+05:30",
    "location": "Main bus stop, Tirur",
    "isSensitive": false,
    "status": "CREATED",
    "handoffStatus": "DRAFT"
  }
}
```

### Validation rules

- `incidentType` is required.
- `description` is required and must contain meaningful text.
- `incidentDateTime` is optional.
- `location` is optional when unavailable or inappropriate.
- `isSensitive` must be a boolean.
- Sensitive incident types should default to private handling even if the client incorrectly sends `false`.
- Do not require irrelevant fields.
- Do not fabricate missing information.
- The backend generates the internal ID and human-readable case ID.
- Initial status must be a valid MVP status such as `CREATED`.

### Error cases

```text
400 Bad Request
```

Invalid or missing request fields.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User is not permitted to create this type of case.

```text
422 Unprocessable Entity
```

Valid request structure but insufficient/invalid incident data.

```text
500 Internal Server Error
```

Unexpected database/server failure.

### Rate limits

Relevant for abuse prevention.

Suggested MVP limit:

```text
10 case-creation requests / 10 minutes / authenticated user
```

This is intentionally generous enough for normal use but prevents accidental request loops.

### Side effects

Creates:

- one `Case` record
- one `TimelineEvent` with `eventType = CASE_CREATED`

No AI call is made automatically.

No official submission occurs.

---

# 3.2 Upload / Associate Evidence

### Endpoint

```http
POST /api/cases/:caseId/evidence
```

### Purpose

Attach one evidence file to an existing case.

This supports:

- F-003 Evidence Upload
- NFR-009 Data Integrity
- F-015 Private Sensitive Case Handling

### Authentication / Authorization

**Required:** Authenticated user.

Allowed:

- Case reporter
- Authorized authority user, where the workflow permits the upload

The backend must verify access to the case before accepting the file.

### Request shape

Use `multipart/form-data`.

Example conceptual request:

```text
caseId: CP-2026-000184
file: pothole.jpg
description: Photo taken from the roadside showing the pothole
```

### Response shape

```json
{
  "evidence": {
    "id": "ev_123",
    "caseId": "clx123abc",
    "fileName": "pothole.jpg",
    "fileType": "image/jpeg",
    "storageReference": "cases/clx123abc/evidence/ev_123",
    "description": "Photo taken from the roadside showing the pothole",
    "createdAt": "2026-09-12T17:35:00+05:30"
  }
}
```

### Validation rules

- Case must exist.
- User must have permission to access the case.
- File must be present.
- File type must be one of the supported MVP evidence types.
- Enforce a reasonable maximum file size.
- Evidence must be associated with the specified case.
- Actual file bytes are stored outside the `Case` row.
- Do not mark evidence as authentic, conclusive, or legally admissible.
- Sensitive evidence must inherit the case's access restrictions.
- The backend must not trust a client-provided storage reference.

### Error cases

```text
400 Bad Request
```

Missing file or malformed multipart request.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User cannot access the case.

```text
404 Not Found
```

Case does not exist.

```text
413 Payload Too Large
```

File exceeds the configured size limit.

```text
415 Unsupported Media Type
```

File type is not supported.

```text
500 Internal Server Error
```

Storage/database failure.

### Rate limits

Suggested MVP limit:

```text
30 evidence uploads / hour / authenticated user
```

Also enforce a per-file size limit.

### Side effects

Creates one `Evidence` record.

No AI analysis is automatically created.

---

# 3.3 Get Case

### Endpoint

```http
GET /api/cases/:caseId
```

### Purpose

Retrieve the complete case view needed by the citizen or authorized authority.

This supports:

- F-010 Case Status & Timeline
- F-011 Authority Case Review
- F-015 Private Sensitive Case Handling
- F-023 Permission-Aware Case Access
- F-024 Transparent Case State

### Authentication / Authorization

**Required:** Authenticated user.

Citizen:

```text
case.reporterId == currentUser.id
```

Authority:

```text
currentUser.role == AUTHORITY
AND
case.authorityUserId == currentUser.id
```

Sensitive cases must never be returned to unrelated users.

### Request shape

No request body.

```http
GET /api/cases/CP-2026-000184
```

### Response shape

```json
{
  "case": {
    "caseId": "CP-2026-000184",
    "incidentType": "POTHOLE",
    "description": "There is a large pothole near the main bus stop.",
    "incidentDateTime": "2026-09-12T17:30:00+05:30",
    "location": "Main bus stop, Tirur",
    "isSensitive": false,
    "status": "IN_REVIEW",
    "severity": "MEDIUM",
    "severityReason": "The report describes a road hazard affecting road users.",
    "reportingDirection": "Local civic authority",
    "reportingChannel": "Official local civic complaint channel",
    "complaintDraft": "To the concerned authority...",
    "handoffStatus": "HANDED_OFF",
    "authorityUserId": "auth_001",
    "resolutionText": null,
    "resolvedAt": null,
    "evidence": [
      {
        "id": "ev_123",
        "fileName": "pothole.jpg",
        "fileType": "image/jpeg",
        "description": "Photo taken from the roadside"
      }
    ],
    "aiAnalysis": {
      "summary": "A road hazard was reported near the main bus stop.",
      "severitySuggestion": "MEDIUM",
      "reportingSuggestion": "Local civic authority",
      "modelLabel": "configured-ai-model"
    },
    "timeline": [
      {
        "eventType": "CASE_CREATED",
        "title": "Report created",
        "description": "Case created by reporter.",
        "createdAt": "2026-09-12T17:30:00+05:30"
      }
    ]
  }
}
```

The exact response may omit fields the requesting user is not authorized to see.

### Validation rules

- `caseId` must match the supported case-ID format.
- Case must exist.
- Authorization must be checked before returning protected data.
- Sensitive case information must never be returned to an unauthorized user.
- Evidence metadata and evidence access must use the same case-level authorization boundary.
- Do not expose internal IDs unnecessarily to the citizen.

### Error cases

```text
400 Bad Request
```

Invalid case ID format.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User is not authorized to view the case.

```text
404 Not Found
```

Case does not exist.

For sensitive cases, implementations may intentionally return `404` instead of `403` to reduce information disclosure.

```text
500 Internal Server Error
```

Database/server failure.

### Rate limits

Suggested:

```text
120 requests / minute / authenticated user
```

Normal case viewing should not be unnecessarily restricted.

### Side effects

None.

This is a read-only operation.

---

# 3.4 Request AI Case Analysis

### Endpoint

```http
POST /api/cases/:caseId/ai-analysis
```

### Purpose

Ask the AI component to:

- structure the supplied incident
- summarize it
- suggest severity
- suggest reporting direction

This supports:

- F-004 AI-Assisted Case Analysis
- F-005 Severity Suggestion
- F-006 Reporting Direction Recommendation
- F-022 AI Failure / Fallback

### Authentication / Authorization

**Required:** Authenticated user.

User must have permission to view the case.

The backend should normally allow:

- Case reporter
- Authorized authority user

The backend, not the client, decides which case data is sent to the AI.

### Request shape

No sensitive AI prompt needs to be constructed directly by the frontend.

Optional request:

```json
{
  "includeEvidenceContext": true
}
```

The backend loads the necessary case information.

### Response shape

```json
{
  "analysis": {
    "summary": "A large pothole has been reported near a bus stop and may create a road-safety hazard.",
    "structuredData": {
      "incidentType": "POTHOLE",
      "location": "Main bus stop, Tirur",
      "reportedImpact": "Difficulty for motorcycles and potential road-user hazard"
    },
    "severitySuggestion": "MEDIUM",
    "severityReason": "The supplied description indicates a public road hazard but does not establish an immediate emergency.",
    "reportingSuggestion": "Local civic authority",
    "reportingChannel": "Official local civic complaint channel",
    "modelLabel": "configured-ai-model",
    "aiAssisted": true
  }
}
```

### Validation rules

- Case must exist.
- User must have access.
- Only necessary case information should be sent to the AI.
- Original user-provided description must remain unchanged.
- AI output must be stored separately from user facts.
- AI must not determine guilt or criminal liability.
- AI must not invent facts, evidence, laws, authorities, or official actions.
- Reporting direction must be presented as a recommendation, not certainty.
- Severity must be presented as a suggestion/assessment.
- If required information is missing, the AI must acknowledge uncertainty rather than fabricate it.
- A successful response must conform to the application's expected structured output.

### Error cases

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User cannot access the case.

```text
404 Not Found
```

Case does not exist.

```text
422 Unprocessable Entity
```

Insufficient valid case information for the requested analysis.

```text
429 Too Many Requests
```

AI request rate limit exceeded.

```text
502 Bad Gateway
```

AI provider failure.

```text
504 Gateway Timeout
```

AI provider did not respond in time.

```text
500 Internal Server Error
```

Unexpected backend/database failure.

### Rate limits

Suggested:

```text
10 AI-analysis requests / 10 minutes / authenticated user
```

Also consider one active analysis request per case at a time.

### Side effects

On successful AI processing:

- Creates/replaces the MVP's `AIAnalysis` record for the case.
- Updates relevant `Case` fields such as:
  - `severity`
  - `severityReason`
  - `reportingDirection`
  - `reportingChannel`
- Creates a `TimelineEvent`:

```text
AI_ANALYSIS_COMPLETED
```

On AI failure:

- Do **not** create a fake `AIAnalysis` record.
- Do **not** claim analysis completed.
- Keep the case accessible.

---

# 3.5 Generate Complaint

### Endpoint

```http
POST /api/cases/:caseId/complaint
```

### Purpose

Generate a reviewable formal complaint from the case information.

This supports:

- F-007 Formal Complaint Generator
- FR-010
- NFR-003 Accuracy and Truthfulness
- NFR-004 Legal/Regulatory Caution

### Authentication / Authorization

**Required:** Authenticated user.

Allowed:

- Case reporter
- Authorized authority user where the workflow permits

The reporter must be able to review the complaint before using it.

### Request shape

Optional user editing/context:

```json
{
  "additionalInstructions": "Keep the complaint concise and suitable for submitting to the concerned civic authority."
}
```

The backend should supply the authoritative case facts.

### Response shape

```json
{
  "complaint": {
    "draft": "To the concerned authority,\n\nI am writing to report a large pothole near the main bus stop in Tirur. According to my report, the pothole is making it difficult for motorcycles to pass safely. I have attached a photograph showing the reported condition.\n\nI request that the concerned authority review the issue and take appropriate action.\n\nSincerely,\nReporter",
    "reviewRequired": true,
    "aiAssisted": true
  }
}
```

### Validation rules

- Case must exist.
- User must be authorized to access the case.
- AI may only use supplied/verified case information.
- No unsupported claims may be added.
- No invented evidence or events.
- No definitive legal conclusions.
- Complaint must remain a draft until the user explicitly proceeds.
- The complaint must be editable/reviewable before handoff.

### Error cases

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User cannot access the case.

```text
404 Not Found
```

Case does not exist.

```text
422 Unprocessable Entity
```

Insufficient information to produce a useful complaint.

```text
429 Too Many Requests
```

Complaint-generation rate limit exceeded.

```text
502 Bad Gateway
```

AI provider failure.

```text
504 Gateway Timeout
```

AI provider timeout.

```text
500 Internal Server Error
```

Unexpected backend failure.

### Rate limits

Suggested:

```text
10 complaint-generation requests / 10 minutes / authenticated user
```

### Side effects

On success:

- Saves the complaint to `Case.complaintDraft`.
- Creates a `TimelineEvent`:

```text
COMPLAINT_PREPARED
```

No official submission occurs.

---

# 3.6 Record Official Handoff

### Endpoint

```http
POST /api/cases/:caseId/handoff
```

### Purpose

Move the case from complaint preparation toward the appropriate official reporting channel while maintaining an honest submission state.

This supports:

- F-008 Official Reporting / Handoff
- F-024 Transparent Case State
- FR-011
- NFR-011

### Authentication / Authorization

**Required:** Authenticated case reporter.

The citizen must have permission to access the case.

### Request shape

For the MVP's official-channel handoff:

```json
{
  "action": "HANDOFF",
  "channel": "OFFICIAL_CIVIC_COMPLAINT_CHANNEL"
}
```

If a real integration exists later, the request can carry an integration-specific operation, but the MVP should not invent one.

### Response shape

```json
{
  "handoff": {
    "status": "HANDED_OFF",
    "channel": "OFFICIAL_CIVIC_COMPLAINT_CHANNEL",
    "message": "Your complaint is ready for the official reporting channel. CivicProof has not claimed official submission unless confirmation is received.",
    "confirmedOfficialSubmission": false
  }
}
```

If the product only provides a link/instructions:

```json
{
  "handoff": {
    "status": "READY_FOR_OFFICIAL_HANDOFF",
    "channel": "OFFICIAL_CIVIC_COMPLAINT_CHANNEL",
    "message": "Continue through the official channel to submit the complaint.",
    "confirmedOfficialSubmission": false
  }
}
```

### Validation rules

- Case must exist.
- User must be the authorized reporter.
- Complaint draft must exist before handoff.
- Reporting direction/channel must be available or explicitly selected from a trusted configured option.
- Never mark `CONFIRMED_SUBMISSION` without genuine external confirmation.
- Never infer official acknowledgment from the fact that the user clicked a button.
- Do not fabricate an authority response.
- The official channel information should come from trusted application configuration, not arbitrary user text.

### Error cases

```text
400 Bad Request
```

Invalid handoff action.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User is not the case reporter/authorized actor.

```text
404 Not Found
```

Case does not exist.

```text
409 Conflict
```

Case is not ready for the requested handoff state.

```text
503 Service Unavailable
```

Configured official channel is temporarily unavailable.

```text
500 Internal Server Error
```

Unexpected backend failure.

### Rate limits

Suggested:

```text
5 handoff actions / hour / authenticated user / case
```

This mainly protects against accidental repeated state transitions.

### Side effects

Depending on the actual MVP handoff behavior:

- Updates `Case.handoffStatus`.
- May update the case status.
- Creates a `TimelineEvent`:

```text
OFFICIAL_HANDOFF
```

It must **not** create a false official submission or acknowledgment.

---

# 3.7 Authority Update Case Status

### Endpoint

```http
PATCH /api/cases/:caseId/status
```

### Purpose

Allow an authorized authority user to update case progress.

This supports:

- F-011 Authority Case Review
- F-012 Authority Status Updates
- F-010 Case Status & Timeline
- F-023 Permission-Aware Case Access

### Authentication / Authorization

**Required:** Authenticated user with:

```text
role == AUTHORITY
```

and access to the case.

For the MVP:

```text
case.authorityUserId == currentUser.id
```

### Request shape

```json
{
  "status": "IN_PROGRESS",
  "progressMessage": "The reported location has been reviewed and the issue has been forwarded for inspection."
}
```

Possible MVP statuses:

```text
CREATED
READY_FOR_HANDOFF
HANDED_OFF
IN_REVIEW
IN_PROGRESS
RESOLVED
```

Only implement the smallest status set actually used by the UI.

### Response shape

```json
{
  "case": {
    "caseId": "CP-2026-000184",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-09-12T18:30:00+05:30"
  },
  "timelineEvent": {
    "eventType": "STATUS_UPDATED",
    "title": "Case status updated",
    "description": "The reported location has been reviewed and the issue has been forwarded for inspection.",
    "createdAt": "2026-09-12T18:30:00+05:30"
  }
}
```

### Validation rules

- User must be authenticated.
- User role must be `AUTHORITY`.
- User must be authorized for the case.
- Status must be a valid allowed state.
- Invalid state transitions should be rejected.
- `progressMessage` should be required for meaningful progress updates.
- Authority updates must not rewrite historical timeline events.
- The backend determines the actor; the client cannot impersonate another authority.

### Error cases

```text
400 Bad Request
```

Invalid status or malformed request.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User is not an authorized authority for the case.

```text
404 Not Found
```

Case does not exist.

```text
409 Conflict
```

Requested status transition is not valid for the current case state.

```text
500 Internal Server Error
```

Database/server failure.

### Rate limits

Suggested:

```text
60 status updates / hour / authority user
```

### Side effects

- Updates `Case.status`.
- Updates `Case.updatedAt`.
- Creates a `TimelineEvent` with:
  - `eventType = STATUS_UPDATED`
  - authenticated authority as `actorUserId`

---

# 3.8 Record Resolution

### Endpoint

```http
POST /api/cases/:caseId/resolution
```

### Purpose

Record an actual authority resolution and complete the MVP case journey.

This supports:

- F-013 Record Resolution
- FR-018
- F-010 Case Status & Timeline

### Authentication / Authorization

**Required:** Authenticated authority user.

Must be authorized for the case.

For the MVP:

```text
role == AUTHORITY
AND
case.authorityUserId == currentUser.id
```

### Request shape

```json
{
  "resolutionText": "The reported pothole was inspected and repair work was completed."
}
```

### Response shape

```json
{
  "case": {
    "caseId": "CP-2026-000184",
    "status": "RESOLVED",
    "resolutionText": "The reported pothole was inspected and repair work was completed.",
    "resolvedAt": "2026-09-12T19:00:00+05:30"
  },
  "timelineEvent": {
    "eventType": "RESOLUTION_RECORDED",
    "title": "Case resolved",
    "description": "The reported pothole was inspected and repair work was completed.",
    "createdAt": "2026-09-12T19:00:00+05:30"
  }
}
```

### Validation rules

- User must be authenticated.
- User must be an authorized authority.
- Case must exist.
- Case must not already be resolved unless an explicit future correction workflow exists.
- `resolutionText` is required.
- Resolution must represent an actual recorded authority action in the prototype.
- The backend must not infer resolution merely because an authority opened the case.
- `resolvedAt` is generated by the backend.
- The client cannot choose the resolution timestamp.

### Error cases

```text
400 Bad Request
```

Missing/invalid resolution information.

```text
401 Unauthorized
```

No authenticated user.

```text
403 Forbidden
```

User is not an authorized authority.

```text
404 Not Found
```

Case does not exist.

```text
409 Conflict
```

Case is already resolved or cannot transition to resolved state.

```text
500 Internal Server Error
```

Database/server failure.

### Rate limits

Suggested:

```text
20 resolution attempts / hour / authority user
```

### Side effects

- Updates `Case.status = RESOLVED`.
- Saves `Case.resolutionText`.
- Sets `Case.resolvedAt`.
- Updates `Case.updatedAt`.
- Creates `TimelineEvent`:

```text
RESOLUTION_RECORDED
```

---

# 4. Backend → External API Calls

## MVP Decision

**No external API is required for the core MVP.**

The architecture document marks external integrations as optional. The MVP only needs a legitimate official-channel handoff and must not pretend that a government/authority system accepted a complaint.

Therefore:

```text
Backend → External Authority API
        ↓
NOT REQUIRED FOR MVP
```

### Official channel handling

The backend can use trusted, application-configured information such as:

```json
{
  "name": "Official civic complaint channel",
  "type": "WEB",
  "url": "configured-official-channel"
}
```

The application must not invent URLs or authorities.

If a genuine official integration is added later, it should be implemented as a separate backend integration layer and only advance the case to `CONFIRMED_SUBMISSION` when the external system genuinely confirms receipt.

### No fake integration

The MVP must never do:

```text
User clicks "Submit"
        ↓
CivicProof writes "Officially submitted"
```

unless a real external system actually confirms submission.

---

# 5. Backend → AI API Calls

AI calls are server-side only.

The browser must **not** receive or use the AI provider secret/API key.

## 5.1 AI Case Analysis

### Backend operation

```text
POST /api/cases/:caseId/ai-analysis
        ↓
Backend validates authorization
        ↓
Backend loads required case information
        ↓
Backend sends minimal required data to AI provider
        ↓
AI returns structured analysis
        ↓
Backend validates AI output
        ↓
Backend stores AIAnalysis
        ↓
Backend updates relevant Case fields
```

### Information sent to AI

Only information necessary for the requested analysis, such as:

```json
{
  "incidentType": "POTHOLE",
  "description": "There is a large pothole near the main bus stop.",
  "incidentDateTime": "2026-09-12T17:30:00+05:30",
  "location": "Main bus stop, Tirur"
}
```

For sensitive cases, minimize personal information wherever possible.

### Required AI output

```json
{
  "summary": "string",
  "structuredData": {},
  "severitySuggestion": "LOW | MEDIUM | HIGH | URGENT",
  "severityReason": "string",
  "reportingSuggestion": "string",
  "reportingChannel": "string"
}
```

The backend should validate that the AI response follows the expected structure before storing it.

---

## 5.2 AI Complaint Generation

### Backend operation

```text
POST /api/cases/:caseId/complaint
        ↓
Backend validates authorization
        ↓
Backend loads case + relevant AI analysis
        ↓
Backend sends required information to AI provider
        ↓
AI returns complaint draft
        ↓
Backend validates response
        ↓
Backend stores Case.complaintDraft
```

### Required AI behavior

The complaint generator must:

- use supplied case facts
- preserve uncertainty where facts are uncertain
- avoid invented claims
- avoid invented evidence
- avoid definitive legal conclusions
- produce a reviewable draft

---

# 6. AI API Safety Rules

All backend AI calls must follow these rules:

### AI may

- structure supplied information
- summarize supplied information
- suggest severity
- suggest reporting direction
- draft complaint wording

### AI may not

- determine guilt
- determine criminal liability
- invent facts
- invent evidence
- invent laws
- invent authorities
- claim official submission
- claim authority acknowledgment
- claim resolution

### Important data distinction

```text
User-provided information
        ≠
AI-generated interpretation
        ≠
Verified authority information
```

The API must preserve these distinctions.

---

# 7. Endpoint Summary

## Frontend → Backend

| Method | Endpoint | User | Purpose | Priority |
|---|---|---|---|---|
| `POST` | `/api/cases` | Citizen | Create case | P0 |
| `POST` | `/api/cases/:caseId/evidence` | Citizen/authorized authority | Upload evidence | P0 |
| `GET` | `/api/cases/:caseId` | Authorized user | Read case/status/timeline | P0 |
| `POST` | `/api/cases/:caseId/ai-analysis` | Authorized user | AI case analysis | P0 |
| `POST` | `/api/cases/:caseId/complaint` | Authorized user | Generate complaint | P0 |
| `POST` | `/api/cases/:caseId/handoff` | Citizen | Official handoff | P0 |
| `PATCH` | `/api/cases/:caseId/status` | Authority | Update case status | P0 |
| `POST` | `/api/cases/:caseId/resolution` | Authority | Record resolution | P0 |

## Backend → External APIs

```text
None required for MVP.
```

External authority integrations are optional and must never be simulated as real.

## Backend → AI APIs

| Operation | Used by | Purpose |
|---|---|---|
| AI Case Analysis | `/api/cases/:caseId/ai-analysis` | Structure, summarize, severity, reporting direction |
| AI Complaint Generation | `/api/cases/:caseId/complaint` | Generate reviewable complaint draft |

---

# 8. Deliberately Excluded Endpoints

The following endpoints are **not part of the MVP**:

```text
POST /api/notifications
```

Reason: notifications are excluded.

```text
POST /api/cases/:caseId/escalate
```

Reason: automatic escalation is excluded.

```text
GET /api/public/cases
```

Reason: there is no public case feed.

```text
GET /api/public/offenders
```

Reason: public alleged-offender identification is explicitly prohibited.

```text
POST /api/chat
```

Reason: real-time chat is excluded.

```text
POST /api/legal/analyze
```

Reason: the MVP does not require an automated legal decision engine.

```text
POST /api/cases/:caseId/deepfake-detection
```

Reason: advanced evidence/deepfake analysis is outside the MVP.

```text
POST /api/cases/:caseId/duplicate-check
```

Reason: duplicate/related-incident clustering is excluded.

```text
POST /api/cases/:caseId/assign
```

Reason: complex authority assignment is P1; the MVP can use the existing `authorityUserId` relationship.

```text
GET /api/authorities
```

Reason: the MVP database deliberately does not include an authority directory. Reporting-direction information can come from bounded AI/configured data.

---

# 9. Final API Boundary

The MVP API should remain this small:

```text
                    FRONTEND
                       │
        ┌──────────────┼─────────────────┐
        │              │                 │
        ▼              ▼                 ▼
   Case CRUD       Evidence          AI requests
        │              │                 │
        └──────────────┼─────────────────┘
                       ▼
                    BACKEND
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
      DATABASE                   AI API
          │
          ▼
   Case + Evidence
   AIAnalysis
   TimelineEvent
```

And, only where genuinely available:

```text
BACKEND
   │
   ▼
Official External Channel
   │
   ▼
Confirmed submission
       only when actually confirmed
```

The API should optimize for the hackathon's core proof:

```text
INCIDENT
   ↓
CASE
   ↓
EVIDENCE
   ↓
AI ASSISTANCE
   ↓
COMPLAINT
   ↓
OFFICIAL HANDOFF
   ↓
CASE ID + TIMELINE
   ↓
AUTHORITY UPDATE
   ↓
RESOLUTION
```

Anything outside this journey should be deferred.
