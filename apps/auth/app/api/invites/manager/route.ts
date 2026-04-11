import { NextResponse } from "next/server";
import { assertInvitePermission, createManagerInvite, resolveActorFromBearer } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS } from "@/lib/server/cors";

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

type Body = {
  email?: string;
  fullName?: string;
  requestedPlatform?: string;
};

export async function POST(request: Request) {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    await assertInvitePermission(actor, "manager_invite");

    const body = (await request.json()) as Body;
    const email = body.email?.trim() || "";
    const fullName = body.fullName?.trim() || "";
    const requestedPlatform = body.requestedPlatform?.trim() || "desktop";

    const invite = await createManagerInvite({
      actorAuthUserId: actor.authUserId,
      email,
      fullName,
      requestedPlatform,
    });

    return NextResponse.json({ ok: true, ...invite }, { headers: CORS_HEADERS });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/invites/manager",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create invite." },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
