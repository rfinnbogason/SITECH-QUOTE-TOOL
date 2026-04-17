"use client"
import { useState } from "react"
import type { QuoteLineItem } from "@/lib/db/schema"
import type { LineItemCalc } from "@/lib/calculations"
import { SECTIONS, CURRENCIES } from "@/lib/constants"
import { formatCurrency } from "@/lib/formatters"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type Item = QuoteLineItem & LineItemCalc

interface Props {
  items: Item[]
  fxRate: number
  onChange: (item: QuoteLineItem) => void
  onDelete: (id: number) => void
}

export function LineItemsTable({ items, fxRate, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState<Record<number, Partial<QuoteLineItem>>>({})

  function patch(id: number, item: QuoteLineItem, field: keyof QuoteLineItem, value: unknown) {
    const updated = { ...item, [field]: value }
    onChange(updated)
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-400">
        No line items. Click <strong>+ Add Row</strong> to start adding parts.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-2 py-2 text-left font-medium text-gray-500 w-36">Section</th>
            <th className="px-2 py-2 text-center font-medium text-gray-500 w-12">Qty</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 w-28">Part #</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500">Description</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-24">List $</th>
            <th className="px-2 py-2 text-center font-medium text-gray-500 w-16">Curr</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-20">Disc %</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-24">Unit Sell</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-24">Total USD</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-24">Total CAD</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-20">Vend %</th>
            <th className="px-2 py-2 text-right font-medium text-gray-500 w-24">Profit</th>
            <th className="px-2 py-2 text-center font-medium text-gray-500 w-12">Show</th>
            <th className="px-2 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={item.id} className={cn("hover:bg-blue-50/30 transition-colors", idx % 2 === 0 ? "" : "bg-gray-50/50")}>
              <td className="px-2 py-1">
                <Select value={item.section} onValueChange={v => patch(item.id, item, "section", v)}>
                  <SelectTrigger className="h-6 text-xs border-0 bg-transparent hover:bg-gray-100 focus:ring-0 px-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-1">
                <Input type="number" min="0.01" step="1" className="h-6 w-12 text-xs text-center"
                  value={item.qty}
                  onChange={e => patch(item.id, item, "qty", parseFloat(e.target.value) || 1)} />
              </td>
              <td className="px-2 py-1">
                <Input className="h-6 text-xs w-28" value={item.partNumber}
                  onChange={e => patch(item.id, item, "partNumber", e.target.value)}
                  placeholder="Part #" />
              </td>
              <td className="px-2 py-1">
                <Input className="h-6 text-xs min-w-48" value={item.description}
                  onChange={e => patch(item.id, item, "description", e.target.value)}
                  placeholder="Description" />
              </td>
              <td className="px-2 py-1">
                <Input type="number" min="0" step="0.01" className="h-6 w-24 text-xs text-right"
                  value={item.listPrice}
                  onChange={e => patch(item.id, item, "listPrice", parseFloat(e.target.value) || 0)} />
              </td>
              <td className="px-2 py-1">
                <Select value={item.currency} onValueChange={v => patch(item.id, item, "currency", v)}>
                  <SelectTrigger className="h-6 text-xs border-0 bg-transparent hover:bg-gray-100 focus:ring-0 px-1 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-1">
                <Input type="number" min="0" max="100" step="1" className="h-6 w-16 text-xs text-right"
                  value={item.discountPct}
                  onChange={e => patch(item.id, item, "discountPct", parseFloat(e.target.value) || 0)} />
              </td>
              <td className="px-2 py-1 text-right text-gray-700 font-medium">{formatCurrency(item.unitSellPrice)}</td>
              <td className="px-2 py-1 text-right text-gray-700">{formatCurrency(item.totalUsd, "USD")}</td>
              <td className="px-2 py-1 text-right text-gray-900 font-medium">{formatCurrency(item.totalCad)}</td>
              <td className="px-2 py-1">
                <Input type="number" min="0" max="100" step="1" className="h-6 w-16 text-xs text-right"
                  value={item.vendorDiscountPct}
                  onChange={e => patch(item.id, item, "vendorDiscountPct", parseFloat(e.target.value) || 0)} />
              </td>
              <td className={cn("px-2 py-1 text-right font-medium", item.profitCad >= 0 ? "text-emerald-600" : "text-red-500")}>
                {formatCurrency(item.profitCad)}
              </td>
              <td className="px-2 py-1 text-center">
                <button onClick={() => patch(item.id, item, "showPrice", !item.showPrice)}
                  className="text-gray-400 hover:text-gray-700 transition-colors">
                  {item.showPrice ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </td>
              <td className="px-2 py-1">
                <button onClick={() => onDelete(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
