"use client";

import React from "react"

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
}

export function LoginScreen({ onBack, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader onBack={onBack} />

      <div className="flex-1 flex flex-col px-6">
        <h2 className="text-xl font-semibold text-center mb-8">Welcome Back!</h2>

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

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-2 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Log In
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
