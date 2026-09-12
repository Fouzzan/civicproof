# 10 — Technology Stack

> **Superseded on two points.** This document selects Claude as the AI provider and SQLite as the database. **The implementation uses Google Gemini and Prisma/Neon PostgreSQL**, and those are the intended choices — Gemini because there is no budget for a paid AI API, and Prisma/Neon because it already worked and migrating it would have spent hackathon time for no product gain.
>
> Read every "Claude" and "SQLite" reference below as historical. `13-PRODUCT-DIRECTION.md` §4 records what actually runs.

This document validates the proposed technology stack against the architecture and MVP decisions in `01-PROBLEM.md` through `09-AI-DESIGN.md`.

The guiding principle is:

> **Choose the smallest reliable stack that can demonstrate Sahayak's end-to-end agent journey within the hackathon time limit.**

The proposed stack is intentionally simple: one Next.js application, one local database, one AI provider, and local-first deployment.

---

# 1. Proposed Stack

| Category | Choice |
|---|---|
| Frontend | **Next.js + TypeScript + Tailwind CSS** |
| Backend | **Next.js API Routes** |
| Database | ~~SQLite + better-sqlite3~~ → **Prisma + Neon PostgreSQL** (as built) |
| AI / Agent | ~~Claude API~~ → **Gemini API with tool use** (as built) |
| Hosting | **Local-first; Vercel if time allows** |

## Overall validation

**Decision: APPROVED for the MVP.**

The stack fits the architecture because:

- The frontend can provide the required conversational UI.
- Next.js API routes provide the required internal backend boundary.
- SQLite provides the minimal persistence needed for application/tracking state.
- Claude can power Sahayak's language understanding and tool-selection loop.
- Local-first execution minimizes deployment risk during a time-constrained hackathon.
- Keeping frontend and backend in one project avoids unnecessary service boundaries.

No part of this stack requires a multi-service or production-scale architecture.

---

# 2. Frontend — Next.js + TypeScript + Tailwind CSS

## Choice

**Next.js + TypeScript + Tailwind CSS**

The frontend will provide the citizen-facing conversational experience.

It should support:

- Chat-style interaction.
- Plain-language questions and responses.
- Eligibility result display.
- Filled application preview.
- User corrections.
- Explicit confirmation before simulated submission.
- Tracking ID display.
- Simulated status display.

## Why it fits

### Next.js

Next.js is a good fit because the backend is also being implemented in the same project.

This allows:

```text
Next.js application
├── Citizen UI
├── API routes
├── Agent orchestration
└── Database access
```

The team does not need to create and configure a separate frontend and backend application.

This directly supports the architecture decision that an internal API boundary is required while keeping the implementation small.

### TypeScript

TypeScript provides:

- Typed API request/response structures.
- Typed agent state.
- Typed tool inputs and outputs.
- Better protection against invalid application state.
- Easier coordination between frontend and backend code.

This is particularly useful for Sahayak because the agent passes structured data between multiple tools.

### Tailwind CSS

Tailwind provides a fast way to build the conversational UI without introducing a large component/styling system.

The MVP needs a polished but focused interface rather than a large design system.

## Alternative

Possible alternatives:

### React + Vite

This would provide a lightweight frontend, but would require a separate backend service or additional setup for the API layer.

That creates unnecessary project boundaries for this MVP.

### Plain React/CSS

Possible, but slower to build a polished responsive interface consistently.

### Component libraries

A component library could improve visual consistency, but adding and configuring another dependency is not necessary for the core hackathon journey.

If an existing project already uses a component library, reusing it is preferable to replacing it.

## Setup time

**Low**

Assuming the project already uses Next.js and TypeScript, the team can focus immediately on the chat experience rather than setting up a new frontend architecture.

Approximate new-project setup:

> **15–30 minutes**

Existing-project integration:

> **Near-zero architectural setup**

## Cost

**Free for local development.**

Next.js, TypeScript, and Tailwind can be used without a paid frontend license.

## Risks

### Risk: UI takes too much time

A chat interface can easily become over-designed.

**Mitigation:** Build the minimum screens/components needed for the core journey.

### Risk: Too much frontend state

The frontend should not become the source of truth for eligibility or application state.

**Mitigation:** Keep business state and rules in the backend.

### Risk: Styling consumes hackathon time

**Mitigation:** Prioritize usability and demo clarity over a complete design system.

---

# 3. Backend — Next.js API Routes

## Choice

**Next.js API Routes in the same project**

The backend exposes the internal API described in `08-API.md`.

Core endpoints:

```text
POST /api/chat
GET  /api/schemes
GET  /api/application/:id
```

The API layer coordinates:

- Sahayak's agent loop.
- Tool invocation.
- Database operations.
- Eligibility rules.
- Application state.
- Simulated submission.
- Status retrieval.

## Why it fits

This is one of the strongest choices for the hackathon.

The architecture requires:

> **Frontend → Internal API → Agent/backend logic → Database/AI**

It does not require:

> Frontend → separate backend service → separate agent service → separate database service

Using Next.js API routes gives the team one codebase and one development server.

### Advantages

- No separate backend project.
- No CORS configuration between frontend and backend.
- Shared TypeScript types.
- Simple local development.
- Easy deployment to Vercel later.
- Direct access to server-only secrets.
- Clear frontend/backend separation despite being in one repository.

## Alternative

### Separate Node.js/Express backend

This provides more explicit backend separation but introduces:

- Another project/process.
- More configuration.
- CORS concerns.
- Additional deployment decisions.
- More files and moving parts.

It is unnecessary for this MVP.

### NestJS

Powerful for larger backend applications, but significantly more structure than this five-hour prototype requires.

### Server Actions only

Could reduce API code, but the architecture already defines an internal API boundary and explicit endpoints.

Keeping the three endpoints provides a clearer separation and aligns with `08-API.md`.

## Setup time

**Very low**

If the project is already Next.js:

> **15–30 minutes for the backend structure**

Most of the actual work will be implementing the agent workflow and tools, not setting up the API framework.

## Cost

**Free locally.**

No separate backend hosting cost is required for the demo.

## Risks

### Risk: API routes become too large

Putting all agent logic into one route can create a difficult-to-maintain file.

**Mitigation:**

Keep the API route thin:

```text
/api/chat
    ↓
agent service
    ↓
tools
    ↓
database / rules
```

### Risk: Server/client boundary mistakes

AI keys and database access must never be exposed to the browser.

**Mitigation:** Keep Claude calls and database access in server-only modules.

### Risk: Next.js-specific deployment behavior

Some local code may behave differently when deployed.

**Mitigation:** Local demo is the primary target. Only deploy after the complete local flow works.

---

# 4. Database — SQLite + better-sqlite3

## Choice

**SQLite using `better-sqlite3`**

SQLite will provide the minimal persistence required by the MVP.

The database needs to support the conceptual entities already defined in `07-DATABASE.md`:

```text
USER
  │
  └── APPLICATION
          │
          └── SCHEME
```

The application must also retain enough state for:

- Draft application.
- User facts.
- Selected scheme.
- Confirmation state.
- Tracking ID.
- Simulated status.

## Why it fits

SQLite is particularly well suited to a short local hackathon because it is:

- Local.
- File-based.
- Fast.
- Simple to inspect.
- Easy to reset.
- Free.
- Sufficient for a single-user/demo workload.
- Does not require a database server.

The setup is essentially:

```text
Application
    ↓
better-sqlite3
    ↓
local .db file
```

No database account or network configuration is required.

## Alternative

### PostgreSQL

A stronger choice for production or a shared deployed application.

However, for this hackathon it introduces:

- Database provisioning.
- Connection configuration.
- Environment variables.
- Remote dependency.
- Potential network/connectivity issues.

PostgreSQL would become more attractive if the project needed reliable cloud persistence for multiple users.

### Prisma + SQLite

Prisma could provide a typed ORM layer and migrations.

However, if the team already has Prisma knowledge or an existing Prisma setup, keeping it can be reasonable.

For a brand-new minimal implementation, direct `better-sqlite3` access has less abstraction and less setup.

**Decision:** Use `better-sqlite3` directly unless the existing project already has a working ORM/data-access layer that would make switching more expensive than keeping it.

### In-memory storage

This would be even simpler, but it fails an important MVP requirement:

> The citizen must be able to return later and retrieve application status.

In-memory state is also fragile if the server restarts.

Therefore SQLite is preferred.

## Setup time

**Very low**

Approximate:

> **10–20 minutes**

This includes creating the database file, tables, and a small data-access layer.

## Cost

**Free.**

SQLite and `better-sqlite3` are open-source technologies and require no hosted database for the local demo.

## Risks

### Risk: SQLite is not ideal for serverless deployment

A local SQLite file is not a good persistence model for many serverless Vercel deployments because filesystem persistence should not be assumed.

**Mitigation:**

> **Do not make Vercel deployment a prerequisite for the MVP.**

If deployment becomes necessary, migrate the persistence layer to a hosted database rather than trying to force local SQLite into a production-like serverless setup.

### Risk: Concurrent users

SQLite is not the intended solution for a large multi-user production service.

**Mitigation:** The hackathon demo is a small controlled workload.

### Risk: Database file accidentally committed

**Mitigation:** Add the SQLite database file to `.gitignore`.

---

# 5. AI / Agent — Claude API with Tool Use

## Choice

**Claude API with tool use**

Claude powers the Sahayak agent.

The model is responsible for:

- Understanding natural-language citizen messages.
- Extracting structured facts.
- Determining the user's intent.
- Choosing among the available tools.
- Asking follow-up questions.
- Generating plain-language explanations.
- Helping map gathered information into application fields.
- Handling natural-language status requests.

The backend remains responsible for:

- Tool execution.
- Eligibility rules.
- Database state.
- Validation.
- Submission confirmation.
- State transitions.

## Why it fits

Claude's tool-use capability maps directly onto the agent design in `09-AI-DESIGN.md`.

Conceptually:

```text
Citizen message
      ↓
Claude / Sahayak
      ↓
Choose tool
      ↓
Tool executes
      ↓
Tool result
      ↓
Claude interprets result
      ↓
Next action / response
```

The five controlled tools are:

```text
SchemeMatcher
EligibilityChecker
FormFiller
ApplicationSubmitter
StatusTracker
```

This makes the agent genuinely agentic without requiring a complex agent framework.

### Important boundary

Claude should **not** directly decide official eligibility.

Instead:

```text
Claude
  ↓
Extract facts
  ↓
EligibilityChecker
  ↓
Controlled scheme rules
  ↓
Result
  ↓
Claude explains result
```

This preserves the architecture decision from `06-ARCHITECTURE-DECISION.md`.

## Alternative

### Gemini API

Gemini is a reasonable alternative and can support structured/tool-based workflows.

It may be preferable if the existing project already has a tested Gemini integration.

However, the proposed stack explicitly selects Claude, so switching providers solely for architectural reasons is unnecessary.

### OpenAI API

Also capable of tool/function calling and structured outputs.

The architecture would remain essentially the same.

### Local open-source model

This could reduce external API dependency but would introduce:

- Model installation.
- Hardware requirements.
- Model serving.
- More setup.
- Potentially weaker quality under hackathon conditions.

It is not appropriate for the five-hour MVP.

### Custom agent framework

A framework could provide abstractions for state and tool execution, but the MVP only has five tools and one focused workflow.

A lightweight custom agent loop is preferable.

## Setup time

**Low to medium**

Approximate:

> **20–45 minutes**

This includes:

- API key configuration.
- Model setup.
- Tool definitions.
- Agent loop.
- Structured output validation.
- Basic error handling.

The actual conversation/tool behavior will take longer to refine than the provider setup.

## Cost

**API usage is usage-based.**

Local application code can be run for free, but Claude API calls may incur provider charges depending on the selected model/account/usage.

For a short hackathon with controlled demo conversations, usage should be kept small.

### Cost-control strategy

- Keep prompts concise.
- Avoid sending unnecessary conversation history.
- Store structured facts instead of repeatedly sending redundant text.
- Use tool calls only when needed.
- Avoid autonomous loops with no clear stopping condition.
- Test using a small number of representative scenarios.

## Risks

### Risk: API availability

The demo depends on an external AI service.

**Mitigation:** Test the exact model and tool-use flow early.

### Risk: Invalid tool arguments

LLMs can produce malformed or incomplete tool inputs.

**Mitigation:** Validate every tool input on the backend before execution.

### Risk: Model tries to bypass rules

The model may attempt to reason about eligibility itself.

**Mitigation:** System instructions + tool architecture + backend validation must enforce that eligibility comes from `EligibilityChecker`.

### Risk: Excessive agent loops

An unrestricted agent loop can waste time and API calls.

**Mitigation:** Keep the action set small and impose reasonable iteration limits.

### Risk: Hallucinated government information

**Mitigation:** Sahayak must only discuss the configured scheme and its controlled rules. Unsupported information should result in a clear limitation.

---

# 6. Hosting — Local First

## Choice

**Local execution is the primary deployment target.**

Vercel is optional if the complete local demo is stable early enough.

## Why it fits

The architecture decision explicitly says the MVP should be runnable locally and cloud deployment is optional.

For a time-constrained hackathon, local execution has major advantages:

- No deployment configuration required.
- No production database migration required.
- No serverless SQLite problem.
- Faster debugging.
- Fewer environment-specific failures.
- Full control over the demo environment.

The priority should be:

```text
Reliable local demo
        ↓
Complete end-to-end journey
        ↓
Polish
        ↓
Optional Vercel deployment
```

## Alternative

### Vercel

Vercel is a natural fit for Next.js and can make the project easier to share.

However, deployment introduces additional concerns:

- Environment variables.
- AI API configuration.
- Database persistence.
- SQLite limitations.
- Production/serverless behavior.
- Deployment debugging.

Therefore Vercel should be treated as a bonus, not a dependency.

### Other cloud hosting

Possible, but provides no meaningful advantage for the hackathon MVP.

## Setup time

### Local

**Minimal**

Once dependencies are installed:

> **Near-zero deployment setup**

### Vercel

Potentially:

> **15–45+ minutes**

depending on database and environment configuration.

## Cost

### Local

**Free**, apart from any external AI API usage.

### Vercel

Can potentially be used within available free-tier capabilities, but the exact cost and limits depend on the account, usage, and services selected.

The MVP should not depend on paid cloud infrastructure.

## Risks

### Risk: Demo machine failure

A local-only demo depends on the machine being used for presentation.

**Mitigation:** Test the complete journey beforehand and keep a backup demo environment if practical.

### Risk: Vercel migration becomes a distraction

**Mitigation:** Only attempt deployment after the local journey is complete.

### Risk: SQLite persistence does not transfer cleanly

**Mitigation:** Treat database persistence as an abstraction behind the data-access layer so a hosted database can replace SQLite later if needed.

---

# 7. Stack-Level Architecture

The selected stack maps to the architecture as follows:

```text
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│        TypeScript + Tailwind CSS            │
│                                             │
│              Citizen Chat UI                │
└──────────────────────┬──────────────────────┘
                       │
                       │ Internal API
                       ▼
┌─────────────────────────────────────────────┐
│          Next.js Backend / API Routes       │
│                                             │
│              POST /api/chat                 │
│              GET  /api/schemes              │
│              GET  /api/application/:id      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│               Sahayak Agent                 │
│                                             │
│       Claude API + Tool Use                 │
│                                             │
│  Understand → Decide → Ask → Act            │
└───────┬──────────┬──────────┬───────────────┘
        │          │          │
        ▼          ▼          ▼
   Scheme      Eligibility   Form
   Matcher      Checker     Filler
        │          │          │
        └──────────┼──────────┘
                   │
             ┌─────┴─────────────┐
             ▼                   ▼
     ApplicationSubmitter   StatusTracker
             │                   │
             └─────────┬─────────┘
                       ▼
              ┌─────────────────┐
              │ SQLite database │
              │ better-sqlite3  │
              └─────────────────┘
```

---

# 8. Responsibility Boundaries

Keeping responsibilities clear is more important than the choice of individual libraries.

| Responsibility | Owner |
|---|---|
| Chat UI | Next.js frontend |
| User interaction state | Frontend + backend session state |
| Agent reasoning/orchestration | Sahayak + Claude |
| Natural-language understanding | Claude |
| Tool selection | Claude/Sahayak agent |
| Scheme matching | SchemeMatcher |
| Eligibility rules | EligibilityChecker |
| Eligibility decision | EligibilityChecker |
| Application preparation | FormFiller |
| Human confirmation | Backend state + citizen |
| Simulated submission | ApplicationSubmitter |
| Tracking ID | ApplicationSubmitter/backend |
| Status retrieval | StatusTracker |
| Persistence | SQLite |
| API boundary | Next.js API routes |

## Critical boundary

The frontend must never become the authority for:

- Eligibility.
- Application state.
- Submission.
- Tracking state.
- Status.

The LLM must never become the authority for:

- Eligibility rules.
- Application ownership.
- Submission authorization.
- Application status.

---

# 9. Hackathon Setup Order

Because the hackathon has limited time, implementation should follow the dependency order rather than setting up every technology first.

## Phase 1 — Run the existing app

```text
Next.js
TypeScript
Tailwind
```

Confirm the application runs locally.

## Phase 2 — Database

Set up:

```text
SQLite
better-sqlite3
```

Create the minimal schema and verify persistence.

## Phase 3 — Backend API

Implement:

```text
POST /api/chat
GET /api/schemes
GET /api/application/:id
```

Initially, these can use mocked agent behavior while the boundaries are established.

## Phase 4 — Sahayak

Add:

```text
Claude API
      ↓
Tool-use loop
      ↓
Controlled tools
```

Implement the tools in this order:

```text
SchemeMatcher
      ↓
EligibilityChecker
      ↓
FormFiller
      ↓
ApplicationSubmitter
      ↓
StatusTracker
```

## Phase 5 — Connect the UI

Connect the chat interface to `/api/chat`.

Then demonstrate:

```text
Situation
  ↓
Questions
  ↓
Eligibility
  ↓
Application
  ↓
Review
  ↓
Confirm
  ↓
Submit
  ↓
Tracking
  ↓
Status
```

## Phase 6 — Polish

Only after the full journey works:

- Improve visual design.
- Improve loading/error states.
- Improve wording.
- Improve demo transitions.
- Add optional Vercel deployment.

---

# 10. What Not to Add

The selected stack does **not** justify adding:

- Separate frontend and backend repositories.
- Express/NestJS service.
- Microservices.
- Redis.
- Vector database.
- RAG pipeline.
- Complex agent framework.
- Multiple LLM providers.
- Multiple agents.
- Long-term memory system.
- Hosted database before local MVP works.
- Kubernetes/container orchestration.
- Production authentication.
- Real government API integration.

These would increase technical complexity without improving the core hackathon demonstration.

---

# 11. Stack Risk Summary

| Area | Risk | Severity | Mitigation |
|---|---|---:|---|
| Next.js | UI/backend files become too coupled | Medium | Keep API and agent logic in separate modules |
| TypeScript | Over-engineering types | Low | Type only important state/tool contracts |
| Tailwind | UI consumes too much time | Medium | Build focused chat UI |
| API routes | Large `/api/chat` route | Medium | Thin route → agent service → tools |
| SQLite | Poor fit for serverless persistence | High if deployed | Local-first; migrate DB only if Vercel becomes necessary |
| Claude API | External dependency | Medium | Test early; keep prompts/tool calls controlled |
| Tool use | Invalid model arguments | Medium | Strict backend schemas and validation |
| Agent loop | Too many calls/steps | Medium | Small tool set + bounded loop |
| Local hosting | Machine dependency | Low | Test demo environment and keep backup |
| Vercel | Deployment complexity | Medium | Optional only after local success |

---

# 12. Alternative Stack Comparison

| Category | Selected | Main Alternative | Why Selected Wins for Hackathon |
|---|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind | React + Vite | One project can contain UI and backend |
| Backend | Next.js API routes | Express/NestJS | No separate backend setup |
| Database | SQLite + better-sqlite3 | PostgreSQL | No server/database provisioning |
| AI | Claude API + tool use | Gemini/OpenAI | Directly supports the proposed tool-using agent design |
| Agent framework | Lightweight custom loop | Agent framework | Less setup and more control |
| Hosting | Local | Vercel | Lowest deployment risk |
| Cloud database | None for MVP | Hosted PostgreSQL | Not required for local demo |

---

# 13. Final Stack

## FINAL STACK SUMMARY

| Category | Final Choice | Reason |
|---|---|---|
| **Frontend** | **Next.js + TypeScript + Tailwind CSS** | Fast, typed, polished UI and same-project backend support |
| **Backend** | **Next.js API Routes** | Minimal internal API boundary without a second service |
| **Database** | **SQLite + better-sqlite3** | Fastest reliable local persistence for the demo |
| **AI / Agent** | **Claude API with tool use** | Supports Sahayak's single-agent, controlled-tool workflow |
| **Agent Framework** | **Lightweight custom agent loop** | Avoids unnecessary framework complexity |
| **Hosting** | **Local-first** | Lowest risk; Vercel only after MVP is stable |

## Final architecture

```text
NEXT.JS APP
│
├── Frontend
│   ├── TypeScript
│   └── Tailwind CSS
│
├── Internal API
│   ├── POST /api/chat
│   ├── GET /api/schemes
│   └── GET /api/application/:id
│
├── Sahayak
│   └── Claude API + tool use
│       ├── SchemeMatcher
│       ├── EligibilityChecker
│       ├── FormFiller
│       ├── ApplicationSubmitter
│       └── StatusTracker
│
└── Persistence
    └── SQLite + better-sqlite3
```

### Final decision

> **Use one Next.js + TypeScript application with Tailwind on the frontend, Next.js API routes on the backend, SQLite via `better-sqlite3` for local persistence, Claude API with a lightweight custom tool-using agent loop for Sahayak, and local hosting as the primary demo environment.**

This stack is deliberately optimized for **speed, reliability, and the end-to-end hackathon demo**, not production scale.

The implementation should proceed only after the selected demonstration scheme and its authoritative eligibility rules are established.
