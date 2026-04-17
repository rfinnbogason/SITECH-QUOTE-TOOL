import { db, salesReps } from "@/lib/db"
import { RepsClient } from "./RepsClient"

export default function RepsPage() {
  const reps = db.select().from(salesReps).all()
  return <RepsClient reps={reps} />
}
