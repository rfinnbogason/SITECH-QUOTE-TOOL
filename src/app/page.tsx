import { db, quotes, partsDb, salesReps, savedBuilds, settings } from "@/lib/db"
import { desc, eq, count } from "drizzle-orm"
import Link from "next/link"
import { formatDate } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, Users, Layers, DollarSign, RefreshCw } from "lucide-react"

export default async function DashboardPage() {
  const recentQuotes = await db.select().from(quotes).orderBy(desc(quotes.updatedAt)).limit(8)
  const [partCountRow] = await db.select({ count: count() }).from(partsDb)
  const [repCountRow] = await db.select({ count: count() }).from(salesReps).where(eq(salesReps.status, "Active"))
  const [buildCountRow] = await db.select({ count: count() }).from(savedBuilds)
  const [quoteCountRow] = await db.select({ count: count() }).from(quotes)
  const [fxRow] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  const [fxUpdated] = await db.select().from(settings).where(eq(settings.key, "fxUpdatedAt"))

  const partCount = partCountRow?.count ?? 0
  const repCount = repCountRow?.count ?? 0
  const buildCount = buildCountRow?.count ?? 0
  const quoteCount = quoteCountRow?.count ?? 0
  const fxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">SITECH Western Canada — Quote Management</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-sm font-medium text-blue-900">Current FX Rate:</span>
            <span className="ml-2 text-lg font-bold text-blue-700">1 USD = {fxRate.toFixed(4)} CAD</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Updated: {fxUpdated?.value ?? "—"}</span>
          <Link href="/settings" className="ml-2 underline text-blue-700 hover:text-blue-900 text-xs">
            Update
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Quotes", value: quoteCount, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "/quotes" },
          { label: "Parts in DB", value: partCount, icon: Package, color: "text-green-600", bg: "bg-green-50", href: "/parts" },
          { label: "Active Reps", value: repCount, icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/reps" },
          { label: "Saved Builds", value: buildCount, icon: Layers, color: "text-orange-600", bg: "bg-orange-50", href: "/builds" },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Quotes</h2>
          <Link href="/quotes" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recentQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No quotes yet. Click <strong>New Quote</strong> to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentQuotes.map(q => (
              <Link key={q.id} href={`/quotes/${q.id}`}
                className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">{q.number}</span>
                    <Badge variant={q.status === "Final" ? "default" : "secondary"} className="text-xs">
                      {q.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 truncate">
                    {q.customerCompany || "No customer"}{q.machineMake ? ` — ${q.machineMake}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-400">{q.salesRepName || "—"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(String(q.updatedAt ?? q.createdAt ?? ""))}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
