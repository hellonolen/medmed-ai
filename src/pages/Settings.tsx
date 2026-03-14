import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { toast } from "sonner";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "api-key", label: "API Key" },
  { id: "appearance", label: "Appearance" },
  { id: "language", label: "Language" },
  { id: "notifications", label: "Notifications" },
  { id: "accessibility", label: "Accessibility" },
];

const Settings = () => {
  const { t } = useLanguage();
  const { highContrast, setHighContrast } = useAccessibility();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [active, setActive] = useState("profile");

  // BYOA API key state
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const token = localStorage.getItem("medmed_token");
  const tier = (user as { tier?: string } | null)?.tier || "";
  const hasApiKeyAccess = tier === "enterprise" || tier === "max" || tier === "business";

  useEffect(() => {
    if (!token || !hasApiKeyAccess) return;
    fetch("https://medmed-agent.hellonolen.workers.dev/api/user/apikey", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then((d: unknown) => {
      const data = d as { apiKey?: string };
      if (data.apiKey) setApiKey(data.apiKey);
      setApiKeyLoaded(true);
    }).catch(() => {});
  }, [token, hasApiKeyAccess]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setApiKeySaving(true);
    try {
      await fetch("https://medmed-agent.hellonolen.workers.dev/api/user/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ apiKey }),
      });
      toast.success("API key saved. It will be used for all your AI requests.");
    } catch { toast.error("Failed to save API key."); }
    setApiKeySaving(false);
  };

  const handleRemoveApiKey = async () => {
    if (!token) return;
    setApiKey("");
    await fetch("https://medmed-agent.hellonolen.workers.dev/api/user/apikey", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    toast.success("API key removed. Platform key will be used.");
  };

  // Profile edit state
  const initName = (user as { name?: string; user_metadata?: { name?: string } } | null)
    ?.user_metadata?.name || (user as { name?: string } | null)?.name || "";
  const [displayName, setDisplayName] = useState(initName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const cardStyle = { backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" };
  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all";
  const inputStyle = { backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    // TODO: wire to worker PATCH /api/auth/profile when ready
    await new Promise((r) => setTimeout(r, 700));
    setProfileSaving(false);
    toast.success("Name updated.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    // TODO: wire to worker PATCH /api/auth/password when ready
    await new Promise((r) => setTimeout(r, 700));
    setPasswordSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated.");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex gap-8">
        {/* Left nav */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setActive(id)}
                className={`block px-3 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                  active === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* Profile */}
          <section id="profile" className="rounded-2xl border p-6 space-y-6" style={cardStyle}>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Profile</h2>
              <p className="text-[13px] text-gray-500">Update your display name and account email.</p>
            </div>

            {/* Name */}
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="s-name">Display name</label>
                <input id="s-name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name" className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="s-email">Email</label>
                <input id="s-email" type="email" value={(user as { email?: string } | null)?.email || ""} disabled
                  className={`${inputCls} opacity-60 cursor-not-allowed`} style={inputStyle} />
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed. Contact support if you need help.</p>
              </div>
              <button type="submit" disabled={profileSaving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {profileSaving ? "Saving..." : "Save name"}
              </button>
            </form>

            <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />

            {/* Password */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Change password</h3>
                <div className="space-y-3">
                  {[
                    { id: "s-cp", label: "Current password", val: currentPassword, set: setCurrentPassword },
                    { id: "s-np", label: "New password", val: newPassword, set: setNewPassword },
                    { id: "s-cfp", label: "Confirm new password", val: confirmPassword, set: setConfirmPassword },
                  ].map(({ id, label, val, set }) => (
                    <div key={id}>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor={id}>{label}</label>
                      <input id={id} type="password" value={val} onChange={e => set(e.target.value)}
                        placeholder="••••••••" className={inputCls} style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={passwordSaving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {passwordSaving ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>

          {/* Appearance */}
          <section id="appearance" className="rounded-2xl border p-6" style={cardStyle}>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">{t("settings.appearance.title", "Appearance")}</h2>
            <p className="text-[13px] text-gray-500 mb-5">{t("settings.appearance.desc", "Customize how MedMed.AI looks.")}</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-gray-800">Dark mode</p>
                  <p className="text-[12px] text-gray-500">Switch between light and dark</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
              </div>
              <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-gray-800">High contrast</p>
                  <p className="text-[12px] text-gray-500">Increase visibility</p>
                </div>
                <Switch checked={highContrast} onCheckedChange={() => setHighContrast(!highContrast)} aria-label="Toggle high contrast" />
              </div>
            </div>
          </section>

          {/* Language */}
          <section id="language" className="rounded-2xl border p-6" style={cardStyle}>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">{t("settings.language.title", "Language")}</h2>
            <p className="text-[13px] text-gray-500 mb-5">{t("settings.language.desc", "Select your preferred language.")}</p>
            <LanguageSwitcher />
          </section>

          {/* Notifications */}
          <section id="notifications" className="rounded-2xl border p-6" style={cardStyle}>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">{t("settings.notifications.title", "Notifications")}</h2>
            <p className="text-[13px] text-gray-500 mb-5">{t("settings.notifications.desc", "Manage your notification preferences.")}</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-gray-800">Enable notifications</p>
                  <p className="text-[12px] text-gray-500">Receive updates about new features</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} aria-label="Toggle notifications" />
              </div>
              <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
              {[
                { label: "Product updates", def: true },
                { label: "Feature announcements", def: false },
              ].map(({ label, def }) => (
                <div key={label} className="flex items-center justify-between pl-1">
                  <p className="text-[13px] text-gray-600">{label}</p>
                  <Switch checked={def} disabled={!notifications} aria-label={`Toggle ${label}`} />
                </div>
              ))}
            </div>
          </section>

          {/* API Key — Enterprise/Max only */}
          <section id="api-key" className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[15px] font-semibold text-gray-900">API Key (Bring Your Own)</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Enterprise / Max</span>
              </div>
              <p className="text-[13px] text-gray-500">
                Add your own Gemini API key to use your personal quota instead of the platform's. Your key is stored securely and never logged.
              </p>
            </div>

            {!hasApiKeyAccess ? (
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f0ebe2", border: "1px solid #e0d8cc" }}>
                <p className="text-[13px] text-gray-600 font-medium mb-1">Enterprise or Max plan required</p>
                <p className="text-[12px] text-gray-500">Upgrade your plan to add your own API key and bypass platform rate limits.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="s-apikey">Gemini API Key</label>
                  <input
                    id="s-apikey"
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIza…"
                    className={inputCls}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#7c3aed")}
                    onBlur={e => (e.target.style.borderColor = "#d8d0c0")}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Get a free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">aistudio.google.com</a>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={apiKeySaving || !apiKey}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {apiKeySaving ? "Saving…" : "Save API key"}
                  </button>
                  {apiKey && (
                    <button type="button" onClick={handleRemoveApiKey}
                      className="px-5 py-2.5 rounded-xl text-[13px] text-red-500 hover:text-red-700 transition-colors"
                      style={{ backgroundColor: "#f0ebe2" }}>
                      Remove key
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Accessibility */}
          <section id="accessibility" className="rounded-2xl border p-6" style={cardStyle}>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1">{t("settings.accessibility.title", "Accessibility")}</h2>
            <p className="text-[13px] text-gray-500 mb-5">{t("settings.accessibility.desc", "Make MedMed.AI more accessible.")}</p>
            <AccessibilityPanel />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
