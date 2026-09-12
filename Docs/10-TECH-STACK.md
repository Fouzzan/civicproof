# CivicProof --- Technology Stack Decision

## Purpose

This document selects the **simplest technology choices that satisfy the
architecture already decided in `docs/06-ARCHITECTURE-DECISION.md`**.

The goal is not to build the most sophisticated system. The goal is to
build a reliable, polished MVP within a **\~4-hour hackathon window**.

The architecture requires:

-   UI
-   Backend
-   Persistent relational database
-   Internal API
-   AI
-   Authentication

Cloud deployment is optional architecturally, but strongly preferred for
the hackathon demo.

Agents and background processing are **NOT REQUIRED** and are
intentionally excluded.

------------------------------------------------------------------------

# 1. Decision Summary

  -----------------------------------------------------------------------
  Category                Final Choice            Why
  ----------------------- ----------------------- -----------------------
  **Frontend**            **Next.js + React +     Gives us the UI and
                          TypeScript + Tailwind   backend in one
                          CSS + shadcn/ui**       application while
                                                  making a polished
                                                  mobile-first interface
                                                  fast to build.

  **Backend**             **Next.js Route         Provides the required
                          Handlers**              server-side logic and
                                                  internal API without
                                                  introducing a separate
                                                  backend project.

  **Database**            **Neon PostgreSQL +     Satisfies the required
                          Prisma**                persistent relational
                                                  model and works cleanly
                                                  with a deployed Next.js
                                                  app.

  **AI**                  **OpenAI API**          Simple server-side API
                                                  integration for the
                                                  bounded AI Assistant
                                                  operations required by
                                                  the MVP.

  **Hosting**             **Vercel**              Natural deployment
                                                  target for Next.js and
                                                  extremely fast to
                                                  deploy/share for a
                                                  hackathon demo.
  -----------------------------------------------------------------------

### Supporting authentication choice

Because authentication is REQUIRED by the architecture, the MVP will use
**Clerk** for authentication and role-aware identity.

Clerk is intentionally treated as a supporting service rather than a
separate architectural category.

------------------------------------------------------------------------

# 2. Frontend --- Next.js + React + TypeScript + Tailwind + shadcn/ui

## Choice

**Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui**

This is one frontend stack rather than several independent technologies:

``` text
Next.js
  └── React + TypeScript
        ├── Tailwind CSS
        └── shadcn/ui
```

## Why it fits the architecture

The architecture requires a user-facing UI for:

-   Citizen incident reporting
-   Incident type selection
-   Evidence upload
-   AI analysis
-   Severity display
-   Reporting direction
-   Complaint review
-   Case ID
-   Case timeline
-   Authority dashboard
-   Authority status/resolution actions
-   Safety guidance
-   Sensitive-case indicators
-   Mobile-friendly usage

Next.js/React handles all of these in one application.

It also lets the frontend and backend live in the same project, which is
especially valuable in a four-hour hackathon.

## Why this is the simplest option

We do **not** need:

-   A separate React frontend repository
-   A separate Express backend repository
-   A separate API gateway
-   A mobile app
-   A native iOS/Android project

The same Next.js application can contain:

``` text
app/
  citizen pages
  authority pages
  case pages
  API route handlers
```

That reduces setup, configuration, debugging, and deployment work.

## Alternatives

### Alternative A --- React + Vite

React + Vite would be a very simple frontend.

However, it would leave us needing a separate backend such as
Express/Fastify/NestJS because the architecture explicitly requires
trusted server-side logic and an internal API.

That means:

``` text
React/Vite
     ↓
Separate backend
     ↓
Database
```

instead of:

``` text
Next.js
 ├── UI
 └── API/backend
```

For this hackathon, the additional project and deployment complexity is
not worthwhile.

### Alternative B --- React Native / Expo

This could provide a native mobile experience.

It is rejected because the requirement is **mobile-friendly**, not
native mobile. Building a web application is substantially faster for
the four-hour constraint.

### Alternative C --- Plain HTML/CSS/JavaScript

This would have the lowest initial setup cost but becomes awkward for:

-   Multiple workflows
-   Case state
-   Authority dashboard
-   Forms
-   Reusable components
-   API state
-   Authentication
-   Conditional sensitive-case UI

It is not the best choice for the actual MVP.

## Complexity and setup time

**Low.**

Approximate hackathon setup:

-   Create Next.js project: \~2--5 minutes
-   Tailwind/shadcn setup: \~5--10 minutes
-   Build initial pages/components: ongoing

Most of the remaining time goes toward actual product functionality
rather than framework configuration.

## Cost

The framework and UI libraries are free/open source.

There is no frontend licensing cost for the MVP.

## Real risks

### Risk 1 --- Next.js has many features

Next.js can become complicated if we start using every feature.

**Mitigation:** Use only:

-   App Router
-   React components
-   Route Handlers
-   Server-side environment variables
-   Basic server/client components

Avoid unnecessary server actions, middleware complexity, advanced
caching, streaming, etc.

### Risk 2 --- UI polish can consume the whole hackathon

shadcn/ui makes components easy to create, but we could waste time
perfecting them.

**Rule:** Build the complete workflow first. Polish only after the
end-to-end demo works.

------------------------------------------------------------------------

# 3. Backend --- Next.js Route Handlers

## Choice

**Next.js Route Handlers**

The backend and internal API will live inside the same Next.js project.

Example:

``` text
app/api/cases/route.ts
app/api/cases/[caseId]/route.ts
app/api/cases/[caseId]/ai-analysis/route.ts
app/api/cases/[caseId]/complaint/route.ts
app/api/cases/[caseId]/handoff/route.ts
app/api/cases/[caseId]/status/route.ts
app/api/cases/[caseId]/resolution/route.ts
```

## Why it fits the architecture

`06-ARCHITECTURE-DECISION.md` requires:

-   Trusted server-side case handling
-   Permission checks
-   Evidence association
-   Case ID generation
-   Status/timeline updates
-   AI calls without exposing API keys
-   Honest handoff states
-   An internal API

Route Handlers provide exactly that boundary.

The API document also explicitly defines a **small internal application
API**, not a public developer API.

Therefore we do not need a separate API service.

## Why this is the simplest option

The alternative would be:

``` text
Next.js frontend
      ↓
Express/Fastify backend
      ↓
Database
```

That creates another:

-   project
-   server
-   deployment
-   environment configuration
-   codebase boundary
-   source of bugs

For this MVP, there is no architectural reason to pay that complexity
cost.

## Alternatives

### Alternative A --- Express.js

Express is mature and simple.

However, it would require a separate backend application and deployment
strategy.

**Rejected for the hackathon because it duplicates infrastructure we
already get from Next.js.**

### Alternative B --- NestJS

NestJS provides excellent structure for large applications.

It is unnecessary for a small five-table hackathon MVP.

It would introduce more concepts and files than needed.

### Alternative C --- Separate Fastify API

Fastify is lightweight and fast, but still creates the same
two-application problem.

Not needed.

## Complexity and setup time

**Very low.**

No separate backend project is required.

The main work is implementing the small set of API endpoints already
defined in `08-API.md`.

## Cost

No additional software cost.

The backend runs as part of the Next.js application and can be deployed
with Vercel.

## Real risks

### Risk 1 --- Mixing UI and backend logic

A beginner could put database calls directly into client components.

**Rule:** Database access, authentication checks, AI API calls, and
permission decisions stay server-side.

### Risk 2 --- Serverless execution limits

Large video processing or heavy workloads would eventually need
background processing.

That is explicitly outside the MVP.

For the hackathon, keep evidence files small and AI operations bounded.

------------------------------------------------------------------------

# 4. Database --- Neon PostgreSQL + Prisma

## Choice

**Neon PostgreSQL + Prisma**

The database remains a conventional relational PostgreSQL database.

Prisma is the ORM used to interact with it.

## Why it fits the architecture

The database decision requires:

-   Persistent data
-   Relational structure
-   Case records
-   Users
-   Evidence references
-   AI analysis
-   Timeline events
-   Authority state
-   Resolution state

The database design contains five core entities:

``` text
User
  ↓
Case
 ├── Evidence
 ├── AIAnalysis
 └── TimelineEvent
```

PostgreSQL is directly suited to this model.

Prisma makes the five-table schema straightforward to define and query
from TypeScript.

## Why not SQLite?

SQLite is arguably the simplest database to start locally.

However, the hackathon product should preferably be deployed so judges
can access it.

A local SQLite file introduces deployment/persistence complications in
serverless environments.

We would then have to think about:

-   filesystem persistence
-   deployment storage
-   writable volumes
-   database synchronization

That is unnecessary risk.

**PostgreSQL avoids this problem.**

## Why Neon?

Neon provides hosted PostgreSQL without requiring us to manage a
database server.

The important hackathon property is:

``` text
PostgreSQL
     +
Hosted
     +
Works with deployed Next.js
     +
No database server to administer
```

## Alternatives

### Alternative A --- Supabase PostgreSQL

Supabase is a strong alternative and also provides
authentication/storage/backend services.

However, CivicProof does not need the full Supabase platform for the
MVP.

Adding another broad platform could make it tempting to use:

-   Supabase Auth
-   Supabase Storage
-   Supabase Edge Functions
-   Supabase APIs

That would expand the technology surface unnecessarily.

For this architecture, we only need a persistent relational database.

### Alternative B --- MongoDB

MongoDB could store the case documents flexibly.

It is rejected because our database design is already a small, clearly
relational model with:

-   Users
-   Cases
-   Evidence
-   AI analysis
-   Timeline events

A relational database is the more direct match.

### Alternative C --- Local SQLite

Very simple locally, but less convenient for a deployed multi-user demo.

## Complexity and setup time

**Low to medium.**

Expected setup:

1.  Create Neon database.
2.  Add PostgreSQL connection string.
3.  Install Prisma.
4.  Define the five models.
5.  Run the migration.
6.  Generate Prisma client.

Once configured, CRUD operations become straightforward.

Approximate initial setup: **10--20 minutes** for someone following a
guided setup.

## Cost

Neon provides a free tier suitable for a small hackathon/demo workload.

The expected CivicProof workload is tiny:

-   few users
-   few cases
-   low concurrency
-   small evidence metadata
-   user-triggered AI requests

Therefore there is no reason to pay for a production database during the
hackathon.

## Real risks

### Risk 1 --- Prisma setup errors

Database URLs, migrations, and Prisma versions can cause setup friction.

**Mitigation:** Set up the database early, before building the full
workflow.

### Risk 2 --- Evidence files are not database rows

The architecture explicitly says the database stores evidence
references, not actual file bytes.

For the four-hour MVP, evidence storage should remain deliberately
simple.

### Risk 3 --- Production privacy requirements are much stronger

A hackathon database is not automatically production-ready for sensitive
reports.

For the demo:

-   enforce authentication
-   enforce server-side case authorization
-   do not expose sensitive cases publicly
-   never put private evidence in public URLs
-   avoid real sensitive personal data

A real deployment would require a much deeper privacy/security review.

------------------------------------------------------------------------

# 5. AI --- OpenAI API

## Choice

**OpenAI API**, called only from the Next.js server.

The AI layer is a bounded **AI Assistant**, not an agent.

The application will use it for the two primary operations defined in
`09-AI-DESIGN.md`:

### Operation A --- Case Analysis

``` text
Incident information
       ↓
OpenAI API
       ↓
Structured result
 ├── summary
 ├── structured data
 ├── severity suggestion
 └── reporting-direction assistance
```

### Operation B --- Complaint Generation

``` text
Case information
       ↓
OpenAI API
       ↓
Reviewable complaint draft
```

## Why it fits the architecture

The architecture requires AI because it is a P0 product capability.

The AI design specifically says the lowest suitable level is an **AI
Assistant**.

OpenAI's API can perform the required natural-language tasks without
introducing:

-   autonomous agents
-   tool-using loops
-   multi-agent orchestration
-   vector databases
-   AI memory
-   background workers

The backend controls when the AI is called and exactly what information
is sent.

## Why not build our own ML model?

The MVP needs:

-   natural-language understanding
-   summarization
-   structured extraction
-   complaint drafting
-   reporting guidance

Training a custom model would be dramatically more complex and would not
help us finish the hackathon.

## Alternatives

### Alternative A --- Anthropic API

Technically a strong fit because Claude is capable of the same bounded
language tasks.

However, the team already has Claude Max for development assistance, and
a Claude Max subscription should **not** be assumed to provide API
credits.

Using a separate API still requires API billing/configuration.

For the application itself, we choose OpenAI to keep the product
integration independent from the development assistant being used in VS
Code.

### Alternative B --- Google Gemini API

Also technically suitable and potentially attractive for low-cost
experimentation.

However, adding another provider solely to optimize a small hackathon
bill is not worth introducing additional decision complexity.

### Alternative C --- Local model

Running a local model would avoid API usage costs but introduces:

-   model installation
-   hardware requirements
-   model selection
-   latency
-   reliability issues
-   much more setup

Not suitable for a four-hour build.

### Alternative D --- AI Agent framework

Rejected.

The architecture explicitly says agents are not required.

CivicProof only needs:

``` text
User action
   ↓
Bounded AI call
   ↓
Structured result
```

not:

``` text
AI decides what to do
   ↓
AI chooses tools
   ↓
AI navigates websites
   ↓
AI submits
   ↓
AI checks results
   ↓
AI retries
```

## Complexity and setup time

**Low.**

Basic setup is:

1.  Create API key.
2.  Store it as a server-side environment variable.
3.  Install the official SDK.
4.  Create two server-side AI functions.
5.  Validate the returned structured data.
6.  Display the result as AI-assisted.

Approximate initial setup: **5--15 minutes**, assuming API access is
already available.

## Cost

The API is usage-based rather than included automatically with a
ChatGPT/Claude subscription.

For a small hackathon demo, usage should be low if the application makes
only a few calls per case.

The important rule is:

> **Do not send repeated AI requests on every keystroke or page
> render.**

Call AI only when the user explicitly requests analysis or complaint
generation.

## Real risks

### Risk 1 --- Hallucination

This is the largest application-level risk.

The AI could invent:

-   facts
-   authorities
-   laws
-   evidence
-   legal conclusions

**Mitigation:**

-   strict prompts
-   structured output
-   output validation
-   AI labeling
-   trusted configured reporting information
-   human review
-   never allow AI to perform official actions

### Risk 2 --- Sensitive information sent to a third party

CivicProof may handle sensitive reports.

**Mitigation for the MVP:**

-   send only necessary information
-   avoid unnecessary personal information
-   do not use real sensitive victim data during the demo
-   keep AI calls server-side
-   review the selected provider's current data-handling terms before
    production use

### Risk 3 --- API failure

If the AI provider is unavailable, the case should not disappear or
pretend that analysis succeeded.

The case remains usable and the UI should show an explicit AI
failure/fallback state.

### Risk 4 --- API key exposure

Never put the AI key in frontend code.

It must exist only in server-side environment variables.

------------------------------------------------------------------------

# 6. Hosting --- Vercel

## Choice

**Vercel**

## Why it fits the architecture

Cloud deployment is optional in the architecture, but it is highly
valuable for the hackathon.

Vercel is particularly suitable because CivicProof is built with
Next.js.

Deployment becomes:

``` text
GitHub
   ↓
Vercel
   ↓
Live CivicProof URL
```

This allows:

-   judges to open the product
-   teammates to test from different devices
-   mobile workflow testing
-   easy sharing
-   a professional demonstration

## Why this is the simplest option

A separate VPS would require:

-   server setup
-   deployment configuration
-   process management
-   domain configuration
-   SSL handling
-   more debugging

Vercel removes most of that.

## Alternatives

### Alternative A --- Local development only

Technically acceptable because cloud deployment is optional.

However, it is weaker for a hackathon because judges may not be able to
access the product easily.

**Use local development as the fallback, not the primary demo.**

### Alternative B --- Netlify

A valid web-hosting option, but Vercel has a more natural fit with
Next.js.

### Alternative C --- Railway / Render

Both can host full-stack applications, but they add more
server/deployment concepts than necessary for this particular Next.js
application.

## Complexity and setup time

**Very low.**

Typical deployment flow:

``` text
Push repository to GitHub
        ↓
Import into Vercel
        ↓
Add environment variables
        ↓
Deploy
```

Initial deployment can often be completed in roughly **5--10 minutes**,
excluding debugging.

## Cost

Vercel has a free/hobby option suitable for a small hackathon demo,
subject to its current usage limits and terms.

The expected traffic is tiny.

## Real risks

### Risk 1 --- Environment variables

The deployed app needs:

-   database URL
-   AI API key
-   authentication configuration

These must be configured in Vercel.

### Risk 2 --- Serverless limitations

Very large uploads and long-running processing are not ideal.

That is another reason the MVP should avoid:

-   large video processing
-   background jobs
-   forensic analysis
-   long-running AI tasks

### Risk 3 --- Free-tier limits

A public demo could theoretically exceed service limits.

For a small hackathon demonstration this is unlikely, but the team
should know the limits before production deployment.

------------------------------------------------------------------------

# 7. Authentication --- Supporting Technology

Authentication is not optional in the architecture.

## Choice

**Clerk**

Use Clerk only for:

-   user authentication
-   current-user identity
-   basic role distinction

The application/database remains responsible for case authorization.

Example:

``` text
Clerk
  ↓
Who is this user?
  ↓
CivicProof backend
  ↓
What may this user access?
```

## Why Clerk

Implementing secure authentication from scratch during a four-hour
hackathon is a poor use of time.

Clerk provides a ready-made authentication flow while allowing the
application to obtain the authenticated user identity.

## Important boundary

Authentication does **not** mean:

> "If Clerk says the user is logged in, they can access every case."

The backend still checks:

``` text
Citizen:
case.reporterId === currentUser.id

Authority:
case.authorityUserId === currentUser.id
```

Sensitive cases remain private.

## Alternative

**Auth.js** would reduce dependence on a third-party authentication
platform and is a valid long-term option.

However, for a four-hour hackathon, Clerk is simpler to get working
reliably.

## Real risk

Authentication providers add another external dependency and may have
plan/configuration constraints.

For the hackathon, this is acceptable because authentication is a
genuine architectural requirement and implementing it ourselves would
consume valuable time.

------------------------------------------------------------------------

# 8. File / Evidence Storage Decision

Evidence upload is P0, so the technology stack needs a practical storage
strategy.

For the **four-hour MVP**, do not build a sophisticated file-storage
architecture.

Use **Vercel Blob** for uploaded evidence if the account/project is
configured for it.

The database stores:

``` text
Evidence
 ├── fileName
 ├── fileType
 ├── storageReference
 ├── caseId
 └── uploadedBy
```

The actual file lives in object storage.

## Why

This follows the database design: evidence metadata belongs in the
relational database, while actual file bytes stay outside the case row.

## Hackathon rule

Keep the supported evidence types narrow:

-   images first
-   small files only

Do not attempt:

-   forensic chain of custody
-   deepfake detection
-   video transcoding
-   virus scanning pipeline
-   evidence authenticity verification

Those are outside the MVP.

------------------------------------------------------------------------

# 9. Why We Are NOT Using More Technologies

The stack intentionally avoids:

  -----------------------------------------------------------------------
  Technology / Pattern    Decision                Reason
  ----------------------- ----------------------- -----------------------
  Express backend         **NO**                  Next.js already
                                                  provides the required
                                                  backend/API boundary.

  NestJS                  **NO**                  Too much structure for
                                                  a five-table MVP.

  React Native            **NO**                  Mobile-friendly web is
                                                  sufficient.

  Microservices           **NO**                  No independent scaling
                                                  requirement.

  Redis                   **NO**                  No caching/queue
                                                  requirement.

  Kafka/Event streaming   **NO**                  Timeline events can be
                                                  stored normally.

  BullMQ/background       **NO**                  Background processing
  workers                                         is not required.

  AI Agents               **NO**                  Bounded AI Assistant
                                                  operations are
                                                  sufficient.

  Vector database         **NO**                  Persistent AI
                                                  memory/RAG is not
                                                  required for P0.

  Custom ML model         **NO**                  General AI API is much
                                                  simpler for language
                                                  tasks.

  MongoDB                 **NO**                  Relational case model
                                                  fits PostgreSQL better.

  Kubernetes              **NO**                  Completely unnecessary
                                                  for hackathon scale.

  Separate API gateway    **NO**                  Internal API only.

  Public developer API    **NO**                  Not part of the MVP.

  Full government         **NO**                  Official handoff is
  integrations                                    sufficient.

  Native mobile app       **NO**                  Explicitly outside MVP.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 10. Overall Complexity

The selected architecture is intentionally:

``` text
                 ┌──────────────────────┐
                 │      Next.js         │
                 │                      │
                 │  React UI            │
                 │  Tailwind/shadcn     │
                 │                      │
                 │  Route Handlers      │
                 │  Backend/API         │
                 └──────────┬───────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌─────────────┐
        │  Neon    │  │ OpenAI   │  │   Clerk     │
        │ Postgres │  │   API    │  │    Auth     │
        └──────────┘  └──────────┘  └─────────────┘
                            │
                            ▼
                     Vercel deployment
```

This is a **modular monolith with managed services**, not a distributed
system.

That is exactly what the architecture requires.

------------------------------------------------------------------------

# 11. Hackathon Setup Priority

Do not configure everything at once.

Recommended order:

## Step 1 --- Next.js

Get the application running locally.

``` text
Next.js
↓
Tailwind
↓
shadcn/ui
```

## Step 2 --- Database

Get Neon + Prisma working immediately.

Create the five models.

## Step 3 --- Authentication

Get Clerk working enough to distinguish:

``` text
CITIZEN
AUTHORITY
```

## Step 4 --- Backend/API

Implement the smallest API path:

``` text
Create Case
↓
Get Case
↓
Update Case
```

## Step 5 --- Evidence

Add image upload/storage.

## Step 6 --- AI

Add:

``` text
Analyze Case
↓
Generate Complaint
```

## Step 7 --- Authority Workflow

Add:

``` text
Authority Review
↓
Status Update
↓
Resolution
```

## Step 8 --- Deploy

Push to GitHub and deploy to Vercel.

## Step 9 --- Polish

Only after the complete workflow works:

-   improve visual design
-   improve loading states
-   improve mobile layout
-   add empty/error states
-   improve demo data
-   tighten privacy indicators

------------------------------------------------------------------------

# 12. Estimated Setup Complexity

  Component                       Setup Difficulty   Approx. Initial Setup
  ----------------------------- ------------------ -----------------------
  Next.js + Tailwind + shadcn                  Low               5--15 min
  Next.js API                                  Low     0--5 min beyond app
  Neon + Prisma                        Low--Medium              10--20 min
  Clerk                                        Low               5--15 min
  OpenAI API                                   Low               5--15 min
  Vercel                                  Very Low               5--10 min
  Evidence storage                     Low--Medium               5--15 min

These are approximate engineering estimates, not guaranteed timings.

The critical strategy is to **start implementing the product before
every optional service is perfect**.

------------------------------------------------------------------------

# 13. Cost Strategy

The hackathon should target **\$0 infrastructure spend where possible**,
with AI API usage being the main potential variable cost.

  Service                               Hackathon Cost Target
  ------------------------------------- ---------------------------------------------------------
  Next.js / React / Tailwind / shadcn   \$0
  Neon                                  \$0 tier for demo-scale workload
  Vercel                                \$0 tier for demo-scale workload
  Clerk                                 \$0 tier if the required usage fits current plan limits
  Evidence storage                      Use free/available quota; keep files small
  OpenAI API                            Small pay-as-you-go usage

### Important

Free-tier availability, quotas, and pricing can change. Before the
hackathon starts, verify the current limits for the accounts actually
being used.

Do **not** architect the application around a paid service unless the
team has confirmed access.

------------------------------------------------------------------------

# 14. Real Risks Across the Whole Stack

## Highest Risk --- Time

The biggest risk is not technology failure.

It is spending the four hours configuring infrastructure instead of
demonstrating CivicProof.

### Response

Build the happy path first:

``` text
Report
↓
Evidence
↓
AI
↓
Complaint
↓
Case ID
↓
Authority
↓
Resolved
```

------------------------------------------------------------------------

## Second Highest Risk --- Privacy

CivicProof deals with sensitive reports.

### Response

During the demo:

-   Use fictional/synthetic incident data.
-   Never demonstrate with real victim information.
-   Keep sensitive cases private.
-   Enforce authorization server-side.
-   Never create a public alleged-offender feed.

------------------------------------------------------------------------

## Third Highest Risk --- AI Hallucination

The AI could sound confident while being wrong.

### Response

The application should clearly label:

> **AI-assisted suggestion**

and keep the user's original description separate.

AI must never be the source of truth for:

-   identity
-   authorization
-   legal guilt
-   official submission
-   authority acknowledgment
-   resolution

------------------------------------------------------------------------

## Fourth Highest Risk --- Fake Government Integration

A polished demo might accidentally imply:

> "Complaint successfully submitted to the government."

when nothing was actually submitted.

### Response

Use explicit states:

``` text
Complaint Draft
      ↓
Ready for Official Handoff
      ↓
Official Channel
```

Only display:

``` text
Confirmed Official Submission
```

when genuine confirmation exists.

------------------------------------------------------------------------

## Fifth Highest Risk --- Overengineering

The team may be tempted to add:

-   agents
-   maps
-   RAG
-   notifications
-   automatic escalation
-   deepfake detection
-   public reports
-   chat
-   analytics
-   native mobile

### Response

Do not add them during the core build.

The existing architecture and MVP documents have already rejected them
for this hackathon.

------------------------------------------------------------------------

# 15. Final Stack

## **FINAL STACK**

### Frontend

**Next.js + React + TypeScript + Tailwind CSS + shadcn/ui**

### Backend

**Next.js Route Handlers**

### Database

**Neon PostgreSQL + Prisma**

### AI

**OpenAI API**

### Hosting

**Vercel**

### Supporting Authentication

**Clerk**

### Evidence Storage

**Vercel Blob**

------------------------------------------------------------------------

# Final Principle

The stack is deliberately boring.

That is a feature.

CivicProof does not need the most advanced architecture. It needs the
**smallest reliable system capable of demonstrating:**

``` text
REAL INCIDENT
      ↓
STRUCTURED REPORT
      ↓
EVIDENCE
      ↓
AI ASSISTANCE
      ↓
SEVERITY + REPORTING DIRECTION
      ↓
COMPLAINT
      ↓
OFFICIAL HANDOFF
      ↓
CASE ID
      ↓
TRACKING
      ↓
AUTHORITY REVIEW
      ↓
STATUS UPDATE
      ↓
RESOLUTION
```

> **Build the product, not the infrastructure.**
