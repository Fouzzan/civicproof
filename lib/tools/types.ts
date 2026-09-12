/**
 * The contract every Sahayak tool follows.
 *
 * Tools never throw at the agent. A failure is a value the model can read and
 * explain, because an exception escaping into the loop would leave the
 * conversation with nothing truthful to say.
 */
export type ToolErrorCode =
  | "INVALID_INPUT"
  | "SCHEME_NOT_FOUND"
  | "SCHEME_DATA_ERROR"
  | "NO_APPLICATION"
  | "NOT_ELIGIBLE"
  | "INCOMPLETE_APPLICATION"
  | "CONFIRMATION_REQUIRED"
  | "ALREADY_SUBMITTED"
  | "NOT_FOUND"
  | "STORAGE_ERROR";

export type ToolResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly code: ToolErrorCode; readonly error: string };

export function toolOk<T>(data: T): ToolResult<T> {
  return { ok: true, data };
}

export function toolError<T>(code: ToolErrorCode, error: string): ToolResult<T> {
  return { ok: false, code, error };
}

/**
 * Server-supplied context for every tool call.
 *
 * This is NOT part of any tool's model-facing schema. The agent loop injects it
 * from the Clerk session, so the model cannot name a user, reach another
 * citizen's application, or widen its own access by writing a different id into
 * its tool arguments.
 */
export type ToolContext = {
  readonly userId: string;
};
