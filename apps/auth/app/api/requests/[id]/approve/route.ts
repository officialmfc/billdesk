import { NextResponse } from "next/server";
import {
  approveSelfRegistration,
  resolveActorFromBearer,
} from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS } from "@/lib/server/cors";

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

type Body = {
  requestId?: string;
};

export async function POST(request: Request) {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    if (!actor.access.is_admin && !actor.access.is_manager) {
      throw new Error("Access denied.");
    }
    const body = (await request.json()) as Body;
    const requestId = body.requestId?.trim() || "";

    if (!requestId) {
      return NextResponse.json({ error: "Missing request id." }, { status: 400 });
    }

    const result = await approveSelfRegistration({
      requestId,
      actorAuthUserId: actor.authUserId,
    });

    return NextResponse.json({ ok: true, ...result }, { headers: CORS_HEADERS });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/requests/[id]/approve",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not approve request." },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
