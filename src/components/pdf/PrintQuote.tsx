"use client"
import type { Quote, QuoteLineItem, QuoteFreightLabour } from "@/lib/db/schema"
import { calcLineItem, calcQuoteTotals } from "@/lib/calculations"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { SECTIONS, COMPANY_INFO, TERMS_AND_CONDITIONS, cleanSection } from "@/lib/constants"
import Image from "next/image"

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

  const knownIds = new Set<number>()
  const groupedItems: { section: string; items: typeof calcedItems }[] = SECTIONS.map(section => {
    const items = calcedItems.filter(i => cleanSection(i.section) === section)
    items.forEach(i => knownIds.add(i.id))
    return { section, items }
  }).filter(g => g.items.length > 0)

  const otherItems = calcedItems.filter(i => !knownIds.has(i.id))
  if (otherItems.length > 0) {
    groupedItems.push({ section: "OTHER", items: otherItems })
  }

  let rowNum = 0

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        @page { size: letter portrait; margin: 0.4in; }
      `}</style>

      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg shadow-lg hover:bg-blue-800 font-medium">
          Print / Save PDF
        </button>
        <button onClick={() => window.close()}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg shadow-lg hover:bg-gray-300 font-medium">
          Close
        </button>
      </div>

      {/* PAGE 1 — QUOTE */}
      <div className="bg-white min-h-screen p-[0.4in] max-w-[8.5in] mx-auto shadow-xl font-sans text-gray-900 text-sm print:shadow-none print:p-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <Image src="/sitech-logo.png" alt="SITECH" width={130} height={48} style={{ objectFit: "contain" }} />
            <Image src="/trimble-logo.png" alt="Trimble" width={110} height={40} style={{ objectFit: "contain" }} />
          </div>
          <div className="bg-[#1a3a6b] text-white px-8 py-4 rounded-sm text-right">
            <div className="text-2xl font-bold tracking-wide">Sales Quote</div>
          </div>
        </div>

        {/* Company + Quote Info Row */}
        <div className="flex justify-between mb-4 pb-4 border-b border-gray-300">
          <div>
            <div className="font-bold text-sm">{COMPANY_INFO.fullName}</div>
            <div className="text-xs text-gray-600 mt-1">{COMPANY_INFO.address}</div>
            <div className="text-xs text-gray-600">{COMPANY_INFO.city}</div>
            <div className="text-xs text-gray-600">Tel: {COMPANY_INFO.phone}</div>
            <div className="text-xs text-gray-600">{COMPANY_INFO.email}</div>
          </div>
          <div className="text-right text-xs space-y-1">
            <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(quote.quoteDate)}</span></div>
            <div><span className="text-gray-500">Expiration:</span> <span className="font-medium">{formatDate(quote.validUntil)}</span></div>
            <div><span className="text-gray-500">Quote #:</span> <span className="font-medium font-mono">{quote.number}</span></div>
            {quote.salesRepName && <div><span className="text-gray-500">Rep:</span> <span className="font-medium">{quote.salesRepName}</span></div>}
          </div>
        </div>

        {/* Bill To / Machine */}
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bill To</div>
            <div className="font-semibold text-sm">{quote.customerCompany || "—"}</div>
            {quote.customerContact && <div className="text-xs text-gray-600">{quote.customerContact}</div>}
            {quote.customerPhone && <div className="text-xs text-gray-600">{quote.customerPhone}</div>}
            {quote.customerEmail && <div className="text-xs text-gray-600">{quote.customerEmail}</div>}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Machine</div>
            {quote.machineMake && <div className="font-semibold text-sm">{quote.machineMake} {quote.machineModel}</div>}
            {quote.machineSerial && <div className="text-xs text-gray-600">S/N: {quote.machineSerial}</div>}
            {quote.installType && <div className="text-xs text-gray-600">Install Type: {quote.installType}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs mb-1 border-collapse">
          <thead>
            <tr className="bg-[#1a3a6b] text-white">
              <th className="text-left px-3 py-2 font-semibold w-8">Item</th>
              <th className="text-left px-3 py-2 font-semibold">Description</th>
              <th className="text-center px-3 py-2 font-semibold w-10">Qty</th>
              <th className="text-right px-3 py-2 font-semibold w-24">Unit Price</th>
              <th className="text-right px-3 py-2 font-semibold w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.map(({ section, items }) => (
              <>
                <tr key={`hdr-${section}`}>
                  <td colSpan={5} className="px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-700 border-y border-gray-200">{cleanSection(section)}</td>
                </tr>
                {items.map((item) => {
                  if (!item.showPrice) return null
                  rowNum++
                  return (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-3 py-1.5 text-gray-400">{rowNum}</td>
                      <td className="px-3 py-1.5">
                        <div className="font-medium">{item.description}</div>
                        {item.partNumber && <div className="text-gray-400 text-xs">{item.partNumber}</div>}
                      </td>
                      <td className="px-3 py-1.5 text-center">{item.qty}</td>
                      <td className="px-3 py-1.5 text-right">{formatCurrency(item.unitSellPrice * fxRate)}</td>
                      <td className="px-3 py-1.5 text-right font-medium">{formatCurrency(item.totalCad)}</td>
                    </tr>
                  )
                })}
              </>
            ))}

            {/* Freight & Labour rows */}
            {freightLabour.map(fl => (
              <tr key={fl.id} className="border-b border-gray-100 bg-gray-50">
                <td className="px-3 py-1.5 text-gray-400"></td>
                <td className="px-3 py-1.5">
                  <span className="font-medium text-gray-700">{fl.type}:</span> {fl.description}
                  {fl.qtyHours > 1 && <span className="text-gray-400 ml-1">({fl.qtyHours} hrs)</span>}
                </td>
                <td className="px-3 py-1.5 text-center">{fl.qtyHours > 1 ? fl.qtyHours : ""}</td>
                <td className="px-3 py-1.5 text-right">{formatCurrency(fl.rateCad)}</td>
                <td className="px-3 py-1.5 text-right font-medium">{formatCurrency(fl.qtyHours * fl.rateCad)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mt-4">
          <div className="w-72">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 text-gray-500">Subtotal</td>
                  <td className="py-1.5 text-right font-medium">{formatCurrency(totals.productSubtotalCad)}</td>
                </tr>
                {freightLabourTotal > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-500">Freight & Labour</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(freightLabourTotal)}</td>
                  </tr>
                )}
                {totals.discountAmtCad > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-500">Discount ({quote.discountPct}%)</td>
                    <td className="py-1.5 text-right font-medium text-red-600">-{formatCurrency(totals.discountAmtCad)}</td>
                  </tr>
                )}
                {totals.taxAmtCad > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-500">Tax ({quote.taxPct}%)</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(totals.taxAmtCad)}</td>
                  </tr>
                )}
                <tr className="bg-[#1a3a6b] text-white">
                  <td className="px-3 py-2 font-bold">Total</td>
                  <td className="px-3 py-2 text-right font-bold text-base">{formatCurrency(totals.grandTotalCad)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-1 text-right">Exchange rate: 1 USD = {fxRate.toFixed(4)} CAD</p>
          </div>
        </div>

        {/* Acceptance / Signature */}
        <div className="mt-6 border border-gray-300 rounded">
          <div className="bg-[#1a3a6b] text-white px-4 py-2 text-xs font-semibold">Acceptance</div>
          <div className="p-4 grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-gray-500 mb-4">Authorized by SITECH Western Canada:</div>
              <div className="border-b border-gray-400 mb-1 mt-6"></div>
              <div className="text-xs text-gray-400">Signature &amp; Date</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Customer acceptance:</div>
              {["Accepted Name", "Title", "PO #", "Date"].map(f => (
                <div key={f} className="mb-2">
                  <div className="border-b border-gray-300 mb-0.5"></div>
                  <div className="text-xs text-gray-400">{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            {COMPANY_INFO.fullName} &nbsp;|&nbsp; {COMPANY_INFO.address}, {COMPANY_INFO.city} &nbsp;|&nbsp; {COMPANY_INFO.phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">*See reverse for Terms and Conditions of Sale</p>
        </div>
      </div>

      {/* PAGE 2 — TERMS & CONDITIONS */}
      <div className="page-break bg-white min-h-screen p-[0.4in] max-w-[8.5in] mx-auto shadow-xl font-sans text-gray-900 print:shadow-none print:p-0">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
          <Image src="/sitech-logo.png" alt="SITECH" width={100} height={36} style={{ objectFit: "contain" }} />
          <div className="text-xs text-gray-500 font-medium">Terms and Conditions of Sale</div>
          <Image src="/trimble-logo.png" alt="Trimble" width={80} height={28} style={{ objectFit: "contain" }} />
        </div>
        <div className="text-gray-700 whitespace-pre-wrap" style={{ fontSize: "7px", lineHeight: "1.5", columnCount: 2, columnGap: "0.3in" }}>
          {TERMS_AND_CONDITIONS}
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200 text-center">
          <p className="text-gray-400" style={{ fontSize: "7px" }}>{COMPANY_INFO.fullName} &nbsp;|&nbsp; {COMPANY_INFO.address}, {COMPANY_INFO.city} &nbsp;|&nbsp; {COMPANY_INFO.phone}</p>
        </div>
      </div>
    </>
  )
}
