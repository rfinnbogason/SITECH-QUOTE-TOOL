import { NextResponse } from "next/server"
import { db, quotes, quoteLineItems, quoteFreightLabour, settings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { renderToBuffer } from "@react-pdf/renderer"
import { QuotePDF } from "@/components/pdf/QuotePDF"
import React from "react"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quoteId = parseInt(id, 10)
  if (isNaN(quoteId)) return new NextResponse("Not found", { status: 404 })

  const quote = db.select().from(quotes).where(eq(quotes.id, quoteId)).get()
  if (!quote) return new NextResponse("Not found", { status: 404 })

  const lineItems = db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.position)
    .all()

  const freightLabour = db.select().from(quoteFreightLabour)
    .where(eq(quoteFreightLabour.quoteId, quoteId))
    .all()

  const fxRow = db.select().from(settings).where(eq(settings.key, "fxRate")).get()
  const defaultFxRate = fxRow ? parseFloat(fxRow.value) : 1.3947

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(QuotePDF, { quote, lineItems, freightLabour, defaultFxRate }) as any
  const buffer = await renderToBuffer(element)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.number}.pdf"`,
    },
  })
}
