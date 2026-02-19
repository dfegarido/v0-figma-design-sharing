"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  XCircle,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react"
import { mockSwaps, type AdminSwap } from "./mock-data"

const statusColors: Record<string, string> = {
  matched: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  completed: "bg-accent/10 text-accent-foreground border-accent/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusIcons: Record<string, typeof ArrowLeftRight> = {
  matched: ArrowLeftRight,
  "in-progress": Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

export function SwapsPage() {
  const [swaps, setSwaps] = useState(mockSwaps)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSwap, setSelectedSwap] = useState<AdminSwap | null>(null)
  const [assignDialog, setAssignDialog] = useState<AdminSwap | null>(null)

  const filtered = swaps.filter((s) => statusFilter === "all" || s.status === statusFilter)

  const stats = [
    { label: "Active Matches", value: swaps.filter((s) => s.status === "matched").length, color: "text-chart-3" },
    { label: "In Progress", value: swaps.filter((s) => s.status === "in-progress").length, color: "text-primary" },
    { label: "Completed", value: swaps.filter((s) => s.status === "completed").length, color: "text-accent-foreground" },
    { label: "Cancelled", value: swaps.filter((s) => s.status === "cancelled").length, color: "text-destructive" },
  ]

  const handleCancel = (id: string) => {
    setSwaps((prev) => prev.map((s) => s.id === id ? { ...s, status: "cancelled" as const } : s))
    setSelectedSwap(null)
  }

  const handleAssignRep = (id: string) => {
    setSwaps((prev) => prev.map((s) => s.id === id ? { ...s, representativeAssigned: "Zoe V." } : s))
    setAssignDialog(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Swaps</h1>
        <p className="text-sm text-muted-foreground">Track and manage all property swap matches</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="matched">Matched</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Match Date</TableHead>
                <TableHead>Representative</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((swap) => {
                const StatusIcon = statusIcons[swap.status]
                return (
                  <TableRow key={swap.id} className="cursor-pointer" onClick={() => setSelectedSwap(swap)}>
                    <TableCell className="text-sm font-mono text-muted-foreground">{swap.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={swap.userA.avatar} />
                          <AvatarFallback className="text-[10px]">{swap.userA.name[0]}</AvatarFallback>
                        </Avatar>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={swap.userB.avatar} />
                          <AvatarFallback className="text-[10px]">{swap.userB.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground ml-1 hidden lg:inline">
                          {swap.userA.name.split(" ")[0]} & {swap.userB.name.split(" ")[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-48 truncate">
                        {swap.propertyA}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{swap.matchDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {swap.representativeAssigned || (
                        <span className="text-muted-foreground/50">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] capitalize gap-1 ${statusColors[swap.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {swap.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSwap(swap) }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {!swap.representativeAssigned && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssignDialog(swap) }}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Rep
                            </DropdownMenuItem>
                          )}
                          {swap.status !== "cancelled" && swap.status !== "completed" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCancel(swap.id) }} className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Swap
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSwap} onOpenChange={() => setSelectedSwap(null)}>
        <DialogContent className="max-w-md">
          {selectedSwap && (
            <>
              <DialogHeader>
                <DialogTitle>Swap {selectedSwap.id}</DialogTitle>
                <DialogDescription>Match date: {selectedSwap.matchDate}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarImage src={selectedSwap.userA.avatar} />
                      <AvatarFallback>{selectedSwap.userA.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-foreground">{selectedSwap.userA.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-32 truncate">{selectedSwap.propertyA}</p>
                  </div>
                  <ArrowLeftRight className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarImage src={selectedSwap.userB.avatar} />
                      <AvatarFallback>{selectedSwap.userB.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-foreground">{selectedSwap.userB.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-32 truncate">{selectedSwap.propertyB}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[selectedSwap.status]}`}>
                    {selectedSwap.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Representative</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedSwap.representativeAssigned || "Unassigned"}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSwap(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Rep Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          {assignDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Assign Representative</DialogTitle>
                <DialogDescription>
                  Assign a Beagl representative to the swap between {assignDialog.userA.name} and {assignDialog.userB.name}.
                </DialogDescription>
              </DialogHeader>
              <Select defaultValue="zoe">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoe">Zoe V. (zoev@beagl.au)</SelectItem>
                  <SelectItem value="mark">Mark D. (markd@beagl.au)</SelectItem>
                  <SelectItem value="anna">Anna S. (annas@beagl.au)</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
                <Button onClick={() => handleAssignRep(assignDialog.id)}>Assign</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
