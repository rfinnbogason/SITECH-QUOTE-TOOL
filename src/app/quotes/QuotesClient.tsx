"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { Quote, QuoteFolder } from "@/lib/db/schema"
import { deleteQuote, moveQuoteToFolder, createQuoteFolder, deleteQuoteFolder } from "@/app/actions/quotes"
import { formatDate } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  FileText, Folder, FolderOpen, Plus, Trash2, FolderInput,
  MoreHorizontal, ChevronRight, Inbox,
} from "lucide-react"
import { NewQuoteButton } from "@/components/quote/NewQuoteButton"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  quotes: Quote[]
  folders: QuoteFolder[]
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "secondary",
  Sent: "secondary",
  Final: "default",
  Won: "default",
  Lost: "secondary",
}

export function QuotesClient({ quotes: initQuotes, folders: initFolders }: Props) {
  const router = useRouter()
  const [, start] = useTransition()
  const [quotes, setQuotes] = useState(initQuotes)
  const [folders, setFolders] = useState(initFolders)
  const [activeFolder, setActiveFolder] = useState<string | null>(null) // null = All Quotes
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)

  const visibleQuotes = activeFolder === null
    ? quotes
    : activeFolder === "__uncategorized__"
      ? quotes.filter(q => !q.folder)
      : quotes.filter(q => q.folder === activeFolder)

  function handleDelete(q: Quote) {
    if (!confirm(`Delete quote ${q.number}${q.customerCompany ? ` (${q.customerCompany})` : ""}? This cannot be undone.`)) return
    setQuotes(prev => prev.filter(x => x.id !== q.id))
    start(async () => {
      await deleteQuote(q.id)
      toast.success(`Quote ${q.number} deleted`)
    })
  }

  function handleMove(q: Quote, folderName: string) {
    setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, folder: folderName } : x))
    start(async () => {
      await moveQuoteToFolder(q.id, folderName)
      toast.success(`Moved to ${folderName || "Uncategorized"}`)
    })
  }

  function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    if (folders.find(f => f.name === name)) { toast.error("Folder already exists"); return }
    const temp: QuoteFolder = { id: Date.now(), name, createdAt: new Date() }
    setFolders(prev => [...prev, temp].sort((a, b) => a.name.localeCompare(b.name)))
    setNewFolderName("")
    setCreatingFolder(false)
    setActiveFolder(name)
    start(async () => {
      await createQuoteFolder(name)
      router.refresh()
    })
    toast.success(`Folder "${name}" created`)
  }

  function handleDeleteFolder(folder: QuoteFolder) {
    if (!confirm(`Delete folder "${folder.name}"? Quotes inside will be moved to Uncategorized.`)) return
    setFolders(prev => prev.filter(f => f.id !== folder.id))
    setQuotes(prev => prev.map(q => q.folder === folder.name ? { ...q, folder: "" } : q))
    if (activeFolder === folder.name) setActiveFolder(null)
    start(async () => {
      await deleteQuoteFolder(folder.id)
      toast.success(`Folder "${folder.name}" deleted`)
    })
  }

  const uncategorizedCount = quotes.filter(q => !q.folder).length

  return (
    <div className="flex h-full">
      {/* Folder Sidebar */}
      <motion.div
        className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 p-3"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Folders</div>

        {/* All Quotes */}
        <FolderItem
          label="All Quotes"
          count={quotes.length}
          active={activeFolder === null}
          icon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => setActiveFolder(null)}
        />

        {/* Uncategorized */}
        {uncategorizedCount > 0 && (
          <FolderItem
            label="Uncategorized"
            count={uncategorizedCount}
            active={activeFolder === "__uncategorized__"}
            icon={<Inbox className="w-3.5 h-3.5" />}
            onClick={() => setActiveFolder("__uncategorized__")}
          />
        )}

        {folders.length > 0 && <div className="border-t border-gray-100 my-2" />}

        {/* User folders */}
        <AnimatePresence initial={false}>
          {folders.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center"
            >
              <button
                onClick={() => setActiveFolder(f.name)}
                className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                  activeFolder === f.name
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {activeFolder === f.name
                  ? <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  : <Folder className="w-3.5 h-3.5 shrink-0" />
                }
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-gray-400">{quotes.filter(q => q.folder === f.name).length}</span>
              </button>
              <button
                onClick={() => handleDeleteFolder(f)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* New folder */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <AnimatePresence>
            {creatingFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <Input
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setCreatingFolder(false) }}
                  placeholder="Folder name…"
                  className="h-7 text-xs mb-1"
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="h-6 text-xs flex-1 bg-blue-600 hover:bg-blue-700">
                    Create
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setCreatingFolder(false)} className="h-6 text-xs">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!creatingFolder && (
            <button
              onClick={() => setCreatingFolder(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeFolder === null ? "All Quotes" : activeFolder === "__uncategorized__" ? "Uncategorized" : activeFolder}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{visibleQuotes.length} quote{visibleQuotes.length !== 1 ? "s" : ""}</p>
            </div>
            <NewQuoteButton />
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            {visibleQuotes.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-base font-medium mb-1">No quotes here</p>
                <p className="text-sm">
                  {activeFolder ? "Move quotes to this folder from the Quotes list." : "Click New Quote to get started."}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quote #</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Machine</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rep</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Updated</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <motion.tbody
                  className="divide-y divide-gray-100"
                  variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                  initial="initial"
                  animate="animate"
                >
                  <AnimatePresence>
                    {visibleQuotes.map(q => (
                      <motion.tr
                        key={q.id}
                        className="hover:bg-gray-50 transition-colors"
                        variants={{ initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-5 py-3">
                          <Link href={`/quotes/${q.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                            {q.number}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700">{q.customerCompany || "—"}</td>
                        <td className="px-3 py-3 text-sm text-gray-500">{[q.machineMake, q.machineModel].filter(Boolean).join(" ") || "—"}</td>
                        <td className="px-3 py-3 text-sm text-gray-500">{q.salesRepName || "—"}</td>
                        <td className="px-3 py-3">
                          <Badge variant={STATUS_COLORS[q.status] as "default" | "secondary" ?? "secondary"} className="text-xs">
                            {q.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-400">{formatDate(String(q.updatedAt ?? q.createdAt ?? ""))}</td>
                        <td className="px-3 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2">
                                  <FolderInput className="w-3.5 h-3.5" /> Move to Folder
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleMove(q, "")} className="gap-2">
                                    <Inbox className="w-3.5 h-3.5" /> Uncategorized
                                  </DropdownMenuItem>
                                  {folders.map(f => (
                                    <DropdownMenuItem key={f.id} onClick={() => handleMove(q, f.name)} className="gap-2">
                                      <Folder className="w-3.5 h-3.5" /> {f.name}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <NewFolderMenuItem onCreated={(name) => {
                                    const temp: QuoteFolder = { id: Date.now(), name, createdAt: new Date() }
                                    setFolders(prev => [...prev, temp].sort((a, b) => a.name.localeCompare(b.name)))
                                    handleMove(q, name)
                                    start(async () => { await createQuoteFolder(name) })
                                  }} />
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(q)}
                                className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Quote
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function NewFolderMenuItem({ onCreated }: { onCreated: (name: string) => void }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")

  if (!creating) {
    return (
      <DropdownMenuItem onSelect={e => { e.preventDefault(); setCreating(true) }} className="gap-2 text-blue-600">
        <Plus className="w-3.5 h-3.5" /> New folder…
      </DropdownMenuItem>
    )
  }

  function commit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreated(trimmed)
    setName("")
    setCreating(false)
  }

  return (
    <div className="px-2 py-1" onKeyDown={e => e.stopPropagation()}>
      <Input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setCreating(false) }}
        placeholder="Folder name…"
        className="h-7 text-xs mb-1"
      />
      <div className="flex gap-1">
        <Button size="sm" onClick={commit} disabled={!name.trim()} className="h-6 text-xs flex-1 bg-blue-600 hover:bg-blue-700">
          Create & Move
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="h-6 text-xs">✕</Button>
      </div>
    </div>
  )
}

function FolderItem({ label, count, active, icon, onClick }: {
  label: string; count: number; active: boolean; icon: React.ReactNode; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${
        active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs text-gray-400">{count}</span>
      {active && <ChevronRight className="w-3 h-3" />}
    </button>
  )
}
