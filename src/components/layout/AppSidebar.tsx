"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FileText, Package, Users, Settings,
  Clock, Layers, Plus, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TourGuide } from "./TourGuide"

const nav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/quotes", icon: FileText, label: "Quotes" },
  { href: "/parts", icon: Package, label: "Parts Database" },
  { href: "/builds", icon: Layers, label: "Saved Builds" },
  { href: "/reps", icon: Users, label: "Sales Reps" },
  { href: "/install-times", icon: Clock, label: "Install Times" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.includes("/print") || pathname.includes("/pdf")) return null

  async function handleNewQuote() {
    const res = await fetch("/api/quotes/create", { method: "POST" })
    const data = await res.json()
    if (data.id) router.push(`/quotes/${data.id}`)
  }

  return (
    <>
      <motion.aside
        className="w-56 bg-white border-r border-gray-200 flex flex-col h-full shrink-0"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">ST</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">SITECH</div>
              <div className="text-xs text-gray-500">Quote Tool</div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <Button id="tour-new-quote" onClick={handleNewQuote} className="w-full bg-blue-600 hover:bg-blue-700 text-sm gap-2">
            <Plus className="w-4 h-4" />
            New Quote
          </Button>
        </div>

        <nav className="flex-1 px-2 pb-4 space-y-0.5">
          {nav.map(({ href, icon: Icon, label }, i) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 + i * 0.04, ease: "easeOut" }}
              >
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="w-3 h-3" />}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">SITECH Western Canada</p>
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </motion.aside>
      <TourGuide />
    </>
  )
}
