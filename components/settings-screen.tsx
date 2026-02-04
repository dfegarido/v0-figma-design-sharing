"use client";

import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { ChevronRight, User, Home, Bell, Shield, HelpCircle, LogOut } from "lucide-react";

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onPreferences: () => void;
  onMyProperty: () => void;
}

const SETTINGS_ITEMS = [
  { icon: User, label: "Edit Profile", action: "profile" },
  { icon: Home, label: "My Property", action: "property" },
  { icon: Bell, label: "Notifications", action: "preferences" },
  { icon: Shield, label: "Privacy & Security", action: "privacy" },
  { icon: HelpCircle, label: "Help & Support", action: "help" },
];

export function SettingsScreen({ onBack, onLogout, onPreferences, onMyProperty }: SettingsScreenProps) {
  const handleItemClick = (action: string) => {
    switch (action) {
      case "preferences":
        onPreferences();
        break;
      case "property":
        onMyProperty();
        break;
      default:
        // Other settings would go here
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader title="Settings" onBack={onBack} />

      <div className="flex-1 px-6 py-4">
        <div className="space-y-2">
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item.action}
              onClick={() => handleItemClick(item.action)}
              className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Log Out</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Switch My House v1.0.0</p>
          <p className="mt-1">© 2025 Switch My House</p>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
