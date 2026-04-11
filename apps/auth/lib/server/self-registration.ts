import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { policyUpsertAuthAccountDirectory } from "@/lib/server/policy-client";

export type SelfRegistrationInput = {
  email: string;
  fullName: string;
  phone?: string;
  businessName?: string;
  message?: string;
  requestedPlatform: "web" | "mobile";
};

function normalizeOptionalText(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}

function normalizeEmail(email: string): string {
  const trimmed = normalizeRequiredText(email, "Email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Enter a valid email address.");
  }

  return trimmed;
}

export async function submitSelfRegistration(input: SelfRegistrationInput): Promise<{
  requestId: string;
  reused: boolean;
}> {
  const env = await getAuthHubEnv();
  const db = env.auth_d1_binding;

  const email = normalizeEmail(input.email);
  const fullName = normalizeRequiredText(input.fullName, "Full name");
  const phone = normalizeOptionalText(input.phone);
  const businessName = normalizeOptionalText(input.businessName);
  const message = normalizeOptionalText(input.message);

  const existing = await db
    .prepare(
      `
        SELECT id
        FROM registration_requests
        WHERE kind = 'self_signup'
          AND email = ?
          AND status IN ('pending_review', 'approved_activation')
        ORDER BY created_at DESC
        LIMIT 1
      `
    )
    .bind(email)
    .first<{ id: string }>();

  if (existing?.id) {
    return {
      requestId: existing.id,
      reused: true,
    };
  }

  const requestId = crypto.randomUUID();
  const payload = JSON.stringify({});

  await db
    .prepare(
      `
        INSERT INTO registration_requests (
          id,
          kind,
          target_app,
          status,
          email,
          full_name,
          editable_name,
          phone,
          business_name,
          message,
          payload_json,
          requested_platform,
          created_at,
          updated_at
        )
        VALUES (?, 'self_signup', 'user', 'pending_review', ?, ?, 1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      requestId,
      email,
      fullName,
      phone,
      businessName,
      message,
      payload,
      input.requestedPlatform
    )
    .run();

  await db
    .prepare(
      `
        INSERT INTO registration_events (
          request_id,
          event_type,
          metadata_json,
          created_at
        )
        VALUES (?, 'self_signup_submitted', ?, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      requestId,
      JSON.stringify({
        email,
        requested_platform: input.requestedPlatform,
      })
    )
    .run();

  await policyUpsertAuthAccountDirectory({
    app: "user",
    email,
    fullName,
    role: "user",
    source: "self_registration",
    status: "pending_review",
    businessName,
    metadata: {
      phone,
      message,
      requested_platform: input.requestedPlatform,
    },
    platform: input.requestedPlatform,
  });

  return {
    requestId,
    reused: false,
  };
}
