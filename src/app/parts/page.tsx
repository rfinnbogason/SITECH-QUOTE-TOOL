import { db, partsDb } from "@/lib/db"
import { PartsClient } from "./PartsClient"

export default function PartsPage() {
  const parts = db.select().from(partsDb).all()
  return <PartsClient parts={parts} />
}
