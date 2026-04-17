"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseText, applyMapping, type ParseResult, type ColumnRole } from "@/lib/parser"
import { SECTIONS } from "@/lib/constants"
import type { QuoteLineItem } from "@/lib/db/schema"

const ROLE_OPTIONS: { value: ColumnRole; label: string }[] = [
  { value: "qty", label: "Qty" },
  { value: "partNumber", label: "Part #" },
  { value: "description", label: "Description" },
  { value: "listPrice", label: "List Price" },
  { value: "currency", label: "Currency" },
  { value: "ignore", label: "Ignore" },
]

interface Props {
  open: boolean
  onClose: () => void
  onImport: (items: Omit<QuoteLineItem, "id" | "quoteId">[]) => void
  quoteId: number
}

export function PasteImportDialog({ open, onClose, onImport }: Props) {
  const [raw, setRaw] = useState("")
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [mapping, setMapping] = useState<Record<number, ColumnRole>>({})
  const [section, setSection] = useState<string>("🏗️ WHOLE MACHINE")
  const [step, setStep] = useState<"paste" | "map">("paste")

  function handleParse() {
    const result = parseText(raw)
    setParsed(result)
    const m: Record<number, ColumnRole> = {}
    result.columnGuesses.forEach(g => { m[g.index] = g.role })
    setMapping(m)
    setStep("map")
  }

  function handleImport() {
    if (!parsed) return
    const rows = applyMapping(parsed, mapping)
    const items: Omit<QuoteLineItem, "id" | "quoteId">[] = rows.map((r, i) => ({
      section,
      position: i,
      qty: r.qty,
      partNumber: r.partNumber,
      description: r.description,
      listPrice: r.listPrice,
      currency: r.currency,
      discountPct: 0,
      vendorDiscountPct: 40,
      showPrice: true,
    }))
    onImport(items)
    handleClose()
  }

  function handleClose() {
    setRaw("")
    setParsed(null)
    setMapping({})
    setStep("paste")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paste Import</DialogTitle>
        </DialogHeader>

        {step === "paste" ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Paste your parts list below. Tab-separated, CSV, or free text — we'll detect the format automatically.
            </p>
            <textarea
              className="w-full h-56 border border-gray-300 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={"Qty\tPart #\tDescription\tPrice\n1\tTR-R780\tTrimble R780 GNSS Receiver\t12500.00\n2\tTR-CB460\tTrimble CB460 Control Box\t4200.00"}
              value={raw}
              onChange={e => setRaw(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleParse} disabled={!raw.trim()} className="bg-blue-600 hover:bg-blue-700">
                Parse & Map Columns →
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Target Section:</span>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="w-52 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-500">{parsed?.rows.length ?? 0} rows detected</span>
            </div>

            {parsed && (
              <>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {parsed.columnGuesses.map(g => (
                          <th key={g.index} className="px-3 py-2 text-left">
                            <div className="text-gray-500 mb-1">{g.header}</div>
                            <Select value={mapping[g.index] ?? "ignore"} onValueChange={v => setMapping(prev => ({ ...prev, [g.index]: v as ColumnRole }))}>
                              <SelectTrigger className="h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map(r => (
                                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsed.rows.slice(0, 8).map((row, ri) => (
                        <tr key={ri} className={ri % 2 === 0 ? "" : "bg-gray-50"}>
                          {parsed.columnGuesses.map(g => (
                            <td key={g.index} className={`px-3 py-1.5 ${mapping[g.index] === "ignore" ? "text-gray-300" : "text-gray-700"}`}>
                              {row[g.index] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {parsed.rows.length > 8 && (
                        <tr>
                          <td colSpan={parsed.columnGuesses.length} className="px-3 py-2 text-gray-400 italic text-center">
                            … {parsed.rows.length - 8} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStep("paste")}>← Back</Button>
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700">
                    Import {parsed.rows.length} Row{parsed.rows.length !== 1 ? "s" : ""} →
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
