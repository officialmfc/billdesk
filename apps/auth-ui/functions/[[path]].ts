import { setAuthHubEnv, type AuthHubCloudflareEnv } from "../../auth/lib/server/cloudflare";
import { captureAuthHubError } from "../../auth/lib/server/logger";
import { routeAuthPage } from "../../auth/lib/ui-pages";

type PagesEnv = AuthHubCloudflareEnv & {
  AUTH_CORE?: {
    fetch: (request: Request) => Promise<Response>;
  };
  AUTH_POLICY?: {
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
    pathname === "/auth-client.js" ||
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

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { env, request } = context;
  setAuthHubEnv(env);

  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  try {
    if (pathname === "/admin/api" || pathname.startsWith("/admin/api/")) {
      return proxyToService(env.AUTH_CORE, request, pathname);
    }

    if (pathname.startsWith("/api/")) {
      if (
        pathname === "/api/auth/preflight" ||
        pathname === "/api/hooks/supabase/send-email"
      ) {
        return proxyToService(env.AUTH_POLICY, request, pathname);
      }

      return proxyToService(env.AUTH_CORE, request, pathname);
    }

    if (isStaticAsset(pathname)) {
      return context.next();
    }

    if (request.method === "GET") {
      return routeAuthPage(env, url, request);
    }

    return new Response("Not found", { status: 404 });
  } catch (error) {
    await captureAuthHubError(error, {
      route: `pages:${request.method} ${pathname}`,
    }).catch(() => undefined);

    return new Response("Internal error", { status: 500 });
  }
};
