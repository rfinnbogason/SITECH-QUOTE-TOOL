export interface ParsedRow {
  qty: number
  partNumber: string
  description: string
  listPrice: number
  currency: "USD" | "CAD"
}

export type ColumnRole = "qty" | "partNumber" | "description" | "listPrice" | "currency" | "ignore"

export interface ColumnGuess {
  index: number
  role: ColumnRole
  header?: string
  sample: string[]
}

export interface ParseResult {
  headers: string[]
  rows: string[][]
  columnGuesses: ColumnGuess[]
}

function detectDelimiter(text: string): string {
  const tabs = (text.match(/\t/g) || []).length
  const commas = (text.match(/,/g) || []).length
  return tabs >= commas ? "\t" : ","
}

function isMoneyLike(val: string): boolean {
  const cleaned = val.replace(/[$,\s]/g, "")
  const num = parseFloat(cleaned)
  return !isNaN(num) && num > 0
}

function isCurrencyLike(val: string): boolean {
  return /^(USD|CAD)$/i.test(val.trim())
}

function isQtyLike(val: string): boolean {
  const n = parseFloat(val.trim())
  return !isNaN(n) && n > 0 && n <= 9999 && Number.isInteger(n)
}

function isSkuLike(val: string): boolean {
  return /^[A-Z0-9][A-Z0-9\-_\.]{2,}$/i.test(val.trim()) && val.trim().length < 30
}

function scoreColumn(values: string[]): { role: ColumnRole; confidence: number } {
  const nonEmpty = values.filter(v => v.trim())
  if (!nonEmpty.length) return { role: "ignore", confidence: 0 }

  const qtyScore = nonEmpty.filter(isQtyLike).length / nonEmpty.length
  const moneyScore = nonEmpty.filter(isMoneyLike).length / nonEmpty.length
  const currScore = nonEmpty.filter(isCurrencyLike).length / nonEmpty.length
  const skuScore = nonEmpty.filter(isSkuLike).length / nonEmpty.length
  const avgLen = nonEmpty.reduce((s, v) => s + v.length, 0) / nonEmpty.length

  if (currScore > 0.7) return { role: "currency", confidence: currScore }
  if (moneyScore > 0.7 && avgLen < 12) return { role: "listPrice", confidence: moneyScore }
  if (qtyScore > 0.8 && avgLen < 6) return { role: "qty", confidence: qtyScore }
  if (skuScore > 0.6 && avgLen < 25) return { role: "partNumber", confidence: skuScore }
  if (avgLen > 15) return { role: "description", confidence: 0.6 }

  return { role: "ignore", confidence: 0 }
}

export function parseText(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [], columnGuesses: [] }

  const delimiter = detectDelimiter(text)
  const allRows = lines.map(l => l.split(delimiter))
  const maxCols = Math.max(...allRows.map(r => r.length))

  // Detect if first row is a header (contains non-numeric text that matches known headers)
  const firstRow = allRows[0]
  const headerKeywords = ["qty", "quantity", "part", "item", "desc", "price", "cost", "curr", "usd", "cad"]
  const isHeader = firstRow.some(c =>
    headerKeywords.some(k => c.toLowerCase().includes(k))
  )

  const dataRows = isHeader ? allRows.slice(1) : allRows
  const headers = isHeader ? firstRow : Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`)

  const columnGuesses: ColumnGuess[] = []
  const usedRoles = new Set<ColumnRole>()

  for (let i = 0; i < maxCols; i++) {
    const colValues = dataRows.map(r => r[i] || "")
    const guess = scoreColumn(colValues)
    const role = usedRoles.has(guess.role) ? "ignore" : guess.role
    if (role !== "ignore") usedRoles.add(role)
    columnGuesses.push({
      index: i,
      role,
      header: headers[i] || `Col ${i + 1}`,
      sample: colValues.slice(0, 3).filter(Boolean),
    })
  }

  // Ensure description gets assigned to longest text column if not yet mapped
  if (!usedRoles.has("description")) {
    const unassigned = columnGuesses.filter(g => g.role === "ignore")
    if (unassigned.length) {
      const longest = unassigned.sort((a, b) => {
        const aLen = a.sample.reduce((s, v) => s + v.length, 0)
        const bLen = b.sample.reduce((s, v) => s + v.length, 0)
        return bLen - aLen
      })[0]
      longest.role = "description"
    }
  }

  return { headers, rows: dataRows, columnGuesses }
}

export function applyMapping(result: ParseResult, mapping: Record<number, ColumnRole>): ParsedRow[] {
  return result.rows
    .filter(row => row.some(c => c.trim()))
    .map(row => {
      const get = (role: ColumnRole) => {
        const entry = Object.entries(mapping).find(([, r]) => r === role)
        if (!entry) return ""
        return row[parseInt(entry[0])] || ""
      }
      const priceRaw = get("listPrice").replace(/[$,\s]/g, "")
      const qtyRaw = get("qty")
      const currRaw = get("currency").toUpperCase()
      return {
        qty: parseFloat(qtyRaw) || 1,
        partNumber: get("partNumber").trim(),
        description: get("description").trim(),
        listPrice: parseFloat(priceRaw) || 0,
        currency: (currRaw === "CAD" ? "CAD" : "USD") as "USD" | "CAD",
      }
    })
    .filter(r => r.description || r.partNumber)
}
