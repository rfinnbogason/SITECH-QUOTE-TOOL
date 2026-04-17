"use server"
import { db, savedBuilds, quoteLineItems } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getBuilds() {
  return db.select().from(savedBuilds).all()
}

export async function saveBuild(name: string, machineType: string, quoteId: number) {
  const items = db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.position)
    .all()
  const itemsData = items.map(({ id: _id, quoteId: _qid, ...rest }) => rest)
  db.insert(savedBuilds).values({
    name,
    machineType,
    lineItemsJson: JSON.stringify(itemsData),
  }).run()
  revalidatePath("/builds")
}

export async function deleteBuild(id: number) {
  db.delete(savedBuilds).where(eq(savedBuilds.id, id)).run()
  revalidatePath("/builds")
}

export async function loadBuild(buildId: number) {
  const build = db.select().from(savedBuilds).where(eq(savedBuilds.id, buildId)).get()
  if (!build) return null
  db.update(savedBuilds)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(savedBuilds.id, buildId))
    .run()
  return {
    ...build,
    lineItems: JSON.parse(build.lineItemsJson),
  }
}
