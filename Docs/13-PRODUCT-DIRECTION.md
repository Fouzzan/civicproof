# 13 — Product Direction

This document records the product direction as actually implemented, and supersedes any earlier statement that conflicts with it. Documents `01`–`12` remain the design record; where one of them disagrees with this file, this file is correct.

It exists because four things changed after those documents were written: the product became citizen-wide rather than farmer-only, the AI provider settled on Gemini, voice became a first-class interaction mode, and privacy became a product requirement rather than a deployment concern.

---

## 1. What Sahayak is

**An AI-powered citizen service navigator.**

A citizen describes what is happening in their life, in their own words. Sahayak works out which services may apply, asks only the questions those services actually need, checks eligibility against controlled rules, prepares an application, and keeps the journey trackable afterwards.

The chat interface is one surface for that agent. It is not the product.

---

## 2. Differentiation from myScheme

The Government of India already operates **myScheme**, which helps citizens discover schemes and offers AI and voice features of its own. Sahayak is not positioned against it on discovery.

| | Scope |
|---|---|
| **myScheme** | Helps a citizen **find** a relevant scheme |
| **Sahayak** | Helps a citizen **complete the journey** after that |

The differentiator is **journey ownership**: eligibility checking, application preparation, review and correction, explicit confirmation, submission, and a tracking reference the citizen can return to.

Stated plainly:

> myScheme helps you find a scheme. Sahayak helps you navigate what happens next.

**Constraints this places on the build.** We do not copy myScheme's branding, content, data model or interface; we do not scrape it; and we do not claim an integration with it. The scheme catalogue here is a small controlled set of fictional demonstration schemes. Supporting verified external scheme sources is future scope, not something this prototype does.

---

## 3. Citizen scope — six categories, not one

The MVP originally shipped a single agricultural scheme. It now carries six fictional schemes, one per category:

| Category | Scheme |
|---|---|
| Education | Student Education Assistance |
| Employment | Job Seeker Support |
| Senior Citizens | Senior Citizen Assistance |
| Agriculture | Farmer Income Support |
| Housing | Basic Housing Assistance |
| Accessibility | Accessibility Support |

Every scheme is **fictional**, carries `isDemo`, and is labelled DEMO wherever it is rendered. None is a real programme and no threshold is a real entitlement rule.

Six is a deliberate size — enough to prove the engine is category-agnostic and to give discovery something to choose between, small enough that each can be written carefully and verified.

---

## 4. Architecture — what changed and what did not

**Unchanged.** One bounded agent (`MAX_ITERATIONS = 6`), five controlled tools, deterministic eligibility, the confirmation boundary, and cards derived from tool results rather than model prose.

**Changed.** The scheme catalogue is multi-category, and scheme rows carry category, benefits, target groups, required documents, provenance and a version.

The important property is that **none of the engine needed rewriting** to go from one category to six. `lib/eligibility`, `lib/schemes/facts.ts` and all five tools operate on whatever facts and rules the database supplies. The farmer assumption lived entirely in data and copy.

### AI provider — Gemini, not Claude

`10-TECH-STACK.md` selects "Claude API with tool use". **The implementation uses Google Gemini** via its OpenAI-compatible endpoint, and that is the intended provider.

The reason is budget: there is no funding for paid AI API usage, and the Gemini key already works. Gemini's function calling was verified end-to-end before the agent was built on it — tool call, deterministic tool result, grounded final answer, with the model's thought signature echoed back across turns.

Treat every "Claude" reference in `10-TECH-STACK.md` as historical.

### Division of responsibility

Gemini handles language: understanding a situation, extracting facts, choosing a tool, asking questions, explaining a structured result.

The backend decides everything that matters: eligibility, application state, confirmation, submission, tracking status, and the scheme rules themselves. The model cannot reach the database, cannot assert confirmation, and cannot move a scheme version.

---

## 5. Voice

Voice is a first-class interaction mode and is **not** a second agent.

```
Voice input → speech-to-text → the same chat input → /api/chat
→ the same agent → the same tools → the same structured result
→ text UI + speech synthesis
```

Browser-native `SpeechRecognition` and `SpeechSynthesis` only — no paid voice service, no audio sent to the backend, no recordings stored. Where the browser does not support it, the interface falls back to text without losing anything.

**Voice changes no security property.** A spoken "submit it now" goes through the identical path as the typed words, and the identical confirmation gate refuses it. Confirmation is a timestamp written only by a button-driven route; speech cannot set it.

---

## 6. Privacy — data minimisation as a product requirement

The honest answer to *"how can a private company hold citizens' private data?"* is not "our database is secure". It is **to hold as little as possible, for one stated purpose**.

### What Sahayak collects

Only the facts the selected scheme actually needs, and nothing else. Across the whole catalogue that vocabulary is: age, annual household income, a small number of yes/no situation facts (studying, seeking work, receiving a pension, farming, owning a home, having a disability), household size, land area, and — only once eligibility is settled — a name and a district.

### What it does not collect

**Aadhaar, PAN, bank details, passwords, OTPs, government portal credentials, biometrics, or identity documents.** This is enforced, not merely promised: the eligibility verification suite fails the build if any scheme in the catalogue defines a fact whose id or label matches those terms.

`requiredDocuments` on a scheme is **informational only** — it says what a real scheme of that kind would ask for, so expectations are honest. Sahayak collects no documents.

### Scope boundaries

- Facts are bound to the **current service journey**, not accumulated into a permanent profile of the citizen.
- "Start over" deletes unfinished drafts. Submitted applications are kept, because their tracking references must keep resolving.
- Applications are **simulated**. Nothing reaches a government system.

### What this prototype is not

This is a hackathon prototype, and it should not be described as production-ready for real citizen data. A production deployment would need privacy notices, a lawful basis for processing, retention and deletion policies, encryption, access control, audit logging, vendor controls, incident response, applicable DPDP compliance, and whatever the relevant government integration requires. Those are **not** implemented here.

---

## 7. Claims that must never be made

- That Sahayak is connected to, endorsed by, or submitting to any government system
- That any scheme in the catalogue is real, or that any threshold is a real rule
- That the catalogue is comprehensive — it is six fictional schemes
- That AI decides eligibility — a deterministic engine does
- That Aadhaar is stored securely — it is never collected
- That this prototype is more secure than government systems

What can be said instead: data minimisation, purpose limitation, explicit confirmation, simulated integration, deterministic rules separated from the model, and a clear list of what production would still require.
