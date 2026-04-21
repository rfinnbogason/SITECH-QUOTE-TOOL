export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { db, savedBuilds, quoteLineItems, quotes } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quoteId } = await req.json()
  const buildId = parseInt(id, 10)

  const [build] = await db.select().from(savedBuilds).where(eq(savedBuilds.id, buildId))
  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const items = JSON.parse(build.lineItemsJson)
  const existing = await db.select({ position: quoteLineItems.position })
    .from(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId))
  const maxPos = existing.reduce((m: number, r: { position: number }) => r.position > m ? r.position : m, 0)

  for (let i = 0; i < items.length; i++) {
    await db.insert(quoteLineItems).values({ ...items[i], quoteId, position: maxPos + i + 1 })
  }
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, quoteId))
  await db.update(savedBuilds).set({ lastUsedAt: new Date() }).where(eq(savedBuilds.id, buildId))

  return NextResponse.json({ ok: true })
}
