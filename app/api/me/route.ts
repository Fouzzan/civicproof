import { NextResponse } from "next/server";

import { AuthError, requireAuthenticatedUser } from "@/lib/auth";

/**
 * Minimal protected endpoint: reports who the server believes you are.
 *
 * This is the reference shape for every future case API — authenticate first,
 * derive identity server-side, never read identity from the request body.
 */
export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    console.error("GET /api/me failed:", error);

    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
