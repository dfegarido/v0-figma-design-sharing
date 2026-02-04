"use client";

import { Logo } from "./logo";
import { PageFooter } from "./page-footer";
import { ChevronRight, Home } from "lucide-react";

interface LandingScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onLearnMore: () => void;
}

export function LandingScreen({ onLogin, onSignup, onLearnMore }: LandingScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Logo size="lg" className="mb-16" />
        
        <div className="w-full max-w-xs space-y-4">
          {/* Login Button */}
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <ChevronRight className="w-8 h-8" strokeWidth={2} />
            </div>
            <span className="text-lg font-medium">Log in</span>
          </button>

          {/* Sign Up Button */}
          <button
            onClick={onSignup}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Home className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <span className="text-lg font-medium">Sign Up</span>
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            There is a new word in property, Switch!
          </p>
          <button 
            onClick={onLearnMore}
            className="text-primary hover:underline mt-1"
          >
            Learn more here
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
