"use client";

import React from "react"

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SignupScreenProps {
  onBack: () => void;
  onSignup: () => void;
}

export function SignupScreen({ onBack, onSignup }: SignupScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreedToTerms) {
      onSignup();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader onBack={onBack} />

      <div className="flex-1 flex flex-col px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Home className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Lets Begin!</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-foreground/30 h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-foreground/30 h-12"
              required
            />
            <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
              Forgotten Password?
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the Terms & Conditions
            </Label>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="px-8 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up!
            </button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-muted-foreground py-4">
        © 2025 by Switch My House
      </div>

      <PageFooter />
    </div>
  );
}
