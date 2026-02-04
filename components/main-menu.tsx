"use client";

import { Logo } from "./logo";
import { PageFooter } from "./page-footer";

interface MainMenuProps {
  matchCount?: number;
  likeCount?: number;
  chatCount?: number;
  onMatches: () => void;
  onLikes: () => void;
  onChats: () => void;
  onSettings: () => void;
  onPreferences: () => void;
  onMyProperty: () => void;
}

interface MenuButtonProps {
  label: string;
  badge?: number;
  badgeColor?: string;
  subtext?: string;
  onClick: () => void;
}

function MenuButton({ label, badge, badgeColor = "bg-primary", subtext, onClick }: MenuButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className="relative px-8 py-3 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors min-w-[160px]"
      >
        {badge !== undefined && badge > 0 && (
          <span className={`absolute -top-2 -right-2 w-6 h-6 ${badgeColor} rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground`}>
            {badge}
          </span>
        )}
        <span className="font-medium">{label}</span>
      </button>
      {subtext && (
        <span className="text-primary text-sm mt-1">{subtext}</span>
      )}
    </div>
  );
}

export function MainMenu({
  matchCount = 0,
  likeCount = 0,
  chatCount = 0,
  onMatches,
  onLikes,
  onChats,
  onSettings,
  onPreferences,
  onMyProperty,
}: MainMenuProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex justify-center pt-6 pb-4">
        <Logo size="sm" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <MenuButton
          label="My Matches"
          badge={matchCount}
          badgeColor="bg-primary"
          subtext={matchCount > 0 ? "You have new matches!" : undefined}
          onClick={onMatches}
        />
        
        <MenuButton
          label="My Likes"
          badge={likeCount}
          badgeColor="bg-accent"
          subtext={likeCount > 0 ? "You have new likes!" : undefined}
          onClick={onLikes}
        />
        
        <MenuButton
          label="My Chats"
          badge={chatCount}
          badgeColor="bg-primary"
          subtext={chatCount > 0 ? "You have new messages!" : undefined}
          onClick={onChats}
        />

        <div className="mt-8">
          <button
            onClick={onSettings}
            className="px-8 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            Settings
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onPreferences}
            className="px-4 py-2 border border-foreground rounded-lg hover:bg-foreground/5 transition-colors text-sm"
          >
            My Preference
          </button>
          <button
            onClick={onMyProperty}
            className="px-4 py-2 border border-foreground rounded-lg hover:bg-foreground/5 transition-colors text-sm"
          >
            My Property
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground py-4">
        © 2025 by Switch My House
      </div>

      <PageFooter />
    </div>
  );
}
