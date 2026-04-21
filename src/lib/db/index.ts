import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const url = process.env.DATABASE_URL || "postgresql://user:password@ep-build-placeholder.us-east-1.aws.neon.tech/neondb"
export const db = drizzle(neon(url), { schema })
export * from "./schema"
