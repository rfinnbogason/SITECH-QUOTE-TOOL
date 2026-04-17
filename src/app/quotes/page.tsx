import { db, quotes } from "@/lib/db"
import { desc } from "drizzle-orm"
import Link from "next/link"
import { formatDate } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus } from "lucide-react"
import { NewQuoteButton } from "@/components/quote/NewQuoteButton"

export default function QuotesPage() {
  const allQuotes = db.select().from(quotes).orderBy(desc(quotes.updatedAt)).all()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 text-sm mt-1">{allQuotes.length} quote{allQuotes.length !== 1 ? "s" : ""} total</p>
        </div>
        <NewQuoteButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {allQuotes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-base font-medium mb-1">No quotes yet</p>
            <p className="text-sm">Click New Quote to create your first quote.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quote #</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Machine</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rep</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allQuotes.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/quotes/${q.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                      {q.number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">{q.customerCompany || "—"}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{q.machineMake || "—"} {q.machineModel}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{q.salesRepName || "—"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={q.status === "Final" ? "default" : "secondary"} className="text-xs">
                      {q.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-400">{formatDate(q.updatedAt ?? q.createdAt ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
