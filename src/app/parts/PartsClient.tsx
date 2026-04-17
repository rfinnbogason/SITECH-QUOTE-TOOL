"use client"
import { useState, useTransition } from "react"
import type { PartDb } from "@/lib/db/schema"
import { upsertPart, deletePart } from "@/app/actions/parts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/formatters"

const EMPTY: Omit<PartDb, "id"> = {
  itemNo: "", description: "", category: "", vendor: "",
  costUsd: 0, msrpUsd: 0, ourPriceUsd: 0,
  inStock: true, leadTime: "", notes: "",
}

export function PartsClient({ parts }: { parts: PartDb[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Partial<PartDb> | null>(null)

  const filtered = parts.filter(p =>
    !search || [p.itemNo, p.description, p.category, p.vendor]
      .some(f => f.toLowerCase().includes(search.toLowerCase()))
  )

  function handleSave() {
    if (!editing) return
    start(async () => {
      await upsertPart(editing as PartDb)
      toast.success("Part saved")
      router.refresh()
      setEditing(null)
    })
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this part?")) return
    start(async () => {
      await deletePart(id)
      toast.success("Part deleted")
      router.refresh()
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Database</h1>
          <p className="text-gray-500 text-sm mt-1">{parts.length} parts</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Part
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 h-8 text-sm" placeholder="Search by part #, description, category, vendor…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {search ? "No parts match your search." : "No parts in database. Add your first part."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Item #</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Category</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Vendor</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Cost USD</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">MSRP USD</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Our Price</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">In Stock</th>
                  <th className="px-3 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{p.itemNo || "—"}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{p.description}</td>
                    <td className="px-3 py-2 text-gray-500">{p.category || "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{p.vendor || "—"}</td>
                    <td className="px-3 py-2 text-right">{p.costUsd > 0 ? formatCurrency(p.costUsd, "USD") : "—"}</td>
                    <td className="px-3 py-2 text-right">{p.msrpUsd > 0 ? formatCurrency(p.msrpUsd, "USD") : "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">{p.ourPriceUsd > 0 ? formatCurrency(p.ourPriceUsd, "USD") : "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={p.inStock ? "default" : "secondary"} className="text-xs">
                        {p.inStock ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 flex gap-1">
                      <button onClick={() => setEditing({ ...p })} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Dialog open onOpenChange={v => !v && setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit Part" : "Add Part"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              {[
                { key: "itemNo", label: "Item #" },
                { key: "description", label: "Description", full: true },
                { key: "category", label: "Category" },
                { key: "vendor", label: "Vendor" },
                { key: "costUsd", label: "Cost (USD)", type: "number" },
                { key: "msrpUsd", label: "MSRP (USD)", type: "number" },
                { key: "ourPriceUsd", label: "Our Price (USD)", type: "number" },
                { key: "leadTime", label: "Lead Time" },
                { key: "notes", label: "Notes", full: true },
              ].map(({ key, label, full, type }) => (
                <div key={key} className={full ? "col-span-2" : ""}>
                  <Label className="text-xs mb-1">{label}</Label>
                  <Input
                    className="h-8 text-sm"
                    type={type || "text"}
                    value={(editing as Record<string, unknown>)[key] as string ?? ""}
                    onChange={e => setEditing(prev => prev ? { ...prev, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value } : null)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
