"use server"
import { db, partsDb } from "@/lib/db"
import { eq, like, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getParts(search?: string) {
  if (search) {
    return db.select().from(partsDb).where(
      or(
        like(partsDb.itemNo, `%${search}%`),
        like(partsDb.description, `%${search}%`),
        like(partsDb.category, `%${search}%`),
      )
    )
  }
  return db.select().from(partsDb)
}

export async function upsertPart(part: typeof partsDb.$inferInsert) {
  if (part.id) {
    await db.update(partsDb).set(part).where(eq(partsDb.id, part.id))
  } else {
    await db.insert(partsDb).values(part)
  }
  revalidatePath("/parts")
}

export async function deletePart(id: number) {
  await db.delete(partsDb).where(eq(partsDb.id, id))
  revalidatePath("/parts")
}
