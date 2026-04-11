import { canUseCloudflareAccessAdmin, getCloudflareAccessEmail } from "../../auth/lib/server/cloudflare-access";
import { captureAuthHubError } from "../../auth/lib/server/logger";
import { setAuthHubEnv, type AuthHubCloudflareEnv } from "../../auth/lib/server/cloudflare";

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

function renderAccessDeniedPage(request: Request): Response {
  const url = new URL(request.url);
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Access denied</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #eef3ff 0%, #f8fafc 100%);
        color: #0f172a;
      }
      .card {
        width: min(100%, 540px);
        border-radius: 24px;
        border: 1px solid #dbe2ee;
        background: rgba(255,255,255,0.96);
        box-shadow: 0 20px 80px rgba(15, 23, 42, 0.08);
        padding: 28px;
      }
      h1 { margin: 0 0 10px; font-size: 30px; letter-spacing: -0.03em; }
      p { margin: 0 0 12px; color: #475569; line-height: 1.6; }
      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 8px;
        padding: 12px 16px;
        border-radius: 14px;
        background: #2563eb;
        color: #fff;
        font-weight: 700;
        text-decoration: none;
      }
      code {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Access denied</h1>
      <p>This control surface is restricted to Cloudflare Access users.</p>
      <p>Request path: <code>${request.method} ${url.pathname}</code></p>
      <a href="/">Try again</a>
    </main>
  </body>
</html>`,
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { env, request } = context;
  setAuthHubEnv(env);

  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  try {
    if (!canUseCloudflareAccessAdmin(request, env)) {
      return renderAccessDeniedPage(request);
    }

    if (pathname === "/admin") {
      return Response.redirect(new URL("/", url).toString(), 302);
    }

    if (pathname === "/admin/api" || pathname.startsWith("/admin/api/")) {
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
