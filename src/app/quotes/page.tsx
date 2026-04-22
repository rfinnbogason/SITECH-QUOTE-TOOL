export const dynamic = "force-dynamic"
import { db, quotes, quoteFolders } from "@/lib/db"
import { desc } from "drizzle-orm"
import { QuotesClient } from "./QuotesClient"

export default async function QuotesPage() {
  const allQuotes = await db.select().from(quotes).orderBy(desc(quotes.updatedAt))
  const folders = await db.select().from(quoteFolders).orderBy(quoteFolders.name)
  return <QuotesClient quotes={allQuotes} folders={folders} />
}
