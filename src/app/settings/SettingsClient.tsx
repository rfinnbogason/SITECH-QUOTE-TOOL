"use client"
import { useState, useTransition } from "react"
import type { Vendor, FreightOption, LabourOption, MarkupDefault } from "@/lib/db/schema"
import { setSetting, upsertVendor, deleteVendor, upsertFreightOption, upsertLabourOption, upsertMarkupDefault } from "@/app/actions/settings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { RefreshCw, Save } from "lucide-react"

interface Props {
  config: Record<string, string>
  vendors: Vendor[]
  freight: FreightOption[]
  labour: LabourOption[]
  markup: MarkupDefault[]
}

export function SettingsClient({ config, vendors, freight, labour, markup }: Props) {
  const [fxRate, setFxRate] = useState(config.fxRate ?? "1.3947")
  const [, startTransition] = useTransition()

  function saveFx() {
    const val = parseFloat(fxRate)
    if (isNaN(val)) return
    startTransition(async () => {
      await setSetting("fxRate", val.toString())
      await setSetting("fxUpdatedAt", new Date().toISOString().split("T")[0])
      toast.success("FX Rate updated")
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* FX Rate */}
      <Section title="Currency & FX Rate">
        <div className="flex items-end gap-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">USD → CAD Exchange Rate</label>
            <div className="flex items-center gap-2">
              <Input value={fxRate} onChange={e => setFxRate(e.target.value)}
                className="w-32 h-9" type="number" step="0.0001" />
              <Button onClick={saveFx} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                <Save className="w-3.5 h-3.5" />
                Save
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

      {/* Vendor Discounts */}
      <Section title="Vendor Discount Levels">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Vendor</th>
              <th className="text-left py-2 text-gray-500 font-medium">Discount %</th>
              <th className="text-left py-2 text-gray-500 font-medium">Payment Terms</th>
              <th className="text-left py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map(v => (
              <VendorRow key={v.id} vendor={v} />
            ))}
          </tbody>
        </table>
      </Section>

      {/* Freight Rates */}
      <Section title="Freight Rates (CAD)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Code</th>
              <th className="text-left py-2 text-gray-500 font-medium">Name</th>
              <th className="text-right py-2 text-gray-500 font-medium">Cost (CAD)</th>
              <th className="text-left py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {freight.map(f => (
              <FreightRow key={f.code} option={f} />
            ))}
          </tbody>
        </table>
      </Section>

      {/* Labour Rates */}
      <Section title="Labour Rates (CAD)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Code</th>
              <th className="text-left py-2 text-gray-500 font-medium">Service</th>
              <th className="text-right py-2 text-gray-500 font-medium">Rate/hr</th>
              <th className="text-right py-2 text-gray-500 font-medium">Min Hrs</th>
              <th className="text-left py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {labour.map(l => (
              <LabourRow key={l.code} option={l} />
            ))}
          </tbody>
        </table>
      </Section>

      {/* Markup Defaults */}
      <Section title="Markup & Margin Defaults">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Category</th>
              <th className="text-right py-2 text-gray-500 font-medium">Default Markup %</th>
              <th className="text-right py-2 text-gray-500 font-medium">Min Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {markup.map(m => (
              <MarkupRow key={m.category} item={m} />
            ))}
          </tbody>
        </table>
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

function VendorRow({ vendor }: { vendor: Vendor }) {
  const [disc, setDisc] = useState(vendor.discountPct.toString())
  const [terms, setTerms] = useState(vendor.paymentTerms)
  const [, start] = useTransition()

  function save() {
    start(async () => {
      await upsertVendor({ ...vendor, discountPct: parseFloat(disc) || 0, paymentTerms: terms })
      toast.success(`${vendor.name} updated`)
    })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 font-medium">{vendor.name}</td>
      <td className="py-2">
        <Input value={disc} onChange={e => setDisc(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm" type="number" min="0" max="100" />
      </td>
      <td className="py-2">
        <Input value={terms} onChange={e => setTerms(e.target.value)} onBlur={save}
          className="h-7 w-24 text-sm" />
      </td>
      <td className="py-2">
        <Badge variant={vendor.status === "Active" ? "default" : "secondary"} className="text-xs">
          {vendor.status}
        </Badge>
      </td>
    </tr>
  )
}

function FreightRow({ option }: { option: FreightOption }) {
  const [cost, setCost] = useState(option.costCad.toString())
  const [, start] = useTransition()
  function save() {
    start(async () => {
      await upsertFreightOption({ ...option, costCad: parseFloat(cost) || 0 })
      toast.success("Freight rate saved")
    })
  }
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 font-mono text-xs text-gray-500">{option.code}</td>
      <td className="py-2">{option.name}</td>
      <td className="py-2 text-right">
        <Input value={cost} onChange={e => setCost(e.target.value)} onBlur={save}
          className="h-7 w-24 text-sm text-right ml-auto" type="number" min="0" />
      </td>
      <td className="py-2">
        <Badge variant="default" className="text-xs">{option.status}</Badge>
      </td>
    </tr>
  )
}

function LabourRow({ option }: { option: LabourOption }) {
  const [rate, setRate] = useState(option.hourlyRateCad.toString())
  const [minHrs, setMinHrs] = useState(option.minHours.toString())
  const [, start] = useTransition()
  function save() {
    start(async () => {
      await upsertLabourOption({ ...option, hourlyRateCad: parseFloat(rate) || 0, minHours: parseFloat(minHrs) || 0 })
      toast.success("Labour rate saved")
    })
  }
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 font-mono text-xs text-gray-500">{option.code}</td>
      <td className="py-2">{option.name}</td>
      <td className="py-2 text-right">
        <Input value={rate} onChange={e => setRate(e.target.value)} onBlur={save}
          className="h-7 w-24 text-sm text-right ml-auto" type="number" min="0" />
      </td>
      <td className="py-2 text-right">
        <Input value={minHrs} onChange={e => setMinHrs(e.target.value)} onBlur={save}
          className="h-7 w-16 text-sm text-right ml-auto" type="number" min="0" />
      </td>
      <td className="py-2">
        <Badge variant="default" className="text-xs">{option.status}</Badge>
      </td>
    </tr>
  )
}

function MarkupRow({ item }: { item: MarkupDefault }) {
  const [markup, setMarkup] = useState(item.markupPct.toString())
  const [minMargin, setMinMargin] = useState(item.minMarginPct.toString())
  const [, start] = useTransition()
  function save() {
    start(async () => {
      await upsertMarkupDefault({ category: item.category, markupPct: parseFloat(markup) || 0, minMarginPct: parseFloat(minMargin) || 0 })
      toast.success("Markup defaults saved")
    })
  }
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 font-medium">{item.category}</td>
      <td className="py-2 text-right">
        <Input value={markup} onChange={e => setMarkup(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm text-right ml-auto" type="number" min="0" max="200" />
      </td>
      <td className="py-2 text-right">
        <Input value={minMargin} onChange={e => setMinMargin(e.target.value)} onBlur={save}
          className="h-7 w-20 text-sm text-right ml-auto" type="number" min="0" max="100" />
      </td>
    </tr>
  )
}
