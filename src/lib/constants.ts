export const SECTIONS = [
  "🏗️ WHOLE MACHINE",
  "🔧 CAB KIT COMPONENTS",
  "📄 LICENSES & SOFTWARE",
  "🚜 MACHINE COMPONENTS",
  "📍 SURVEY EQUIPMENT / SPS",
  "🔌 CABLES & HARNESSES",
  "🔩 MOUNTS & BRACKETS",
  "📦 ACCESSORIES",
  "📋 MISCELLANEOUS",
  "🎓 TRAINING & SERVICES",
] as const

export const MACHINE_MAKES = [
  "CAT", "John Deere", "Komatsu", "Volvo", "Hitachi",
  "Trimble", "Topcon", "Leica", "Other",
] as const

export const INSTALL_TYPES = [
  "TTT (Track-Type Tractor)",
  "HEX (Excavator)",
  "MG (Motor Grader)",
  "COMPACTOR",
  "SCRAPER",
  "PAVER",
  "BOX BLADE",
  "SPS/SURVEY",
  "Other",
] as const

export const CURRENCIES = ["USD", "CAD"] as const

export const COMPANY_INFO = {
  name: "SITECH Western Canada",
  address: "10910 170 St NW South Entrance",
  city: "Edmonton, AB T5S 1H6",
  phone: "(780) 483-3700",
  email: "sitechwesterncanada@sitech-wc.ca",
} as const

export const TERMS = [
  "Prices are valid for 30 days from the date of this quotation.",
  "All prices are in Canadian Dollars (CAD) unless otherwise specified.",
  "Installation and labour charges are estimates and may vary based on site conditions.",
]
