import { NextResponse } from "next/server";
import { exchangeAuthHandoff } from "@/lib/server/handoff";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS } from "@/lib/server/cors";

type Body = {
  handoffId?: string;
};

function corsHeaders(request: Request): HeadersInit {
  return {
    ...CORS_HEADERS,
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const handoffId = body.handoffId?.trim() || "";

    if (!handoffId) {
      return NextResponse.json(
        { error: "Missing handoff id." },
        { status: 400, headers: corsHeaders(request) }
      );
    }

    const result = await exchangeAuthHandoff(handoffId);

    return NextResponse.json(
      {
        ok: true,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        expires_at: result.expiresAt,
      },
      { headers: corsHeaders(request) }
    );
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/auth/exchange",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not exchange handoff." },
      { status: 400, headers: corsHeaders(request) }
    );
  }
}
