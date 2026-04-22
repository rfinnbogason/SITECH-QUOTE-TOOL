"use server"
import { db, quotes, quoteLineItems, quoteFreightLabour, quoteFolders, settings } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { todayISO, futureISO } from "@/lib/formatters"

async function getFxRate(): Promise<number> {
  const [row] = await db.select().from(settings).where(eq(settings.key, "fxRate"))
  return row ? parseFloat(row.value) : 1.3947
}

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const all = await db.select({ number: quotes.number }).from(quotes)
  const maxSeq = all
    .filter(q => q.number.startsWith(`QT-${year}-`))
    .reduce((max, q) => {
      const seq = parseInt(q.number.split("-")[2] || "0", 10)
      return seq > max ? seq : max
    }, 0)
  return `QT-${year}-${String(maxSeq + 1).padStart(4, "0")}`
}

export async function createQuote() {
  const fxRate = await getFxRate()
  const number = await generateQuoteNumber()
  const [result] = await db.insert(quotes).values({
    number,
    fxRate,
    quoteDate: todayISO(),
    validUntil: futureISO(30),
  }).returning()
  revalidatePath("/")
  revalidatePath("/quotes")
  return result
}

export async function getQuote(id: number) {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id))
  const lineItems = await db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, id))
    .orderBy(quoteLineItems.position)
  const freightLabour = await db.select().from(quoteFreightLabour)
    .where(eq(quoteFreightLabour.quoteId, id))
  return { quote, lineItems, freightLabour }
}

export async function listQuotes() {
  return db.select().from(quotes).orderBy(desc(quotes.updatedAt))
}

export async function updateQuote(id: number, data: Partial<typeof quotes.$inferInsert>) {
  await db.update(quotes).set({ ...data, updatedAt: new Date() }).where(eq(quotes.id, id))
  revalidatePath(`/quotes/${id}`)
  revalidatePath("/")
}

export async function upsertLineItem(item: typeof quoteLineItems.$inferInsert) {
  if (item.id) {
    await db.update(quoteLineItems).set(item).where(eq(quoteLineItems.id, item.id))
  } else {
    await db.insert(quoteLineItems).values(item)
  }
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, item.quoteId))
  revalidatePath(`/quotes/${item.quoteId}`)
}

export async function deleteLineItem(id: number, quoteId: number) {
  await db.delete(quoteLineItems).where(eq(quoteLineItems.id, id))
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, quoteId))
  revalidatePath(`/quotes/${quoteId}`)
}

export async function upsertFreightLabour(item: typeof quoteFreightLabour.$inferInsert) {
  if (item.id) {
    await db.update(quoteFreightLabour).set(item).where(eq(quoteFreightLabour.id, item.id))
  } else {
    await db.insert(quoteFreightLabour).values(item)
  }
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, item.quoteId))
  revalidatePath(`/quotes/${item.quoteId}`)
}

export async function deleteFreightLabour(id: number, quoteId: number) {
  await db.delete(quoteFreightLabour).where(eq(quoteFreightLabour.id, id))
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, quoteId))
  revalidatePath(`/quotes/${quoteId}`)
}

export async function deleteQuote(id: number) {
  await db.delete(quoteFreightLabour).where(eq(quoteFreightLabour.quoteId, id))
  await db.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, id))
  await db.delete(quotes).where(eq(quotes.id, id))
  revalidatePath("/quotes")
  revalidatePath("/")
}

export async function moveQuoteToFolder(id: number, folder: string) {
  await db.update(quotes).set({ folder, updatedAt: new Date() }).where(eq(quotes.id, id))
  revalidatePath("/quotes")
}

export async function getQuoteFolders() {
  return db.select().from(quoteFolders).orderBy(quoteFolders.name)
}

export async function createQuoteFolder(name: string) {
  await db.insert(quoteFolders).values({ name: name.trim() }).onConflictDoNothing()
  revalidatePath("/quotes")
}

export async function deleteQuoteFolder(id: number) {
  const [folder] = await db.select().from(quoteFolders).where(eq(quoteFolders.id, id))
  if (folder) {
    await db.update(quotes).set({ folder: "" }).where(eq(quotes.folder, folder.name))
  }
  await db.delete(quoteFolders).where(eq(quoteFolders.id, id))
  revalidatePath("/quotes")
}

export async function bulkInsertLineItems(
  quoteId: number,
  items: Omit<typeof quoteLineItems.$inferInsert, "id" | "quoteId">[],
) {
  const existing = await db.select({ position: quoteLineItems.position })
    .from(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId))
  const maxPos = existing.reduce((m, r) => r.position > m ? r.position : m, 0)
  for (let i = 0; i < items.length; i++) {
    await db.insert(quoteLineItems).values({ ...items[i], quoteId, position: maxPos + i + 1 })
  }
  await db.update(quotes).set({ updatedAt: new Date() }).where(eq(quotes.id, quoteId))
  revalidatePath(`/quotes/${quoteId}`)
}
