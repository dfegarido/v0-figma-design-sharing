"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Flag,
  FlagOff,
  MessageCircle,
  Send,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { mockChats, type AdminChat } from "./mock-data"

const mockTranscript = [
  { sender: "Sarah Mitchell", message: "Hi! I saw your property on Collins St. It looks perfect for what I need.", time: "10:23 AM", isSystem: false },
  { sender: "Michael Torres", message: "Thanks Sarah! I've been looking at your Manly place too. The harbour views are stunning.", time: "10:25 AM", isSystem: false },
  { sender: "Sarah Mitchell", message: "Would you be open to arranging an inspection? I'm free this weekend.", time: "10:30 AM", isSystem: false },
  { sender: "Michael Torres", message: "Sounds great! Let me check my schedule for the inspection.", time: "10:32 AM", isSystem: false },
  { sender: "System", message: "Beagl representative Zoe V. has been assigned to this swap.", time: "10:45 AM", isSystem: true },
]

export function ChatsPage() {
  const [chats, setChats] = useState(mockChats)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedChat, setSelectedChat] = useState<AdminChat | null>(null)
  const [systemMessage, setSystemMessage] = useState("")
  const [transcript, setTranscript] = useState(mockTranscript)

  const filtered = chats.filter((c) => {
    const matchesSearch = c.participants.some((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    const matchesFilter = filter === "all" || (filter === "flagged" && c.flagged)
    return matchesSearch && matchesFilter
  })

  const handleToggleFlag = (id: string) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, flagged: !c.flagged } : c))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Chats</h1>
        <p className="text-sm text-muted-foreground">Monitor conversations between users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by participant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chats</SelectItem>
            <SelectItem value="flagged">Flagged Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-2">
          {filtered.map((chat) => (
            <Card
              key={chat.id}
              className={`cursor-pointer transition-all hover:border-primary/30 ${
                selectedChat?.id === chat.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex -space-x-2 flex-shrink-0">
                    {chat.participants.map((p, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-card">
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback className="text-[10px]">{p.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {chat.participants.map((p) => p.name.split(" ")[0]).join(" & ")}
                      </p>
                      {chat.flagged && (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{chat.lastActivity}</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {chat.messageCount} msgs
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No chats found.
            </div>
          )}
        </div>

        {/* Chat Transcript */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {selectedChat.participants.map((p, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-card">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback className="text-[10px]">{p.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div>
                      <CardTitle className="text-sm">
                        {selectedChat.participants.map((p) => p.name).join(" & ")}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedChat.messageCount} messages - {selectedChat.lastActivity}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFlag(selectedChat.id)}
                    className={selectedChat.flagged ? "text-destructive hover:text-destructive" : ""}
                  >
                    {selectedChat.flagged ? (
                      <><FlagOff className="mr-1 h-3.5 w-3.5" /> Unflag</>
                    ) : (
                      <><Flag className="mr-1 h-3.5 w-3.5" /> Flag</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={`${
                        msg.isSystem
                          ? "text-center"
                          : "flex gap-3"
                      }`}
                    >
                      {msg.isSystem ? (
                        <p className="text-xs text-muted-foreground bg-secondary/50 inline-block px-3 py-1.5 rounded-full">
                          {msg.message}
                        </p>
                      ) : (
                        <>
                          <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                            <AvatarImage
                              src={selectedChat.participants.find((p) => p.name === msg.sender)?.avatar}
                            />
                            <AvatarFallback className="text-[10px]">{msg.sender[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground">{msg.sender}</p>
                              <p className="text-[10px] text-muted-foreground">{msg.time}</p>
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{msg.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* System message input */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Input
                    placeholder="Send system message..."
                    value={systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    disabled={!systemMessage.trim()}
                    onClick={() => {
                      setTranscript((prev) => [
                        ...prev,
                        {
                          sender: "System",
                          message: systemMessage.trim(),
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          isSystem: true,
                        },
                      ])
                      setSystemMessage("")
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to view the transcript</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
