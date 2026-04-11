export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  if (!initial) {
    return path;
  }

  try {
    const url = new URL(path, "mfcadmin://app.home");
    if (url.hostname === "expo-development-client") {
      const nested = url.searchParams.get("url");
      if (!nested) {
        return "/";
      }

      const nestedUrl = new URL(nested);
      const isOAuthCallback =
        nestedUrl.hostname === "oauth-callback" ||
        /\/(?:--\/)?oauth-callback\/?$/i.test(nestedUrl.pathname);
      if (isOAuthCallback) {
        const search = nestedUrl.search || "";
        const hash = nestedUrl.hash || "";
        return `/oauth-callback${search}${hash}`;
      }

      return "/";
    }
  } catch {
    return "/";
  }

  return path;
}
