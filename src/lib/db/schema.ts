import { pgTable, text, integer, real, boolean, serial, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
})

export const salesReps = pgTable("sales_reps", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().default(""),
  region: text("region").notNull().default(""),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  discountPct: real("discount_pct").notNull().default(0),
  paymentTerms: text("payment_terms").notNull().default("Net 30"),
  status: text("status").notNull().default("Active"),
})

export const freightOptions = pgTable("freight_options", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  costCad: real("cost_cad").notNull(),
  status: text("status").notNull().default("Active"),
})

export const labourOptions = pgTable("labour_options", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  hourlyRateCad: real("hourly_rate_cad").notNull(),
  minHours: real("min_hours").notNull().default(1),
  status: text("status").notNull().default("Active"),
})

export const markupDefaults = pgTable("markup_defaults", {
  category: text("category").primaryKey(),
  markupPct: real("markup_pct").notNull().default(30),
  minMarginPct: real("min_margin_pct").notNull().default(15),
})

export const installTimes = pgTable("install_times", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  machineType: text("machine_type").notNull(),
  description: text("description").notNull(),
  hours: real("hours").notNull(),
})

export const partsDb = pgTable("parts_db", {
  id: serial("id").primaryKey(),
  itemNo: text("item_no").notNull().default(""),
  description: text("description").notNull(),
  category: text("category").notNull().default(""),
  vendor: text("vendor").notNull().default(""),
  costUsd: real("cost_usd").notNull().default(0),
  msrpUsd: real("msrp_usd").notNull().default(0),
  ourPriceUsd: real("our_price_usd").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  leadTime: text("lead_time").notNull().default(""),
  notes: text("notes").notNull().default(""),
})

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  salesRepId: integer("sales_rep_id"),
  salesRepName: text("sales_rep_name").notNull().default(""),
  customerCompany: text("customer_company").notNull().default(""),
  customerContact: text("customer_contact").notNull().default(""),
  customerEmail: text("customer_email").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  machineMake: text("machine_make").notNull().default(""),
  machineModel: text("machine_model").notNull().default(""),
  machineSerial: text("machine_serial").notNull().default(""),
  installType: text("install_type").notNull().default(""),
  fxRate: real("fx_rate").notNull().default(1.3947),
  quoteDate: text("quote_date").notNull(),
  validUntil: text("valid_until").notNull(),
  discountPct: real("discount_pct").notNull().default(0),
  taxPct: real("tax_pct").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull(),
  section: text("section").notNull().default("🏗️ WHOLE MACHINE"),
  position: integer("position").notNull().default(0),
  qty: real("qty").notNull().default(1),
  partNumber: text("part_number").notNull().default(""),
  description: text("description").notNull().default(""),
  listPrice: real("list_price").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  discountPct: real("discount_pct").notNull().default(0),
  vendorDiscountPct: real("vendor_discount_pct").notNull().default(40),
  showPrice: boolean("show_price").notNull().default(true),
})

export const quoteFreightLabour = pgTable("quote_freight_labour", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull(),
  type: text("type").notNull(),
  code: text("code").notNull().default(""),
  description: text("description").notNull().default(""),
  qtyHours: real("qty_hours").notNull().default(1),
  rateCad: real("rate_cad").notNull().default(0),
})

export const savedBuilds = pgTable("saved_builds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  machineType: text("machine_type").notNull().default(""),
  lineItemsJson: text("line_items_json").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
})

export type Setting = typeof settings.$inferSelect
export type SalesRep = typeof salesReps.$inferSelect
export type Vendor = typeof vendors.$inferSelect
export type FreightOption = typeof freightOptions.$inferSelect
export type LabourOption = typeof labourOptions.$inferSelect
export type MarkupDefault = typeof markupDefaults.$inferSelect
export type InstallTime = typeof installTimes.$inferSelect
export type PartDb = typeof partsDb.$inferSelect
export type Quote = typeof quotes.$inferSelect
export type QuoteLineItem = typeof quoteLineItems.$inferSelect
export type QuoteFreightLabour = typeof quoteFreightLabour.$inferSelect
export type SavedBuild = typeof savedBuilds.$inferSelect
