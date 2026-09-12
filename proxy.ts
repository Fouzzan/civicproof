import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk session context for every request.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`; this is the
 * same Clerk middleware at its current filename.
 *
 * This deliberately performs NO route protection. Clerk has deprecated
 * `createRouteMatcher` because middleware auth relies on path matching, which
 * can diverge from how Next.js actually routes a request and leave a protected
 * resource reachable. That matches Docs/13-SECURITY.md §3, which requires the
 * authorization check to live on the resource-access path:
 *
 *   authenticate -> load resource -> authorize -> act
 *
 * So the proxy only establishes who the caller is. Each route handler, page and
 * server function enforces its own access using the guards in lib/auth.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files unless used in search params.
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
