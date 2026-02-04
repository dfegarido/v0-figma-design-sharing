"use client";

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { PropertySwipeCard, type Property } from "./property-swipe-card";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "1",
    location: "Joondalup",
    address: "123 Ocean Drive, Joondalup WA 6027",
    images: ["/houses/house-1.jpg", "/houses/house-2.jpg"],
    bedrooms: 3,
    bathrooms: 1,
    carSpaces: 2,
    sqm: 457,
    price: 850000,
    ownerName: "Sarah Smith",
  },
  {
    id: "2",
    location: "Fremantle",
    address: "45 South Terrace, Fremantle WA 6160",
    images: ["/houses/house-3.jpg", "/houses/house-4.jpg"],
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    sqm: 520,
    price: 1200000,
    ownerName: "John Davis",
  },
  {
    id: "3",
    location: "Scarborough",
    address: "78 Beach Road, Scarborough WA 6019",
    images: ["/houses/house-5.jpg", "/houses/house-6.jpg"],
    bedrooms: 2,
    bathrooms: 1,
    carSpaces: 1,
    sqm: 320,
    price: 650000,
    ownerName: "Emma Wilson",
  },
];

interface SwipeScreenProps {
  onBack: () => void;
  onMatch: (property: Property) => void;
}

type SwipeState = "swiping" | "liked" | "matched";

export function SwipeScreen({ onBack, onMatch }: SwipeScreenProps) {
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>("swiping");
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null);

  const currentProperty = properties[currentIndex];

  const handleNope = () => {
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset for demo
      setCurrentIndex(0);
    }
  };

  const handleYup = () => {
    // Show "Liked!" screen
    setSwipeState("liked");
    
    // Simulate match check (30% chance)
    const isMatch = Math.random() < 0.3;
    
    setTimeout(() => {
      if (isMatch) {
        setMatchedProperty(currentProperty);
        setSwipeState("matched");
      } else {
        setSwipeState("swiping");
        if (currentIndex < properties.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }
    }, 1500);
  };

  const handleContinueAfterLike = () => {
    setSwipeState("swiping");
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleContinueAfterMatch = () => {
    setSwipeState("swiping");
    if (matchedProperty) {
      onMatch(matchedProperty);
    }
    setMatchedProperty(null);
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleChat = () => {
    if (matchedProperty) {
      onMatch(matchedProperty);
    }
  };

  // Liked Screen
  if (swipeState === "liked") {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <ScreenHeader onBack={onBack} />
        
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h2 className="text-3xl font-bold text-primary mb-8">Liked!</h2>
          <p className="text-center text-muted-foreground mb-8">
            We have let the property owner know you are<br />
            interested in their property! You can view your previous<br />
            likes from the main menu.
          </p>
          <button
            onClick={handleContinueAfterLike}
            className="flex items-center gap-2 text-lg"
          >
            Continue
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <PageFooter />
      </div>
    );
  }

  // Matched Screen
  if (swipeState === "matched" && matchedProperty) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <ScreenHeader onBack={onBack} />
        
        <div className="flex-1 flex flex-col items-center px-6">
          <h2 className="text-xl font-semibold mb-4">{matchedProperty.location}</h2>
          
          <div className="relative w-full max-w-sm aspect-square bg-secondary rounded-lg overflow-hidden mb-4">
            <Image
              src={matchedProperty.images[0] || "/placeholder.svg"}
              alt={matchedProperty.location}
              fill
              className="object-cover"
            />
          </div>

          {/* Property Stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-6">
            <span>{matchedProperty.bedrooms} beds</span>
            <span>{matchedProperty.bathrooms} bath</span>
            <span>{matchedProperty.carSpaces} car</span>
            <span>{matchedProperty.sqm} sqm</span>
          </div>

          <button
            onClick={handleChat}
            className="flex items-center gap-2 px-6 py-3 border-2 border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </button>
        </div>

        <PageFooter />
      </div>
    );
  }

  // Main Swiping Screen
  if (!currentProperty) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <ScreenHeader onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No more properties to show</p>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader onBack={onBack} />
      
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProperty.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            <PropertySwipeCard
              property={currentProperty}
              onNope={handleNope}
              onYup={handleYup}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <PageFooter />
    </div>
  );
}
