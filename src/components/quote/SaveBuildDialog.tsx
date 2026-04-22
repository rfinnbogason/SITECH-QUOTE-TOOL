"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveBuild, createBuildGroup } from "@/app/actions/builds"
import { toast } from "sonner"
import type { BuildGroup } from "@/lib/db/schema"

interface Props {
  open: boolean
  onClose: () => void
  quoteId: number
  machineMake: string
  groups: BuildGroup[]
}

export function SaveBuildDialog({ open, onClose, quoteId, machineMake, groups: initGroups }: Props) {
  const [name, setName] = useState("")
  const [machineType, setMachineType] = useState(machineMake)
  const [groupName, setGroupName] = useState("Recent Builds")
  const [groups, setGroups] = useState(initGroups)
  const [saving, setSaving] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await saveBuild(name.trim(), machineType, quoteId, groupName)
    toast.success(`Build "${name}" saved to ${groupName}!`)
    setSaving(false)
    setName("")
    onClose()
  }

  async function handleCreateGroup() {
    const trimmed = newGroupName.trim()
    if (!trimmed) return
    const temp: BuildGroup = { id: Date.now(), name: trimmed, createdAt: new Date() }
    setGroups(prev => [...prev, temp].sort((a, b) => a.name.localeCompare(b.name)))
    setGroupName(trimmed)
    setNewGroupName("")
    setCreatingGroup(false)
    await createBuildGroup(trimmed)
    toast.success(`Group "${trimmed}" created`)
  }

  const allGroups = [
    { id: -1, name: "Recent Builds" },
    ...groups.filter(g => g.name !== "Recent Builds"),
  ]

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as Build Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="build-name" className="text-sm">Build Name</Label>
            <Input id="build-name" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. CAT D8T Standard GCS 3D" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="machine-type" className="text-sm">Machine Type</Label>
            <Input id="machine-type" value={machineType} onChange={e => setMachineType(e.target.value)}
              placeholder="e.g. CAT D8T" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Group / Folder</Label>
            <div className="flex flex-wrap gap-1.5">
              {allGroups.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroupName(g.name)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    groupName === g.name
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {g.name}
                </button>
              ))}
              {!creatingGroup && (
                <button
                  type="button"
                  onClick={() => setCreatingGroup(true)}
                  className="px-3 py-1 rounded-full text-xs border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  + New group
                </button>
              )}
            </div>
            {creatingGroup && (
              <div className="flex gap-1 mt-2">
                <Input
                  autoFocus
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateGroup(); if (e.key === "Escape") setCreatingGroup(false) }}
                  placeholder="Group name…"
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCreatingGroup(false)} className="h-7 text-xs">✕</Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Saving…" : "Save Build"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
