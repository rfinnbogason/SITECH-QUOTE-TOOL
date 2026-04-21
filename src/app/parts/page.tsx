export const dynamic = "force-dynamic"
import { db, partsDb } from "@/lib/db"
import { PartsClient } from "./PartsClient"

export default async function PartsPage() {
  const parts = await db.select().from(partsDb)
  return <PartsClient parts={parts} />
}
