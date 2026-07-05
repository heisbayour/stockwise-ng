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

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 max-w-xl">
      {/* Profile */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Profile Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <input value={user.email} disabled className={inputClass} />
              {user.emailVerified && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full sw-badge-teal">Verified</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div>
            <label className={labelClass}>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>
              NIN{" "}
              {user.ninVerified ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-1 sw-badge-teal">Verified</span>
              ) : user.ninSubmitted ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-1 sw-badge-warning">Pending Review</span>
              ) : null}
            </label>
            <input
              value={nin}
              onChange={(e) => setNin(e.target.value)}
              placeholder="Enter your NIN"
              disabled={user.ninVerified}
              className={inputClass}
            />
            {!user.ninVerified && (
              <p className="mt-1 text-xs text-gray-400">
                {user.ninSubmitted
                  ? "Your NIN is under review. Admin will verify within 24-48 hours."
                  : "Submit your NIN for identity verification. It will be reviewed by our team."}
              </p>
            )}
          </div>
        </div>

        {profileMsg.text && (
          <p className={`mt-4 text-sm ${profileMsg.ok ? "text-green-600" : "text-red-600"}`}>{profileMsg.text}</p>
        )}

        <button type="submit" disabled={savingProfile}
          className="mt-5 px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 sw-btn-primary">
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handlePwSave} className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className={inputClass} placeholder="Enter current password" />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className={inputClass} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputClass} placeholder="Repeat new password" />
          </div>
        </div>

        {pwMsg.text && (
          <p className={`mt-4 text-sm ${pwMsg.ok ? "text-green-600" : "text-red-600"}`}>{pwMsg.text}</p>
        )}

        <button type="submit" disabled={savingPw}
          className="mt-5 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 disabled:opacity-60 transition-colors border-[color:var(--color-teal)] sw-text-brand">
          {savingPw ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* Role badge */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Account Role</h3>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium sw-badge-teal">
          {user.role}
        </span>
        <p className="text-xs text-gray-400 mt-2">Your role determines what you can access in Stockwise.</p>
      </div>
    </div>
  );
}
