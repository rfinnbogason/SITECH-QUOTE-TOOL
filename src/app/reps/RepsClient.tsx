"use client"
import { useState, useTransition } from "react"
import type { SalesRep } from "@/lib/db/schema"
import { upsertSalesRep, deleteSalesRep } from "@/app/actions/settings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

const EMPTY: Omit<SalesRep, "id" | "createdAt"> = {
  fullName: "", email: "", region: "", status: "Active",
}

export function RepsClient({ reps }: { reps: SalesRep[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [editing, setEditing] = useState<Partial<SalesRep> | null>(null)

  function handleSave() {
    if (!editing?.fullName) return
    start(async () => {
      await upsertSalesRep(editing as SalesRep)
      toast.success("Rep saved")
      router.refresh()
      setEditing(null)
    })
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    start(async () => {
      await deleteSalesRep(id)
      toast.success("Rep deleted")
      router.refresh()
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reps</h1>
          <p className="text-gray-500 text-sm mt-1">{reps.length} reps</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Rep
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Email</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Region</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-3 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reps.map(rep => (
              <tr key={rep.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{rep.fullName}</td>
                <td className="px-3 py-3 text-gray-500">{rep.email || "—"}</td>
                <td className="px-3 py-3 text-gray-500">{rep.region || "—"}</td>
                <td className="px-3 py-3 text-center">
                  <Badge variant={rep.status === "Active" ? "default" : "secondary"} className="text-xs">
                    {rep.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 flex gap-1">
                  <button onClick={() => setEditing({ ...rep })} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rep.id, rep.fullName)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Dialog open onOpenChange={v => !v && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit Rep" : "Add Rep"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {[
                { key: "fullName", label: "Full Name" },
                { key: "email", label: "Email" },
                { key: "region", label: "Region / Territory" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-xs mb-1">{label}</Label>
                  <Input className="h-8 text-sm"
                    value={(editing as Record<string, unknown>)[key] as string ?? ""}
                    onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : null)} />
                </div>
              ))}
              <div>
                <Label className="text-xs mb-1">Status</Label>
                <Select value={editing.status ?? "Active"} onValueChange={v => setEditing(prev => prev ? { ...prev, status: v } : null)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
