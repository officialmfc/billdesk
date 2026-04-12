import { getCloudflareAccessEmail } from "../../auth/lib/server/cloudflare-access";
import { captureAuthHubError } from "../../auth/lib/server/logger";
import { setAuthHubEnv, type AuthHubCloudflareEnv } from "../../auth/lib/server/cloudflare";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  readAdminSessionState,
} from "../../auth/lib/server/admin-session";
//use server-only imports to ensure these modules are not included in the client bundle
type PagesEnv = AuthHubCloudflareEnv & {
  AUTH_CORE?: {
    fetch: (request: Request) => Promise<Response>;
  };
};

type PagesContext = {
  env: PagesEnv;
  next: () => Promise<Response>;
  request: Request;
};

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname === "/admin-client.js" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/logo/") ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

async function proxyToService(
  service: { fetch: (request: Request) => Promise<Response> } | undefined,
  request: Request,
  pathname: string
): Promise<Response> {
  if (!service) {
    return new Response(
      JSON.stringify({ error: `Service binding is not available for ${pathname}.` }),
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  return service.fetch(request);
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...headers,
    },
  });
}

async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

async function handleAdminSession(request: Request, env: PagesEnv): Promise<Response> {
  const session = await readAdminSessionState(request, env);
  return json({
    ok: true,
    ...session,
  });
}

async function handleAdminLogin(request: Request, env: PagesEnv): Promise<Response> {
  const session = await readAdminSessionState(request, env);
  if (session.authenticated) {
    return json({
      ok: true,
      ...session,
    });
  }

  const payload = await readJsonBody<{ password?: string }>(request);
  const password = payload?.password?.trim() || "";
  const configuredPassword = env.AUTH_ADMIN_PASSWORD?.trim() || "";

  if (!configuredPassword) {
    return json(
      {
        error: "Set AUTH_ADMIN_PASSWORD in the auth-admin Pages environment to enable password login.",
      },
      400
    );
  }

  if (!password) {
    return json({ error: "Password is required." }, 400);
  }

  if (password !== configuredPassword) {
    return json({ error: "Incorrect admin password." }, 401);
  }

  const cookie = await createAdminSessionCookie(env, request);
  if (!cookie) {
    return json({ error: "Could not create the admin session." }, 500);
  }

  return json(
    {
      ok: true,
      authenticated: true,
      accessEmail: null,
      mode: "password",
      passwordConfigured: true,
    },
    200,
    {
      "Set-Cookie": cookie,
    }
  );
}

async function handleAdminLogout(request: Request, env: PagesEnv): Promise<Response> {
  const session = await readAdminSessionState(request, env);
  const headers: HeadersInit = {
    "Set-Cookie": clearAdminSessionCookie(request),
  };

  if (session.mode === "access" || session.mode === "dev") {
    return json(
      {
        ok: true,
        ...session,
      },
      200,
      headers
    );
  }

  return json(
    {
      ok: true,
      authenticated: false,
      accessEmail: null,
      mode: null,
      passwordConfigured: session.passwordConfigured,
    },
    200,
    headers
  );
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { env, request } = context;
  setAuthHubEnv(env);

  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  try {
    if (pathname === "/admin") {
      return Response.redirect(new URL("/", url).toString(), 302);
    }

    if (pathname === "/admin/api/session" && request.method === "GET") {
      return handleAdminSession(request, env);
    }

    if (pathname === "/admin/api/login" && request.method === "POST") {
      return handleAdminLogin(request, env);
    }

    if (pathname === "/admin/api/logout" && request.method === "POST") {
      return handleAdminLogout(request, env);
    }

    if (pathname === "/admin/api" || pathname.startsWith("/admin/api/")) {
      const session = await readAdminSessionState(request, env);
      if (!session.authenticated) {
        return json(
          {
            error: "Admin authentication is required.",
          },
          401
        );
      }

      return proxyToService(env.AUTH_CORE, request, pathname);
    }

    if (isStaticAsset(pathname)) {
      return context.next();
    }

    if (request.method === "GET") {
      return context.next();
    }

    return new Response("Not found", { status: 404 });
  } catch (error) {
    await captureAuthHubError(error, {
      route: `auth-admin:${request.method} ${pathname}`,
      access_email: getCloudflareAccessEmail(request) ?? "",
    }).catch(() => undefined);

    return new Response("Internal error", { status: 500 });
  }
};
