import { db, quotes, quoteLineItems, quoteFreightLabour, settings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { PrintQuote } from "@/components/pdf/PrintQuote"

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quoteId = parseInt(id, 10)
  if (isNaN(quoteId)) notFound()

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId))
  if (!quote) notFound()

  const lineItems = await db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.position)

  const freightLabour = await db.select().from(quoteFreightLabour)
    .where(eq(quoteFreightLabour.quoteId, quoteId))

  const [fxRow] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  const defaultFxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  return <PrintQuote quote={quote} lineItems={lineItems} freightLabour={freightLabour} defaultFxRate={defaultFxRate} />
}
