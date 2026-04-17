"use client"
import type { Quote, QuoteLineItem, QuoteFreightLabour } from "@/lib/db/schema"
import { calcLineItem, calcQuoteTotals } from "@/lib/calculations"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { SECTIONS, COMPANY_INFO, TERMS } from "@/lib/constants"

interface Props {
  quote: Quote
  lineItems: QuoteLineItem[]
  freightLabour: QuoteFreightLabour[]
  defaultFxRate: number
}

export function PrintQuote({ quote, lineItems, freightLabour, defaultFxRate }: Props) {
  const fxRate = quote.fxRate ?? defaultFxRate

  const calcedItems = lineItems.map(item => ({
    ...item,
    ...calcLineItem(item.qty, item.listPrice, item.currency as "USD" | "CAD", item.discountPct, item.vendorDiscountPct, fxRate),
  }))

  const freightLabourTotal = freightLabour.reduce((s, fl) => s + fl.qtyHours * fl.rateCad, 0)
  const totals = calcQuoteTotals(calcedItems, freightLabourTotal, quote.discountPct, quote.taxPct, fxRate)

  const groupedItems = SECTIONS.map(section => ({
    section,
    items: calcedItems.filter(i => i.section === section),
  })).filter(g => g.items.length > 0)

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .page { box-shadow: none !important; margin: 0 !important; padding: 0.5in !important; }
        }
        @page { size: letter portrait; margin: 0.5in; }
      `}</style>

      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 font-medium">
          🖨 Print / Save PDF
        </button>
        <button onClick={() => window.close()}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg shadow-lg hover:bg-gray-300 font-medium">
          ✕ Close
        </button>
      </div>

      <div className="page bg-white min-h-screen p-[0.5in] max-w-[8.5in] mx-auto shadow-xl font-sans text-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-blue-700 pb-4 mb-6">
          <div>
            <div className="text-2xl font-bold text-blue-700">{COMPANY_INFO.name}</div>
            <div className="text-sm text-gray-600 mt-1">{COMPANY_INFO.address}</div>
            <div className="text-sm text-gray-600">{COMPANY_INFO.city}</div>
            <div className="text-sm text-gray-600">Tel: {COMPANY_INFO.phone}</div>
            <div className="text-sm text-gray-600">{COMPANY_INFO.email}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800 tracking-wide">QUOTATION</div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Quote #:</span> {quote.number}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {formatDate(quote.quoteDate)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Valid Until:</span> {formatDate(quote.validUntil)}
            </div>
            {quote.salesRepName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rep:</span> {quote.salesRepName}
              </div>
            )}
          </div>
        </div>

        {/* Bill To / Machine */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</div>
            <div className="font-semibold">{quote.customerCompany || "—"}</div>
            <div className="text-sm text-gray-600">{quote.customerContact || ""}</div>
            <div className="text-sm text-gray-600">{quote.customerEmail || ""}</div>
            <div className="text-sm text-gray-600">{quote.customerPhone || ""}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Machine</div>
            {quote.machineMake && <div className="font-semibold">{quote.machineMake} {quote.machineModel}</div>}
            {quote.machineSerial && <div className="text-sm text-gray-600">S/N: {quote.machineSerial}</div>}
            {quote.installType && <div className="text-sm text-gray-600">Install: {quote.installType}</div>}
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="text-left px-3 py-2 font-medium text-xs w-8">#</th>
              <th className="text-left px-3 py-2 font-medium text-xs w-28">Part #</th>
              <th className="text-left px-3 py-2 font-medium text-xs">Description</th>
              <th className="text-center px-3 py-2 font-medium text-xs w-12">Qty</th>
              <th className="text-right px-3 py-2 font-medium text-xs w-24">Unit (CAD)</th>
              <th className="text-right px-3 py-2 font-medium text-xs w-24">Total (CAD)</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.map(({ section, items }) => (
              <>
                <tr key={`hdr-${section}`}>
                  <td colSpan={6} className="px-3 py-1.5 bg-gray-100 text-xs font-semibold text-gray-700">{section}</td>
                </tr>
                {items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-1.5 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-gray-500">{item.partNumber || "—"}</td>
                    <td className="px-3 py-1.5">{item.description}</td>
                    <td className="px-3 py-1.5 text-center">{item.qty}</td>
                    <td className="px-3 py-1.5 text-right">{item.showPrice ? formatCurrency(item.unitSellPrice * fxRate) : "—"}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{formatCurrency(item.totalCad)}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>

        {/* Freight & Labour */}
        {freightLabour.length > 0 && (
          <table className="w-full text-sm mb-2">
            <tbody>
              {freightLabour.map(fl => (
                <tr key={fl.id} className="bg-gray-50">
                  <td colSpan={3} className="px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase">{fl.type}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-500">{fl.description}</td>
                  <td className="px-3 py-1.5 text-center text-xs">{fl.qtyHours}</td>
                  <td className="px-3 py-1.5 text-right font-medium">{formatCurrency(fl.qtyHours * fl.rateCad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Summary */}
        <div className="flex justify-end mt-4">
          <table className="text-sm w-72">
            <tbody className="divide-y divide-gray-200">
              <SumRow label="Products Subtotal" value={formatCurrency(totals.productSubtotalCad)} />
              {freightLabourTotal > 0 && <SumRow label="Freight & Labour" value={formatCurrency(freightLabourTotal)} />}
              <SumRow label="Subtotal" value={formatCurrency(totals.subtotalCad)} />
              {totals.discountAmtCad > 0 && (
                <SumRow label={`Discount (${quote.discountPct}%)`} value={`-${formatCurrency(totals.discountAmtCad)}`} />
              )}
              {totals.taxAmtCad > 0 && (
                <SumRow label={`Tax (${quote.taxPct}%)`} value={formatCurrency(totals.taxAmtCad)} />
              )}
              <tr className="bg-blue-700 text-white">
                <td className="px-3 py-2 font-bold text-sm">GRAND TOTAL (CAD)</td>
                <td className="px-3 py-2 text-right font-bold text-sm">{formatCurrency(totals.grandTotalCad)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Exchange Rate Note */}
        <p className="text-xs text-gray-400 mt-2 text-right">
          Exchange Rate: 1 USD = {fxRate.toFixed(4)} CAD
        </p>

        {/* Terms */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Terms & Conditions</div>
          <ul className="space-y-1">
            {TERMS.map((t, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-blue-600 font-bold shrink-0">•</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Signature */}
        <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-3">SITECH Western Canada Authorization</div>
            <div className="border-b border-gray-400 mb-1 mt-8"></div>
            <div className="text-xs text-gray-500">Signature &amp; Date</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-3">Customer Acceptance</div>
            <div className="space-y-3">
              {["Name", "Title", "PO #", "Date"].map(f => (
                <div key={f}>
                  <div className="border-b border-gray-400 mb-1"></div>
                  <div className="text-xs text-gray-500">{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">Thank you for your business! — {COMPANY_INFO.name} | {COMPANY_INFO.phone} | {COMPANY_INFO.email}</p>
        </div>
      </div>
    </>
  )
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-3 py-1.5 text-gray-600">{label}</td>
      <td className="px-3 py-1.5 text-right font-medium">{value}</td>
    </tr>
  )
}
