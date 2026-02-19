"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
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
  Search,
  MoreHorizontal,
  ShieldCheck,
  ShieldX,
  Ban,
  Trash2,
  Eye,
  UserX,
  X,
  Home,
  ArrowLeftRight,
  CreditCard,
  Calendar,
  Mail,
  Phone,
} from "lucide-react"
import { mockUsers, mockListings, mockPayments, type AdminUser } from "./mock-data"
import { Textarea } from "@/components/ui/textarea"

const statusColors: Record<string, string> = {
  active: "bg-accent/10 text-accent-foreground border-accent/20",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
  suspended: "bg-amber-500/10 text-amber-700 border-amber-500/20",
}

const verificationColors: Record<string, string> = {
  verified: "bg-accent/10 text-accent-foreground border-accent/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  unverified: "bg-secondary text-muted-foreground border-border",
}

const planLabels: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  single: "Single",
  free: "Free",
}

export function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [banDialog, setBanDialog] = useState<{ user: AdminUser; action: "ban" | "suspend" } | null>(null)
  const [banReason, setBanReason] = useState("")

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (userId: string, newStatus: AdminUser["status"]) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u))
    setBanDialog(null)
    setBanReason("")
  }

  const handleVerificationToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, verificationStatus: u.verificationStatus === "verified" ? "unverified" : "verified" }
          : u
      )
    )
  }

  const handleDelete = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Users</h1>
        <p className="text-sm text-muted-foreground">Manage all registered users on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.joinedDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] ${verificationColors[user.verificationStatus]}`}>
                      {user.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{planLabels[user.subscriptionPlan]}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.listingCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.matchCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[user.status]}`}>
                      {user.status}
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedUser(user) }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleVerificationToggle(user.id) }}>
                          {user.verificationStatus === "verified" ? (
                            <><ShieldX className="mr-2 h-4 w-4" /> Unverify</>
                          ) : (
                            <><ShieldCheck className="mr-2 h-4 w-4" /> Verify</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status !== "suspended" && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setBanDialog({ user, action: "suspend" }) }}
                            className="text-amber-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {user.status !== "banned" ? (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setBanDialog({ user, action: "ban" }) }}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(user.id, "active") }}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Unban
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleDelete(user.id) }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Panel */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg">{selectedUser.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[selectedUser.status]}`}>
                        {selectedUser.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[11px] ${verificationColors[selectedUser.verificationStatus]}`}>
                        {selectedUser.verificationStatus}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Joined {selectedUser.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{planLabels[selectedUser.subscriptionPlan]} plan</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-secondary/50">
                    <CardContent className="p-3 text-center">
                      <Home className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-lg font-bold text-foreground">{selectedUser.listingCount}</p>
                      <p className="text-[11px] text-muted-foreground">Listings</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardContent className="p-3 text-center">
                      <ArrowLeftRight className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-lg font-bold text-foreground">{selectedUser.matchCount}</p>
                      <p className="text-[11px] text-muted-foreground">Matches</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardContent className="p-3 text-center">
                      <CreditCard className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-lg font-bold text-foreground">
                        ${mockPayments.filter((p) => p.userId === selectedUser.id && p.status === "completed").reduce((sum, p) => sum + p.amount, 0).toFixed(0)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Spent</p>
                    </CardContent>
                  </Card>
                </div>

                {/* User's Listings */}
                {mockListings.filter((l) => l.ownerId === selectedUser.id).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Listings</h4>
                    <div className="space-y-2">
                      {mockListings.filter((l) => l.ownerId === selectedUser.id).map((listing) => (
                        <div key={listing.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                          <img
                            src={listing.image}
                            alt={listing.address}
                            className="w-12 h-12 rounded-lg object-cover"
                            crossOrigin="anonymous"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{listing.address}</p>
                            <p className="text-xs text-muted-foreground">{listing.suburb} - ${listing.price.toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] capitalize">{listing.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 mt-4">
                {selectedUser.status === "active" && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => setBanDialog({ user: selectedUser, action: "ban" })}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}
                {selectedUser.status === "banned" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(selectedUser.id, "active")
                      setSelectedUser({ ...selectedUser, status: "active" })
                    }}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Unban
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban/Suspend Confirmation Dialog */}
      <Dialog open={!!banDialog} onOpenChange={() => { setBanDialog(null); setBanReason("") }}>
        <DialogContent>
          {banDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {banDialog.action === "ban" ? "Ban" : "Suspend"} {banDialog.user.name}?
                </DialogTitle>
                <DialogDescription>
                  {banDialog.action === "ban"
                    ? "This will permanently ban the user from the platform. Their listings will be removed and they will not be able to log in."
                    : "This will temporarily suspend the user. They will not be able to use the platform until reinstated."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Reason</label>
                <Textarea
                  placeholder={`Enter reason for ${banDialog.action}...`}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setBanDialog(null); setBanReason("") }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleStatusChange(banDialog.user.id, banDialog.action === "ban" ? "banned" : "suspended")
                    if (selectedUser?.id === banDialog.user.id) {
                      setSelectedUser({ ...banDialog.user, status: banDialog.action === "ban" ? "banned" : "suspended" })
                    }
                  }}
                >
                  {banDialog.action === "ban" ? "Ban User" : "Suspend User"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
