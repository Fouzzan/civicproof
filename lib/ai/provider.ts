import { getAiConfig, type AiConfig } from "@/lib/ai/config";

/**
 * Minimal chat-completion provider.
 *
 * Deliberately a thin fetch wrapper rather than a vendor SDK: the only thing the
 * rest of the app knows is "send messages, get something back". It speaks the
 * OpenAI chat-completions shape, which Gemini's compatible endpoint accepts, so
 * changing provider later is a change to lib/ai/config.ts rather than a rewrite.
 *
 * Two entry points, because the two callers need different things:
 *
 *   requestJsonCompletion  — one shot, JSON object back. Used by the legacy
 *                            CivicProof analysis path.
 *   requestToolCompletion  — multi-turn with tool calling. Used by the Sahayak
 *                            agent loop. Cannot set response_format, which the
 *                            API rejects alongside tools.
 *
 * Both share the timeout, retry and error handling below.
 */

/**
 * A message is either plain text or a sequence of parts, which is how the
 * OpenAI-compatible shape carries images. Gemini accepts image parts as data:
 * URLs on this endpoint.
 */
export type ContentPart =
  | { readonly type: "text"; readonly text: string }
  | { readonly type: "image_url"; readonly image_url: { readonly url: string } };

export type ChatMessage = {
  readonly role: "system" | "user";
  readonly content: string | readonly ContentPart[];
};

/** One tool call requested by the model. */
export type ToolCall = {
  readonly id: string;
  readonly type: "function";
  readonly function: { readonly name: string; readonly arguments: string };
  /**
   * Gemini 3 returns a thought signature here. It is opaque to us and must be
   * echoed back unchanged on the next request, or the model loses the reasoning
   * that led to the call.
   */
  readonly extra_content?: unknown;
};

export type AssistantMessage = {
  readonly role: "assistant";
  readonly content?: string | null;
  readonly tool_calls?: readonly ToolCall[];
  readonly extra_content?: unknown;
};

/** Every message shape the agent loop puts on the wire. */
export type AgentMessage =
  | { readonly role: "system"; readonly content: string }
  | { readonly role: "user"; readonly content: string }
  | AssistantMessage
  | { readonly role: "tool"; readonly tool_call_id: string; readonly content: string };

export type CompletionFailure =
  | "NOT_CONFIGURED"
  | "PROVIDER_ERROR"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "EMPTY_RESPONSE";

export class AiProviderError extends Error {
  readonly reason: CompletionFailure;

  constructor(reason: CompletionFailure, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.reason = reason;
  }
}

// Gemini 3.x models reason before answering, which can take ~50s at default
// effort. The ceiling leaves margin above the effort-limited latency measured
// for this prompt rather than cutting a valid response short.
const REQUEST_TIMEOUT_MS = 60_000;

// Google returns 503 "this model is currently experiencing high demand" under
// transient capacity pressure and asks callers to retry. One short retry turns
// that blip into a slightly slower success instead of a visible failure.
// Deliberately NOT retried: 429 (respect the rate limit), 4xx (won't change),
// and timeouts (a second 60s wait is worse than failing fast).
const TRANSIENT_STATUSES = new Set([500, 502, 503, 504]);
const RETRY_DELAY_MS = 1_200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** POST a request body, retrying once on a transient provider fault. */
async function postWithRetry(
  config: AiConfig,
  body: Readonly<Record<string, unknown>>,
): Promise<Response> {
  let response = await sendOnce(config, body);

  if (TRANSIENT_STATUSES.has(response.status)) {
    await delay(RETRY_DELAY_MS);
    response = await sendOnce(config, body);
  }

  if (!response.ok) {
    // Status only. The provider body can echo the prompt, so it is never logged
    // or surfaced. A provider-side rate limit is distinguished from a genuine
    // fault so the user can be told to simply wait — free-tier models hit this
    // routinely.
    throw new AiProviderError(
      response.status === 429 ? "RATE_LIMITED" : "PROVIDER_ERROR",
      `AI provider responded with status ${response.status}.`,
    );
  }

  return response;
}

async function sendOnce(
  config: AiConfig,
  body: Readonly<Record<string, unknown>>,
): Promise<Response> {
  try {
    return await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: config.model, ...body }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AiProviderError("TIMEOUT", "AI provider timed out.");
    }

    throw new AiProviderError("PROVIDER_ERROR", "AI provider request failed.");
  }
}

function requireConfig(): AiConfig {
  const config = getAiConfig();

  if (!config) {
    throw new AiProviderError("NOT_CONFIGURED", "AI provider is not configured.");
  }

  return config;
}

export async function requestJsonCompletion(
  messages: readonly ChatMessage[],
): Promise<{ content: string; config: AiConfig }> {
  const config = requireConfig();

  const response = await postWithRetry(config, {
    messages,
    // Ask for JSON; the response is still validated before use.
    response_format: { type: "json_object" },
    temperature: 0.2,
    // This is a bounded extraction task, not a reasoning problem. Capping
    // effort keeps latency usable — measured ~51s to ~33s on a thinking
    // model, and ~1.5s on the lighter ones. Ignored by models that do not
    // support it.
    reasoning_effort: "low",
  });

  const payload: unknown = await response.json().catch(() => null);
  const content = extractContent(payload);

  if (!content) {
    throw new AiProviderError("EMPTY_RESPONSE", "AI provider returned no content.");
  }

  return { content, config };
}

export type ToolCompletion = {
  readonly message: AssistantMessage;
  readonly finishReason: string | null;
  readonly config: AiConfig;
};

/**
 * One turn of a tool-calling conversation.
 *
 * The assistant message is returned as received so the caller can echo it back
 * verbatim on the next request. Rebuilding it from parsed fields would drop
 * Gemini's thought signature and degrade multi-step reasoning.
 *
 * `response_format` is deliberately absent: the API rejects it together with
 * `tools`, and a tool-calling turn has no single JSON answer to constrain.
 */
export async function requestToolCompletion(
  messages: readonly AgentMessage[],
  tools: readonly Record<string, unknown>[],
): Promise<ToolCompletion> {
  const config = requireConfig();

  const response = await postWithRetry(config, {
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.1,
  });

  const payload: unknown = await response.json().catch(() => null);
  const choice = firstChoice(payload);

  if (!choice) {
    throw new AiProviderError("EMPTY_RESPONSE", "AI provider returned no choices.");
  }

  const message = choice.message;

  // A turn with neither text nor a tool call is unusable; treat it as empty
  // rather than letting the loop spin on it.
  if (!message || (!message.content && !message.tool_calls?.length)) {
    throw new AiProviderError("EMPTY_RESPONSE", "AI provider returned an empty message.");
  }

  return { message, finishReason: choice.finish_reason ?? null, config };
}

type Choice = {
  readonly message?: AssistantMessage;
  readonly finish_reason?: string;
};

function firstChoice(payload: unknown): Choice | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const choices = (payload as { choices?: unknown }).choices;

  return Array.isArray(choices) && choices.length > 0 ? (choices[0] as Choice) : null;
}

function extractContent(payload: unknown): string | null {
  const choice = firstChoice(payload);
  const content = choice?.message?.content;

  return typeof content === "string" && content.trim().length > 0 ? content : null;
}
