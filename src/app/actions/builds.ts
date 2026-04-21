"use server"
import { db, savedBuilds, quoteLineItems } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getBuilds() {
  return db.select().from(savedBuilds)
}

export async function saveBuild(name: string, machineType: string, quoteId: number, groupName = "Recent Builds") {
  const items = await db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.position)
  const itemsData = items.map(({ id: _id, quoteId: _qid, ...rest }) => rest)
  await db.insert(savedBuilds).values({
    name,
    machineType,
    groupName,
    lineItemsJson: JSON.stringify(itemsData),
    lastQuotedDate: new Date(),
  })
  revalidatePath("/builds")
}

export async function deleteBuild(id: number) {
  await db.delete(savedBuilds).where(eq(savedBuilds.id, id))
  revalidatePath("/builds")
}

export async function loadBuild(buildId: number) {
  const [build] = await db.select().from(savedBuilds).where(eq(savedBuilds.id, buildId))
  if (!build) return null
  await db.update(savedBuilds)
    .set({ lastUsedAt: new Date(), lastQuotedDate: new Date() })
    .where(eq(savedBuilds.id, buildId))
  return {
    ...build,
    lineItems: JSON.parse(build.lineItemsJson),
  }
}
