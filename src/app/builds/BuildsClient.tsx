"use client"
import { useTransition } from "react"
import type { SavedBuild } from "@/lib/db/schema"
import { deleteBuild } from "@/app/actions/builds"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Layers, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/formatters"

export function BuildsClient({ builds }: { builds: SavedBuild[] }) {
  const router = useRouter()
  const [, start] = useTransition()

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete build "${name}"?`)) return
    start(async () => {
      await deleteBuild(id)
      toast.success("Build deleted")
      router.refresh()
    })
  }

  async function handleLoadNew(buildId: number) {
    const res = await fetch("/api/quotes/create", { method: "POST" })
    const data = await res.json()
    if (!data.id) return
    await fetch(`/api/builds/${buildId}/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: data.id }),
    })
    router.push(`/quotes/${data.id}`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Builds</h1>
        <p className="text-gray-500 text-sm mt-1">Reusable machine configurations</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {builds.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No saved builds. Open a quote and click <strong>Save Build</strong> to create one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Build Name</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Machine Type</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500">Items</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Created</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Last Used</th>
                <th className="px-3 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {builds.map(b => {
                const items = JSON.parse(b.lineItemsJson || "[]")
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{b.name}</td>
                    <td className="px-3 py-3 text-gray-500">{b.machineType || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs">{b.createdAt ? formatDate(b.createdAt) : "—"}</td>
                    <td className="px-3 py-3 text-gray-400 text-xs">{b.lastUsedAt ? formatDate(b.lastUsedAt) : "Never"}</td>
                    <td className="px-3 py-3 flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7"
                        onClick={() => handleLoadNew(b.id)}>
                        Load into New Quote
                      </Button>
                      <button onClick={() => handleDelete(b.id, b.name)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
