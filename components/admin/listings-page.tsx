"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Eye,
  CheckCircle,
  Flag,
  Trash2,
  Bed,
  Bath,
  Car,
  Ruler,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react"
import { mockListings, type AdminListing } from "./mock-data"

const statusColors: Record<string, string> = {
  active: "bg-accent/10 text-accent-foreground border-accent/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  removed: "bg-destructive/10 text-destructive border-destructive/20",
  flagged: "bg-destructive/10 text-destructive border-destructive/20",
}

export function ListingsPage() {
  const [listings, setListings] = useState(mockListings)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)

  const filtered = listings.filter((l) => {
    const matchesSearch = l.address.toLowerCase().includes(search.toLowerCase()) ||
      l.suburb.toLowerCase().includes(search.toLowerCase()) ||
      l.ownerName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || l.status === statusFilter
    const matchesType = typeFilter === "all" || l.propertyType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleStatusChange = (id: string, status: AdminListing["status"]) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
  }

  const handleRemove = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
    setSelectedListing(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Listings</h1>
        <p className="text-sm text-muted-foreground">Manage all property listings on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address, suburb, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="unit">Unit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px]">Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((listing) => (
                <TableRow
                  key={listing.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedListing(listing)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.image}
                        alt={listing.address}
                        className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm text-foreground">{listing.address}</p>
                          {listing.verified && (
                            <ShieldCheck className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{listing.suburb}, {listing.state}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{listing.ownerName}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">${listing.price.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{listing.propertyType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{listing.matchCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[listing.status]}`}>
                      {listing.status}
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedListing(listing) }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {listing.status === "pending" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(listing.id, "active") }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {listing.status !== "flagged" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(listing.id, "flagged") }} className="text-amber-600">
                            <Flag className="mr-2 h-4 w-4" />
                            Flag
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRemove(listing.id) }} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
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
              No listings found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listing Detail Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-lg">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.address}</DialogTitle>
                <DialogDescription>{selectedListing.suburb}, {selectedListing.state}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <img
                  src={selectedListing.image}
                  alt={selectedListing.address}
                  className="w-full h-48 rounded-xl object-cover"
                  crossOrigin="anonymous"
                />

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-foreground">${selectedListing.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[selectedListing.status]}`}>
                      {selectedListing.status}
                    </Badge>
                    {selectedListing.verified && (
                      <Badge variant="outline" className="text-[11px] bg-accent/10 text-accent-foreground border-accent/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
                    <Bed className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold text-foreground">{selectedListing.bedrooms}</span>
                    <span className="text-[10px] text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
                    <Bath className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold text-foreground">{selectedListing.bathrooms}</span>
                    <span className="text-[10px] text-muted-foreground">Baths</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
                    <Car className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold text-foreground">{selectedListing.parking}</span>
                    <span className="text-[10px] text-muted-foreground">Parking</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
                    <Ruler className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold text-foreground">{selectedListing.landSize || "-"}</span>
                    <span className="text-[10px] text-muted-foreground">{"m\u00B2"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Owner: </span>
                    <span className="font-medium text-foreground">{selectedListing.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span>{selectedListing.matchCount} matches</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 mt-2">
                {selectedListing.status === "pending" && (
                  <Button onClick={() => { handleStatusChange(selectedListing.id, "active"); setSelectedListing({ ...selectedListing, status: "active" }) }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => handleRemove(selectedListing.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
                <Button variant="outline" onClick={() => setSelectedListing(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
