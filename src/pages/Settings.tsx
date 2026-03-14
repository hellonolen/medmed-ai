import React from "react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";

const SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "language", label: "Language" },
  { id: "notifications", label: "Notifications" },
  { id: "accessibility", label: "Accessibility" },
];

const Settings = () => {
  const { t } = useLanguage();
  const { highContrast, setHighContrast } = useAccessibility();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [active, setActive] = React.useState("appearance");

  const cardStyle = { backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" };

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
                { label: "Medication reminders", def: true },
                { label: "Health news", def: false },
              ].map(({ label, def }) => (
                <div key={label} className="flex items-center justify-between pl-1">
                  <p className="text-[13px] text-gray-600">{label}</p>
                  <Switch checked={def} disabled={!notifications} aria-label={`Toggle ${label}`} />
                </div>
              ))}
            </div>
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
