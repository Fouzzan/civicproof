import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { SahayakChat } from "@/components/chat/sahayak-chat";
import { getAuthenticatedUser } from "@/lib/auth";

export const metadata = { title: "Talk to Sahayak" };

/**
 * The working surface.
 *
 * Separate from the landing page on purpose: a citizen should meet the product
 * before being dropped into a conversation, and someone returning to finish an
 * application should not have to scroll past the pitch to reach it.
 *
 * A situation typed on the landing page arrives here as a query parameter and
 * is sent as the first message, so the handoff costs the citizen nothing —
 * they do not retype what they already said.
 */
export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ situation?: string }>;
}) {
  const { situation } = await searchParams;
  const opening = typeof situation === "string" ? situation.trim().slice(0, 2000) : "";

  const user = await getAuthenticatedUser();

  if (!user) {
    // Carry the situation through sign-in. Someone who has just described a
    // difficult circumstance should not have to type it again because they
    // were interrupted by a login.
    const target = opening.length > 0 ? `/chat?situation=${encodeURIComponent(opening)}` : "/chat";

    redirect(`/sign-in?redirect_url=${encodeURIComponent(target)}`);
  }

  return (
    <Container width="form">
      <SahayakChat initialMessage={opening.length > 0 ? opening : undefined} />
    </Container>
  );
}
