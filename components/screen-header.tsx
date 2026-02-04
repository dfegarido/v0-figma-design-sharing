"use client";

import { ChevronLeft } from "lucide-react";
import { Logo } from "./logo";

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function ScreenHeader({ title, onBack, showBack = true }: ScreenHeaderProps) {
  return (
    <header className="flex flex-col items-center px-4 pt-6 pb-4">
      <Logo size="sm" />
      {(title || showBack) && (
        <div className="flex items-center w-full mt-4">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="absolute left-4 text-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-8 h-8" strokeWidth={3} />
            </button>
          )}
          {title && (
            <h1 className="text-xl font-semibold text-center w-full">{title}</h1>
          )}
        </div>
      )}
    </header>
  );
}
