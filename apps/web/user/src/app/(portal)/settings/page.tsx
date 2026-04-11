"use client";

import { useEffect, useState } from "react";

import { useUserApp } from "@/components/providers/user-app-provider";
import { supabase } from "@/lib/supabase";
import { updateMyProfile } from "@/lib/user-api";

export default function SettingsPage(): React.JSX.Element {
  const {
    profile,
    refreshProfile,
    logout,
    sellerSectionEnabled,
    setSellerSectionEnabled,
  } = useUserApp();
  const [name, setName] = useState(profile?.name ?? "");
  const [businessName, setBusinessName] = useState(profile?.businessName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [defaultRole, setDefaultRole] = useState<"buyer" | "seller">(profile?.defaultRole ?? "buyer");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
    setBusinessName(profile?.businessName ?? "");
    setPhone(profile?.phone ?? "");
    setDefaultRole(profile?.defaultRole ?? "buyer");
  }, [profile?.businessName, profile?.defaultRole, profile?.name, profile?.phone]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMyProfile({
        businessName,
        defaultRole,
        name,
        phone,
      });
      await refreshProfile();
      setMessage("Profile updated.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setChangingPassword(true);
    setMessage(null);
    try {
      if (!newPassword.trim()) {
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      setNewPassword("");
      setMessage("Password updated.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="stack">
      <section className="panel hero panel--soft">
        <div className="hero__top">
          <div>
            <p className="hero__eyebrow">User</p>
            <h1 className="hero__title">Settings</h1>
            <p className="hero__subtitle">
              Edit your profile, password, and seller section preference.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__body stack">
          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Business name</span>
              <input
                className="input"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Phone</span>
              <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Default role</span>
              <select
                className="select"
                value={defaultRole}
                onChange={(event) => setDefaultRole(event.target.value as "buyer" | "seller")}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          </div>

          <div className="toolbar">
            <div className="toolbar__group">
              <button className="button" type="button" onClick={() => void saveProfile()} disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__body stack">
          <div>
            <h2 className="card__title">Seller section</h2>
            <p className="card__subtitle">
              Keep seller navigation hidden until you want to use it.
            </p>
          </div>

          <div className="toolbar">
            <div className="toolbar__group">
              <button
                className={`nav-chip ${sellerSectionEnabled ? "nav-chip--active" : ""}`}
                type="button"
                onClick={() => void setSellerSectionEnabled(!sellerSectionEnabled)}
              >
                {sellerSectionEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__body stack">
          <div>
            <h2 className="card__title">Password</h2>
            <p className="card__subtitle">Change your password and keep the same browser session.</p>
          </div>

          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">New password</span>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
          </div>

          <div className="toolbar">
            <button
              className="button button--secondary"
              type="button"
              onClick={() => void changePassword()}
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Change password"}
            </button>
            <button className="button button--secondary" type="button" onClick={() => void logout()}>
              Log out
            </button>
          </div>
        </div>
      </section>

      {message ? <div className="auth-status auth-status--success">{message}</div> : null}
    </div>
  );
}
