// This file configures the initialization of Sentry for edge features.
// It is loaded for middleware/edge routes and also when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://2b41a61cf9c4fea22eb353e76fe7976e@o4508792765947904.ingest.us.sentry.io/4508872813256704",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
