export type Currency = "USD" | "CAD"

export function extendedUsd(qty: number, listPrice: number, currency: Currency, fxRate: number): number {
  if (currency === "CAD") return (qty * listPrice) / fxRate
  return qty * listPrice
}

export function unitSell(listPrice: number, discountPct: number): number {
  return listPrice * (1 - discountPct / 100)
}

export function totalUsd(qty: number, unitSellPrice: number): number {
  return qty * unitSellPrice
}

export function totalCad(totalUsdAmt: number, fxRate: number): number {
  return totalUsdAmt * fxRate
}

export function profitCad(
  totalCadAmt: number,
  extendedUsdAmt: number,
  vendorDiscPct: number,
  fxRate: number,
): number {
  return totalCadAmt - extendedUsdAmt * (1 - vendorDiscPct / 100) * fxRate
}

export function marginPct(profitCadAmt: number, revenueCad: number): number {
  if (revenueCad === 0) return 0
  return (profitCadAmt / revenueCad) * 100
}

export interface LineItemCalc {
  extendedUsd: number
  unitSellPrice: number
  totalUsd: number
  totalCad: number
  profitCad: number
}

export function calcLineItem(
  qty: number,
  listPrice: number,
  currency: Currency,
  discountPct: number,
  vendorDiscPct: number,
  fxRate: number,
): LineItemCalc {
  const ext = extendedUsd(qty, listPrice, currency, fxRate)
  const us = unitSell(listPrice, discountPct)
  const tusd = totalUsd(qty, us)
  const tcad = totalCad(tusd, fxRate)
  const profit = profitCad(tcad, ext, vendorDiscPct, fxRate)
  return { extendedUsd: ext, unitSellPrice: us, totalUsd: tusd, totalCad: tcad, profitCad: profit }
}

export interface QuoteTotals {
  productSubtotalUsd: number
  productSubtotalCad: number
  freightLabourCad: number
  subtotalUsd: number
  subtotalCad: number
  discountAmtUsd: number
  discountAmtCad: number
  afterDiscountUsd: number
  afterDiscountCad: number
  taxAmtUsd: number
  taxAmtCad: number
  grandTotalUsd: number
  grandTotalCad: number
  totalProfitCad: number
  marginPct: number
}

export function calcQuoteTotals(
  lineItems: { totalUsd: number; totalCad: number; profitCad: number }[],
  freightLabourCad: number,
  discountPct: number,
  taxPct: number,
  fxRate: number,
): QuoteTotals {
  const productSubtotalUsd = lineItems.reduce((s, i) => s + i.totalUsd, 0)
  const productSubtotalCad = lineItems.reduce((s, i) => s + i.totalCad, 0)
  const subtotalUsd = productSubtotalUsd + freightLabourCad / fxRate
  const subtotalCad = productSubtotalCad + freightLabourCad
  const discountAmtUsd = subtotalUsd * (discountPct / 100)
  const discountAmtCad = subtotalCad * (discountPct / 100)
  const afterDiscountUsd = subtotalUsd - discountAmtUsd
  const afterDiscountCad = subtotalCad - discountAmtCad
  const taxAmtUsd = afterDiscountUsd * (taxPct / 100)
  const taxAmtCad = afterDiscountCad * (taxPct / 100)
  const grandTotalUsd = afterDiscountUsd + taxAmtUsd
  const grandTotalCad = afterDiscountCad + taxAmtCad
  const totalProfitCad = lineItems.reduce((s, i) => s + i.profitCad, 0)
  const margin = marginPct(totalProfitCad, grandTotalCad)
  return {
    productSubtotalUsd, productSubtotalCad, freightLabourCad,
    subtotalUsd, subtotalCad, discountAmtUsd, discountAmtCad,
    afterDiscountUsd, afterDiscountCad, taxAmtUsd, taxAmtCad,
    grandTotalUsd, grandTotalCad, totalProfitCad, marginPct: margin,
  }
}
