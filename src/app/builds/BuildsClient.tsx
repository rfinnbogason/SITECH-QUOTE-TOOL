"use client"
import { useState, useTransition } from "react"
import type { SavedBuild } from "@/lib/db/schema"
import { deleteBuild } from "@/app/actions/builds"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Layers, Trash2, ChevronDown, ChevronRight, FolderOpen, Folder } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/formatters"
import { motion, AnimatePresence } from "framer-motion"

export function BuildsClient({ builds }: { builds: SavedBuild[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggleGroup(group: string) {
    setCollapsed(p => ({ ...p, [group]: !p[group] }))
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete build "${name}"?`)) return
    start(async () => {
      await deleteBuild(id)
      toast.success("Build deleted")
      router.refresh()
    })
  }

  async function handleLoadNew(buildId: number) {
    const res = await fetch("/api/quotes/create", { method: "POST" })
    const data = await res.json()
    if (!data.id) return
    await fetch(`/api/builds/${buildId}/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: data.id }),
    })
    router.push(`/quotes/${data.id}`)
  }

  // Group builds by groupName
  const groups: Record<string, SavedBuild[]> = {}
  for (const b of builds) {
    const g = b.groupName || "Recent Builds"
    if (!groups[g]) groups[g] = []
    groups[g].push(b)
  }

  // Sort groups: most recently used first within each group
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => {
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : new Date(a.createdAt ?? 0).getTime()
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : new Date(b.createdAt ?? 0).getTime()
      return bTime - aTime
    })
  }

  return (
    <div id="tour-builds-page" className="p-6 max-w-5xl mx-auto">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-gray-900">Saved Builds</h1>
        <p className="text-gray-500 text-sm mt-1">Reusable machine configurations organized by group</p>
      </motion.div>

      {builds.length === 0 ? (
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
        >
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No saved builds. Open a quote and click <strong>Save Build</strong> to create one.</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          animate="animate"
        >
          {Object.entries(groups).map(([group, groupBuilds]) => {
            const isCollapsed = collapsed[group]
            return (
              <motion.div
                key={group}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
                >
                  {isCollapsed
                    ? <Folder className="w-4 h-4 text-blue-600" />
                    : <FolderOpen className="w-4 h-4 text-blue-600" />
                  }
                  <span className="font-semibold text-gray-800 text-sm">{group}</span>
                  <Badge variant="secondary" className="text-xs ml-1">{groupBuilds.length}</Badge>
                  <motion.span
                    className="ml-auto"
                    animate={{ rotate: isCollapsed ? 0 : 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.span>
                </button>

                {/* Builds in group */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-5 py-2 text-xs font-medium text-gray-400">Build Name</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Machine Type</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-400">Items</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Created</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Last Quoted</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Last Used</th>
                            <th className="px-3 py-2 w-36"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupBuilds.map(b => {
                            const items = JSON.parse(b.lineItemsJson || "[]")
                            return (
                              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-2.5 font-medium text-sm">{b.name}</td>
                                <td className="px-3 py-2.5 text-gray-500 text-sm">{b.machineType || "—"}</td>
                                <td className="px-3 py-2.5 text-center">
                                  <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                                </td>
                                <td className="px-3 py-2.5 text-gray-400 text-xs">{b.createdAt ? formatDate(b.createdAt) : "—"}</td>
                                <td className="px-3 py-2.5 text-xs">
                                  {b.lastQuotedDate
                                    ? <span className="text-blue-600 font-medium">{formatDate(b.lastQuotedDate)}</span>
                                    : <span className="text-gray-300">Never</span>
                                  }
                                </td>
                                <td className="px-3 py-2.5 text-gray-400 text-xs">{b.lastUsedAt ? formatDate(b.lastUsedAt) : "Never"}</td>
                                <td className="px-3 py-2.5 flex gap-2">
                                  <Button size="sm" variant="outline" className="text-xs h-7"
                                    onClick={() => handleLoadNew(b.id)}>
                                    Load into New Quote
                                  </Button>
                                  <button onClick={() => handleDelete(b.id, b.name)}
                                    className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
