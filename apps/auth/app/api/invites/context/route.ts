import { NextResponse } from "next/server";
import { getInviteContextByToken } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const invite = url.searchParams.get("invite")?.trim() || "";

  if (!invite) {
    return NextResponse.json({ error: "Missing invite token." }, { status: 400 });
  }

  try {
    const context = await getInviteContextByToken(invite);
    return NextResponse.json({ context });
  } catch (error) {
    captureAuthHubError(error, {
      route: "GET /api/invites/context",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load invite." },
      { status: 400 }
    );
  }
}
