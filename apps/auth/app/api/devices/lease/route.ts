import { NextResponse } from "next/server";
import { touchDeviceLease } from "@/lib/server/device-leases";
import { resolveActorFromBearer } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS } from "@/lib/server/cors";

type Body = {
  app?: string;
  deviceId?: string;
  deviceLabel?: string;
  mode?: string;
  platform?: string;
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const body = (await request.json()) as Body;

    const app = body.app;
    const platform = body.platform;
    const deviceId = body.deviceId?.trim();
    const deviceLabel = body.deviceLabel?.trim();

    if (app !== "manager" && app !== "admin" && app !== "user") {
      throw new Error("Invalid app target.");
    }

    if (platform !== "web" && platform !== "desktop" && platform !== "mobile") {
      throw new Error("Invalid platform target.");
    }

    if (!deviceId) {
      throw new Error("Device id is required.");
    }

    const result = await touchDeviceLease({
      authUserId: actor.authUserId,
      app,
      platform,
      deviceId,
      deviceLabel,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "This device is no longer active.", lease_status: result.status },
        { status: 403, headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } }
    );
  } catch (error) {
    captureAuthHubError(error, { route: "POST /api/devices/lease" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not touch device lease." },
      { status: 400, headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } }
    );
  }
}
