export const dynamic = "force-dynamic"
import { db, settings, vendors, freightOptions, labourOptions, markupDefaults } from "@/lib/db"
import { SettingsClient } from "./SettingsClient"

export default async function SettingsPage() {
  const rows = await db.select().from(settings)
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]))
  const vendorList = await db.select().from(vendors)
  const freightList = await db.select().from(freightOptions)
  const labourList = await db.select().from(labourOptions)
  const markupList = await db.select().from(markupDefaults)

  return <SettingsClient config={cfg} vendors={vendorList} freight={freightList} labour={labourList} markup={markupList} />
}
