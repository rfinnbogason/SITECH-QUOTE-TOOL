import React from "react"
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer"
import type { Quote, QuoteLineItem, QuoteFreightLabour } from "@/lib/db/schema"
import { calcLineItem, calcQuoteTotals } from "@/lib/calculations"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { SECTIONS, COMPANY_INFO, TERMS_SHORT as TERMS } from "@/lib/constants"

// Helvetica is a built-in PDF font, no registration needed

const BLUE = "#1a56db"
const DARK = "#111827"
const GRAY = "#6b7280"
const LIGHT = "#f9fafb"
const BORDER = "#e5e7eb"

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: DARK, padding: "0.5in" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: BLUE, paddingBottom: 10, marginBottom: 14 },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BLUE },
  companyDetail: { fontSize: 8, color: GRAY, marginTop: 2 },
  quoteTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right" },
  quoteDetail: { fontSize: 8, color: GRAY, textAlign: "right", marginTop: 2 },
  quoteDetailBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "right" },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  billRow: { flexDirection: "row", gap: 24, marginBottom: 14 },
  billCol: { flex: 1 },
  billName: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  billDetail: { fontSize: 8, color: GRAY, marginTop: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 5, paddingHorizontal: 6 },
  tableHeaderCell: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "white" },
  tableRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: LIGHT },
  cell: { fontSize: 8 },
  sectionRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, backgroundColor: "#e5e7eb" },
  sectionRowText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY },
  summaryTable: { alignSelf: "flex-end", marginTop: 12, width: 220, borderTopWidth: 1, borderTopColor: BORDER },
  summaryRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER, paddingVertical: 3, paddingHorizontal: 6 },
  summaryLabel: { flex: 1, fontSize: 8, color: GRAY },
  summaryValue: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  grandRow: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 5, paddingHorizontal: 6 },
  grandLabel: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "white" },
  grandValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "white" },
  fxNote: { fontSize: 7, color: GRAY, textAlign: "right", marginTop: 4 },
  termsHeader: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 4, marginTop: 14, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  termItem: { fontSize: 7, color: GRAY, marginBottom: 2 },
  sigRow: { flexDirection: "row", gap: 24, marginTop: 16, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10 },
  sigCol: { flex: 1 },
  sigHeader: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 14 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: DARK, marginBottom: 2 },
  sigLabel: { fontSize: 7, color: GRAY },
  footer: { fontSize: 7, color: GRAY, textAlign: "center", marginTop: 14, borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 6 },
})

interface Props {
  quote: Quote
  lineItems: QuoteLineItem[]
  freightLabour: QuoteFreightLabour[]
  defaultFxRate: number
}

export function QuotePDF({ quote, lineItems, freightLabour, defaultFxRate }: Props) {
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
    <Document title={`${quote.number} — ${quote.customerCompany || "Quote"}`}>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={s.companyDetail}>{COMPANY_INFO.address}</Text>
            <Text style={s.companyDetail}>{COMPANY_INFO.city}</Text>
            <Text style={s.companyDetail}>Tel: {COMPANY_INFO.phone}</Text>
            <Text style={s.companyDetail}>{COMPANY_INFO.email}</Text>
          </View>
          <View>
            <Text style={s.quoteTitle}>QUOTATION</Text>
            <Text style={s.quoteDetailBold}>Quote #: {quote.number}</Text>
            <Text style={s.quoteDetail}>Date: {formatDate(quote.quoteDate)}</Text>
            <Text style={s.quoteDetail}>Valid Until: {formatDate(quote.validUntil)}</Text>
            {quote.salesRepName ? <Text style={s.quoteDetail}>Rep: {quote.salesRepName}</Text> : null}
          </View>
        </View>

        {/* Bill To / Machine */}
        <View style={s.billRow}>
          <View style={s.billCol}>
            <Text style={s.sectionLabel}>Bill To</Text>
            <Text style={s.billName}>{quote.customerCompany || "—"}</Text>
            {quote.customerContact ? <Text style={s.billDetail}>{quote.customerContact}</Text> : null}
            {quote.customerEmail ? <Text style={s.billDetail}>{quote.customerEmail}</Text> : null}
            {quote.customerPhone ? <Text style={s.billDetail}>{quote.customerPhone}</Text> : null}
          </View>
          <View style={s.billCol}>
            <Text style={s.sectionLabel}>Machine</Text>
            {quote.machineMake ? <Text style={s.billName}>{quote.machineMake} {quote.machineModel}</Text> : <Text style={s.billName}>—</Text>}
            {quote.machineSerial ? <Text style={s.billDetail}>S/N: {quote.machineSerial}</Text> : null}
            {quote.installType ? <Text style={s.billDetail}>Install: {quote.installType}</Text> : null}
          </View>
        </View>

        {/* Table Header */}
        <View style={s.tableHeader}>
          <Text style={{ ...s.tableHeaderCell, width: 18 }}>#</Text>
          <Text style={{ ...s.tableHeaderCell, width: 70 }}>Part #</Text>
          <Text style={{ ...s.tableHeaderCell, flex: 1 }}>Description</Text>
          <Text style={{ ...s.tableHeaderCell, width: 28, textAlign: "center" }}>Qty</Text>
          <Text style={{ ...s.tableHeaderCell, width: 68, textAlign: "right" }}>Unit (CAD)</Text>
          <Text style={{ ...s.tableHeaderCell, width: 68, textAlign: "right" }}>Total (CAD)</Text>
        </View>

        {/* Line Items grouped by section */}
        {groupedItems.map(({ section, items }) => (
          <React.Fragment key={section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionRowText}>{section}</Text>
            </View>
            {items.map((item, idx) => (
              <View key={item.id} style={{ ...s.tableRow, ...(idx % 2 === 1 ? s.tableRowAlt : {}) }}>
                <Text style={{ ...s.cell, width: 18, color: GRAY }}>{idx + 1}</Text>
                <Text style={{ ...s.cell, width: 70, color: GRAY, fontFamily: "Helvetica" }}>{item.partNumber || "—"}</Text>
                <Text style={{ ...s.cell, flex: 1 }}>{item.description}</Text>
                <Text style={{ ...s.cell, width: 28, textAlign: "center" }}>{item.qty}</Text>
                <Text style={{ ...s.cell, width: 68, textAlign: "right" }}>
                  {item.showPrice ? formatCurrency(item.unitSellPrice * fxRate) : "—"}
                </Text>
                <Text style={{ ...s.cell, width: 68, textAlign: "right", fontFamily: "Helvetica-Bold" }}>
                  {formatCurrency(item.totalCad)}
                </Text>
              </View>
            ))}
          </React.Fragment>
        ))}

        {/* Freight & Labour */}
        {freightLabour.map(fl => (
          <View key={fl.id} style={{ ...s.tableRow, backgroundColor: "#ede9fe" }}>
            <Text style={{ ...s.cell, width: 18, color: GRAY }}>—</Text>
            <Text style={{ ...s.cell, width: 70, color: GRAY, fontFamily: "Helvetica-Bold" }}>{fl.type}</Text>
            <Text style={{ ...s.cell, flex: 1 }}>{fl.description}</Text>
            <Text style={{ ...s.cell, width: 28, textAlign: "center" }}>{fl.qtyHours}</Text>
            <Text style={{ ...s.cell, width: 68, textAlign: "right" }}>{formatCurrency(fl.rateCad)}</Text>
            <Text style={{ ...s.cell, width: 68, textAlign: "right", fontFamily: "Helvetica-Bold" }}>
              {formatCurrency(fl.qtyHours * fl.rateCad)}
            </Text>
          </View>
        ))}

        {/* Summary */}
        <View style={s.summaryTable}>
          <SumRow label="Products Subtotal" value={formatCurrency(totals.productSubtotalCad)} />
          {freightLabourTotal > 0 && <SumRow label="Freight & Labour" value={formatCurrency(freightLabourTotal)} />}
          <SumRow label="Subtotal" value={formatCurrency(totals.subtotalCad)} />
          {totals.discountAmtCad > 0 && (
            <SumRow label={`Discount (${quote.discountPct}%)`} value={`-${formatCurrency(totals.discountAmtCad)}`} />
          )}
          {totals.taxAmtCad > 0 && (
            <SumRow label={`Tax (${quote.taxPct}%)`} value={formatCurrency(totals.taxAmtCad)} />
          )}
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>GRAND TOTAL (CAD)</Text>
            <Text style={s.grandValue}>{formatCurrency(totals.grandTotalCad)}</Text>
          </View>
        </View>

        <Text style={s.fxNote}>Exchange Rate: 1 USD = {fxRate.toFixed(4)} CAD</Text>

        {/* Terms */}
        <Text style={s.termsHeader}>Terms &amp; Conditions</Text>
        {TERMS.map((t, i) => <Text key={i} style={s.termItem}>• {t}</Text>)}

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigCol}>
            <Text style={s.sigHeader}>SITECH Western Canada Authorization</Text>
            <View style={{ marginTop: 18 }}>
              <View style={s.sigLine} />
              <Text style={s.sigLabel}>Signature &amp; Date</Text>
            </View>
          </View>
          <View style={s.sigCol}>
            <Text style={s.sigHeader}>Customer Acceptance</Text>
            {["Name", "Title", "PO #", "Date"].map(f => (
              <View key={f} style={{ marginBottom: 8 }}>
                <View style={s.sigLine} />
                <Text style={s.sigLabel}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          Thank you for your business! — {COMPANY_INFO.name} | {COMPANY_INFO.phone} | {COMPANY_INFO.email}
        </Text>
      </Page>
    </Document>
  )
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.summaryRow}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={s.summaryValue}>{value}</Text>
    </View>
  )
}
