"use client";
// src/components/dashboard/SettingsForm.tsx
import { useState, FormEvent } from "react";

interface User {
  firstName: string | null; lastName: string | null; email: string;
  phone: string | null; nin: string | null; ninSubmitted: boolean;
  ninVerified: boolean; emailVerified: boolean; phoneVerified: boolean; role: string;
}

export default function SettingsForm({ user }: { user: User }) {
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [nin, setNin] = useState(user.nin ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [profileMsg, setProfileMsg] = useState({ text: "", ok: true });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileMsg({ text: "", ok: true }); setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, nin }),
      });
      const data = await res.json();
      setProfileMsg({ text: res.ok ? "Profile updated successfully." : (data.error || "Update failed"), ok: res.ok });
    } catch { setProfileMsg({ text: "Network error.", ok: false }); }
    setSavingProfile(false);
  }

  async function handlePwSave(e: FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg({ text: "Passwords do not match", ok: false }); return; }
    if (newPw.length < 8) { setPwMsg({ text: "Password must be at least 8 characters", ok: false }); return; }
    setPwMsg({ text: "", ok: true }); setSavingPw(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) { setPwMsg({ text: "Password updated successfully.", ok: true }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
      else setPwMsg({ text: data.error || "Update failed", ok: false });
    } catch { setPwMsg({ text: "Network error.", ok: false }); }
    setSavingPw(false);
  }

  return (
    <div>
      <form onSubmit={handleProfileSave} className="settings-card">
        <h2 className="settings-card-title">Profile Information</h2>

        <div className="form-row">
          <div>
            <label className="form-label">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="settings-field">
          <label className="form-label">Email address</label>
          <div className="form-input-wrap">
            <input value={user.email} disabled className="form-input form-input-disabled" />
            {user.emailVerified && <span className="badge badge-teal form-badge-inline">Verified</span>}
          </div>
          <p className="form-hint">Email cannot be changed</p>
        </div>

        <div className="settings-field">
          <label className="form-label">Phone number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="form-input" />
        </div>

        <div className="settings-field">
          <label className="form-label">
            NIN{" "}
            {user.ninVerified ? (
              <span className="badge badge-teal">Verified</span>
            ) : user.ninSubmitted ? (
              <span className="badge badge-warning">Pending Review</span>
            ) : null}
          </label>
          <input
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            placeholder="Enter your NIN"
            disabled={user.ninVerified}
            className={`form-input ${user.ninVerified ? "form-input-disabled" : ""}`}
          />
          {!user.ninVerified && (
            <p className="form-hint">
              {user.ninSubmitted
                ? "Your NIN is under review. Admin will verify within 24-48 hours."
                : "Submit your NIN for identity verification. It will be reviewed by our team."}
            </p>
          )}
        </div>

        {profileMsg.text && (
          <p className={profileMsg.ok ? "settings-msg-ok" : "settings-msg-err"}>{profileMsg.text}</p>
        )}

        <button type="submit" disabled={savingProfile} className="btn btn-primary settings-submit-btn">
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <form onSubmit={handlePwSave} className="settings-card">
        <h2 className="settings-card-title">Change Password</h2>

        <div className="settings-field">
          <label className="form-label">Current password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className="form-input" placeholder="Enter current password" />
        </div>
        <div className="settings-field">
          <label className="form-label">New password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className="form-input" placeholder="Min. 8 characters" />
        </div>
        <div className="settings-field">
          <label className="form-label">Confirm new password</label>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="form-input" placeholder="Repeat new password" />
        </div>

        {pwMsg.text && (
          <p className={pwMsg.ok ? "settings-msg-ok" : "settings-msg-err"}>{pwMsg.text}</p>
        )}

        <button type="submit" disabled={savingPw} className="btn btn-outline-teal settings-submit-btn">
          {savingPw ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="settings-card">
        <h3 className="settings-card-title">Account Role</h3>
        <span className="badge badge-teal">{user.role}</span>
        <p className="settings-role-desc">Your role determines what you can access in Stockwise.</p>
      </div>
    </div>
  );
}
