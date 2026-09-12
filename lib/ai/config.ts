/**
 * Server-only AI configuration.
 *
 * The provider is Google Gemini, reached through its OpenAI-compatible surface
 * on Google's own API host. The rest of the app never learns which provider is
 * in use: it only sees an api key, a model name and a base url, so swapping
 * provider later means changing this file, not the callers.
 *
 * Nothing here reaches the browser — no NEXT_PUBLIC_ prefix, and no client
 * component imports lib/ai (Docs/13-SECURITY.md §4).
 */
export type AiConfig = {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
};

/** Google's OpenAI-compatible surface for the Gemini API. */
const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Resolve configuration, or null when the AI feature is not set up.
 *
 * The model is always supplied by GEMINI_MODEL and is never hard-coded, so
 * changing model is a deployment change rather than a code change.
 */
export function getAiConfig(): AiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return null;
  }

  return {
    apiKey,
    model,
    baseUrl: trimTrailingSlash(process.env.GEMINI_BASE_URL ?? GEMINI_OPENAI_BASE_URL),
  };
}

/** Safe to show a user: identifies which model produced an analysis. */
export function getModelLabel(config: AiConfig): string {
  return config.model;
}
