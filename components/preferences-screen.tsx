"use client";

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PreferencesScreenProps {
  onBack: () => void;
}

export function PreferencesScreen({ onBack }: PreferencesScreenProps) {
  const [preferences, setPreferences] = useState({
    newMessages: true,
    newLikes: true,
    newMatches: true,
    visible: true,
  });

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader title="My Preferences" onBack={onBack} />

      <div className="flex-1 px-6 py-4">
        {/* Alerts Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 italic">Alerts</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-messages" className="text-base">New Messages</Label>
              <Switch
                id="new-messages"
                checked={preferences.newMessages}
                onCheckedChange={(checked) => updatePreference("newMessages", checked)}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="new-likes" className="text-base">New Likes</Label>
              <Switch
                id="new-likes"
                checked={preferences.newLikes}
                onCheckedChange={(checked) => updatePreference("newLikes", checked)}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="new-matches" className="text-base">New Matches</Label>
              <Switch
                id="new-matches"
                checked={preferences.newMatches}
                onCheckedChange={(checked) => updatePreference("newMatches", checked)}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 italic">Profile</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="visible" className="text-base">Visible</Label>
              <Switch
                id="visible"
                checked={preferences.visible}
                onCheckedChange={(checked) => updatePreference("visible", checked)}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              NOTE: If you disable this you will no longer receive matches or likes and will be totally hidden
            </p>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
