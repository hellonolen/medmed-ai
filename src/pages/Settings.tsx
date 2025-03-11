
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, Bell, Globe, Eye, Moon, Sun, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";

const Settings = () => {
  const { t } = useLanguage();
  const { highContrast, setHighContrast, fontSize, setFontSize } = useAccessibility();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const currentYear = new Date().getFullYear();

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, this would apply a dark theme
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    // In a real app, this would update notification preferences
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="group gap-2 pl-1 pr-4">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>{t("navigation.back_home", "Back to Home")}</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">{t("settings.title", "Settings")}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-5 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.menu.title", "Menu")}</h2>
              <nav className="space-y-1">
                <a href="#appearance" className="flex items-center gap-2 py-2 px-3 rounded-md bg-primary/10 text-primary font-medium">
                  <Eye className="h-4 w-4" />
                  <span>{t("settings.menu.appearance", "Appearance")}</span>
                </a>
                <a href="#language" className="flex items-center gap-2 py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                  <Globe className="h-4 w-4" />
                  <span>{t("settings.menu.language", "Language")}</span>
                </a>
                <a href="#notifications" className="flex items-center gap-2 py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                  <Bell className="h-4 w-4" />
                  <span>{t("settings.menu.notifications", "Notifications")}</span>
                </a>
                <a href="#accessibility" className="flex items-center gap-2 py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                  <Lock className="h-4 w-4" />
                  <span>{t("settings.menu.accessibility", "Accessibility")}</span>
                </a>
              </nav>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-5 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.help.title", "Need Help?")}</h2>
              <p className="text-gray-600 mb-4">{t("settings.help.desc", "Having trouble with your settings? Our support team is here to help.")}</p>
              <Button className="w-full" variant="outline">{t("settings.help.contact", "Contact Support")}</Button>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <section id="appearance" className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.appearance.title", "Appearance")}</h2>
              <p className="text-gray-600 mb-6">{t("settings.appearance.desc", "Customize how MedMed.AI looks for you.")}</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-gray-900">{t("settings.appearance.dark_mode", "Dark Mode")}</h3>
                    <p className="text-sm text-gray-500">{t("settings.appearance.dark_mode_desc", "Switch between light and dark theme")}</p>
                  </div>
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 text-gray-400 mr-2" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={handleDarkModeToggle}
                      aria-label="Toggle dark mode"
                    />
                    <Moon className="h-4 w-4 text-gray-400 ml-2" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-gray-900">{t("settings.appearance.high_contrast", "High Contrast")}</h3>
                    <p className="text-sm text-gray-500">{t("settings.appearance.high_contrast_desc", "Increase visibility with high contrast mode")}</p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={() => setHighContrast(!highContrast)}
                    aria-label="Toggle high contrast"
                  />
                </div>
              </div>
            </section>
            
            <section id="language" className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.language.title", "Language")}</h2>
              <p className="text-gray-600 mb-6">{t("settings.language.desc", "Select your preferred language for the application.")}</p>
              
              <LanguageSwitcher />
            </section>
            
            <section id="notifications" className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.notifications.title", "Notifications")}</h2>
              <p className="text-gray-600 mb-6">{t("settings.notifications.desc", "Manage your notification preferences.")}</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-gray-900">{t("settings.notifications.enable", "Enable Notifications")}</h3>
                    <p className="text-sm text-gray-500">{t("settings.notifications.enable_desc", "Receive updates about new features and health information")}</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={handleNotificationToggle}
                    aria-label="Toggle notifications"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900">{t("settings.notifications.types", "Notification Types")}</h3>
                  
                  <div className="pl-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("settings.notifications.updates", "Product Updates")}</p>
                      <Switch
                        checked={true}
                        disabled={!notifications}
                        aria-label="Toggle product updates"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("settings.notifications.reminders", "Medication Reminders")}</p>
                      <Switch
                        checked={true}
                        disabled={!notifications}
                        aria-label="Toggle medication reminders"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("settings.notifications.news", "Health News")}</p>
                      <Switch
                        checked={false}
                        disabled={!notifications}
                        aria-label="Toggle health news"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="accessibility" className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-xl font-medium text-gray-800 mb-4">{t("settings.accessibility.title", "Accessibility")}</h2>
              <p className="text-gray-600 mb-6">{t("settings.accessibility.desc", "Adjust settings to make MedMed.AI more accessible.")}</p>
              
              <AccessibilityPanel />
            </section>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© {currentYear} MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
