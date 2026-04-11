import { NextResponse } from "next/server";
import {
  rejectRegistration,
  resolveActorFromBearer,
} from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";

type Body = {
  reason?: string;
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

    await rejectRegistration({
      requestId,
      actorAuthUserId: actor.authUserId,
      reason: body.reason?.trim() || null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/requests/[id]/reject",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reject request." },
      { status: 400 }
    );
  }
}
