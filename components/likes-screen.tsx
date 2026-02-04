"use client";

import { useState } from "react";
import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

interface Like {
  id: string;
  address: string;
  image: string;
  likeDate: string;
}

const LIKED_ME: Like[] = [
  {
    id: "1",
    address: "1 Address Here, State Here, 1234",
    image: "/houses/house-3.jpg",
    likeDate: "1 Jan 2025",
  },
  {
    id: "2",
    address: "2 Address Here, State Here, 1234",
    image: "/houses/house-4.jpg",
    likeDate: "11 Jan 2025",
  },
];

const I_LIKE: Like[] = [
  {
    id: "3",
    address: "3 Address Here, State Here, 1234",
    image: "/houses/house-5.jpg",
    likeDate: "5 Jan 2025",
  },
];

interface LikesScreenProps {
  onBack: () => void;
  onViewProperty: (likeId: string) => void;
}

export function LikesScreen({ onBack, onViewProperty }: LikesScreenProps) {
  const [activeTab, setActiveTab] = useState<"liked-me" | "i-like">("liked-me");

  const likes = activeTab === "liked-me" ? LIKED_ME : I_LIKE;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader title="Likes" onBack={onBack} />

      <div className="px-6 py-4">
        {/* Tabs */}
        <div className="flex bg-secondary rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("liked-me")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "liked-me"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-primary">❤️</span>
            Liked Me
          </button>
          <button
            onClick={() => setActiveTab("i-like")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "i-like"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-accent">💚</span>
            I Like
          </button>
        </div>

        {/* Likes List */}
        <div className="space-y-4">
          {likes.map((like) => (
            <div
              key={like.id}
              className="flex items-center gap-4 p-3 rounded-lg"
            >
              <div className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={like.image || "/placeholder.svg"}
                  alt={like.address}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-[10px] text-center py-0.5">
                  {like.likeDate}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{like.address}</p>
              </div>

              <button
                onClick={() => onViewProperty(like.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-8 h-8" strokeWidth={3} />
                <ChevronRight className="w-8 h-8 -ml-4" strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>

        {likes.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {activeTab === "liked-me" ? "No one has liked you yet" : "You haven't liked anyone yet"}
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
