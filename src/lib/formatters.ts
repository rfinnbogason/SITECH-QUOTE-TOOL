export function formatCurrency(amount: number, currency: "USD" | "CAD" = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function futureISO(days: number): string {
  return addDays(new Date(), days).toISOString().split("T")[0]
}
