import { NextResponse } from "next/server";
import { assertInvitePermission, createUserInvite, resolveActorFromBearer } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";

type Body = {
  businessName?: string;
  defaultRole?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  requestedPlatform?: string;
  requestedUserType?: string;
};

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
    });

    return NextResponse.json({ ok: true, ...invite });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/invites/user",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create invite." },
      { status: 400 }
    );
  }
}
