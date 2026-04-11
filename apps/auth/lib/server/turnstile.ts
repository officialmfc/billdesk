import { getAuthHubEnv } from "@/lib/server/cloudflare";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<void> {
  const env = await getAuthHubEnv();
  const secret = env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    return;
  }

  if (!token) {
    throw new Error("Complete the security check first.");
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error("Could not verify the security check.");
  }

  const result = (await response.json()) as TurnstileVerifyResponse;
  if (!result.success) {
    throw new Error("The security check expired. Try again.");
  }
}
