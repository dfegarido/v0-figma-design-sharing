"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Send, Phone, Video, MoreVertical, Image as ImageLucide, Home, CheckCheck, Users, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import NextImage from "next/image"
import { Badge } from "@/components/ui/badge"

interface ChatDetailScreenProps {
  chatId: string
  onBack: () => void
}

interface Message {
  id: string
  text: string
  sender: "me" | "them"
  timestamp: string
  read?: boolean
}

interface ChatData {
  id: string
  name: string
  avatar: string
  property: {
    image: string
    address: string
    price: number
  }
  online: boolean
  messages: Message[]
}

const chatData: Record<string, ChatData> = {
  "1": {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-1.jpg",
      address: "123 Ocean Drive, Bondi Beach",
      price: 2500000,
    },
    online: true,
    messages: [
      { id: "1", text: "Hi! I saw your property in Surry Hills and I absolutely love it!", sender: "them", timestamp: "10:30 AM" },
      { id: "2", text: "The layout is perfect for what we are looking for.", sender: "them", timestamp: "10:31 AM" },
      { id: "3", text: "Thank you so much! I really like your Bondi Beach property too. The ocean views are stunning!", sender: "me", timestamp: "10:35 AM", read: true },
      { id: "4", text: "Would you be open to scheduling a video tour sometime this week?", sender: "them", timestamp: "10:40 AM" },
      { id: "5", text: "Absolutely! How does Thursday afternoon work for you?", sender: "me", timestamp: "10:42 AM", read: true },
      { id: "6", text: "Thursday at 3pm would be perfect! I will send you a calendar invite.", sender: "them", timestamp: "10:45 AM" },
    ],
  },
  "2": {
    id: "2",
    name: "James Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-2.jpg",
      address: "45 Maple Street, Paddington",
      price: 1800000,
    },
    online: false,
    messages: [
      { id: "1", text: "Hey there! Your property caught my eye.", sender: "them", timestamp: "Yesterday" },
      { id: "2", text: "The neighborhood is really quiet, perfect for families", sender: "them", timestamp: "Yesterday" },
      { id: "3", text: "Hi James! Thanks for reaching out. Yes, it is a great area for families.", sender: "me", timestamp: "Yesterday", read: true },
    ],
  },
  "3": {
    id: "3",
    name: "Emma Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-3.jpg",
      address: "789 Harbour View, Darling Point",
      price: 4200000,
    },
    online: true,
    messages: [
      { id: "1", text: "Hello! I am very interested in discussing a potential swap.", sender: "them", timestamp: "2 days ago" },
      { id: "2", text: "Let me know when you are free to chat!", sender: "them", timestamp: "2 days ago" },
    ],
  },
  "4": {
    id: "4",
    name: "Michael Torres",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-4.jpg",
      address: "22 Park Lane, Mosman",
      price: 3100000,
    },
    online: false,
    messages: [
      { id: "1", text: "Hi! I noticed we both have similar sized properties.", sender: "them", timestamp: "3 days ago" },
      { id: "2", text: "Sounds great! Looking forward to it.", sender: "them", timestamp: "3 days ago" },
    ],
  },
}

export function ChatDetailScreen({ chatId, onBack }: ChatDetailScreenProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showRepDialog, setShowRepDialog] = useState(false)
  const [repRequested, setRepRequested] = useState(false)
  
  const chat = chatData[chatId] || chatData["1"]

  useEffect(() => {
    setMessages(chat.messages)
  }, [chat.messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    const newMessage: Message = {
      id: String(messages.length + 1),
      text: message,
      sender: "me",
      timestamp: "Just now",
      read: false,
    }
    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleRequestRep = () => {
    setRepRequested(true)
    setShowRepDialog(false)
    const repMessage: Message = {
      id: String(messages.length + 1),
      text: "A Beagl representative has been requested for this swap. They will review the match and reach out to both parties shortly.",
      sender: "them",
      timestamp: "Just now",
    }
    setMessages((prev) => [...prev, repMessage])
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    return `$${(price / 1000).toFixed(0)}K`
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <NextImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} width={40} height={40} className="object-cover" />
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{chat.name}</p>
                <p className="text-xs text-muted-foreground">{chat.online ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => !repRequested && setShowRepDialog(true)}
              disabled={repRequested}
            >
              <Users className={`h-5 w-5 ${repRequested ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Video className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Property card */}
      <div className="flex-shrink-0 px-4 py-3 bg-secondary/50">
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <NextImage src={chat.property.image || "/placeholder.svg"} alt="" width={56} height={56} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{chat.property.address}</p>
            <p className="text-primary font-semibold text-sm">{formatPrice(chat.property.price)}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
            <Home className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${msg.sender === "me" ? "order-2" : ""}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === "me" ? "justify-end" : ""}`}>
                  <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                  {msg.sender === "me" && msg.read && (
                    <CheckCheck className="h-3 w-3 text-accent" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Representative request banner */}
      {repRequested && (
        <div className="flex-shrink-0 px-4 py-2 bg-primary/5 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">Representative requested - a Beagl agent will contact both parties.</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-card border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0">
            <ImageLucide className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-11 rounded-xl bg-secondary border-0"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!message.trim()}
            className="rounded-xl flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Request Representative Dialog */}
      <AnimatePresence>
        {showRepDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowRepDialog(false)}
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", zIndex: 9998 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-card rounded-2xl p-6 shadow-2xl"
              style={{ maxWidth: "calc(32rem - 2rem)", marginLeft: "auto", marginRight: "auto", zIndex: 9999 }}
            >
              <button onClick={() => setShowRepDialog(false)} className="absolute top-4 right-4">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Request a Representative</h3>
                <p className="text-sm text-muted-foreground">
                  A Beagl representative will review this match and reach out to both parties to assist with the swap process.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 mb-6">
                <p className="text-xs text-muted-foreground text-center">
                  Contact: zoev@beagl.au
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl bg-transparent" onClick={() => setShowRepDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleRequestRep}>
                  Request
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
