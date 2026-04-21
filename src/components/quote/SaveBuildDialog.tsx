"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveBuild } from "@/app/actions/builds"
import { toast } from "sonner"
import { BUILD_GROUPS } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
  open: boolean
  onClose: () => void
  quoteId: number
  machineMake: string
}

export function SaveBuildDialog({ open, onClose, quoteId, machineMake }: Props) {
  const [name, setName] = useState("")
  const [machineType, setMachineType] = useState(machineMake)
  const [groupName, setGroupName] = useState("Recent Builds")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await saveBuild(name.trim(), machineType, quoteId, groupName)
    toast.success(`Build "${name}" saved to ${groupName}!`)
    setSaving(false)
    setName("")
    onClose()
  }

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
            <Select value={groupName} onValueChange={setGroupName}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUILD_GROUPS.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
