import { NextResponse } from "next/server";
import { createAuthHandoff } from "@/lib/server/handoff";
import { buildInternalHref } from "@/lib/config";
import { resolveActorFromBearer } from "@/lib/server/registration-workflow";
import { captureAuthHubError } from "@/lib/server/logger";
import { sanitizeNextPath, sanitizeReturnTo } from "@/lib/config";
import { CORS_HEADERS } from "@/lib/server/cors";

type Body = {
  accessToken?: string;
  app?: "manager" | "admin" | "user";
  deviceId?: string;
  deviceLabel?: string;
  next?: string;
  platform?: "web" | "desktop" | "mobile";
  refreshToken?: string;
  returnTo?: string;
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  let app: Body["app"] | undefined;
  let deviceId: string | undefined;
  let deviceLabel: string | undefined;
  let platform: Body["platform"] | undefined;
  let hasAccessToken = false;
  let hasRefreshToken = false;
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const body = (await request.json()) as Body;
    const accessToken = body.accessToken?.trim() ?? "";
    const refreshToken = body.refreshToken?.trim() ?? "";

    hasAccessToken = Boolean(accessToken);
    hasRefreshToken = Boolean(refreshToken);

    if (!hasAccessToken || !hasRefreshToken) {
      throw new Error("Missing session tokens.");
    }

    if (accessToken !== actor.accessToken.trim()) {
      throw new Error("Session token mismatch.");
    }

    app = body.app;
    deviceId = body.deviceId?.trim() || undefined;
    deviceLabel = body.deviceLabel?.trim() || undefined;
    platform = body.platform;

    if (app !== "manager" && app !== "admin" && app !== "user") {
      throw new Error("Invalid app target.");
    }

    if (platform !== "web" && platform !== "desktop" && platform !== "mobile") {
      throw new Error("Invalid platform target.");
    }

    const result = await createAuthHandoff({
      accessToken,
      authUserId: actor.authUserId,
      refreshToken,
      context: {
        app,
        platform,
        next: sanitizeNextPath(body.next ?? null),
        returnTo: sanitizeReturnTo(app, platform, body.returnTo ?? null),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        handoff_id: result.handoffId,
        redirect_url: result.redirectUrl,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create handoff.";
    captureAuthHubError(error, {
      route: "POST /api/auth/handoff",
      app,
      platform,
      hasAccessToken,
      hasRefreshToken,
      error_message: message,
    });
    console.error("[AuthHub] /api/auth/handoff failed", {
      app,
      platform,
      hasAccessToken,
      hasRefreshToken,
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error && typeof error === "object" && (error as { deviceLeaseConflict?: boolean }).deviceLeaseConflict) {
      const manageUrl = new URL(
        buildInternalHref("/account", app && platform ? { app, platform } : { app: "manager", platform: "web" }),
        "https://auth.mondalfishcenter.com"
      );
      if (deviceId) {
        manageUrl.searchParams.set("device_id", deviceId);
      }
      if (deviceLabel) {
        manageUrl.searchParams.set("device_label", deviceLabel);
      }
      return NextResponse.json(
        {
          error: message,
          device_conflict: true,
          manage_url: manageUrl.toString(),
          active_device: (error as { activeDeviceLease?: unknown }).activeDeviceLease ?? null,
        },
        {
          status: 409,
          headers: {
            ...CORS_HEADERS,
            "Cache-Control": "no-store",
          },
        }
      );
    }
    return NextResponse.json(
      { error: message },
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
