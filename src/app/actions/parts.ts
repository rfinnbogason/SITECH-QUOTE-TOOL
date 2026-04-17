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
    ).all()
  }
  return db.select().from(partsDb).all()
}

export async function upsertPart(part: typeof partsDb.$inferInsert) {
  if (part.id) {
    db.update(partsDb).set(part).where(eq(partsDb.id, part.id)).run()
  } else {
    db.insert(partsDb).values(part).run()
  }
  revalidatePath("/parts")
}

export async function deletePart(id: number) {
  db.delete(partsDb).where(eq(partsDb.id, id)).run()
  revalidatePath("/parts")
}
