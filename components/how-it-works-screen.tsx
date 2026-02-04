"use client";

import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { Home, Heart, MessageCircle, ArrowLeftRight, CheckCircle } from "lucide-react";

interface HowItWorksScreenProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const STEPS = [
  {
    icon: Home,
    title: "List Your Property",
    description: "Upload photos and details about your current home. Tell us what makes it special.",
  },
  {
    icon: Heart,
    title: "Set Your Preferences",
    description: "Tell us what you're looking for - location, size, bedrooms, and your budget range.",
  },
  {
    icon: ArrowLeftRight,
    title: "Swipe & Match",
    description: "Browse properties that match your criteria. Swipe right on homes you love, left to pass.",
  },
  {
    icon: MessageCircle,
    title: "Connect & Chat",
    description: "When both parties like each other's homes, it's a match! Start chatting to discuss the swap.",
  },
  {
    icon: CheckCircle,
    title: "Make the Switch",
    description: "Agree on terms, handle any price differences, and switch homes. Simple!",
  },
];

export function HowItWorksScreen({ onBack, onGetStarted }: HowItWorksScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader onBack={onBack} />

      <div className="flex-1 px-6 py-4">
        <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-center text-muted-foreground mb-8">
          Swap homes instead of buying. It's that simple.
        </p>

        <div className="space-y-6">
          {STEPS.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-secondary rounded-lg">
          <h3 className="font-semibold mb-2 text-center">What about price differences?</h3>
          <p className="text-sm text-muted-foreground text-center">
            If one home is worth more than the other, the difference is settled outside the platform.
            For example, if your home is worth $1M and your match's is worth $800K, they would pay you $200K.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Perfect for downsizers looking to simplify and<br />
            upsizers ready for more space!
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get Started
          </button>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
