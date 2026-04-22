export const dynamic = "force-dynamic"
import { db, quotes, partsDb, salesReps, savedBuilds, settings } from "@/lib/db"
import { desc, eq, count } from "drizzle-orm"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const recentQuotes = await db.select().from(quotes).orderBy(desc(quotes.updatedAt)).limit(8)
  const [partCountRow] = await db.select({ count: count() }).from(partsDb)
  const [repCountRow] = await db.select({ count: count() }).from(salesReps).where(eq(salesReps.status, "Active"))
  const [buildCountRow] = await db.select({ count: count() }).from(savedBuilds)
  const [quoteCountRow] = await db.select({ count: count() }).from(quotes)
  const [fxRow] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  const [fxUpdated] = await db.select().from(settings).where(eq(settings.key, "fxUpdatedAt"))

  return (
    <DashboardClient
      fxRate={fxRow ? parseFloat(fxRow.value) : 1.3947}
      fxUpdatedAt={fxUpdated?.value ?? null}
      quoteCount={quoteCountRow?.count ?? 0}
      partCount={partCountRow?.count ?? 0}
      repCount={repCountRow?.count ?? 0}
      buildCount={buildCountRow?.count ?? 0}
      recentQuotes={recentQuotes}
    />
  )
}
