import {
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  ToggleLeft as Toggle,
} from "lucide-react";
import { useState } from "react";

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    analyticsData: false,
    cookieConsent: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink mb-2">
          Settings
        </h1>
        <p className="text-brand-ink/70">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <Bell className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-lg font-semibold text-brand-ink">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Email Notifications
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Receive notifications via email
                </p>
              </div>
              <button
                onClick={() => toggleNotification("email")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Push Notifications
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Receive push notifications in browser
                </p>
              </div>
              <button
                onClick={() => toggleNotification("push")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.push
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Weekly Summary
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Get weekly activity summary
                </p>
              </div>
              <button
                onClick={() => toggleNotification("weekly")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.weekly
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.weekly ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Marketing Emails
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Receive promotional content
                </p>
              </div>
              <button
                onClick={() => toggleNotification("marketing")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.marketing
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.marketing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <Shield className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-lg font-semibold text-brand-ink">
              Privacy & Security
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Public Profile
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Make your profile visible to others
                </p>
              </div>
              <button
                onClick={() => togglePrivacy("profilePublic")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.profilePublic
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.profilePublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Analytics Data
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Share usage data for improvements
                </p>
              </div>
              <button
                onClick={() => togglePrivacy("analyticsData")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.analyticsData
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.analyticsData ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-brand-ink">
                  Cookie Consent
                </h3>
                <p className="text-sm text-brand-ink/70">
                  Accept cookies for better experience
                </p>
              </div>
              <button
                onClick={() => togglePrivacy("cookieConsent")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.cookieConsent
                    ? "bg-brand-green"
                    : "bg-brand-green/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.cookieConsent ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-brand-green/10 rounded-lg">
              <Palette className="w-5 h-5 text-brand-green" />
            </div>
            <h2 className="text-lg font-semibold text-brand-ink">
              Appearance
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-brand-ink mb-3">Language</h3>
              <select className="w-full px-3 py-2 bg-white text-brand-ink border border-brand-green/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-200">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brand-green/12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Download className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-brand-ink">
              Data Management
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-brand-green/15 rounded-lg">
              <h3 className="font-medium text-brand-ink mb-2">
                Export Data
              </h3>
              <p className="text-sm text-brand-ink/70 mb-3">
                Download a copy of your data
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-brand-green hover:bg-brand-green-700 text-brand-cream rounded-full transition-colors duration-200 text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <h3 className="font-medium text-destructive mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-destructive/80 mb-3">
                Permanently delete your account and all data
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors duration-200 text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-700 text-brand-cream rounded-full transition-colors duration-200">
          Save All Changes
        </button>
      </div>
    </div>
  );
}
