"use client"
import type { QuoteFreightLabour, FreightOption, LabourOption } from "@/lib/db/schema"
import { formatCurrency } from "@/lib/formatters"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Truck, Wrench, Trash2, Plus } from "lucide-react"

interface Props {
  items: QuoteFreightLabour[]
  freightOptions: FreightOption[]
  labourOptions: LabourOption[]
  onAdd: (type: "FREIGHT" | "LABOUR") => void
  onChange: (item: QuoteFreightLabour) => void
  onDelete: (id: number) => void
}

export function FreightLabourSection({ items, freightOptions, labourOptions, onAdd, onChange, onDelete }: Props) {
  const total = items.reduce((s, fl) => s + fl.qtyHours * fl.rateCad, 0)

  function handleSelect(item: QuoteFreightLabour, code: string) {
    if (item.type === "FREIGHT") {
      const opt = freightOptions.find(f => f.code === code)
      if (opt) onChange({ ...item, code, description: opt.name, rateCad: opt.costCad, qtyHours: 1 })
    } else {
      const opt = labourOptions.find(l => l.code === code)
      if (opt) onChange({ ...item, code, description: opt.name, rateCad: opt.hourlyRateCad, qtyHours: opt.minHours })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Freight & Labour</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onAdd("FREIGHT")} className="text-xs gap-1">
            <Truck className="w-3 h-3" />
            Add Freight
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAdd("LABOUR")} className="text-xs gap-1">
            <Wrench className="w-3 h-3" />
            Add Labour
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-gray-400">
          No freight or labour added. Click buttons above to add.
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                item.type === "FREIGHT" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
              }`}>
                {item.type === "FREIGHT" ? <Truck className="w-3 h-3 inline mr-1" /> : <Wrench className="w-3 h-3 inline mr-1" />}
                {item.type}
              </div>
              <Select value={item.code || ""} onValueChange={v => handleSelect(item, v)}>
                <SelectTrigger className="h-7 text-xs w-56">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {(item.type === "FREIGHT" ? freightOptions : labourOptions).map(opt => (
                    <SelectItem key={opt.code} value={opt.code} className="text-xs">
                      {opt.name} — {item.type === "FREIGHT" ? formatCurrency((opt as FreightOption).costCad) : `$${(opt as LabourOption).hourlyRateCad}/hr`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={item.description} onChange={e => onChange({ ...item, description: e.target.value })}
                className="h-7 text-xs flex-1" placeholder="Description" />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-gray-400">{item.type === "FREIGHT" ? "Qty:" : "Hrs:"}</span>
                <Input type="number" min="0" step="0.5" className="h-7 w-14 text-xs text-center"
                  value={item.qtyHours}
                  onChange={e => onChange({ ...item, qtyHours: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-gray-400">Rate:</span>
                <Input type="number" min="0" step="5" className="h-7 w-20 text-xs text-right"
                  value={item.rateCad}
                  onChange={e => onChange({ ...item, rateCad: parseFloat(e.target.value) || 0 })} />
              </div>
              <span className="text-xs font-medium text-gray-700 w-20 text-right shrink-0">
                {formatCurrency(item.qtyHours * item.rateCad)}
              </span>
              <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
