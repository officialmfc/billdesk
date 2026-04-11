import { NextResponse } from "next/server";
import { submitSelfRegistration } from "@/lib/server/self-registration";
import { verifyTurnstileToken } from "@/lib/server/turnstile";
import { captureAuthHubError } from "@/lib/server/logger";

type SelfRegistrationBody = {
  businessName?: string;
  captchaToken?: string;
  email?: string;
  fullName?: string;
  message?: string;
  phone?: string;
  requestedPlatform?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SelfRegistrationBody;
    const remoteIp =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for");

    await verifyTurnstileToken(body.captchaToken, remoteIp);

    if (body.requestedPlatform !== "web" && body.requestedPlatform !== "mobile") {
      return NextResponse.json(
        {
          error: "Self-registration requires a valid target platform.",
        },
        { status: 400 }
      );
    }

    const result = await submitSelfRegistration({
      email: body.email ?? "",
      fullName: body.fullName ?? "",
      phone: body.phone,
      businessName: body.businessName,
      message: body.message,
      requestedPlatform: body.requestedPlatform,
    });

    return NextResponse.json({
      ok: true,
      requestId: result.requestId,
      reused: result.reused,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit registration.";
    captureAuthHubError(error, {
      route: "POST /api/register/self",
      error_message: message,
    });

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}
