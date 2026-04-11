import {
  preflightAuthGate,
  syncAuthAccountDirectoryLogin,
  upsertAuthAccountDirectory,
  type AuthGateAction,
  type AuthAccountStatus,
} from "../auth/lib/server/auth-control-plane";
import {
  getZeptoMailErrorDetails,
  sendSupabaseAuthEmail,
} from "../auth/lib/server/email";
import {
  setAuthHubEnv,
  type AuthHubCloudflareEnv,
} from "../auth/lib/server/cloudflare";
import { captureAuthHubError } from "../auth/lib/server/logger";

type WorkerEnv = AuthHubCloudflareEnv;

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

function getRequestIp(request: Request): string | null {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

async function handlePreflight(request: Request): Promise<Response> {
  const body = (await readJsonBody<{
    action: AuthGateAction;
    app: "manager" | "admin" | "user";
    deviceId?: string | null;
    deviceLabel?: string | null;
    email: string;
    fullName?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile";
  }>(request)) as {
    action: AuthGateAction;
    app: "manager" | "admin" | "user";
    deviceId?: string | null;
    deviceLabel?: string | null;
    email: string;
    fullName?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile";
  };

  const result = await preflightAuthGate({
    action: body.action,
    app: body.app,
    email: body.email,
    fullName: body.fullName,
    deviceId: body.deviceId,
    deviceLabel: body.deviceLabel,
    ipAddress: getRequestIp(request),
    metadata: body.metadata,
    platform: body.platform,
  });

  return json({ ok: true, ...result });
}

async function handleLoginSync(request: Request): Promise<Response> {
  const body = (await readJsonBody<{
    app: "manager" | "admin" | "user";
    authUserId: string;
    businessName?: string | null;
    deviceId?: string | null;
    email: string;
    fullName: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile" | null;
    role: string;
    source?: string;
    status?: AuthAccountStatus;
  }>(request)) as {
    app: "manager" | "admin" | "user";
    authUserId: string;
    businessName?: string | null;
    deviceId?: string | null;
    email: string;
    fullName: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile" | null;
    role: string;
    source?: string;
    status?: AuthAccountStatus;
  };

  await syncAuthAccountDirectoryLogin(body);
  return json({ ok: true });
}

async function handleAccountUpsert(request: Request): Promise<Response> {
  const body = (await readJsonBody<{
    app: "manager" | "admin" | "user";
    authUserId?: string | null;
    businessName?: string | null;
    deviceId?: string | null;
    email: string;
    fullName: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile" | null;
    role: string;
    source: string;
    status?: AuthAccountStatus;
  }>(request)) as {
    app: "manager" | "admin" | "user";
    authUserId?: string | null;
    businessName?: string | null;
    deviceId?: string | null;
    email: string;
    fullName: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
    platform?: "web" | "desktop" | "mobile" | null;
    role: string;
    source: string;
    status?: AuthAccountStatus;
  };

  await upsertAuthAccountDirectory(body);
  return json({ ok: true });
}

async function verifySupabaseHook(
  request: Request,
  env: WorkerEnv
): Promise<{
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
}> {
  const hookSecret = env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim() || env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!hookSecret) {
    throw new Error("Missing send email hook secret.");
  }

  const { Webhook } = await import("standardwebhooks");
  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);
  const webhook = new Webhook(hookSecret.replace(/^v1,whsec_/, ""));
  return webhook.verify(payload, headers) as {
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
}

async function handleSupabaseSendEmail(request: Request, env: WorkerEnv): Promise<Response> {
  const verified = await verifySupabaseHook(request, env);
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

  return json({ ok: true });
}

async function handleInternalSupabaseEmail(request: Request): Promise<Response> {
  const body = (await readJsonBody<{
    actionType: string;
    email: string;
    redirectTo: string;
    siteUrl?: string | null;
    token: string;
    tokenHash: string;
    tokenNew?: string | null;
    tokenHashNew?: string | null;
  }>(request)) as {
    actionType: string;
    email: string;
    redirectTo: string;
    siteUrl?: string | null;
    token: string;
    tokenHash: string;
    tokenNew?: string | null;
    tokenHashNew?: string | null;
  };

  await sendSupabaseAuthEmail(body);
  return json({ ok: true });
}

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    setAuthHubEnv(env);
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (request.method === "POST" && (pathname === "/internal/preflight" || pathname === "/api/auth/preflight")) {
        return await handlePreflight(request);
      }

      if (request.method === "POST" && pathname === "/internal/account/login-sync") {
        return await handleLoginSync(request);
      }

      if (request.method === "POST" && pathname === "/internal/account/upsert") {
        return await handleAccountUpsert(request);
      }

      if (request.method === "POST" && pathname === "/internal/email/supabase") {
        return await handleInternalSupabaseEmail(request);
      }

      if (
        request.method === "POST" &&
        (pathname === "/api/hooks/supabase/send-email" || pathname === "/hooks/supabase/send-email")
      ) {
        return await handleSupabaseSendEmail(request, env);
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      await captureAuthHubError(error, {
        route: `policy:${request.method} ${pathname}`,
      }).catch(() => undefined);

      const mailError = getZeptoMailErrorDetails(error);
      return json(
        {
          error: error instanceof Error ? error.message : "Auth policy failure.",
          mailError,
        },
        mailError ? 502 : 400
      );
    }
  },
};

export default worker;
