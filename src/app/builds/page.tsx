import { db, savedBuilds } from "@/lib/db"
import { BuildsClient } from "./BuildsClient"

export default function BuildsPage() {
  const builds = db.select().from(savedBuilds).all()
  return <BuildsClient builds={builds} />
}
