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
  existingUserId?: string;
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

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
      existingUserId: body.existingUserId?.trim() || null,
    });

    return NextResponse.json(
      {
        ok: true,
        invite_token: invite.inviteToken,
        registration_id: invite.requestId,
        requested_app: "manager",
        requested_platform: requestedPlatform,
        signup_path: invite.signupPath,
        supabase_record_id: invite.supabaseRecordId,
        inviteToken: invite.inviteToken,
        registrationId: invite.requestId,
        requestedApp: "manager",
        requestedPlatform,
        signupPath: invite.signupPath,
        supabaseRecordId: invite.supabaseRecordId,
        emailDelivery: invite.emailDelivery,
      },
      { headers: CORS_HEADERS }
    );
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
