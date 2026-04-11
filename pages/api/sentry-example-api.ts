import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

// Custom error class for Sentry testing
class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
// This endpoint ALWAYS captures errors to Sentry, bypassing environment checks
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentEnv = process.env.NODE_ENV || 'unknown';

  // Create the error
  const error = new SentryExampleAPIError(
    `🧪 TEST: Backend API error from test endpoint (Env: ${currentEnv})`
  );

  // ALWAYS capture the error, regardless of environment
  // This bypasses normal environment checks since it's a dedicated test endpoint
  Sentry.captureException(error, {
    tags: {
      test_page: 'true',
      test_type: 'manual',
      test_source: 'backend-api',
      original_env: currentEnv,
    },
    extra: {
      timestamp: new Date().toISOString(),
      note: 'This is a test error from the Sentry test API endpoint',
    },
  });

  console.log(`✅ Test error sent to Sentry from API (Env: ${currentEnv})`);
  console.log('🔍 Filter by: test_page:true');

  // Return error response
  res.status(500).json({
    error: error.message,
    environment: currentEnv,
    sentToSentry: true,
    timestamp: new Date().toISOString(),
    note: 'This test endpoint always sends errors to Sentry, bypassing environment checks'
  });
}
