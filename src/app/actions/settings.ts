"use server"
import { db, settings, vendors, freightOptions, labourOptions, markupDefaults, salesReps } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  const rows = await db.select().from(settings)
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function setSetting(key: string, value: string) {
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } })
  revalidatePath("/settings")
  revalidatePath("/")
}

export async function getVendors() {
  return db.select().from(vendors)
}

export async function upsertVendor(v: typeof vendors.$inferInsert) {
  if (v.id) {
    await db.update(vendors).set(v).where(eq(vendors.id, v.id))
  } else {
    await db.insert(vendors).values(v)
  }
  revalidatePath("/settings")
}

export async function deleteVendor(id: number) {
  await db.delete(vendors).where(eq(vendors.id, id))
  revalidatePath("/settings")
}

export async function getFreightOptions() {
  return db.select().from(freightOptions)
}

export async function upsertFreightOption(f: typeof freightOptions.$inferInsert) {
  await db.insert(freightOptions).values(f).onConflictDoUpdate({ target: freightOptions.code, set: f })
  revalidatePath("/settings")
}

export async function deleteFreightOption(code: string) {
  await db.delete(freightOptions).where(eq(freightOptions.code, code))
  revalidatePath("/settings")
}

export async function getLabourOptions() {
  return db.select().from(labourOptions)
}

export async function upsertLabourOption(l: typeof labourOptions.$inferInsert) {
  await db.insert(labourOptions).values(l).onConflictDoUpdate({ target: labourOptions.code, set: l })
  revalidatePath("/settings")
}

export async function deleteLabourOption(code: string) {
  await db.delete(labourOptions).where(eq(labourOptions.code, code))
  revalidatePath("/settings")
}

export async function getMarkupDefaults() {
  return db.select().from(markupDefaults)
}

export async function upsertMarkupDefault(m: typeof markupDefaults.$inferInsert) {
  await db.insert(markupDefaults).values(m).onConflictDoUpdate({ target: markupDefaults.category, set: m })
  revalidatePath("/settings")
}

export async function deleteMarkupDefault(category: string) {
  await db.delete(markupDefaults).where(eq(markupDefaults.category, category))
  revalidatePath("/settings")
}

export async function getSalesReps() {
  return db.select().from(salesReps)
}

export async function upsertSalesRep(rep: typeof salesReps.$inferInsert) {
  if (rep.id) {
    await db.update(salesReps).set(rep).where(eq(salesReps.id, rep.id))
  } else {
    await db.insert(salesReps).values(rep)
  }
  revalidatePath("/reps")
}

export async function deleteSalesRep(id: number) {
  await db.delete(salesReps).where(eq(salesReps.id, id))
  revalidatePath("/reps")
}
