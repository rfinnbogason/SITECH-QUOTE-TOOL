import { db, savedBuilds } from "@/lib/db"
import { BuildsClient } from "./BuildsClient"

export default async function BuildsPage() {
  const builds = await db.select().from(savedBuilds)
  return <BuildsClient builds={builds} />
}
