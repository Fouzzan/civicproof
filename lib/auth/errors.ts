/**
 * Authentication / authorization failures, carrying the HTTP status the API
 * boundary should return.
 *
 * `publicMessage` is deliberately generic: error responses must not leak
 * whether a resource exists or why access failed (Docs/13-SECURITY.md §1).
 */
export class AuthError extends Error {
  readonly status: 401 | 403;
  readonly publicMessage: string;

  constructor(status: 401 | 403, publicMessage: string, internalMessage?: string) {
    super(internalMessage ?? publicMessage);
    this.name = "AuthError";
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

export function unauthenticated(internalMessage?: string): AuthError {
  return new AuthError(401, "Authentication required.", internalMessage);
}

export function forbidden(internalMessage?: string): AuthError {
  return new AuthError(403, "You are not authorized to perform this action.", internalMessage);
}
