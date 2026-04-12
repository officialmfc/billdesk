import { NextResponse } from "next/server";
import { assertInvitePermission, createUserInvite, resolveActorFromBearer } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS } from "@/lib/server/cors";

type Body = {
  businessName?: string;
  defaultRole?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  requestedPlatform?: string;
  requestedUserType?: string;
  existingUserId?: string;
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    await assertInvitePermission(actor, "user_invite");

    const body = (await request.json()) as Body;
    const invite = await createUserInvite({
      actorAuthUserId: actor.authUserId,
      email: body.email?.trim() || "",
      fullName: body.fullName?.trim() || "",
      businessName: body.businessName?.trim() || null,
      phone: body.phone?.trim() || null,
      requestedPlatform: body.requestedPlatform?.trim() || "mobile",
      requestedDefaultRole: body.defaultRole?.trim() || "buyer",
      requestedUserType: body.requestedUserType?.trim() || "vendor",
      existingUserId: body.existingUserId?.trim() || null,
    });

    return NextResponse.json(
      {
        ok: true,
        invite_token: invite.inviteToken,
        registration_id: invite.requestId,
        requested_app: "user",
        requested_platform: body.requestedPlatform?.trim() || "mobile",
        signup_path: invite.signupPath,
        supabase_record_id: invite.supabaseRecordId,
        inviteToken: invite.inviteToken,
        registrationId: invite.requestId,
        requestedApp: "user",
        requestedPlatform: body.requestedPlatform?.trim() || "mobile",
        signupPath: invite.signupPath,
        supabaseRecordId: invite.supabaseRecordId,
        emailDelivery: invite.emailDelivery,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/invites/user",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create invite." },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
