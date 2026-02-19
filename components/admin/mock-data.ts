export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  joinedDate: string
  verificationStatus: "verified" | "pending" | "unverified"
  subscriptionPlan: "monthly" | "yearly" | "single" | "free"
  status: "active" | "banned" | "suspended"
  listingCount: number
  matchCount: number
  lastActive: string
}

export interface AdminListing {
  id: string
  address: string
  suburb: string
  state: string
  ownerId: string
  ownerName: string
  price: number
  propertyType: "house" | "apartment" | "townhouse" | "unit"
  bedrooms: number
  bathrooms: number
  parking: number
  landSize: number
  status: "active" | "pending" | "removed" | "flagged"
  verified: boolean
  dateListed: string
  matchCount: number
  image: string
}

export interface AdminSwap {
  id: string
  userA: { id: string; name: string; avatar: string }
  userB: { id: string; name: string; avatar: string }
  propertyA: string
  propertyB: string
  matchDate: string
  status: "matched" | "in-progress" | "completed" | "cancelled"
  representativeAssigned: string | null
}

export interface AdminChat {
  id: string
  participants: { name: string; avatar: string }[]
  lastMessage: string
  messageCount: number
  flagged: boolean
  lastActivity: string
  swapId: string | null
}

export interface AdminPayment {
  id: string
  userId: string
  userName: string
  amount: number
  plan: "monthly" | "yearly" | "single"
  date: string
  status: "completed" | "refunded" | "failed"
}

export interface AdminVerification {
  id: string
  userId: string
  userName: string
  userAvatar: string
  propertyAddress: string
  documentType: "title-deed" | "rates-notice" | "utility-bill"
  submittedDate: string
  status: "pending" | "approved" | "rejected"
}

export interface ActivityItem {
  id: string
  type: "signup" | "verification" | "ban" | "payment" | "listing" | "swap"
  message: string
  timestamp: string
  user?: string
}

// --- Mock Users ---
export const mockUsers: AdminUser[] = [
  {
    id: "u1", name: "Sarah Mitchell", email: "sarah.m@email.com", phone: "+61 412 345 678",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    joinedDate: "2025-08-15", verificationStatus: "verified", subscriptionPlan: "yearly",
    status: "active", listingCount: 2, matchCount: 5, lastActive: "2 hours ago"
  },
  {
    id: "u2", name: "James Cooper", email: "james.c@email.com", phone: "+61 421 987 654",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    joinedDate: "2025-09-02", verificationStatus: "verified", subscriptionPlan: "monthly",
    status: "active", listingCount: 1, matchCount: 3, lastActive: "5 hours ago"
  },
  {
    id: "u3", name: "Emily Wong", email: "emily.w@email.com", phone: "+61 433 456 789",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    joinedDate: "2025-09-20", verificationStatus: "pending", subscriptionPlan: "free",
    status: "active", listingCount: 1, matchCount: 0, lastActive: "1 day ago"
  },
  {
    id: "u4", name: "Michael Torres", email: "michael.t@email.com", phone: "+61 444 111 222",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    joinedDate: "2025-07-10", verificationStatus: "verified", subscriptionPlan: "yearly",
    status: "active", listingCount: 3, matchCount: 8, lastActive: "30 min ago"
  },
  {
    id: "u5", name: "Lisa Patel", email: "lisa.p@email.com", phone: "+61 455 333 444",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    joinedDate: "2025-10-01", verificationStatus: "unverified", subscriptionPlan: "free",
    status: "active", listingCount: 0, matchCount: 0, lastActive: "3 days ago"
  },
  {
    id: "u6", name: "David Kim", email: "david.k@email.com", phone: "+61 466 555 666",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    joinedDate: "2025-06-22", verificationStatus: "verified", subscriptionPlan: "monthly",
    status: "banned", listingCount: 1, matchCount: 2, lastActive: "2 weeks ago"
  },
  {
    id: "u7", name: "Rachel Green", email: "rachel.g@email.com", phone: "+61 477 888 999",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    joinedDate: "2025-11-05", verificationStatus: "verified", subscriptionPlan: "single",
    status: "active", listingCount: 1, matchCount: 1, lastActive: "6 hours ago"
  },
  {
    id: "u8", name: "Tom Bradley", email: "tom.b@email.com", phone: "+61 488 000 111",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    joinedDate: "2025-08-30", verificationStatus: "pending", subscriptionPlan: "free",
    status: "suspended", listingCount: 1, matchCount: 0, lastActive: "1 week ago"
  },
  {
    id: "u9", name: "Amanda Chen", email: "amanda.c@email.com", phone: "+61 499 222 333",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    joinedDate: "2025-12-01", verificationStatus: "verified", subscriptionPlan: "yearly",
    status: "active", listingCount: 2, matchCount: 4, lastActive: "1 hour ago"
  },
  {
    id: "u10", name: "Chris Anderson", email: "chris.a@email.com", phone: "+61 411 444 555",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    joinedDate: "2025-10-15", verificationStatus: "verified", subscriptionPlan: "monthly",
    status: "active", listingCount: 1, matchCount: 2, lastActive: "4 hours ago"
  },
]

// --- Mock Listings ---
export const mockListings: AdminListing[] = [
  {
    id: "l1", address: "42 Harbour View Dr", suburb: "Manly", state: "NSW", ownerId: "u1",
    ownerName: "Sarah Mitchell", price: 1850000, propertyType: "house", bedrooms: 4, bathrooms: 3,
    parking: 2, landSize: 650, status: "active", verified: true, dateListed: "2025-09-01", matchCount: 12,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=150&fit=crop"
  },
  {
    id: "l2", address: "15 Ocean Parade", suburb: "Bondi Beach", state: "NSW", ownerId: "u2",
    ownerName: "James Cooper", price: 2200000, propertyType: "apartment", bedrooms: 3, bathrooms: 2,
    parking: 1, landSize: 0, status: "active", verified: true, dateListed: "2025-09-15", matchCount: 8,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=150&fit=crop"
  },
  {
    id: "l3", address: "88 Collins St", suburb: "Melbourne CBD", state: "VIC", ownerId: "u4",
    ownerName: "Michael Torres", price: 950000, propertyType: "apartment", bedrooms: 2, bathrooms: 1,
    parking: 1, landSize: 0, status: "active", verified: true, dateListed: "2025-08-20", matchCount: 15,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop"
  },
  {
    id: "l4", address: "7 Jacaranda Lane", suburb: "Paddington", state: "QLD", ownerId: "u4",
    ownerName: "Michael Torres", price: 1450000, propertyType: "townhouse", bedrooms: 3, bathrooms: 2,
    parking: 2, landSize: 300, status: "active", verified: true, dateListed: "2025-10-01", matchCount: 6,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=150&fit=crop"
  },
  {
    id: "l5", address: "23 Sunset Blvd", suburb: "Byron Bay", state: "NSW", ownerId: "u3",
    ownerName: "Emily Wong", price: 1750000, propertyType: "house", bedrooms: 3, bathrooms: 2,
    parking: 1, landSize: 500, status: "pending", verified: false, dateListed: "2025-11-10", matchCount: 0,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=200&h=150&fit=crop"
  },
  {
    id: "l6", address: "101 King William St", suburb: "Adelaide CBD", state: "SA", ownerId: "u7",
    ownerName: "Rachel Green", price: 680000, propertyType: "unit", bedrooms: 2, bathrooms: 1,
    parking: 1, landSize: 0, status: "active", verified: true, dateListed: "2025-11-20", matchCount: 3,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=150&fit=crop"
  },
  {
    id: "l7", address: "5 Riverside Tce", suburb: "South Perth", state: "WA", ownerId: "u8",
    ownerName: "Tom Bradley", price: 1200000, propertyType: "house", bedrooms: 4, bathrooms: 2,
    parking: 2, landSize: 720, status: "flagged", verified: false, dateListed: "2025-09-28", matchCount: 1,
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=200&h=150&fit=crop"
  },
  {
    id: "l8", address: "33 Marine Parade", suburb: "St Kilda", state: "VIC", ownerId: "u9",
    ownerName: "Amanda Chen", price: 1100000, propertyType: "apartment", bedrooms: 2, bathrooms: 2,
    parking: 1, landSize: 0, status: "active", verified: true, dateListed: "2025-12-05", matchCount: 7,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=150&fit=crop"
  },
]

// --- Mock Swaps ---
export const mockSwaps: AdminSwap[] = [
  {
    id: "sw1",
    userA: { id: "u1", name: "Sarah Mitchell", avatar: mockUsers[0].avatar },
    userB: { id: "u4", name: "Michael Torres", avatar: mockUsers[3].avatar },
    propertyA: "42 Harbour View Dr, Manly",
    propertyB: "88 Collins St, Melbourne CBD",
    matchDate: "2025-11-15", status: "in-progress", representativeAssigned: "Zoe V."
  },
  {
    id: "sw2",
    userA: { id: "u2", name: "James Cooper", avatar: mockUsers[1].avatar },
    userB: { id: "u7", name: "Rachel Green", avatar: mockUsers[6].avatar },
    propertyA: "15 Ocean Parade, Bondi Beach",
    propertyB: "101 King William St, Adelaide CBD",
    matchDate: "2025-12-01", status: "matched", representativeAssigned: null
  },
  {
    id: "sw3",
    userA: { id: "u9", name: "Amanda Chen", avatar: mockUsers[8].avatar },
    userB: { id: "u10", name: "Chris Anderson", avatar: mockUsers[9].avatar },
    propertyA: "33 Marine Parade, St Kilda",
    propertyB: "12 Chapel St, Prahran",
    matchDate: "2025-10-20", status: "completed", representativeAssigned: "Mark D."
  },
  {
    id: "sw4",
    userA: { id: "u4", name: "Michael Torres", avatar: mockUsers[3].avatar },
    userB: { id: "u6", name: "David Kim", avatar: mockUsers[5].avatar },
    propertyA: "7 Jacaranda Lane, Paddington",
    propertyB: "19 Brunswick St, Fortitude Valley",
    matchDate: "2025-09-10", status: "cancelled", representativeAssigned: "Zoe V."
  },
]

// --- Mock Chats ---
export const mockChats: AdminChat[] = [
  {
    id: "c1", participants: [
      { name: "Sarah Mitchell", avatar: mockUsers[0].avatar },
      { name: "Michael Torres", avatar: mockUsers[3].avatar }
    ],
    lastMessage: "Sounds great! Let me check my schedule for the inspection.",
    messageCount: 47, flagged: false, lastActivity: "2 hours ago", swapId: "sw1"
  },
  {
    id: "c2", participants: [
      { name: "James Cooper", avatar: mockUsers[1].avatar },
      { name: "Rachel Green", avatar: mockUsers[6].avatar }
    ],
    lastMessage: "Is the parking space included?",
    messageCount: 12, flagged: false, lastActivity: "5 hours ago", swapId: "sw2"
  },
  {
    id: "c3", participants: [
      { name: "Tom Bradley", avatar: mockUsers[7].avatar },
      { name: "Emily Wong", avatar: mockUsers[2].avatar }
    ],
    lastMessage: "I need this done by next week or forget it",
    messageCount: 31, flagged: true, lastActivity: "1 day ago", swapId: null
  },
  {
    id: "c4", participants: [
      { name: "Amanda Chen", avatar: mockUsers[8].avatar },
      { name: "Chris Anderson", avatar: mockUsers[9].avatar }
    ],
    lastMessage: "Thanks for a smooth swap! Really appreciate it.",
    messageCount: 63, flagged: false, lastActivity: "3 days ago", swapId: "sw3"
  },
]

// --- Mock Payments ---
export const mockPayments: AdminPayment[] = [
  { id: "p1", userId: "u1", userName: "Sarah Mitchell", amount: 199.99, plan: "yearly", date: "2025-12-01", status: "completed" },
  { id: "p2", userId: "u2", userName: "James Cooper", amount: 29.99, plan: "monthly", date: "2025-12-15", status: "completed" },
  { id: "p3", userId: "u4", userName: "Michael Torres", amount: 199.99, plan: "yearly", date: "2025-11-01", status: "completed" },
  { id: "p4", userId: "u7", userName: "Rachel Green", amount: 4.99, plan: "single", date: "2025-12-10", status: "completed" },
  { id: "p5", userId: "u9", userName: "Amanda Chen", amount: 199.99, plan: "yearly", date: "2025-12-05", status: "completed" },
  { id: "p6", userId: "u10", userName: "Chris Anderson", amount: 29.99, plan: "monthly", date: "2025-12-18", status: "completed" },
  { id: "p7", userId: "u6", userName: "David Kim", amount: 29.99, plan: "monthly", date: "2025-11-20", status: "refunded" },
  { id: "p8", userId: "u8", userName: "Tom Bradley", amount: 29.99, plan: "monthly", date: "2025-12-01", status: "failed" },
]

// --- Mock Verifications ---
export const mockVerifications: AdminVerification[] = [
  {
    id: "v1", userId: "u3", userName: "Emily Wong", userAvatar: mockUsers[2].avatar,
    propertyAddress: "23 Sunset Blvd, Byron Bay", documentType: "title-deed",
    submittedDate: "2025-12-18", status: "pending"
  },
  {
    id: "v2", userId: "u8", userName: "Tom Bradley", userAvatar: mockUsers[7].avatar,
    propertyAddress: "5 Riverside Tce, South Perth", documentType: "rates-notice",
    submittedDate: "2025-12-16", status: "pending"
  },
  {
    id: "v3", userId: "u5", userName: "Lisa Patel", userAvatar: mockUsers[4].avatar,
    propertyAddress: "14 Park Ave, Toorak", documentType: "utility-bill",
    submittedDate: "2025-12-19", status: "pending"
  },
  {
    id: "v4", userId: "u1", userName: "Sarah Mitchell", userAvatar: mockUsers[0].avatar,
    propertyAddress: "42 Harbour View Dr, Manly", documentType: "title-deed",
    submittedDate: "2025-09-05", status: "approved"
  },
  {
    id: "v5", userId: "u4", userName: "Michael Torres", userAvatar: mockUsers[3].avatar,
    propertyAddress: "88 Collins St, Melbourne CBD", documentType: "rates-notice",
    submittedDate: "2025-08-25", status: "approved"
  },
]

// --- Mock Activity ---
export const mockActivity: ActivityItem[] = [
  { id: "a1", type: "signup", message: "New user Lisa Patel signed up", timestamp: "10 min ago", user: "Lisa Patel" },
  { id: "a2", type: "verification", message: "Emily Wong submitted verification docs", timestamp: "1 hour ago", user: "Emily Wong" },
  { id: "a3", type: "payment", message: "Chris Anderson subscribed to Monthly plan", timestamp: "2 hours ago", user: "Chris Anderson" },
  { id: "a4", type: "swap", message: "Sarah Mitchell and Michael Torres swap in progress", timestamp: "4 hours ago" },
  { id: "a5", type: "listing", message: "Amanda Chen added a new listing", timestamp: "6 hours ago", user: "Amanda Chen" },
  { id: "a6", type: "ban", message: "David Kim was banned for policy violation", timestamp: "1 day ago", user: "David Kim" },
  { id: "a7", type: "payment", message: "Rachel Green purchased single chat unlock", timestamp: "1 day ago", user: "Rachel Green" },
  { id: "a8", type: "verification", message: "Tom Bradley verification pending review", timestamp: "2 days ago", user: "Tom Bradley" },
]

// --- Chart data ---
export const signupChartData = [
  { month: "Jul", users: 45 },
  { month: "Aug", users: 78 },
  { month: "Sep", users: 112 },
  { month: "Oct", users: 89 },
  { month: "Nov", users: 134 },
  { month: "Dec", users: 156 },
]

export const revenueChartData = [
  { month: "Jul", revenue: 2400 },
  { month: "Aug", revenue: 3800 },
  { month: "Sep", revenue: 5200 },
  { month: "Oct", revenue: 4100 },
  { month: "Nov", revenue: 6800 },
  { month: "Dec", revenue: 8200 },
]

export const listingsBySuburb = [
  { suburb: "Manly", count: 24 },
  { suburb: "Bondi Beach", count: 18 },
  { suburb: "Melbourne CBD", count: 32 },
  { suburb: "Paddington", count: 14 },
  { suburb: "Byron Bay", count: 11 },
  { suburb: "St Kilda", count: 21 },
]
