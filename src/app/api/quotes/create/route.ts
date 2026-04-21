export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { db, quotes, settings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { todayISO, futureISO } from "@/lib/formatters"

export async function POST() {
  const [fxRow] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  const fxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  const year = new Date().getFullYear()
  const all = await db.select({ number: quotes.number }).from(quotes)
  const maxSeq = all
    .filter(q => q.number.startsWith(`QT-${year}-`))
    .reduce((max, q) => {
      const seq = parseInt(q.number.split("-")[2] || "0", 10)
      return seq > max ? seq : max
    }, 0)
  const number = `QT-${year}-${String(maxSeq + 1).padStart(4, "0")}`

  const [quote] = await db.insert(quotes).values({
    number,
    fxRate,
    quoteDate: todayISO(),
    validUntil: futureISO(30),
  }).returning()

  return NextResponse.json({ id: quote.id })
}
