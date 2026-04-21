import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

const client = postgres(process.env.DATABASE_URL ?? "postgresql://user:password@ep-build-placeholder.us-east-1.aws.neon.tech/neondb")
export const db = drizzle(client, { schema })
export * from "./schema"
