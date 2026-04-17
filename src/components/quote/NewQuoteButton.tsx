"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function NewQuoteButton() {
  const router = useRouter()
  async function handleNew() {
    const res = await fetch("/api/quotes/create", { method: "POST" })
    const data = await res.json()
    if (data.id) router.push(`/quotes/${data.id}`)
  }
  return (
    <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 gap-2">
      <Plus className="w-4 h-4" />
      New Quote
    </Button>
  )
}
