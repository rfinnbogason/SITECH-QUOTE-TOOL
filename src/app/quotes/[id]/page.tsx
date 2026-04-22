export const dynamic = "force-dynamic"
import { db, quotes, quoteLineItems, quoteFreightLabour, salesReps, freightOptions, labourOptions, settings, buildGroups } from "@/lib/db"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { QuoteBuilder } from "@/components/quote/QuoteBuilder"

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
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

  const reps = await db.select().from(salesReps)
  const freightOpts = await db.select().from(freightOptions)
  const labourOpts = await db.select().from(labourOptions)
  const groups = await db.select().from(buildGroups).orderBy(buildGroups.name)
  const [fxRow] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  const defaultFxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  return (
    <QuoteBuilder
      quote={quote}
      lineItems={lineItems}
      freightLabour={freightLabour}
      reps={reps}
      freightOptions={freightOpts}
      labourOptions={labourOpts}
      defaultFxRate={defaultFxRate}
      buildGroups={groups}
    />
  )
}
