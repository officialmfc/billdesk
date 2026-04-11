const cfg = window.__AUTH_HUB__ || {};

const $ = (selector) => document.querySelector(selector);

function statusEl() {
  return document.querySelector("[data-status]");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message, tone = "info") {
  const el = statusEl();
  if (!el) {
    return;
  }

  el.textContent = message;
  el.dataset.tone = tone;
  el.hidden = false;
}

function clearStatus() {
  const el = statusEl();
  if (!el) {
    return;
  }

  el.textContent = "";
  el.hidden = true;
}

function setBusy(container, busy) {
  if (!container) {
    return;
  }

  for (const element of container.querySelectorAll("button, input, select, textarea")) {
    element.disabled = busy;
    if (element instanceof HTMLButtonElement) {
      if (busy) {
        element.setAttribute("aria-busy", "true");
      } else {
        element.removeAttribute("aria-busy");
      }
    }
  }
}

function setButtonLabel(button, label) {
  if (!(button instanceof HTMLButtonElement)) {
    return () => {};
  }

  const labelEl = button.querySelector("[data-admin-button-label]");
  if (!(labelEl instanceof HTMLElement)) {
    return () => {};
  }

  const defaultLabel = labelEl.getAttribute("data-default-label") || labelEl.textContent || "";
  labelEl.textContent = label;
  return () => {
    labelEl.textContent = defaultLabel;
  };
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getQueryElement(selector) {
  return document.querySelector(selector);
}

function getCurrentQuery() {
  const emailInput = getQueryElement("#admin-email");
  const appSelect = getQueryElement("#admin-app");

  return {
    app: appSelect instanceof HTMLSelectElement ? appSelect.value.trim() : "",
    email: emailInput instanceof HTMLInputElement ? emailInput.value.trim() : "",
  };
}

function setActionButtonsEnabled(enabled) {
  const revokeAllButton = getQueryElement("[data-admin-revoke-all]");
  const resetRateLimitsButton = getQueryElement("[data-admin-reset-rate-limits]");

  if (revokeAllButton instanceof HTMLButtonElement) {
    revokeAllButton.disabled = !enabled;
  }

  if (resetRateLimitsButton instanceof HTMLButtonElement) {
    resetRateLimitsButton.disabled = !enabled;
  }
}

function renderEmptyState() {
  const accountsEl = getQueryElement("[data-admin-accounts]");
  const devicesEl = getQueryElement("[data-admin-devices]");
  const rateLimitsEl = getQueryElement("[data-admin-rate-limits]");
  const summaryEl = getQueryElement("[data-admin-summary]");

  if (summaryEl instanceof HTMLElement) {
    summaryEl.innerHTML = `<p class="small">Search by email to load account rows, devices, and rate-limit entries.</p>`;
  }

  if (accountsEl instanceof HTMLElement) {
    accountsEl.innerHTML = `<div class="admin-item"><p>Nothing loaded yet.</p></div>`;
  }

  if (devicesEl instanceof HTMLElement) {
    devicesEl.innerHTML = `<div class="admin-item"><p>Search for active devices.</p></div>`;
  }

  if (rateLimitsEl instanceof HTMLElement) {
    rateLimitsEl.innerHTML = `<div class="admin-item"><p>Search for rate-limit entries.</p></div>`;
  }

  setActionButtonsEnabled(false);
}

function renderAccounts(accounts) {
  const accountsEl = getQueryElement("[data-admin-accounts]");
  if (!(accountsEl instanceof HTMLElement)) {
    return;
  }

  if (!accounts.length) {
    accountsEl.innerHTML = `<div class="admin-item"><p>No matching account rows.</p></div>`;
    return;
  }

  accountsEl.innerHTML = accounts
    .map((account) => {
      const meta = [
        account.app,
        account.role,
        account.status,
        account.platform || "unknown platform",
        account.source,
      ]
        .filter(Boolean)
        .join(" · ");

      const deviceLine = [
        account.last_login_device_id ? `device ${account.last_login_device_id}` : null,
        account.last_login_ip ? `ip ${account.last_login_ip}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <div class="admin-item">
          <strong>${escapeHtml(account.full_name || account.email)}</strong>
          <small>${escapeHtml(account.email)}</small>
          <p>${escapeHtml(meta)}</p>
          ${deviceLine ? `<p>${escapeHtml(deviceLine)}</p>` : ""}
          ${account.business_name ? `<p>Business: ${escapeHtml(account.business_name)}</p>` : ""}
          ${account.auth_user_id ? `<p>Auth user: ${escapeHtml(account.auth_user_id)}</p>` : "<p>Auth user: unlinked</p>"}
        </div>
      `;
    })
    .join("");
}

function renderDevices(devices) {
  const devicesEl = getQueryElement("[data-admin-devices]");
  if (!(devicesEl instanceof HTMLElement)) {
    return;
  }

  if (!devices.length) {
    devicesEl.innerHTML = `<div class="admin-item"><p>No active device leases found.</p></div>`;
    return;
  }

  devicesEl.innerHTML = devices
    .map(
      (device) => `
        <div class="admin-item">
          <strong>${escapeHtml(device.device_label || "Unknown device")}</strong>
          <small>${escapeHtml([device.app, device.platform, device.status].filter(Boolean).join(" · "))}</small>
          <p>${escapeHtml(device.device_id)}</p>
          <p>Last seen: ${escapeHtml(formatDate(device.last_seen_at))}</p>
          <div class="admin-item-actions">
            <button class="button danger" type="button" data-admin-revoke-device="${escapeHtml(device.device_id)}">
              <span data-admin-button-label data-default-label="Revoke">Revoke</span>
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderRateLimits(rateLimits) {
  const rateLimitsEl = getQueryElement("[data-admin-rate-limits]");
  if (!(rateLimitsEl instanceof HTMLElement)) {
    return;
  }

  if (!rateLimits.length) {
    rateLimitsEl.innerHTML = `<div class="admin-item"><p>No matching rate-limit entries.</p></div>`;
    return;
  }

  rateLimitsEl.innerHTML = rateLimits
    .map((entry) => {
      return `
        <div class="admin-item">
          <strong>${escapeHtml(entry.action)}</strong>
          <small>${escapeHtml(entry.scope)} · ${escapeHtml(entry.value)}</small>
          <p>Count: ${escapeHtml(String(entry.count))}</p>
          <p>First seen: ${escapeHtml(formatDate(entry.firstSeenAt))}</p>
          <p>Last seen: ${escapeHtml(formatDate(entry.lastSeenAt))}</p>
          <p>Expires: ${escapeHtml(formatDate(entry.expiresAt))}</p>
        </div>
      `;
    })
    .join("");
}

function renderSummary(payload) {
  const summaryEl = getQueryElement("[data-admin-summary]");
  if (!(summaryEl instanceof HTMLElement)) {
    return;
  }

  const accounts = payload.accounts || [];
  const devices = payload.devices || [];
  const rateLimits = payload.rate_limits || [];
  const query = payload.query || {};

  summaryEl.innerHTML = `
    <div class="admin-item">
      <strong>${escapeHtml(query.email || "Search loaded")}</strong>
      <p>${escapeHtml([
        query.app ? `app ${query.app}` : "all apps",
        `${accounts.length} account row${accounts.length === 1 ? "" : "s"}`,
        `${devices.length} device${devices.length === 1 ? "" : "s"}`,
        `${rateLimits.length} rate limit${rateLimits.length === 1 ? "" : "s"}`,
      ].join(" · "))}</p>
      ${payload.access_email ? `<p>Access identity: ${escapeHtml(payload.access_email)}</p>` : ""}
    </div>
  `;
}

async function fetchAdminAccountSummary() {
  const query = getCurrentQuery();
  if (!query.email) {
    throw new Error("Email is required.");
  }

  const url = new URL("/admin/api/account", window.location.origin);
  url.searchParams.set("email", query.email);
  if (query.app) {
    url.searchParams.set("app", query.app);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not load the account.");
  }

  return payload;
}

async function refreshAdminView() {
  const payload = await fetchAdminAccountSummary();
  renderSummary(payload);
  renderAccounts(payload.accounts || []);
  renderDevices(payload.devices || []);
  renderRateLimits(payload.rate_limits || []);
  setActionButtonsEnabled((payload.accounts || []).length > 0 || (payload.devices || []).length > 0 || (payload.rate_limits || []).length > 0);
  return payload;
}

async function postAdminAction(pathname, body) {
  const response = await fetch(pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

async function bootAdmin() {
  const form = getQueryElement("#admin-form");
  const emailInput = getQueryElement("#admin-email");
  const appSelect = getQueryElement("#admin-app");
  const accessEmailEl = getQueryElement("[data-admin-access-email]");
  const revokeAllButton = getQueryElement("[data-admin-revoke-all]");
  const resetRateLimitsButton = getQueryElement("[data-admin-reset-rate-limits]");
  const devicesEl = getQueryElement("[data-admin-devices]");

  if (accessEmailEl instanceof HTMLElement && typeof cfg.accessEmail === "string" && cfg.accessEmail.trim()) {
    accessEmailEl.textContent = cfg.accessEmail.trim();
  }

  const url = new URL(window.location.href);
  const initialEmail = url.searchParams.get("email")?.trim() || "";
  const initialApp = url.searchParams.get("app")?.trim() || "";

  if (emailInput instanceof HTMLInputElement && initialEmail) {
    emailInput.value = initialEmail;
  }

  if (appSelect instanceof HTMLSelectElement && initialApp) {
    appSelect.value = initialApp;
  }

  renderEmptyState();

  const runSearch = async () => {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    clearStatus();
    setBusy(form, true);
    const resetLabel = setButtonLabel(form.querySelector('button[type="submit"]'), "Searching...");

    try {
      const payload = await refreshAdminView();
      setStatus(
        `${payload.accounts?.length || 0} account row(s), ${payload.devices?.length || 0} device(s), ${payload.rate_limits?.length || 0} rate-limit entries loaded.`,
        "success"
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load account data.", "error");
      renderEmptyState();
    } finally {
      resetLabel();
      setBusy(form, false);
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void runSearch();
  });

  revokeAllButton?.addEventListener("click", async () => {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (!window.confirm("Revoke all active devices for this account?")) {
      return;
    }

    try {
      clearStatus();
      setBusy(form, true);
      const query = getCurrentQuery();
      await postAdminAction("/admin/api/devices/revoke-all", query);
      setStatus("All active devices revoked.", "success");
      await refreshAdminView();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not revoke devices.", "error");
    } finally {
      setBusy(form, false);
    }
  });

  resetRateLimitsButton?.addEventListener("click", async () => {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (!window.confirm("Reset all matching rate-limit entries for this account?")) {
      return;
    }

    try {
      clearStatus();
      setBusy(form, true);
      const query = getCurrentQuery();
      const payload = await postAdminAction("/admin/api/rate-limits/reset", query);
      const resetCount = typeof payload.reset_count === "number" ? payload.reset_count : 0;
      setStatus(`Reset ${resetCount} rate-limit entr${resetCount === 1 ? "y" : "ies"}.`, "success");
      await refreshAdminView();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reset rate limits.", "error");
    } finally {
      setBusy(form, false);
    }
  });

  devicesEl?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const deviceId = target.getAttribute("data-admin-revoke-device");
    if (!deviceId || !(form instanceof HTMLFormElement)) {
      return;
    }

    try {
      clearStatus();
      setBusy(form, true);
      const query = getCurrentQuery();
      await postAdminAction("/admin/api/devices/revoke", {
        ...query,
        deviceId,
      });
      setStatus("Device revoked.", "success");
      await refreshAdminView();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not revoke device.", "error");
    } finally {
      setBusy(form, false);
    }
  });

  if (initialEmail) {
    await runSearch();
  }
}

bootAdmin().catch((error) => {
  setStatus(error instanceof Error ? error.message : "Could not load the admin page.", "error");
});
