import { ApplicationStatus, Prisma } from "@prisma/client";

import type { AgentMessage } from "@/lib/ai/provider";
import { prisma } from "@/lib/db";

/**
 * Server-side conversation state.
 *
 * The transcript lives in the database, not the browser, so a client cannot
 * forge an assistant turn or a tool result. It is also what lets a citizen
 * close the tab and come back to a half-finished application.
 *
 * The system prompt is NOT stored. It is prepended fresh on every request, so
 * editing it takes effect immediately instead of only for new conversations.
 */

/** Enough for a full journey with room to spare; old turns fall off the front. */
const MAX_STORED_MESSAGES = 40;

function isAgentMessage(value: unknown): value is AgentMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const role = (value as { role?: unknown }).role;

  return role === "user" || role === "assistant" || role === "tool" || role === "system";
}

/**
 * Trim the transcript without leaving it malformed.
 *
 * An assistant message carrying tool_calls must be followed by its tool
 * results, and a tool result cannot open a conversation. Cutting blindly at a
 * fixed offset can strand either, which the API rejects — so after trimming we
 * advance to the first user message and start there.
 */
function trim(messages: readonly AgentMessage[]): readonly AgentMessage[] {
  if (messages.length <= MAX_STORED_MESSAGES) {
    return messages;
  }

  const tail = messages.slice(messages.length - MAX_STORED_MESSAGES);
  const firstUser = tail.findIndex((message) => message.role === "user");

  return firstUser <= 0 ? tail.slice(Math.max(firstUser, 0)) : tail.slice(firstUser);
}

export async function loadTranscript(userId: string): Promise<readonly AgentMessage[]> {
  const row = await prisma.conversation.findUnique({ where: { userId } });

  if (!row || !Array.isArray(row.messages)) {
    return [];
  }

  return (row.messages as unknown[]).filter(isAgentMessage);
}

export async function saveTranscript(
  userId: string,
  messages: readonly AgentMessage[],
): Promise<void> {
  const bounded = trim(messages) as unknown as Prisma.InputJsonValue;

  await prisma.conversation.upsert({
    where: { userId },
    update: { messages: bounded },
    create: { userId, messages: bounded },
  });
}

/**
 * Clear the conversation so a fresh run starts from nothing.
 *
 * Unfinished DRAFT applications go too. Without that, "Start over" clears only
 * what is on screen: the next conversation finds the old draft, inherits facts
 * the citizen can no longer see, and the demo begins halfway through. Anything
 * already SUBMITTED is left alone — it is a record with a tracking id the
 * citizen may still ask about, and deleting it would make a reference they hold
 * stop resolving.
 */
export async function resetConversation(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.application.deleteMany({
      where: { userId, status: ApplicationStatus.DRAFT },
    }),
    prisma.conversation.upsert({
      where: { userId },
      update: { messages: [], activeApplicationId: null },
      create: { userId, messages: [] },
    }),
  ]);
}
