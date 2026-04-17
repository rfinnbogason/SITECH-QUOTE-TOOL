import { db, settings, vendors, freightOptions, labourOptions, markupDefaults } from "@/lib/db"
import { SettingsClient } from "./SettingsClient"

export default function SettingsPage() {
  const rows = db.select().from(settings).all()
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]))
  const vendorList = db.select().from(vendors).all()
  const freightList = db.select().from(freightOptions).all()
  const labourList = db.select().from(labourOptions).all()
  const markupList = db.select().from(markupDefaults).all()

  return <SettingsClient config={cfg} vendors={vendorList} freight={freightList} labour={labourList} markup={markupList} />
}
