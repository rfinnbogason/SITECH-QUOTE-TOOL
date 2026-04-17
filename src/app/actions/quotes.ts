"use server"
import { db, quotes, quoteLineItems, quoteFreightLabour, settings } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { todayISO, futureISO } from "@/lib/formatters"

function getFxRate(): number {
  const row = db.select().from(settings).where(eq(settings.key, "fxRate")).get()
  return row ? parseFloat(row.value) : 1.3947
}

function generateQuoteNumber(): string {
  const year = new Date().getFullYear()
  const all = db.select({ number: quotes.number }).from(quotes).all()
  const maxSeq = all
    .filter(q => q.number.startsWith(`QT-${year}-`))
    .reduce((max, q) => {
      const seq = parseInt(q.number.split("-")[2] || "0", 10)
      return seq > max ? seq : max
    }, 0)
  return `QT-${year}-${String(maxSeq + 1).padStart(4, "0")}`
}

export async function createQuote() {
  const fxRate = getFxRate()
  const number = generateQuoteNumber()
  const result = db.insert(quotes).values({
    number,
    fxRate,
    quoteDate: todayISO(),
    validUntil: futureISO(30),
  }).returning().get()
  revalidatePath("/")
  revalidatePath("/quotes")
  return result
}

export async function getQuote(id: number) {
  const quote = db.select().from(quotes).where(eq(quotes.id, id)).get()
  const lineItems = db.select().from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, id))
    .orderBy(quoteLineItems.position)
    .all()
  const freightLabour = db.select().from(quoteFreightLabour)
    .where(eq(quoteFreightLabour.quoteId, id))
    .all()
  return { quote, lineItems, freightLabour }
}

export async function listQuotes() {
  return db.select().from(quotes).orderBy(desc(quotes.updatedAt)).all()
}

export async function updateQuote(id: number, data: Partial<typeof quotes.$inferInsert>) {
  db.update(quotes).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(quotes.id, id)).run()
  revalidatePath(`/quotes/${id}`)
  revalidatePath("/")
}

export async function upsertLineItem(item: typeof quoteLineItems.$inferInsert) {
  if (item.id) {
    db.update(quoteLineItems).set(item).where(eq(quoteLineItems.id, item.id)).run()
  } else {
    db.insert(quoteLineItems).values(item).run()
  }
  db.update(quotes).set({ updatedAt: new Date().toISOString() }).where(eq(quotes.id, item.quoteId)).run()
  revalidatePath(`/quotes/${item.quoteId}`)
}

export async function deleteLineItem(id: number, quoteId: number) {
  db.delete(quoteLineItems).where(eq(quoteLineItems.id, id)).run()
  db.update(quotes).set({ updatedAt: new Date().toISOString() }).where(eq(quotes.id, quoteId)).run()
  revalidatePath(`/quotes/${quoteId}`)
}

export async function upsertFreightLabour(item: typeof quoteFreightLabour.$inferInsert) {
  if (item.id) {
    db.update(quoteFreightLabour).set(item).where(eq(quoteFreightLabour.id, item.id)).run()
  } else {
    db.insert(quoteFreightLabour).values(item).run()
  }
  db.update(quotes).set({ updatedAt: new Date().toISOString() }).where(eq(quotes.id, item.quoteId)).run()
  revalidatePath(`/quotes/${item.quoteId}`)
}

export async function deleteFreightLabour(id: number, quoteId: number) {
  db.delete(quoteFreightLabour).where(eq(quoteFreightLabour.id, id)).run()
  db.update(quotes).set({ updatedAt: new Date().toISOString() }).where(eq(quotes.id, quoteId)).run()
  revalidatePath(`/quotes/${quoteId}`)
}

export async function bulkInsertLineItems(
  quoteId: number,
  items: Omit<typeof quoteLineItems.$inferInsert, "id" | "quoteId">[],
) {
  const existing = db.select({ position: quoteLineItems.position })
    .from(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId)).all()
  const maxPos = existing.reduce((m, r) => r.position > m ? r.position : m, 0)
  items.forEach((item, i) => {
    db.insert(quoteLineItems).values({ ...item, quoteId, position: maxPos + i + 1 }).run()
  })
  db.update(quotes).set({ updatedAt: new Date().toISOString() }).where(eq(quotes.id, quoteId)).run()
  revalidatePath(`/quotes/${quoteId}`)
}
