import { Role, type User } from "@prisma/client";

import { getAuthenticatedUser } from "@/lib/auth/current-user";
import { forbidden, unauthenticated } from "@/lib/auth/errors";

/**
 * Identity and role guards for server-side code.
 *
 * These answer "who are you?" and "what kind of user are you?". They do NOT
 * answer "may you touch this particular case?" — per-case authorization
 * (canViewCase / canUpdateAuthorityState) belongs to the case-access task and
 * is deliberately not implemented here.
 */

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw unauthenticated("No Clerk session on a protected operation.");
  }

  return user;
}

export async function requireCitizen(): Promise<User> {
  const user = await requireAuthenticatedUser();

  if (user.role !== Role.CITIZEN) {
    throw forbidden(`User ${user.id} is ${user.role}, not CITIZEN.`);
  }

  return user;
}

export async function requireAuthority(): Promise<User> {
  const user = await requireAuthenticatedUser();

  if (user.role !== Role.AUTHORITY) {
    throw forbidden(`User ${user.id} is ${user.role}, not AUTHORITY.`);
  }

  return user;
}

export function isAuthority(user: User): boolean {
  return user.role === Role.AUTHORITY;
}

export function isCitizen(user: User): boolean {
  return user.role === Role.CITIZEN;
}
