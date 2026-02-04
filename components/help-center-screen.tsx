"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Search, ChevronRight, MessageCircle, Mail, FileText, HelpCircle, Home, ArrowLeftRight, CreditCard, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface HelpCenterScreenProps {
  onBack: () => void
}

const categories = [
  { icon: Home, title: "Getting Started", articles: 8 },
  { icon: ArrowLeftRight, title: "Swapping Process", articles: 12 },
  { icon: CreditCard, title: "Payments & Pricing", articles: 6 },
  { icon: Shield, title: "Safety & Trust", articles: 9 },
  { icon: HelpCircle, title: "Account & Settings", articles: 7 },
]

const faqs = [
  {
    question: "How does house swapping work?",
    answer: "House swapping allows you to exchange homes with another user instead of buying and selling. When both parties match and agree, you can arrange the swap. Any price difference is settled between the parties outside the platform."
  },
  {
    question: "Is my information secure?",
    answer: "Yes! We use bank-level encryption to protect your data. Your personal information is never shared with other users until you choose to connect with them."
  },
  {
    question: "What happens after a match?",
    answer: "After matching, you can message your match directly through the app. We recommend scheduling video calls, exchanging documents, and potentially visiting each other's properties before finalizing any swap."
  },
  {
    question: "Can I cancel a match?",
    answer: "Yes, you can unmatch with anyone at any time before finalizing a swap. Simply go to your matches and select the unmatch option."
  },
  {
    question: "How is the price difference calculated?",
    answer: "The price difference is based on the listed values of both properties. For example, if your home is worth $500K and your match's home is worth $600K, the difference would be $100K."
  },
]

export function HelpCenterScreen({ onBack }: HelpCenterScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Help Center</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 rounded-xl bg-secondary border-0"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">BROWSE BY TOPIC</h3>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-card rounded-2xl border border-border text-left hover:border-primary/50 transition-colors"
            >
              <category.icon className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">{category.title}</p>
              <p className="text-xs text-muted-foreground">{category.articles} articles</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">FREQUENTLY ASKED</h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronRight className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${expandedFaq === index ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">NEED MORE HELP?</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full h-14 rounded-2xl justify-start bg-transparent">
            <MessageCircle className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <p className="font-medium">Live Chat</p>
              <p className="text-xs text-muted-foreground">Available 24/7</p>
            </div>
          </Button>
          <Button variant="outline" className="w-full h-14 rounded-2xl justify-start bg-transparent">
            <Mail className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <p className="font-medium">Email Support</p>
              <p className="text-xs text-muted-foreground">support@switchmyhouse.com</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
