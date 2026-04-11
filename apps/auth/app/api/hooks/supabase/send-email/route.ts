import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { getZeptoMailErrorDetails, sendSupabaseAuthEmail } from "@/lib/server/email";
import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { captureAuthHubError } from "@/lib/server/logger";

type SendEmailPayload = {
  email_data: {
    email_action_type: string;
    redirect_to: string;
    site_url: string;
    token: string;
    token_hash: string;
    token_hash_new?: string;
    token_new?: string;
  };
  user: {
    email: string;
  };
};

export async function POST(request: Request) {
  try {
    const env = await getAuthHubEnv();
    const hookSecret = env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim() || env.SEND_EMAIL_HOOK_SECRET?.trim();

    if (!hookSecret) {
      throw new Error("Missing send email hook secret.");
    }

    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);
    const webhook = new Webhook(hookSecret.replace(/^v1,whsec_/, ""));
    const verified = webhook.verify(payload, headers) as SendEmailPayload;

    await sendSupabaseAuthEmail({
      actionType: verified.email_data.email_action_type,
      email: verified.user.email,
      redirectTo: verified.email_data.redirect_to,
      siteUrl: verified.email_data.site_url,
      token: verified.email_data.token,
      tokenHash: verified.email_data.token_hash,
      tokenHashNew: verified.email_data.token_hash_new,
      tokenNew: verified.email_data.token_new,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureAuthHubError(error, {
      route: "POST /api/hooks/supabase/send-email",
    });
    const mailError = getZeptoMailErrorDetails(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not send auth email.",
        mailError,
      },
      { status: mailError ? 502 : 400 }
    );
  }
}
