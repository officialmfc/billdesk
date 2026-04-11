import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0?target=es2022";

const cfg = window.__AUTH_HUB__ || {};
const page = cfg.page || document.body.dataset.page || "login";
const $ = (selector) => document.querySelector(selector);
const statusEl = () => document.querySelector("[data-status]");
const TURNSTILE_SCRIPT_ID = "mfc-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const DEVICE_STORAGE_KEY = "mfc-auth-device-id";
const SENTRY_CLIENT = "mfc-auth-browser/1.0";
let turnstileScriptPromise = null;

const supabase =
  cfg.supabaseUrl && cfg.supabaseAnonKey
    ? createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
        },
      })
    : null;

function createBrowserSupabaseClient() {
  if (!supabase) {
    const error = new Error("Supabase is not configured.");
    void captureClientError(error, { phase: "create_supabase_client" });
    throw error;
  }

  return supabase;
}

function createEventId() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function parseSentryDsn(dsn) {
  try {
    const url = new URL(dsn);
    const segments = url.pathname.split("/").filter(Boolean);
    const projectId = segments.pop();
    const publicKey = url.username;
    if (!projectId || !publicKey) {
      return null;
    }

    return {
      host: url.host,
      pathPrefix: segments.length ? `/${segments.join("/")}` : "",
      projectId,
      protocol: url.protocol,
      publicKey,
    };
  } catch {
    return null;
  }
}

async function captureClientError(error, extra = {}) {
  const sentryDsn =
    (typeof cfg.sentryDsn === "string" && cfg.sentryDsn.trim()) ||
    "";

  if (!sentryDsn) {
    return;
  }

  const parsed = parseSentryDsn(sentryDsn);
  if (!parsed) {
    return;
  }

  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unexpected client error.");
  const eventId = createEventId();
  const endpoint =
    `${parsed.protocol}//${parsed.host}${parsed.pathPrefix}/api/${parsed.projectId}/envelope/` +
    `?sentry_key=${encodeURIComponent(parsed.publicKey)}` +
    `&sentry_version=7&sentry_client=${encodeURIComponent(SENTRY_CLIENT)}`;

  const event = {
    environment: cfg.context?.platform || "web",
    event_id: eventId,
    extra: {
      authHub: {
        ...extra,
        app: cfg.context?.app || "auth",
        flowId: cfg.flowId || null,
        page,
      },
    },
    level: "error",
    message: normalizedError.message || "Unexpected client error.",
    platform: "javascript",
    tags: {
      app: cfg.context?.app || "auth",
      page,
      platform: cfg.context?.platform || "web",
      source: "auth-worker-ui",
    },
    timestamp: Date.now() / 1000,
    exception: {
      values: [
        {
          type: normalizedError.name || "Error",
          value: normalizedError.message || "Unexpected client error.",
        },
      ],
    },
  };

  const envelope =
    `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n` +
    `${JSON.stringify({ type: "event" })}\n` +
    `${JSON.stringify(event)}\n`;

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
    },
    body: envelope,
  }).catch(() => undefined);
}

function installGlobalErrorHandlers() {
  if (window.__AUTH_HUB_SENTRY_BOUND__) {
    return;
  }

  window.__AUTH_HUB_SENTRY_BOUND__ = true;

  window.addEventListener("error", (event) => {
    void captureClientError(event.error || new Error(event.message || "Unexpected window error."), {
      columnNumber: event.colno,
      filename: event.filename,
      lineNumber: event.lineno,
      mechanism: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      event.reason instanceof Error
        ? event.reason
        : new Error(typeof event.reason === "string" ? event.reason : "Unhandled promise rejection.");
    void captureClientError(reason, { mechanism: "window.unhandledrejection" });
  });
}

function setStatus(message, tone = "info") {
  const el = statusEl();
  if (!el) return;
  el.textContent = message;
  el.dataset.tone = tone;
  el.hidden = false;
}

function clearStatus() {
  const el = statusEl();
  if (!el) return;
  el.textContent = "";
  el.hidden = true;
}

function setBusy(form, busy) {
  if (!form) return;
  const buttons = form.querySelectorAll("button");
  for (const button of buttons) {
    button.disabled = busy;
    if (busy) {
      button.setAttribute("aria-busy", "true");
    } else {
      button.removeAttribute("aria-busy");
    }
  }
}

function setButtonLabel(button, label) {
  if (!(button instanceof HTMLButtonElement)) {
    return () => {};
  }

  const labelEl = button.querySelector("[data-button-label]");
  if (!(labelEl instanceof HTMLElement)) {
    return () => {};
  }

  const defaultLabel =
    labelEl.getAttribute("data-default-label") ||
    labelEl.textContent ||
    "";

  labelEl.textContent = label;
  return () => {
    labelEl.textContent = defaultLabel;
  };
}

function createDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mfc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getBrowserDeviceId() {
  if (typeof cfg.deviceId === "string" && cfg.deviceId.trim()) {
    return cfg.deviceId.trim();
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const next = createDeviceId();
    window.localStorage.setItem(DEVICE_STORAGE_KEY, next);
    return next;
  } catch {
    return createDeviceId();
  }
}

function getBrowserDeviceLabel() {
  if (typeof cfg.deviceLabel === "string" && cfg.deviceLabel.trim()) {
    return cfg.deviceLabel.trim();
  }

  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    "Browser";
  return `${platform} browser`;
}

function getBrowserDeviceContext() {
  return {
    deviceId: getBrowserDeviceId(),
    deviceLabel: getBrowserDeviceLabel(),
  };
}

async function runAuthPreflight(action, extra = {}) {
  if (!cfg.context?.app || !cfg.context?.platform || !cfg.context) {
    throw new Error("The auth hub context is missing.");
  }

  const email =
    typeof extra.email === "string"
      ? extra.email.trim()
      : "";

  if (!email) {
    throw new Error("Email is required.");
  }

  const device = getBrowserDeviceContext();
  const response = await fetch("/api/auth/preflight", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      flowId: cfg.flowId || undefined,
      app: cfg.context.app,
      platform: cfg.context.platform,
      deviceId: device.deviceId,
      deviceLabel: device.deviceLabel,
      ...extra,
      email,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.reason || "Could not complete the security preflight.");
  }

  if (payload && payload.allowed === false) {
    throw new Error(payload.reason || "This account cannot continue.");
  }

  return payload;
}

function setupPasswordToggles() {
  for (const button of document.querySelectorAll("[data-password-toggle]")) {
    if (button.dataset.passwordToggleBound === "1") {
      continue;
    }

    button.dataset.passwordToggleBound = "1";
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-password-toggle");
      if (!targetId) {
        return;
      }

      const input = document.getElementById(targetId);
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const nextVisible = input.type === "password";
      input.type = nextVisible ? "text" : "password";
      button.textContent = nextVisible ? "Hide" : "Show";
      button.setAttribute("aria-label", nextVisible ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", nextVisible ? "true" : "false");
    });
  }
}

function pageContextParams() {
  const params = new URLSearchParams();
  if (cfg.flowId) {
    params.set("flow", cfg.flowId);
  }
  const context = cfg.context || {};
  if (context.app) params.set("app", context.app);
  if (context.platform) params.set("platform", context.platform);
  if (context.next) params.set("next", context.next);
  if (context.returnTo) params.set("return_to", context.returnTo);
  if (cfg.deviceId) params.set("device_id", cfg.deviceId);
  if (cfg.deviceLabel) params.set("device_label", cfg.deviceLabel);
  if (!cfg.flowId && !context.app) params.set("app", "manager");
  if (!cfg.flowId && !context.platform) params.set("platform", "web");
  return params;
}

function callbackUrl(pageName) {
  const url = new URL(`/${pageName}`, window.location.origin);
  const params = pageContextParams();
  for (const [key, value] of params.entries()) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function loginPageUrl() {
  if (cfg.context?.app && cfg.context?.platform) {
    return callbackUrl("login");
  }

  return `${window.location.origin}/login?app=manager&platform=web`;
}

function emailRedirectUrl(pageName) {
  return callbackUrl(pageName);
}

async function setupTurnstile({
  onTokenChange,
  onReadyChange,
} = {}) {
  const turnstileInput = document.querySelector("[data-turnstile-token]");
  const turnstileWidget = document.querySelector("#turnstile-widget");
  let captchaToken = "";
  const turnstileSiteKey = cfg.turnstileSiteKey || "";

  if (!turnstileSiteKey) {
    onReadyChange?.(false);
    return {
      captchaToken: "",
      ready: false,
      reset() {},
    };
  }

  try {
    await loadTurnstileScript();

    if (!window.turnstile) {
      throw new Error("Turnstile did not initialize.");
    }
    if (!turnstileWidget) {
      throw new Error("Security check container is missing.");
    }

    if (turnstileWidget instanceof HTMLElement) {
      turnstileWidget.innerHTML = "";
    }

    window.turnstile.render(turnstileWidget, {
      sitekey: turnstileSiteKey,
      callback(token) {
        captchaToken = token || "";
        if (turnstileInput) turnstileInput.value = captchaToken;
        onTokenChange?.(captchaToken || null);
      },
      "expired-callback"() {
        captchaToken = "";
        if (turnstileInput) turnstileInput.value = "";
        onTokenChange?.(null);
      },
      "error-callback"() {
        captchaToken = "";
        if (turnstileInput) turnstileInput.value = "";
        onTokenChange?.(null);
      },
    });

    onReadyChange?.(true);

    return {
      captchaToken,
      ready: true,
      reset() {
        if (window.turnstile) {
          window.turnstile.reset();
        }
        captchaToken = "";
        if (turnstileInput) turnstileInput.value = "";
        onTokenChange?.(null);
      },
    };
  } catch (error) {
    onReadyChange?.(false);
    throw error instanceof Error ? error : new Error("Security check failed to load.");
  }
}

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existing) {
    if (window.turnstile || existing.getAttribute("data-loaded") === "true") {
      return Promise.resolve();
    }

    turnstileScriptPromise = new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Turnstile failed to load.")),
        { once: true },
      );
    });
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error("Turnstile failed to load."));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

async function getSessionTokens() {
  const supabaseClient = createBrowserSupabaseClient();

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token || !session.refresh_token) {
    throw new Error("No authenticated session is available.");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

async function requestHandoff() {
  const tokens = await getSessionTokens();
  const response = await fetch("/api/auth/handoff", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      flowId: cfg.flowId || undefined,
      app: cfg.context?.app,
      deviceId: getBrowserDeviceContext().deviceId,
      deviceLabel: getBrowserDeviceContext().deviceLabel,
      platform: cfg.context?.platform,
      next: cfg.context?.next || undefined,
      returnTo: cfg.context?.returnTo || undefined,
    }),
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || "Could not create a session handoff." };
  }

  if (!response.ok) {
    if (response.status === 409 && payload.manage_url) {
      const manageUrl = new URL(payload.manage_url, window.location.origin);
      const device = getBrowserDeviceContext();
      if (!manageUrl.searchParams.has("device_id")) {
        manageUrl.searchParams.set("device_id", device.deviceId);
      }
      if (!manageUrl.searchParams.has("device_label")) {
        manageUrl.searchParams.set("device_label", device.deviceLabel);
      }
      window.location.assign(manageUrl.toString());
      return;
    }
    throw new Error(payload.error || "Could not create a session handoff.");
  }

  if (!payload.redirect_url) {
    throw new Error("The handoff response was incomplete.");
  }

  window.location.assign(payload.redirect_url);
}

async function settleSessionFromUrl({ redirectAfter = true } = {}) {
  const supabaseClient = createBrowserSupabaseClient();

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (error) {
    throw new Error(error);
  }

  if (code) {
    const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      throw exchangeError;
    }
  } else if (window.location.hash.includes("access_token=")) {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (access_token && refresh_token) {
      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) {
        throw sessionError;
      }
    }
  }

  if (redirectAfter) {
    await requestHandoff();
  }
}

async function bootLogin() {
  const form = document.querySelector("#login-form");
  const emailInput = document.querySelector("#login-email");
  const passwordInput = document.querySelector("#login-password");
  const googleButton = document.querySelector("#google-login");
  const magicLinkButton = document.querySelector("#request-magic-link");

  if (!form || !emailInput || !passwordInput) return;
  if (!emailInput.value && typeof cfg.emailSeed === "string" && cfg.emailSeed.trim()) {
    emailInput.value = cfg.emailSeed.trim();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(form, true);
    const submitButton =
      event.submitter instanceof HTMLButtonElement
        ? event.submitter
        : form.querySelector('button[type="submit"]');
    const resetSubmitLabel = setButtonLabel(submitButton, "Logging in...");

    try {
      await runAuthPreflight("login_password", { email: emailInput.value.trim() });
      const supabaseClient = createBrowserSupabaseClient();

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });

      if (error) {
        throw error;
      }

      setStatus("Authenticated. Preparing your session...", "info");
      await requestHandoff();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sign in.";
      setStatus(message, "error");
      await supabase?.auth.signOut({ scope: "local" }).catch(() => undefined);
    } finally {
      resetSubmitLabel();
      setBusy(form, false);
    }
  });

  googleButton?.addEventListener("click", async () => {
    clearStatus();
    setBusy(form, true);
    const resetGoogleLabel = setButtonLabel(googleButton, "Opening Google...");
    try {
      const supabaseClient = createBrowserSupabaseClient();
      const preflightEmail = emailInput.value.trim();
      if (preflightEmail) {
        await runAuthPreflight("login_password", { email: preflightEmail });
      }

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl("callback"),
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Google sign-in did not start.");
      window.location.assign(data.url);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not start Google sign-in.", "error");
    } finally {
      resetGoogleLabel();
      setBusy(form, false);
    }
  });

  magicLinkButton?.addEventListener("click", async () => {
    clearStatus();
    setBusy(form, true);
    const resetMagicLabel = setButtonLabel(magicLinkButton, "Sending...");
    try {
      await runAuthPreflight("magic_link", { email: emailInput.value.trim() });
      const supabaseClient = createBrowserSupabaseClient();

      const { error } = await supabaseClient.auth.signInWithOtp({
        email: emailInput.value.trim(),
        options: {
          emailRedirectTo: callbackUrl("confirm"),
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("Magic link sent. Check your email to continue.", "success");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not send a magic link.", "error");
    } finally {
      resetMagicLabel();
      setBusy(form, false);
    }
  });
}

async function bootSignup() {
  const form = document.querySelector("#signup-form");
  if (!form) return;

  const turnstileSiteKey = cfg.turnstileSiteKey || "";
  const captchaEnabled = Boolean(cfg.captchaEnabled) && page === "signup";
  const inviteToken = cfg.inviteToken || "";
  const inviteFields = document.querySelector("#invite-fields");
  const inviteStatus = document.querySelector("#invite-status");
  const nameInput = document.querySelector("#signup-name");
  const emailInput = document.querySelector("#signup-email");
  const phoneInput = document.querySelector("#signup-phone");
  const businessInput = document.querySelector("#signup-business");
  const messageInput = document.querySelector("#signup-message");
  const passwordInput = document.querySelector("#signup-password");
  const acceptedInvite = Boolean(inviteToken);
  const requireCaptcha = captchaEnabled && !acceptedInvite;
  const captchaRequired = Boolean(requireCaptcha);
  const turnstileInput = document.querySelector("[data-turnstile-token]");
  let captchaToken = "";
  let turnstileReady = false;
  let turnstileReset = () => {};
  let inviteContext = null;

  if (emailInput && !emailInput.value && typeof cfg.emailSeed === "string" && cfg.emailSeed.trim()) {
    emailInput.value = cfg.emailSeed.trim();
  }

  if (requireCaptcha) {
    try {
      const turnstile = await setupTurnstile({
        onTokenChange(token) {
          captchaToken = token || "";
        },
        onReadyChange(ready) {
          turnstileReady = ready;
        },
      });
      turnstileReady = turnstile.ready;
      turnstileReset = turnstile.reset;
      captchaToken = turnstile.captchaToken || "";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Security check failed to load.", "error");
    }
  }

  if (inviteToken) {
    try {
      const response = await fetch(`/api/invites/context?invite=${encodeURIComponent(inviteToken)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not verify this invite link.");
      }
      inviteContext = payload.context || null;
      if (!inviteContext) {
        throw new Error("This invite link is invalid or has expired.");
      }
      if (nameInput && inviteContext.full_name) nameInput.value = inviteContext.full_name;
      if (emailInput && inviteContext.email) emailInput.value = inviteContext.email;
      if (businessInput && inviteContext.business_name) businessInput.value = inviteContext.business_name;
      if (inviteFields) inviteFields.hidden = false;
      if (inviteStatus) inviteStatus.textContent = "Invite verified.";
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not verify this invite link.", "error");
      form.querySelector("button[type=submit]")?.setAttribute("disabled", "disabled");
      return;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(form, true);
    const submitButton =
      event.submitter instanceof HTMLButtonElement
        ? event.submitter
        : form.querySelector('button[type="submit"]');
    const resetSubmitLabel = setButtonLabel(
      submitButton,
      acceptedInvite ? "Create account..." : "Submitting request..."
    );

    try {
      await runAuthPreflight(
        acceptedInvite ? "invite_signup" : "self_registration",
        {
          email: emailInput.value.trim(),
          fullName: nameInput.value.trim(),
          metadata: {
            invite_token: inviteToken || null,
            business_name: businessInput?.value?.trim() || null,
            phone: phoneInput?.value?.trim() || null,
            requested_platform: cfg.context?.platform || "mobile",
          },
        },
      );
      if (captchaRequired && !turnstileReady) {
        throw new Error("Security check failed to load. Refresh the page.");
      }
      if (acceptedInvite) {
        const registrationResponse = await fetch("/api/register/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flowId: cfg.flowId || undefined,
            email: emailInput.value.trim(),
            fullName: nameInput.value.trim(),
            inviteToken,
            password: passwordInput.value,
          }),
        });
        const registrationPayload = await registrationResponse.json();
        if (!registrationResponse.ok || !registrationPayload.ok) {
          throw new Error(registrationPayload.error || "Could not create the invited account.");
        }

        setStatus("Account created. Signing you in...", "info");

        const supabaseClient = createBrowserSupabaseClient();

        const { error } = await supabaseClient.auth.signInWithPassword({
          email: emailInput.value.trim(),
          password: passwordInput.value,
          options: captchaRequired
            ? {
                captchaToken: captchaToken || undefined,
              }
            : undefined,
        });
        if (error) throw error;

        await requestHandoff();
        return;
      } else {
        if (!captchaRequired) {
          throw new Error("Complete the security check first.");
        }
        const response = await fetch("/api/register/self", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flowId: cfg.flowId || undefined,
            email: emailInput.value.trim(),
            fullName: nameInput.value.trim(),
            phone: phoneInput?.value?.trim() || undefined,
            businessName: businessInput?.value?.trim() || undefined,
            message: messageInput?.value?.trim() || undefined,
            requestedPlatform: cfg.context?.platform || "mobile",
            captchaToken: captchaToken || undefined,
          }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || "Could not submit the registration request.");
        }
        setStatus(
          payload.reused
            ? "Your registration request is already pending review."
            : "Registration request submitted. We will email you after approval.",
          "info",
        );
        phoneInput.value = "";
        businessInput.value = "";
        if (messageInput) messageInput.value = "";
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not create the account.", "error");
    } finally {
      resetSubmitLabel();
      turnstileReset();
      setBusy(form, false);
    }
  });
}

async function bootForgotPassword() {
  const form = document.querySelector("#forgot-form");
  if (!form) return;

  const emailInput = document.querySelector("#forgot-email");
  if (emailInput && !emailInput.value && typeof cfg.emailSeed === "string" && cfg.emailSeed.trim()) {
    emailInput.value = cfg.emailSeed.trim();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    setBusy(form, true);
    const submitButton =
      event.submitter instanceof HTMLButtonElement
        ? event.submitter
        : form.querySelector('button[type="submit"]');
    const resetSubmitLabel = setButtonLabel(submitButton, "Sending...");
    try {
      await runAuthPreflight("password_reset", { email: emailInput.value.trim() });
      const supabaseClient = createBrowserSupabaseClient();
      const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value.trim(), {
        redirectTo: emailRedirectUrl("reset-password"),
      });
      if (error) throw error;
      setStatus("Password reset email sent.", "info");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not send reset email.", "error");
    } finally {
      resetSubmitLabel();
      setBusy(form, false);
    }
  });
}

async function bootResetPassword() {
  const form = document.querySelector("#reset-form");
  if (!form) return;
  const passwordInput = document.querySelector("#reset-password");
  const openButton = document.querySelector("[data-open-handoff]");

  try {
    await settleSessionFromUrl({ redirectAfter: false });
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not restore your session.", "error");
  }

  openButton?.addEventListener("click", async () => {
    clearStatus();
    setBusy(form, true);
    const resetButtonLabel = setButtonLabel(openButton, "Updating password...");
    try {
      const supabaseClient = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      await runAuthPreflight("password_reset", {
        email: session?.user?.email || "",
      });
      const { error } = await supabaseClient.auth.updateUser({
        password: passwordInput.value,
      });
      if (error) throw error;
      setStatus("Password updated. Please sign in again.", "success");
      await supabaseClient.auth.signOut({ scope: "local" }).catch(() => undefined);
      window.location.assign(loginPageUrl());
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not update password.", "error");
    } finally {
      resetButtonLabel();
      setBusy(form, false);
    }
  });
}

async function bootAuthCallback() {
  try {
    await settleSessionFromUrl({ redirectAfter: true });
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not complete sign in.", "error");
  }
}

async function loadDeviceList() {
  const tokens = await getSessionTokens();
  const response = await fetch("/api/devices", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not load device list.");
  }

  return payload.devices || [];
}

async function touchCurrentDeviceLease() {
  const tokens = await getSessionTokens();
  const device = getBrowserDeviceContext();
  const response = await fetch("/api/devices/lease", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: cfg.context?.app,
      platform: cfg.context?.platform,
      deviceId: device.deviceId,
      deviceLabel: device.deviceLabel,
      mode: "touch",
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "This device is no longer active.");
    error.deviceLease = payload;
    throw error;
  }

  return payload.lease || null;
}

async function revokeCurrentDeviceLease(deviceId) {
  const tokens = await getSessionTokens();
  const response = await fetch("/api/devices/revoke", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deviceId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not revoke the device.");
  }

  return payload.revoked || null;
}

async function loadAccountSummary() {
  const tokens = await getSessionTokens();
  const response = await fetch("/api/account", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not load account.");
  }

  return payload;
}

async function requestPasswordResetForCurrentAccount() {
  const supabaseClient = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user?.email) {
    throw new Error("No account email is available.");
  }

  await runAuthPreflight("password_reset", { email: user.email });
  const redirectTo = `${window.location.origin}/reset-password/?${new URLSearchParams({
    app: cfg.context?.app || "manager",
    platform: cfg.context?.platform || "web",
    ...(cfg.context?.next ? { next: cfg.context.next } : {}),
    ...(cfg.context?.returnTo ? { return_to: cfg.context.returnTo } : {}),
  }).toString()}`;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(user.email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}

async function logoutAllAccountSessions() {
  const supabaseClient = createBrowserSupabaseClient();
  const tokens = await getSessionTokens();
  await fetch("/api/devices/revoke-all", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
  }).catch(() => undefined);
  await supabaseClient.auth.signOut({ scope: "global" }).catch(() => undefined);
}

async function bootAccount() {
  const emailEl = document.querySelector("[data-account-email]");
  const sessionEl = document.querySelector("[data-account-session]");
  const roleEl = document.querySelector("[data-account-role]");
  const statusEl = document.querySelector("[data-account-status]");
  const deviceListEl = document.querySelector("[data-device-list]");
  const refreshButton = document.querySelector("[data-account-refresh]");
  const logoutAllButton = document.querySelector("[data-account-logout-all]");
  const passwordResetButton = document.querySelector("[data-account-password-reset]");
  const logoutButton = document.querySelector("[data-account-logout]");

  if (!emailEl || !sessionEl || !deviceListEl) {
    return;
  }

  const renderDevices = (devices) => {
    deviceListEl.innerHTML = "";

    if (!devices.length) {
      deviceListEl.innerHTML = `<div class="device-card"><div class="small">No active device leases found.</div></div>`;
      return;
    }

    const currentDeviceId = getBrowserDeviceId();
    for (const device of devices) {
      const card = document.createElement("div");
      card.className = "device-card";
      const isCurrent = device.device_id === currentDeviceId;
      card.innerHTML = `
        <div class="device-row">
          <div>
            <strong>${device.device_label || "Unknown device"}</strong>
            <small>${device.app} · ${device.platform} · ${device.status}${isCurrent ? " · current device" : ""}</small>
            <small>Last seen: ${device.last_seen_at || "now"}</small>
          </div>
          <div class="pill">${device.device_id.slice(0, 8)}</div>
        </div>
        <div class="device-actions">
          <button class="button danger" type="button" data-revoke-device="${device.device_id}">Revoke</button>
        </div>
      `;
      deviceListEl.appendChild(card);
    }
  };

  const refresh = async () => {
    const supabaseClient = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      window.location.assign(loginPageUrl());
      return;
    }

    const accountPayload = await loadAccountSummary();
    const account = accountPayload.account || null;
    const devices = accountPayload.devices || [];
    emailEl.textContent = account?.full_name || user.email || "Signed in";
    sessionEl.textContent = cfg.context?.app && cfg.context?.platform
      ? "Session active. Verifying device lease..."
      : "Session active.";
    const accountRole =
      account?.role ||
      (accountPayload.access?.is_admin
        ? "admin"
        : accountPayload.access?.is_manager
          ? "manager"
          : "user");
    roleEl.textContent = `Role: ${accountRole}`;
    statusEl.textContent = `Account: ${account?.status || "active"}`;

    if (cfg.context?.app && cfg.context?.platform) {
      try {
        const lease = await touchCurrentDeviceLease();
        sessionEl.textContent = lease
          ? `Session active on ${lease.device_label}`
          : "Session active.";
      } catch (error) {
        const leasePayload =
          error instanceof Error && error.deviceLease && typeof error.deviceLease === "object"
            ? error.deviceLease
            : null;
        const activeDevice = leasePayload?.active_device;
        if (activeDevice) {
          const activeLabel =
            typeof activeDevice.device_label === "string" && activeDevice.device_label.trim()
              ? activeDevice.device_label.trim()
              : "another device";
          const message = `This slot is already active on ${activeLabel}. Revoke it to continue.`;
          sessionEl.textContent = message;
          setStatus(message, "error");
        } else {
          await supabaseClient.auth.signOut({ scope: "local" }).catch(() => undefined);
          const message = error instanceof Error ? error.message : "Device lease not active.";
          sessionEl.textContent = message;
          setStatus(message, "error");
          return;
        }
      }
    }

    renderDevices(devices);
  };

  refreshButton?.addEventListener("click", () => {
    void refresh().catch((error) => {
      setStatus(error instanceof Error ? error.message : "Could not refresh devices.", "error");
    });
  });

  deviceListEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const deviceId = target.getAttribute("data-revoke-device");
    if (!deviceId) {
      return;
    }

    try {
      clearStatus();
      setBusy(document.querySelector("#account-form"), true);
      await revokeCurrentDeviceLease(deviceId);
      if (deviceId === getBrowserDeviceId()) {
        const supabaseClient = createBrowserSupabaseClient();
        await supabaseClient.auth.signOut({ scope: "local" }).catch(() => undefined);
        window.location.assign(loginPageUrl());
        return;
      }
      await refresh();
      setStatus("Device revoked.", "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not revoke device.", "error");
    } finally {
      setBusy(document.querySelector("#account-form"), false);
    }
  });

  logoutButton?.addEventListener("click", async () => {
    const supabaseClient = createBrowserSupabaseClient();
    await supabaseClient.auth.signOut({ scope: "local" }).catch(() => undefined);
    window.location.assign(loginPageUrl());
  });

  logoutAllButton?.addEventListener("click", async () => {
    try {
      setBusy(document.querySelector("#account-form"), true);
      await logoutAllAccountSessions();
      window.location.assign(loginPageUrl());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not log out all sessions.", "error");
    } finally {
      setBusy(document.querySelector("#account-form"), false);
    }
  });

  passwordResetButton?.addEventListener("click", async () => {
    try {
      clearStatus();
      setBusy(document.querySelector("#account-form"), true);
      await requestPasswordResetForCurrentAccount();
      setStatus("Password reset email sent.", "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send password reset email.", "error");
    } finally {
      setBusy(document.querySelector("#account-form"), false);
    }
  });

  await refresh();
}

async function bootHandoff() {
  try {
    await requestHandoff();
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not create handoff.", "error");
  }
}

async function bootConfirm() {
  try {
    await settleSessionFromUrl({ redirectAfter: true });
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not confirm your account.", "error");
  }
}

const boots = {
  login: bootLogin,
  signup: bootSignup,
  "forgot-password": bootForgotPassword,
  "reset-password": bootResetPassword,
  callback: bootAuthCallback,
  confirm: bootConfirm,
  handoff: bootHandoff,
  account: bootAccount,
};

installGlobalErrorHandlers();
setupPasswordToggles();

boots[page]?.().catch((err) => {
  void captureClientError(err, { phase: "page_boot" });
  setStatus(err instanceof Error ? err.message : "Unexpected client error.", "error");
});
