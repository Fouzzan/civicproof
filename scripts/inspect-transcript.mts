import { existsSync } from "node:fs";
for (const f of [".env", ".env.local"] as const) if (existsSync(f)) process.loadEnvFile(f);
const { prisma } = await import("../lib/db/index.ts");

try {
  const rows = await prisma.conversation.findMany();
  for (const r of rows) {
    const msgs = (Array.isArray(r.messages) ? r.messages : []) as Record<string, unknown>[];
    console.log(`user ${r.userId}`);
    console.log(`  fingerprint: ${r.catalogueFingerprint ?? "(null)"}`);
    console.log(`  messages   : ${msgs.length}`);
    msgs.forEach((m, i) => {
      const role = String(m.role);
      const calls = Array.isArray(m.tool_calls) ? (m.tool_calls as unknown[]).length : 0;
      const hasContent = typeof m.content === "string" && m.content.length > 0;
      console.log(`    [${i}] role=${role.padEnd(9)} tool_calls=${calls} content=${hasContent ? "yes" : "no"}${m.tool_call_id ? ` tool_call_id=${String(m.tool_call_id).slice(0,14)}` : ""}`);
    });

    // An assistant turn with tool_calls MUST be followed by one tool message
    // per call, or the chat-completions API rejects the whole array.
    let dangling = 0;
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i]!;
      const calls = Array.isArray(m.tool_calls) ? (m.tool_calls as unknown[]).length : 0;
      if (m.role === "assistant" && calls > 0) {
        let following = 0;
        for (let j = i + 1; j < msgs.length && msgs[j]!.role === "tool"; j++) following++;
        if (following < calls) dangling++;
      }
    }
    console.log(`  -> dangling tool_calls without results: ${dangling}`);
    console.log(`  -> MALFORMED FOR THE API: ${dangling > 0}`);
  }
  if (rows.length === 0) console.log("(no conversations)");
} finally {
  await prisma.$disconnect();
}
