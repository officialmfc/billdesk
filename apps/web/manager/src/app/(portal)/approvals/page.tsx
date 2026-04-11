"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type StaffRole = "admin" | "manager" | null;
type RegistrationKind = "self_signup" | "user_invite" | "manager_invite";
type RegistrationStatus = "pending_review" | "invited" | "opened" | "approved_activation";

type RegistrationRow = {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  registration_kind: RegistrationKind | string;
  payload_json: string;
  requested_app: string | null;
  requested_platform: string | null;
  created_at: string;
  status: RegistrationStatus | string;
};

function authBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

function safeParse(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function getAuthHubToken(supabase: ReturnType<typeof createClient>): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token?.trim();
  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

async function fetchAuthHubJson<T>(
  supabase: ReturnType<typeof createClient>,
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = await getAuthHubToken(supabase);
  const response = await fetch(`${authBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export default function ApprovalsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<StaffRole>(null);
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingRows = useMemo(
    () =>
      rows.filter((row) =>
        row.status === "pending_review" ||
        row.status === "invited" ||
        row.status === "opened" ||
        row.status === "approved_activation"
      ),
    [rows]
  );

  const selfRegistrationRows = useMemo(
    () =>
      pendingRows.filter(
        (row) =>
          row.registration_kind === "self_signup" && row.status === "pending_review"
      ),
    [pendingRows]
  );

  const inviteRows = useMemo(
    () => pendingRows.filter((row) => row.registration_kind !== "self_signup"),
    [pendingRows]
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: roleData, error: roleError } = await supabase.rpc("get_my_staff_role");
      if (roleError) {
        throw roleError;
      }

      const nextRole = roleData === "admin" || roleData === "manager" ? roleData : null;
      setRole(nextRole);

      const { rows: data } = await fetchAuthHubJson<{ rows: RegistrationRow[] }>(
        supabase,
        "/api/requests"
      );

      setRows(data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load approvals.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approveSelfRegistration = async (row: RegistrationRow) => {
    setBusyId(row.id);
    setError(null);

    try {
      await fetchAuthHubJson(supabase, `/api/requests/${row.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          requestId: row.id,
        }),
      });

      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not approve registration.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (row: RegistrationRow) => {
    const reason = window.prompt("Optional rejection reason");

    setBusyId(row.id);
    setError(null);

    try {
      await fetchAuthHubJson(supabase, `/api/requests/${row.id}/reject`, {
        method: "POST",
        body: JSON.stringify({
          requestId: row.id,
          reason: reason?.trim() || null,
        }),
      });

      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reject registration.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[28px] border border-slate-200 bg-white/90 p-10 text-slate-600 shadow-sm">
        Loading approvals...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Approvals</h1>
          <p className="mt-2 text-sm text-slate-600">Pending registrations and invitations.</p>
        </div>
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">
          Access denied. Only admin and manager accounts can review approvals.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Approvals</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review self-signups, user invites, and manager invites.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending users" value={selfRegistrationRows.length} />
        <StatCard label="Pending invites" value={inviteRows.length} />
        <StatCard label="Total pending" value={pendingRows.length} />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User approvals</h2>
          <p className="text-sm text-slate-600">Self-signups waiting for manager review.</p>
        </div>
        <div className="grid gap-4">
          {selfRegistrationRows.length ? (
            selfRegistrationRows.map((row) => (
              <RegistrationCard
                key={row.id}
                row={row}
                role={role}
                busy={busyId === row.id}
                showApprove
                onApprove={() => void approveSelfRegistration(row)}
                onReject={() => void reject(row)}
              />
            ))
          ) : (
            <EmptyState title="No user approvals" description="Everything is up to date." />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Manager invitations</h2>
          <p className="text-sm text-slate-600">Issued invitations waiting for activation.</p>
        </div>
        <div className="grid gap-4">
          {inviteRows.length ? (
            inviteRows.map((row) => (
              <RegistrationCard
                key={row.id}
                row={row}
                role={role}
                busy={busyId === row.id}
                showApprove={false}
                onReject={() => void reject(row)}
              />
            ))
          ) : (
            <EmptyState title="No manager invitations" description="Nothing is waiting for admin review." />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{description}</div>
    </div>
  );
}

function RegistrationCard({
  row,
  role,
  busy,
  showApprove,
  onApprove,
  onReject,
}: {
  row: RegistrationRow;
  role: StaffRole;
  busy: boolean;
  showApprove: boolean;
  onApprove?: () => void;
  onReject: () => void;
}) {
  const payload = safeParse(row.payload_json);
  const approvalTarget = row.registration_kind === "manager_invite" ? "staff" : "user";
  const canReject = true;
  const canApprove = showApprove && (approvalTarget === "staff" ? role === "admin" : true);

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {row.registration_kind.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {approvalTarget === "staff" ? "Manager invite" : "User approval"}
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {row.full_name || row.email}
            </div>
            <div className="text-sm text-slate-600">{row.email}</div>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <InfoLine label="Business" value={row.business_name || "—"} />
            <InfoLine label="Phone" value={row.phone || "—"} />
              <InfoLine label="Requested app" value={row.requested_app || "—"} />
              <InfoLine label="Platform" value={row.requested_platform || "—"} />
              <InfoLine
                label="Requested role"
                value={
                approvalTarget === "staff"
                  ? (payload.requested_staff_role as string | undefined) || "manager"
                  : `${(payload.requested_user_type as string | undefined) || "vendor"} / ${(payload.requested_default_role as string | undefined) || "buyer"}`
                }
              />
              <InfoLine label="Created" value={formatDate(row.created_at)} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:items-end">
          {approvalTarget === "staff" && showApprove && role !== "admin" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Admin approval only
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {showApprove ? (
              <button
                type="button"
                disabled={busy || !canApprove}
                onClick={() => {
                  if (onApprove) {
                    onApprove();
                  }
                }}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Working..." : "Approve"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy || !canReject}
              onClick={onReject}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-28 font-medium text-slate-500">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
