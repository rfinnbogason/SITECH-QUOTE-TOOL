"use server"
import { db, settings, vendors, freightOptions, labourOptions, markupDefaults, salesReps } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  const rows = db.select().from(settings).all()
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function setSetting(key: string, value: string) {
  db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }).run()
  revalidatePath("/settings")
  revalidatePath("/")
}

export async function getVendors() {
  return db.select().from(vendors).all()
}

export async function upsertVendor(v: typeof vendors.$inferInsert) {
  if (v.id) {
    db.update(vendors).set(v).where(eq(vendors.id, v.id)).run()
  } else {
    db.insert(vendors).values(v).run()
  }
  revalidatePath("/settings")
}

export async function deleteVendor(id: number) {
  db.delete(vendors).where(eq(vendors.id, id)).run()
  revalidatePath("/settings")
}

export async function getFreightOptions() {
  return db.select().from(freightOptions).all()
}

export async function upsertFreightOption(f: typeof freightOptions.$inferInsert) {
  db.insert(freightOptions).values(f).onConflictDoUpdate({ target: freightOptions.code, set: f }).run()
  revalidatePath("/settings")
}

export async function getLabourOptions() {
  return db.select().from(labourOptions).all()
}

export async function upsertLabourOption(l: typeof labourOptions.$inferInsert) {
  db.insert(labourOptions).values(l).onConflictDoUpdate({ target: labourOptions.code, set: l }).run()
  revalidatePath("/settings")
}

export async function getMarkupDefaults() {
  return db.select().from(markupDefaults).all()
}

export async function upsertMarkupDefault(m: typeof markupDefaults.$inferInsert) {
  db.insert(markupDefaults).values(m).onConflictDoUpdate({ target: markupDefaults.category, set: m }).run()
  revalidatePath("/settings")
}

export async function getSalesReps() {
  return db.select().from(salesReps).all()
}

export async function upsertSalesRep(rep: typeof salesReps.$inferInsert) {
  if (rep.id) {
    db.update(salesReps).set(rep).where(eq(salesReps.id, rep.id)).run()
  } else {
    db.insert(salesReps).values(rep).run()
  }
  revalidatePath("/reps")
}

export async function deleteSalesRep(id: number) {
  db.delete(salesReps).where(eq(salesReps.id, id)).run()
  revalidatePath("/reps")
}
