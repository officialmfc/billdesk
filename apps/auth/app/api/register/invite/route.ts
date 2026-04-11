import { NextResponse } from "next/server";
import { registerInviteAccount } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";

type InviteRegistrationBody = {
  email?: string;
  fullName?: string;
  inviteToken?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InviteRegistrationBody;
    const result = await registerInviteAccount({
      inviteToken: body.inviteToken?.trim() || "",
      email: body.email?.trim() || "",
      fullName: body.fullName?.trim() || "",
      password: body.password?.trim() || "",
    });

    return NextResponse.json({
      ok: true,
      authUserId: result.authUserId,
      inviteContext: result.inviteContext,
    });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/register/invite",
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create invited account.",
      },
      { status: 400 }
    );
  }
}
