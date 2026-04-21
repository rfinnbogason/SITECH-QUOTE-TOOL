import { db, salesReps } from "@/lib/db"
import { RepsClient } from "./RepsClient"

export default async function RepsPage() {
  const reps = await db.select().from(salesReps)
  return <RepsClient reps={reps} />
}
