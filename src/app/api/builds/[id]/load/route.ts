export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { loadBuild } from "@/app/actions/builds"
import { bulkInsertLineItems } from "@/app/actions/quotes"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quoteId } = await req.json()
  const build = await loadBuild(parseInt(id, 10))
  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await bulkInsertLineItems(quoteId, build.lineItems)
  return NextResponse.json({ ok: true })
}
