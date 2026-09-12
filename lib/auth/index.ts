export { getAuthenticatedUser } from "@/lib/auth/current-user";
export { AuthError, forbidden, unauthenticated } from "@/lib/auth/errors";
export {
  isAuthority,
  isCitizen,
  requireAuthenticatedUser,
  requireAuthority,
  requireCitizen,
} from "@/lib/auth/guards";
