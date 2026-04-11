import { NextResponse } from "next/server";
import { resolveActorFromBearer, listPendingRegistrations } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";

export async function GET(request: Request) {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    if (!actor.access.is_admin && !actor.access.is_manager) {
      throw new Error("Access denied.");
    }
    const rows = await listPendingRegistrations();
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    captureAuthHubError(error, {
      route: "GET /api/requests",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load requests." },
      { status: 400 }
    );
  }
}
