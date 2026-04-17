import { db, quotes, quoteLineItems, quoteFreightLabour, settings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { PrintQuote } from "@/components/pdf/PrintQuote"

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quoteId = parseInt(id, 10)
  if (isNaN(quoteId)) notFound()

  const quote = db.select().from(quotes).where(eq(quotes.id, quoteId)).get()
  if (!quote) notFound()

  const lineItems = db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.position)
    .all()

  const freightLabour = db.select().from(quoteFreightLabour)
    .where(eq(quoteFreightLabour.quoteId, quoteId))
    .all()

  const fxRow = db.select().from(settings).where(eq(settings.key, "fxRate")).get()
  const defaultFxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  return <PrintQuote quote={quote} lineItems={lineItems} freightLabour={freightLabour} defaultFxRate={defaultFxRate} />
}
