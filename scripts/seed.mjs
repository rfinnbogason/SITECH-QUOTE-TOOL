// Run: node scripts/seed.mjs
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { pgTable, text, integer, real, boolean, serial, timestamp } from "drizzle-orm/pg-core"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required")
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client)

const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
})

const salesReps = pgTable("sales_reps", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().default(""),
  region: text("region").notNull().default(""),
  status: text("status").notNull().default("Active"),
})

const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  discountPct: real("discount_pct").notNull().default(0),
  paymentTerms: text("payment_terms").notNull().default("Net 30"),
  status: text("status").notNull().default("Active"),
})

const freightOptions = pgTable("freight_options", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  costCad: real("cost_cad").notNull(),
  status: text("status").notNull().default("Active"),
})

const labourOptions = pgTable("labour_options", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  hourlyRateCad: real("hourly_rate_cad").notNull(),
  minHours: real("min_hours").notNull().default(1),
  status: text("status").notNull().default("Active"),
})

const markupDefaults = pgTable("markup_defaults", {
  category: text("category").primaryKey(),
  markupPct: real("markup_pct").notNull().default(30),
  minMarginPct: real("min_margin_pct").notNull().default(15),
})

const installTimes = pgTable("install_times", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  machineType: text("machine_type").notNull(),
  description: text("description").notNull(),
  hours: real("hours").notNull(),
})

async function seed() {
  console.log("🌱 Seeding database...")

  await db.insert(settings).values([
    { key: "fxRate", value: "1.3947" },
    { key: "fxUpdatedAt", value: new Date().toISOString().split("T")[0] },
  ]).onConflictDoNothing()

  await db.insert(salesReps).values([
    { fullName: "Jonas Klum", email: "jonas.klum@sitech-wc.ca", region: "Western Canada", status: "Active" },
    { fullName: "Jessie Emmons", email: "jessie.emmons@sitech-wc.ca", region: "Eastern Canada", status: "Active" },
    { fullName: "David Prangnell", email: "david.prangnell@sitech-wc.ca", region: "Central Region", status: "Active" },
    { fullName: "Travis Woods", email: "travis.woods@sitech-wc.ca", region: "USA - Northwest", status: "Active" },
    { fullName: "Everett Buckmaster", email: "everett.buckmaster@sitech-wc.ca", region: "", status: "Active" },
    { fullName: "Larry Ross", email: "larry.ross@sitech-wc.ca", region: "", status: "Inactive" },
  ]).onConflictDoNothing()

  await db.insert(vendors).values([
    { name: "Trimble", discountPct: 25, paymentTerms: "Net 30" },
    { name: "Topcon", discountPct: 22, paymentTerms: "Net 30" },
    { name: "Leica", discountPct: 20, paymentTerms: "Net 45" },
    { name: "CAT", discountPct: 18, paymentTerms: "Net 30" },
    { name: "John Deere", discountPct: 20, paymentTerms: "Net 30" },
    { name: "Komatsu", discountPct: 15, paymentTerms: "Net 45" },
    { name: "Hitachi", discountPct: 17, paymentTerms: "Net 30" },
    { name: "SITECH Parts", discountPct: 30, paymentTerms: "Net 15" },
    { name: "Third Party", discountPct: 10, paymentTerms: "Net 30" },
    { name: "Custom", discountPct: 0, paymentTerms: "Varies" },
  ]).onConflictDoNothing()

  await db.insert(freightOptions).values([
    { code: "FRT-SMALL", name: "Small Parts", costCad: 75 },
    { code: "FRT-MEDIUM", name: "Medium Parts", costCad: 150 },
    { code: "FRT-LARGE", name: "Large Parts", costCad: 250 },
  ]).onConflictDoNothing()

  await db.insert(labourOptions).values([
    { code: "LAB-INST", name: "Standard Installation", hourlyRateCad: 175, minHours: 2 },
    { code: "LAB-INSTADV", name: "Advanced Installation", hourlyRateCad: 245, minHours: 4 },
    { code: "LAB-CALIB", name: "Calibration & Setup", hourlyRateCad: 210, minHours: 1 },
    { code: "LAB-TRAIN", name: "On-Site Training", hourlyRateCad: 280, minHours: 4 },
    { code: "LAB-TRAINADV", name: "Advanced Training", hourlyRateCad: 260, minHours: 8 },
    { code: "LAB-SUPPORT", name: "Technical Support", hourlyRateCad: 210, minHours: 2 },
    { code: "LAB-REPAIR", name: "Field Repair Service", hourlyRateCad: 245, minHours: 1 },
    { code: "LAB-SURVEY", name: "Survey & Site Assessment", hourlyRateCad: 280, minHours: 4 },
    { code: "LAB-CONSULT", name: "Consulting Services", hourlyRateCad: 315, minHours: 2 },
    { code: "LAB-CUSTOM", name: "Custom Service", hourlyRateCad: 0, minHours: 0 },
  ]).onConflictDoNothing()

  await db.insert(markupDefaults).values([
    { category: "Hardware", markupPct: 35, minMarginPct: 20 },
    { category: "Software", markupPct: 40, minMarginPct: 25 },
    { category: "Services/Labor", markupPct: 50, minMarginPct: 30 },
    { category: "Parts", markupPct: 30, minMarginPct: 15 },
    { category: "Support Packages", markupPct: 45, minMarginPct: 25 },
    { category: "Training", markupPct: 40, minMarginPct: 20 },
  ]).onConflictDoNothing()

  await db.insert(installTimes).values([
    { category: "TTT - GCS", machineType: "CAT D6 or Smaller", description: "ARO 3D", hours: 10 },
    { category: "TTT - GCS", machineType: "CAT D8", description: "ARO 3D", hours: 12 },
    { category: "TTT - GCS", machineType: "CAT D9", description: "ARO 3D", hours: 14 },
    { category: "TTT - GCS", machineType: "CAT D10", description: "ARO 3D", hours: 16 },
    { category: "TTT - GCS", machineType: "CAT D11", description: "ARO 3D", hours: 18 },
    { category: "TTT - GCS", machineType: "John Deere TTT", description: "ARO 3D", hours: 12 },
    { category: "TTT - GCS", machineType: "Komatsu TTT", description: "ARO 3D", hours: 12 },
    { category: "MG - GCS", machineType: "CAT MG H or K", description: "No ARO, 3D w/Sideshift", hours: 50 },
    { category: "MG - GCS", machineType: "CAT MG M", description: "3D", hours: 40 },
    { category: "MG - GCS", machineType: "John Deere MG", description: "3D", hours: 42 },
    { category: "MG - GCS", machineType: "Volvo MG", description: "3D", hours: 44 },
    { category: "HEX - GCS", machineType: "CAT HEX", description: "3D", hours: 32 },
    { category: "HEX - GCS", machineType: "CAT HEX Next Gen", description: "3D", hours: 30 },
    { category: "HEX - GCS", machineType: "John Deere HEX", description: "3D", hours: 34 },
    { category: "HEX - GCS", machineType: "Komatsu HEX", description: "3D", hours: 34 },
    { category: "OTHER - GCS", machineType: "Compactor", description: "3D", hours: 20 },
    { category: "OTHER - GCS", machineType: "Scraper", description: "3D", hours: 28 },
    { category: "OTHER - GCS", machineType: "Box Blade", description: "3D", hours: 16 },
    { category: "OTHER - GCS", machineType: "Paver", description: "3D", hours: 24 },
    { category: "ADD ON OPTIONS", machineType: "Any", description: "Valve Calibration", hours: 2 },
    { category: "ADD ON OPTIONS", machineType: "Any", description: "M/U Upgrade", hours: 4 },
    { category: "ADD ON OPTIONS", machineType: "Any", description: "Tilt Bucket Add-on", hours: 6 },
  ]).onConflictDoNothing()

  console.log("✅ Seed complete")
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
