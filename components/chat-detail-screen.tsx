"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Send, CheckCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  loadConversation,
  sendMessage,
  markMessagesRead,
  subscribeToMessages,
  type Message,
  type LoadedConversation,
  firstImageUrl,
} from "@/lib/matches"
import { ChatSkeleton } from "@/components/ui/chat-skeleton"

interface ChatDetailScreenProps {
  chatId: string
  onBack: () => void
  onViewProperty?: (propertyId: string) => void
  onViewProfile?: (userId: string) => void
}

function formatMessageTime(timestamp: string): string {
  const d = new Date(timestamp)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" })
}

export function ChatDetailScreen({
  chatId,
  onBack,
  onViewProperty,
  onViewProfile,
}: ChatDetailScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<LoadedConversation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(0)
  const isInitialLoadRef = useRef(true)

  const load = useCallback(async () => {
    setError(null)
    try {
      const { userId: uid, conversation: convo, messages: msgs } = await loadConversation(chatId)
      setUserId(uid)
      setConversation(convo)
      setMessages(msgs)
      prevLengthRef.current = msgs.length
      await markMessagesRead(chatId, uid)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load conversation."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [chatId])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!cancelled) await load()
    }
    void run()

    const unsubscribe = subscribeToMessages(chatId, ({ event, message }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id)
        if (exists) {
          return prev.map((m) => (m.id === message.id ? message : m))
        }
        if (event === "INSERT") {
          return [...prev, message]
        }
        return prev
      })

      // Mark messages from the other user as read.
      if (message.sender_id !== userId && userId) {
        markMessagesRead(chatId, userId).catch(() => {
          // best-effort
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [chatId, load, userId])

  // Scroll to bottom only when message count increases or on first load.
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const currentLength = messages.length
    const shouldScroll = isInitialLoadRef.current || currentLength > prevLengthRef.current
    if (shouldScroll) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
    prevLengthRef.current = currentLength
    isInitialLoadRef.current = false
  }, [messages.length])

  const handleSend = async () => {
    const text = newMessage.trim()
    if (!text || !userId || sending) return

    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      conversation_id: chatId,
      sender_id: userId,
      text,
      read: false,
      created_at: new Date().toISOString(),
    }

    setNewMessage("")
    setSending(true)
    setMessages((prev) => [...prev, optimistic])
    inputRef.current?.focus()

    try {
      const sent = await sendMessage(chatId, userId, text)
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? sent : m))
      )
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <ChatSkeleton />
  }

  if (error || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-4 top-4 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-center text-muted-foreground">{error || "Conversation not found or you do not have access."}</p>
        <Button variant="outline" onClick={load}>Retry</Button>
      </div>
    )
  }

  const otherName = conversation.other_user?.full_name || "Match"
  const otherAvatar = conversation.other_user?.avatar_url || "/placeholder.svg"
  const otherProperty = conversation.other_property

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-lg">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={() => {
            if (conversation.other_user_id && onViewProfile) {
              onViewProfile(conversation.other_user_id)
            }
          }}
          className="flex-1 flex items-center gap-3 min-w-0 text-left"
          disabled={!onViewProfile}
        >
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={otherAvatar} alt={otherName} />
            <AvatarFallback>{otherName[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{otherName}</h3>
          </div>
        </button>
      </div>

      {/* Property context */}
      {otherProperty && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={firstImageUrl(otherProperty.property_images) || "/placeholder.svg"}
                alt={otherProperty.address}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{otherProperty.suburb}</p>
              <p className="text-xs text-muted-foreground">${otherProperty.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => onViewProperty?.(otherProperty.id)}
              className="shrink-0"
            >
              <Badge variant="default" className="cursor-pointer">View</Badge>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isMe = message.sender_id === userId
              const isOptimistic = message.id.startsWith("temp-")
              const isRead = !isOptimistic && message.read

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card text-foreground rounded-bl-md border border-border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-muted-foreground">{formatMessageTime(message.created_at)}</span>
                      {isMe && isRead && (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      )}
                      {isMe && isOptimistic && (
                        <span className="text-[10px] text-muted-foreground">Sending…</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 h-12 rounded-full bg-secondary border-0 px-4"
            disabled={!userId || sending}
            maxLength={1000}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-full flex-shrink-0"
            disabled={!newMessage.trim() || !userId || sending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
