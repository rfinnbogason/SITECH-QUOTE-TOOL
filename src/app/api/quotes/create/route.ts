import { NextResponse } from "next/server"
import { createQuote } from "@/app/actions/quotes"

export async function POST() {
  const quote = await createQuote()
  return NextResponse.json({ id: quote.id })
}
