import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { Role, type User } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Resolving the Clerk session into CivicProof's own User record.
 *
 * Identity is ALWAYS derived server-side from the Clerk session. A client may
 * never supply a userId, reporterId, authorityUserId or role
 * (Docs/13-SECURITY.md §2).
 *
 * The schema has no dedicated `clerkId` column, so the mapping works like this:
 *
 *   1. Fast path  - look the user up by primary key, which equals the Clerk user
 *                   id for every account CivicProof created itself.
 *   2. Slow path  - ask Clerk for the profile and match on the unique `email`.
 *                   This lets a pre-provisioned record (for example a seeded
 *                   authority account created before that person ever signed in)
 *                   keep its own id and, crucially, its role.
 *   3. Otherwise  - create the record as a CITIZEN.
 */

function primaryEmailOf(clerkUser: { primaryEmailAddressId: string | null; emailAddresses: readonly { id: string; emailAddress: string }[] }): string | null {
  const primary = clerkUser.emailAddresses.find(
    (address) => address.id === clerkUser.primaryEmailAddressId,
  );

  return primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
}

function displayNameOf(clerkUser: { firstName: string | null; lastName: string | null; username: string | null }, fallback: string): string {
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();

  return fullName || clerkUser.username || fallback;
}

async function provisionUser(clerkUserId: string): Promise<User> {
  const clerkUser = await clerkCurrentUser();

  if (!clerkUser || clerkUser.id !== clerkUserId) {
    throw new Error("Clerk session did not resolve to a matching Clerk user.");
  }

  const email = primaryEmailOf(clerkUser);

  if (!email) {
    throw new Error("Clerk user has no email address; cannot map to a CivicProof user.");
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });

  if (existingByEmail) {
    // Pre-provisioned record. Its role is authoritative and is left untouched —
    // signing in must never change a user's role.
    return existingByEmail;
  }

  return prisma.user.create({
    data: {
      id: clerkUserId,
      email,
      name: displayNameOf(clerkUser, email),
      // Role is server-assigned. A user can never request AUTHORITY.
      role: Role.CITIZEN,
    },
  });
}

/**
 * The signed-in CivicProof user, or null when there is no active session.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const existing = await prisma.user.findUnique({ where: { id: clerkUserId } });

  if (existing) {
    return existing;
  }

  return provisionUser(clerkUserId);
}
