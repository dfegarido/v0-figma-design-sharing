"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  RotateCcw,
  DollarSign,
  TrendingUp,
  Users,
  TrendingDown,
} from "lucide-react"
import { mockPayments, type AdminPayment, revenueChartData } from "./mock-data"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const statusColors: Record<string, string> = {
  completed: "bg-accent/10 text-accent-foreground border-accent/20",
  refunded: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}

const planLabels: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  single: "Single Unlock",
}

export function PaymentsPage() {
  const [payments, setPayments] = useState(mockPayments)
  const [statusFilter, setStatusFilter] = useState("all")
  const [refundDialog, setRefundDialog] = useState<AdminPayment | null>(null)
  const [detailPayment, setDetailPayment] = useState<AdminPayment | null>(null)

  const filtered = payments.filter((p) => statusFilter === "all" || p.status === statusFilter)

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0)
  const activeSubscriptions = payments.filter((p) => p.status === "completed" && p.plan !== "single").length
  const refunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0)
  const mrr = payments.filter((p) => p.status === "completed" && p.plan === "monthly").reduce((s, p) => s + p.amount, 0) +
    payments.filter((p) => p.status === "completed" && p.plan === "yearly").reduce((s, p) => s + (p.amount / 12), 0)

  const handleRefund = (id: string) => {
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "refunded" as const } : p))
    setRefundDialog(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono">Payments</h1>
        <p className="text-sm text-muted-foreground">Track revenue and manage transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-accent-foreground" />
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1 border-0">
                <TrendingUp className="h-3 w-3" /> +22%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">${mrr.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">MRR</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-chart-3" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeSubscriptions}</p>
            <p className="text-xs text-muted-foreground">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">${refunded.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 280)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" />
              <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 280)" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.9 0.02 280)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="oklch(0.82 0.12 165)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filter + Table */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm font-mono text-muted-foreground">{payment.id}</TableCell>
                  <TableCell className="text-sm text-foreground">{payment.userName}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{planLabels[payment.plan]}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] capitalize ${statusColors[payment.status]}`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailPayment(payment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {payment.status === "completed" && (
                          <DropdownMenuItem onClick={() => setRefundDialog(payment)} className="text-destructive">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={!!refundDialog} onOpenChange={() => setRefundDialog(null)}>
        <DialogContent>
          {refundDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Refund Transaction {refundDialog.id}?</DialogTitle>
                <DialogDescription>
                  This will refund ${refundDialog.amount.toFixed(2)} to {refundDialog.userName}. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRefundDialog(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleRefund(refundDialog.id)}>Process Refund</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailPayment} onOpenChange={() => setDetailPayment(null)}>
        <DialogContent className="max-w-sm">
          {detailPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {[
                  ["Transaction ID", detailPayment.id],
                  ["User", detailPayment.userName],
                  ["Amount", `$${detailPayment.amount.toFixed(2)}`],
                  ["Plan", planLabels[detailPayment.plan]],
                  ["Date", detailPayment.date],
                  ["Status", detailPayment.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailPayment(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
