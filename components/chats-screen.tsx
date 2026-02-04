"use client";

import { ScreenHeader } from "./screen-header";
import { PageFooter } from "./page-footer";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

interface Chat {
  id: string;
  name: string;
  address: string;
  image: string;
  unreadCount: number;
  lastMessage?: string;
}

const SAMPLE_CHATS: Chat[] = [
  {
    id: "1",
    name: "Sarah Smith",
    address: "1 Address Here, State Here, 1234",
    image: "/houses/house-1.jpg",
    unreadCount: 2,
    lastMessage: "Hi! I'm interested in your property...",
  },
  {
    id: "2",
    name: "Fred Jones",
    address: "2 Address Here, State Here, 1234",
    image: "/houses/house-2.jpg",
    unreadCount: 0,
    lastMessage: "Sounds great, let's arrange a viewing",
  },
  {
    id: "3",
    name: "Bill Bobbins",
    address: "3 Address Here, State Here, 1234",
    image: "/houses/house-3.jpg",
    unreadCount: 0,
    lastMessage: "Thanks for getting back to me",
  },
];

interface ChatsScreenProps {
  onBack: () => void;
  onOpenChat: (chatId: string) => void;
}

export function ChatsScreen({ onBack, onOpenChat }: ChatsScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScreenHeader title="My Chats" onBack={onBack} />

      <div className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {SAMPLE_CHATS.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onOpenChat(chat.id)}
              className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="relative w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={chat.image || "/placeholder.svg"}
                  alt={chat.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{chat.name}</p>
                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.address}</p>
              </div>

              <ChevronRight className="w-8 h-8 text-muted-foreground" strokeWidth={3} />
              <ChevronRight className="w-8 h-8 -ml-5 text-muted-foreground" strokeWidth={3} />
            </button>
          ))}
        </div>

        {SAMPLE_CHATS.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No chats yet. Match with someone to start chatting!
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
