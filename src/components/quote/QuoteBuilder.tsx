"use client"
import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Quote, QuoteLineItem, QuoteFreightLabour, SalesRep, FreightOption, LabourOption } from "@/lib/db/schema"
import { updateQuote, upsertLineItem, deleteLineItem, upsertFreightLabour, deleteFreightLabour, bulkInsertLineItems } from "@/app/actions/quotes"
import { calcLineItem, calcQuoteTotals } from "@/lib/calculations"
import { formatCurrency, formatPct } from "@/lib/formatters"
import { SECTIONS, MACHINE_MAKES, INSTALL_TYPES, CURRENCIES } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LineItemsTable } from "./LineItemsTable"
import { FreightLabourSection } from "./FreightLabourSection"
import { PasteImportDialog } from "./PasteImportDialog"
import { SaveBuildDialog } from "./SaveBuildDialog"
import {
  FileDown, ClipboardPaste, Save, ExternalLink,
  DollarSign, TrendingUp, Package, Layers,
} from "lucide-react"

interface Props {
  quote: Quote
  lineItems: QuoteLineItem[]
  freightLabour: QuoteFreightLabour[]
  reps: SalesRep[]
  freightOptions: FreightOption[]
  labourOptions: LabourOption[]
  defaultFxRate: number
}

export function QuoteBuilder({ quote, lineItems: initLineItems, freightLabour: initFL, reps, freightOptions, labourOptions, defaultFxRate }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [lineItems, setLineItems] = useState(initLineItems)
  const [freightLabour, setFreightLabour] = useState(initFL)
  const [quoteData, setQuoteData] = useState(quote)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [saveBuildOpen, setSaveBuildOpen] = useState(false)

  const fxRate = quoteData.fxRate ?? defaultFxRate

  const calcedItems = lineItems.map(item => ({
    ...item,
    ...calcLineItem(item.qty, item.listPrice, item.currency as "USD" | "CAD", item.discountPct, item.vendorDiscountPct, fxRate),
  }))

  const freightLabourTotal = freightLabour.reduce((s, fl) => s + fl.qtyHours * fl.rateCad, 0)
  const totals = calcQuoteTotals(calcedItems, freightLabourTotal, quoteData.discountPct, quoteData.taxPct, fxRate)

  function saveField<K extends keyof Quote>(field: K, value: Quote[K]) {
    const updated = { ...quoteData, [field]: value }
    setQuoteData(updated)
    startTransition(async () => {
      await updateQuote(quoteData.id, { [field]: value })
    })
  }

  function handleLineItemChange(updated: QuoteLineItem) {
    setLineItems(prev => prev.map(item => item.id === updated.id ? updated : item))
    startTransition(async () => {
      await upsertLineItem(updated)
    })
  }

  function handleLineItemDelete(id: number) {
    setLineItems(prev => prev.filter(item => item.id !== id))
    startTransition(async () => {
      await deleteLineItem(id, quoteData.id)
    })
  }

  async function handleAddRow() {
    const maxPos = lineItems.reduce((m, i) => i.position > m ? i.position : m, 0)
    await upsertLineItem({
      quoteId: quoteData.id,
      section: "🏗️ WHOLE MACHINE",
      position: maxPos + 1,
      qty: 1,
      partNumber: "",
      description: "",
      listPrice: 0,
      currency: "USD",
      discountPct: 0,
      vendorDiscountPct: 40,
      showPrice: true,
    })
    router.refresh()
  }

  function handleFLChange(updated: QuoteFreightLabour) {
    setFreightLabour(prev => prev.map(fl => fl.id === updated.id ? updated : fl))
    startTransition(async () => {
      await upsertFreightLabour(updated)
    })
  }

  function handleFLDelete(id: number) {
    setFreightLabour(prev => prev.filter(fl => fl.id !== id))
    startTransition(async () => {
      await deleteFreightLabour(id, quoteData.id)
    })
  }

  async function handleAddFL(type: "FREIGHT" | "LABOUR") {
    await upsertFreightLabour({ quoteId: quoteData.id, type, code: "", description: "", qtyHours: 1, rateCad: 0 })
    router.refresh()
  }

  async function handlePasteImport(items: Omit<QuoteLineItem, "id" | "quoteId">[]) {
    await bulkInsertLineItems(quoteData.id, items)
    router.refresh()
    toast.success(`${items.length} item${items.length !== 1 ? "s" : ""} imported`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div id="tour-quote-topbar" className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-gray-900">{quoteData.number}</span>
          <Badge variant={quoteData.status === "Final" ? "default" : "secondary"}>{quoteData.status}</Badge>
          {isPending && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button id="tour-paste-import" variant="outline" size="sm" onClick={() => setPasteOpen(true)} className="gap-1.5 text-xs">
            <ClipboardPaste className="w-3.5 h-3.5" />
            Paste Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSaveBuildOpen(true)} className="gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" />
            Save Build
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => window.open(`/quotes/${quoteData.id}/print`, "_blank")}
            className="gap-1.5 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => window.open(`/quotes/${quoteData.id}/pdf`, "_blank")}
            className="bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Cards */}
        <div id="tour-kpi-cards" className="grid grid-cols-4 gap-3">
          {[
            { label: "Total CAD", value: formatCurrency(totals.grandTotalCad), icon: DollarSign, color: "text-blue-600" },
            { label: "Total USD", value: formatCurrency(totals.grandTotalUsd, "USD"), icon: DollarSign, color: "text-green-600" },
            { label: "Profit", value: formatCurrency(totals.totalProfitCad), icon: TrendingUp, color: totals.totalProfitCad >= 0 ? "text-emerald-600" : "text-red-600" },
            { label: "Margin", value: formatPct(totals.marginPct), icon: TrendingUp, color: totals.marginPct >= 20 ? "text-emerald-600" : "text-amber-600" },
            { label: "Items", value: lineItems.length, icon: Package, color: "text-purple-600" },
            { label: "FX Rate", value: fxRate.toFixed(4), icon: DollarSign, color: "text-gray-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
              <div>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`text-sm font-semibold ${color}`}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Header Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Quote Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📋 Quote Details</div>
            <div className="space-y-2">
              <FieldRow label="Quote #">
                <span className="font-mono text-sm">{quoteData.number}</span>
              </FieldRow>
              <FieldRow label="Date">
                <Input type="date" className="h-7 text-sm" value={quoteData.quoteDate}
                  onChange={e => saveField("quoteDate", e.target.value)} />
              </FieldRow>
              <FieldRow label="Valid Until">
                <Input type="date" className="h-7 text-sm" value={quoteData.validUntil}
                  onChange={e => saveField("validUntil", e.target.value)} />
              </FieldRow>
              <FieldRow label="Sales Rep">
                <Select value={quoteData.salesRepName || ""} onValueChange={v => saveField("salesRepName", v)}>
                  <SelectTrigger className="h-7 text-sm"><SelectValue placeholder="Select rep" /></SelectTrigger>
                  <SelectContent>
                    {reps.filter(r => r.status === "Active").map(r => (
                      <SelectItem key={r.id} value={r.fullName}>{r.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Status">
                <Select value={quoteData.status} onValueChange={v => saveField("status", v)}>
                  <SelectTrigger className="h-7 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>
          </div>

          {/* Customer */}
          <div id="tour-customer-info" className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">👤 Customer</div>
            <div className="space-y-2">
              <FieldRow label="Company">
                <Input className="h-7 text-sm" value={quoteData.customerCompany}
                  onChange={e => saveField("customerCompany", e.target.value)} placeholder="Company name" />
              </FieldRow>
              <FieldRow label="Contact">
                <Input className="h-7 text-sm" value={quoteData.customerContact}
                  onChange={e => saveField("customerContact", e.target.value)} placeholder="Contact name" />
              </FieldRow>
              <FieldRow label="Email">
                <Input className="h-7 text-sm" value={quoteData.customerEmail}
                  onChange={e => saveField("customerEmail", e.target.value)} placeholder="email@company.com" />
              </FieldRow>
              <FieldRow label="Phone">
                <Input className="h-7 text-sm" value={quoteData.customerPhone}
                  onChange={e => saveField("customerPhone", e.target.value)} placeholder="(xxx) xxx-xxxx" />
              </FieldRow>
              <FieldRow label="FX Rate">
                <Input className="h-7 text-sm w-24" type="number" step="0.0001" value={fxRate}
                  onChange={e => saveField("fxRate", parseFloat(e.target.value) || defaultFxRate)} />
              </FieldRow>
            </div>
          </div>

          {/* Machine */}
          <div id="tour-machine-info" className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🚜 Machine</div>
            <div className="space-y-2">
              <FieldRow label="Make">
                <Select value={quoteData.machineMake || ""} onValueChange={v => saveField("machineMake", v)}>
                  <SelectTrigger className="h-7 text-sm"><SelectValue placeholder="Select make" /></SelectTrigger>
                  <SelectContent>
                    {MACHINE_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Model">
                <Input className="h-7 text-sm" value={quoteData.machineModel}
                  onChange={e => saveField("machineModel", e.target.value)} placeholder="e.g. D8T" />
              </FieldRow>
              <FieldRow label="Serial #">
                <Input className="h-7 text-sm" value={quoteData.machineSerial}
                  onChange={e => saveField("machineSerial", e.target.value)} placeholder="Serial number" />
              </FieldRow>
              <FieldRow label="Install Type">
                <Select value={quoteData.installType || ""} onValueChange={v => saveField("installType", v)}>
                  <SelectTrigger className="h-7 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {INSTALL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Notes">
                <Input className="h-7 text-sm" value={quoteData.notes}
                  onChange={e => saveField("notes", e.target.value)} placeholder="Optional notes" />
              </FieldRow>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div id="tour-line-items" className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Line Items ({lineItems.length})</h2>
            <Button size="sm" variant="outline" onClick={handleAddRow} className="text-xs gap-1">
              + Add Row
            </Button>
          </div>
          <LineItemsTable
            items={calcedItems}
            fxRate={fxRate}
            onChange={handleLineItemChange}
            onDelete={handleLineItemDelete}
          />
        </div>

        {/* Freight & Labour */}
        <div id="tour-freight-labour">
        <FreightLabourSection
          items={freightLabour}
          freightOptions={freightOptions}
          labourOptions={labourOptions}
          onAdd={handleAddFL}
          onChange={handleFLChange}
          onDelete={handleFLDelete}
        />
        </div>

        {/* Summary */}
        <div id="tour-quote-summary" className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Quote Summary</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-xl">
            <SummaryRow label="Products Subtotal" usd={totals.productSubtotalUsd} cad={totals.productSubtotalCad} />
            <SummaryRow label="Freight & Labour" usd={totals.freightLabourCad / fxRate} cad={totals.freightLabourCad} />
            <SummaryRow label="Subtotal" usd={totals.subtotalUsd} cad={totals.subtotalCad} bold />
            <div className="col-span-2 flex items-center gap-3 py-1">
              <span className="text-sm text-gray-600 w-36">Discount %</span>
              <Input type="number" min="0" max="100" step="0.5" className="h-7 w-20 text-sm"
                value={quoteData.discountPct}
                onChange={e => saveField("discountPct", parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-gray-500">= {formatCurrency(totals.discountAmtCad)} CAD</span>
            </div>
            <SummaryRow label="After Discount" usd={totals.afterDiscountUsd} cad={totals.afterDiscountCad} />
            <div className="col-span-2 flex items-center gap-3 py-1">
              <span className="text-sm text-gray-600 w-36">Tax (GST/PST) %</span>
              <Input type="number" min="0" max="50" step="0.5" className="h-7 w-20 text-sm"
                value={quoteData.taxPct}
                onChange={e => saveField("taxPct", parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-gray-500">= {formatCurrency(totals.taxAmtCad)} CAD</span>
            </div>
            <Separator className="col-span-2" />
            <SummaryRow label="GRAND TOTAL" usd={totals.grandTotalUsd} cad={totals.grandTotalCad} bold large />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6">
            <div>
              <span className="text-xs text-gray-500">Total Profit</span>
              <div className={`text-sm font-semibold ${totals.totalProfitCad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(totals.totalProfitCad)}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Margin</span>
              <div className={`text-sm font-semibold ${totals.marginPct >= 20 ? "text-emerald-600" : "text-amber-600"}`}>
                {formatPct(totals.marginPct)}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">FX Rate</span>
              <div className="text-sm font-medium text-gray-700">1 USD = {fxRate.toFixed(4)} CAD</div>
            </div>
          </div>
        </div>
      </div>

      <PasteImportDialog
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onImport={handlePasteImport}
        quoteId={quoteData.id}
      />
      <SaveBuildDialog
        open={saveBuildOpen}
        onClose={() => setSaveBuildOpen(false)}
        quoteId={quoteData.id}
        machineMake={quoteData.machineMake ?? ""}
      />
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function SummaryRow({ label, usd, cad, bold, large }: {
  label: string; usd: number; cad: number; bold?: boolean; large?: boolean
}) {
  const cls = `${bold ? "font-semibold" : ""} ${large ? "text-base" : "text-sm"}`
  return (
    <>
      <div className={`text-gray-600 py-1 ${cls}`}>{label}</div>
      <div className={`flex gap-4 justify-end py-1 ${cls}`}>
        <span className="text-gray-400 text-xs">{formatCurrency(usd, "USD")}</span>
        <span className="text-gray-900">{formatCurrency(cad)}</span>
      </div>
    </>
  )
}
