"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Vendor, FreightOption, LabourOption, MarkupDefault } from "@/lib/db/schema"
import {
  setSetting,
  upsertVendor, deleteVendor,
  upsertFreightOption, deleteFreightOption,
  upsertLabourOption, deleteLabourOption,
  upsertMarkupDefault, deleteMarkupDefault,
} from "@/app/actions/settings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { RefreshCw, Save, Trash2, Plus } from "lucide-react"

interface Props {
  config: Record<string, string>
  vendors: Vendor[]
  freight: FreightOption[]
  labour: LabourOption[]
  markup: MarkupDefault[]
}

export function SettingsClient({ config, vendors: initVendors, freight: initFreight, labour: initLabour, markup: initMarkup }: Props) {
  const router = useRouter()
  const [fxRate, setFxRate] = useState(config.fxRate ?? "1.3947")
  const [, startTransition] = useTransition()

  const [vendors, setVendors] = useState(initVendors)
  const [freight, setFreight] = useState(initFreight)
  const [labour, setLabour] = useState(initLabour)
  const [markup, setMarkup] = useState(initMarkup)

  function saveFx() {
    const val = parseFloat(fxRate)
    if (isNaN(val)) return
    startTransition(async () => {
      await setSetting("fxRate", val.toString())
      await setSetting("fxUpdatedAt", new Date().toISOString().split("T")[0])
      toast.success("FX Rate updated")
    })
  }

  function refresh() { router.refresh() }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* FX Rate */}
      <div id="tour-settings-fx">
        <Section title="Currency & FX Rate">
          <div className="flex items-end gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">USD → CAD Exchange Rate</label>
              <div className="flex items-center gap-2">
                <Input value={fxRate} onChange={e => setFxRate(e.target.value)}
                  className="w-32 h-9" type="number" step="0.0001" />
                <Button onClick={saveFx} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <a href="https://xe.com" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Get from XE.com
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-1">Current: {config.fxRate} (updated {config.fxUpdatedAt ?? "—"})</p>
            </div>
          </div>
        </Section>
      </div>

      {/* Vendors */}
      <Section title="Vendor Discount Levels">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Vendor Name</th>
              <th className="text-left py-2 text-gray-500 font-medium w-28">Discount %</th>
              <th className="text-left py-2 text-gray-500 font-medium w-32">Payment Terms</th>
              <th className="text-left py-2 text-gray-500 font-medium w-28">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map(v => (
              <VendorRow key={v.id} vendor={v} onSaved={refresh} onDeleted={() => setVendors(p => p.filter(x => x.id !== v.id))} />
            ))}
          </tbody>
        </table>
        <AddVendorRow onAdded={refresh} />
      </Section>

      {/* Freight */}
      <Section title="Freight Rates (CAD)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium w-28">Code</th>
              <th className="text-left py-2 text-gray-500 font-medium">Name / Description</th>
              <th className="text-right py-2 text-gray-500 font-medium w-28">Cost (CAD)</th>
              <th className="text-left py-2 text-gray-500 font-medium w-24">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {freight.map(f => (
              <FreightRow key={f.code} option={f} onSaved={refresh} onDeleted={() => setFreight(p => p.filter(x => x.code !== f.code))} />
            ))}
          </tbody>
        </table>
        <AddFreightRow onAdded={refresh} />
      </Section>

      {/* Labour */}
      <Section title="Labour Rates (CAD)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium w-28">Code</th>
              <th className="text-left py-2 text-gray-500 font-medium">Service Name</th>
              <th className="text-right py-2 text-gray-500 font-medium w-28">Rate/hr (CAD)</th>
              <th className="text-right py-2 text-gray-500 font-medium w-24">Min Hrs</th>
              <th className="text-left py-2 text-gray-500 font-medium w-24">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {labour.map(l => (
              <LabourRow key={l.code} option={l} onSaved={refresh} onDeleted={() => setLabour(p => p.filter(x => x.code !== l.code))} />
            ))}
          </tbody>
        </table>
        <AddLabourRow onAdded={refresh} />
      </Section>

      {/* Markup */}
      <Section title="Markup & Margin Defaults">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Category</th>
              <th className="text-right py-2 text-gray-500 font-medium w-36">Default Markup %</th>
              <th className="text-right py-2 text-gray-500 font-medium w-36">Min Margin %</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {markup.map(m => (
              <MarkupRow key={m.category} item={m} onSaved={refresh} onDeleted={() => setMarkup(p => p.filter(x => x.category !== m.category))} />
            ))}
          </tbody>
        </table>
        <AddMarkupRow onAdded={refresh} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function DeleteBtn({ onDelete }: { onDelete: () => void }) {
  return (
    <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors p-1">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

// ── Vendor ──────────────────────────────────────────────────────────────────

function VendorRow({ vendor, onSaved, onDeleted }: { vendor: Vendor; onSaved: () => void; onDeleted: () => void }) {
  const [name, setName] = useState(vendor.name)
  const [disc, setDisc] = useState(vendor.discountPct.toString())
  const [terms, setTerms] = useState(vendor.paymentTerms)
  const [status, setStatus] = useState(vendor.status)
  const [, start] = useTransition()

  function save() {
    start(async () => {
      await upsertVendor({ ...vendor, name, discountPct: parseFloat(disc) || 0, paymentTerms: terms, status })
      toast.success(`${name} saved`)
      onSaved()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete vendor "${name}"?`)) return
    start(async () => {
      await deleteVendor(vendor.id)
      toast.success("Vendor deleted")
      onDeleted()
    })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-1.5 pr-2">
        <Input value={name} onChange={e => setName(e.target.value)} onBlur={save} className="h-7 text-sm" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={disc} onChange={e => setDisc(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm" type="number" min="0" max="100" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={terms} onChange={e => setTerms(e.target.value)} onBlur={save} className="h-7 w-28 text-sm" />
      </td>
      <td className="py-1.5 pr-2">
        <Select value={status} onValueChange={v => { setStatus(v); setTimeout(save, 0) }}>
          <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5"><DeleteBtn onDelete={handleDelete} /></td>
    </tr>
  )
}

function AddVendorRow({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("")
  const [disc, setDisc] = useState("40")
  const [terms, setTerms] = useState("Net 30")
  const [, start] = useTransition()

  function add() {
    if (!name.trim()) return
    start(async () => {
      await upsertVendor({ name: name.trim(), discountPct: parseFloat(disc) || 0, paymentTerms: terms, status: "Active" })
      toast.success(`${name} added`)
      setName(""); setDisc("40"); setTerms("Net 30")
      onAdded()
    })
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Vendor name" className="h-8 text-sm flex-1" />
      <Input value={disc} onChange={e => setDisc(e.target.value)} placeholder="Disc %" className="h-8 w-20 text-sm" type="number" />
      <Input value={terms} onChange={e => setTerms(e.target.value)} placeholder="Terms" className="h-8 w-28 text-sm" />
      <Button size="sm" onClick={add} disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 gap-1">
        <Plus className="w-3.5 h-3.5" /> Add
      </Button>
    </div>
  )
}

// ── Freight ──────────────────────────────────────────────────────────────────

function FreightRow({ option, onSaved, onDeleted }: { option: FreightOption; onSaved: () => void; onDeleted: () => void }) {
  const [code, setCode] = useState(option.code)
  const [name, setName] = useState(option.name)
  const [cost, setCost] = useState(option.costCad.toString())
  const [status, setStatus] = useState(option.status)
  const [, start] = useTransition()

  function save() {
    start(async () => {
      await upsertFreightOption({ code: code.trim(), name, costCad: parseFloat(cost) || 0, status })
      toast.success("Freight rate saved")
      onSaved()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete freight option "${name}"?`)) return
    start(async () => {
      await deleteFreightOption(option.code)
      toast.success("Freight option deleted")
      onDeleted()
    })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-1.5 pr-2">
        <Input value={code} onChange={e => setCode(e.target.value)} onBlur={save} className="h-7 w-24 text-sm font-mono" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={name} onChange={e => setName(e.target.value)} onBlur={save} className="h-7 text-sm" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={cost} onChange={e => setCost(e.target.value)} onBlur={save}
          className="h-7 w-24 text-sm text-right ml-auto" type="number" min="0" />
      </td>
      <td className="py-1.5 pr-2">
        <Select value={status} onValueChange={v => { setStatus(v); setTimeout(save, 0) }}>
          <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5"><DeleteBtn onDelete={handleDelete} /></td>
    </tr>
  )
}

function AddFreightRow({ onAdded }: { onAdded: () => void }) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [cost, setCost] = useState("0")
  const [, start] = useTransition()

  function add() {
    if (!code.trim() || !name.trim()) return
    start(async () => {
      await upsertFreightOption({ code: code.trim().toUpperCase(), name: name.trim(), costCad: parseFloat(cost) || 0, status: "Active" })
      toast.success(`${name} added`)
      setCode(""); setName(""); setCost("0")
      onAdded()
    })
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <Input value={code} onChange={e => setCode(e.target.value)} placeholder="CODE" className="h-8 w-24 text-sm font-mono" />
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name / description" className="h-8 text-sm flex-1" />
      <Input value={cost} onChange={e => setCost(e.target.value)} placeholder="Cost CAD" className="h-8 w-24 text-sm" type="number" />
      <Button size="sm" onClick={add} disabled={!code.trim() || !name.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 gap-1">
        <Plus className="w-3.5 h-3.5" /> Add
      </Button>
    </div>
  )
}

// ── Labour ───────────────────────────────────────────────────────────────────

function LabourRow({ option, onSaved, onDeleted }: { option: LabourOption; onSaved: () => void; onDeleted: () => void }) {
  const [code, setCode] = useState(option.code)
  const [name, setName] = useState(option.name)
  const [rate, setRate] = useState(option.hourlyRateCad.toString())
  const [minHrs, setMinHrs] = useState(option.minHours.toString())
  const [status, setStatus] = useState(option.status)
  const [, start] = useTransition()

  function save() {
    start(async () => {
      await upsertLabourOption({ code: code.trim(), name, hourlyRateCad: parseFloat(rate) || 0, minHours: parseFloat(minHrs) || 1, status })
      toast.success("Labour rate saved")
      onSaved()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete labour option "${name}"?`)) return
    start(async () => {
      await deleteLabourOption(option.code)
      toast.success("Labour option deleted")
      onDeleted()
    })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-1.5 pr-2">
        <Input value={code} onChange={e => setCode(e.target.value)} onBlur={save} className="h-7 w-24 text-sm font-mono" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={name} onChange={e => setName(e.target.value)} onBlur={save} className="h-7 text-sm" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={rate} onChange={e => setRate(e.target.value)} onBlur={save}
          className="h-7 w-24 text-sm text-right ml-auto" type="number" min="0" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={minHrs} onChange={e => setMinHrs(e.target.value)} onBlur={save}
          className="h-7 w-16 text-sm text-right ml-auto" type="number" min="0" step="0.5" />
      </td>
      <td className="py-1.5 pr-2">
        <Select value={status} onValueChange={v => { setStatus(v); setTimeout(save, 0) }}>
          <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5"><DeleteBtn onDelete={handleDelete} /></td>
    </tr>
  )
}

function AddLabourRow({ onAdded }: { onAdded: () => void }) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [rate, setRate] = useState("0")
  const [minHrs, setMinHrs] = useState("1")
  const [, start] = useTransition()

  function add() {
    if (!code.trim() || !name.trim()) return
    start(async () => {
      await upsertLabourOption({ code: code.trim().toUpperCase(), name: name.trim(), hourlyRateCad: parseFloat(rate) || 0, minHours: parseFloat(minHrs) || 1, status: "Active" })
      toast.success(`${name} added`)
      setCode(""); setName(""); setRate("0"); setMinHrs("1")
      onAdded()
    })
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <Input value={code} onChange={e => setCode(e.target.value)} placeholder="CODE" className="h-8 w-24 text-sm font-mono" />
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Service name" className="h-8 text-sm flex-1" />
      <Input value={rate} onChange={e => setRate(e.target.value)} placeholder="Rate/hr" className="h-8 w-24 text-sm" type="number" />
      <Input value={minHrs} onChange={e => setMinHrs(e.target.value)} placeholder="Min hrs" className="h-8 w-20 text-sm" type="number" step="0.5" />
      <Button size="sm" onClick={add} disabled={!code.trim() || !name.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 gap-1">
        <Plus className="w-3.5 h-3.5" /> Add
      </Button>
    </div>
  )
}

// ── Markup ───────────────────────────────────────────────────────────────────

function MarkupRow({ item, onSaved, onDeleted }: { item: MarkupDefault; onSaved: () => void; onDeleted: () => void }) {
  const [category, setCategory] = useState(item.category)
  const [markupPct, setMarkupPct] = useState(item.markupPct.toString())
  const [minMargin, setMinMargin] = useState(item.minMarginPct.toString())
  const [, start] = useTransition()

  function save() {
    start(async () => {
      await upsertMarkupDefault({ category: category.trim(), markupPct: parseFloat(markupPct) || 0, minMarginPct: parseFloat(minMargin) || 0 })
      toast.success("Markup saved")
      onSaved()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete markup category "${category}"?`)) return
    start(async () => {
      await deleteMarkupDefault(item.category)
      toast.success("Category deleted")
      onDeleted()
    })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-1.5 pr-2">
        <Input value={category} onChange={e => setCategory(e.target.value)} onBlur={save} className="h-7 text-sm" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={markupPct} onChange={e => setMarkupPct(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm text-right ml-auto" type="number" min="0" max="200" />
      </td>
      <td className="py-1.5 pr-2">
        <Input value={minMargin} onChange={e => setMinMargin(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm text-right ml-auto" type="number" min="0" max="100" />
      </td>
      <td className="py-1.5"><DeleteBtn onDelete={handleDelete} /></td>
    </tr>
  )
}

function AddMarkupRow({ onAdded }: { onAdded: () => void }) {
  const [category, setCategory] = useState("")
  const [markupPct, setMarkupPct] = useState("30")
  const [minMargin, setMinMargin] = useState("15")
  const [, start] = useTransition()

  function add() {
    if (!category.trim()) return
    start(async () => {
      await upsertMarkupDefault({ category: category.trim(), markupPct: parseFloat(markupPct) || 0, minMarginPct: parseFloat(minMargin) || 0 })
      toast.success(`${category} added`)
      setCategory(""); setMarkupPct("30"); setMinMargin("15")
      onAdded()
    })
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category name" className="h-8 text-sm flex-1" />
      <Input value={markupPct} onChange={e => setMarkupPct(e.target.value)} placeholder="Markup %" className="h-8 w-28 text-sm" type="number" />
      <Input value={minMargin} onChange={e => setMinMargin(e.target.value)} placeholder="Min margin %" className="h-8 w-28 text-sm" type="number" />
      <Button size="sm" onClick={add} disabled={!category.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 gap-1">
        <Plus className="w-3.5 h-3.5" /> Add
      </Button>
    </div>
  )
}
