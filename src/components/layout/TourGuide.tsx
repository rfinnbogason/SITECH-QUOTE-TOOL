"use client"
import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, HelpCircle, FileText, Plus, Table2, Truck, Printer, Layers, Settings, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

const TOUR_KEY = "sitech_tour_v1_seen"

const steps = [
  {
    icon: <FileText className="w-10 h-10 text-blue-600" />,
    title: "Welcome to SITECH Quote Tool",
    body: "This tool replaces the Excel quoting process. You can create professional customer-ready quotes in minutes, track all your quotes in one place, and generate clean PDFs — no more save-as, no more broken formulas.",
    tip: null,
  },
  {
    icon: <Plus className="w-10 h-10 text-blue-600" />,
    title: "Creating a New Quote",
    body: "Click the blue New Quote button in the sidebar to start. Each quote gets a unique number (QT-YYYY-####) automatically. Fill in the customer details, machine make/model/serial, and choose your sales rep from the dropdown.",
    tip: "The quote auto-saves as you type — you never need to manually save.",
  },
  {
    icon: <Table2 className="w-10 h-10 text-blue-600" />,
    title: "Adding Line Items",
    body: "In the quote builder, use Add Item to add parts manually. Set the part number, description, list price (USD or CAD), quantity, and your discount %. The tool automatically calculates the CAD sell price, profit, and margin for each line.",
    tip: "Use the Section dropdown on each row to organize items (e.g. Whole Machine, Cab Kit, Licenses).",
  },
  {
    icon: <Table2 className="w-10 h-10 text-green-600" />,
    title: "Paste Import — Fastest Way to Add Items",
    body: "Copy a list of parts from a vendor email, spreadsheet, or PDF and click Paste Import. The tool auto-detects columns (description, part number, price, qty) and shows you a preview before adding. Confirm and all rows are added instantly.",
    tip: "Works with tab-separated or comma-separated data. You can fix column assignments in the preview.",
  },
  {
    icon: <Truck className="w-10 h-10 text-orange-600" />,
    title: "Freight & Labour",
    body: "Scroll down to the Freight & Labour section. Add installation labour (hourly rate pulls from Settings), freight charges, and travel. These show as separate line items on the customer quote with their own totals.",
    tip: "Labour rates and freight options are managed in Settings so they stay consistent across all quotes.",
  },
  {
    icon: <DollarSign className="w-10 h-10 text-blue-600" />,
    title: "Quote Summary & FX Rate",
    body: "The right panel shows subtotal, freight/labour, any discount, tax, and the grand total in CAD. The USD → CAD exchange rate is shown at the bottom. All USD-priced items are automatically converted using the current FX rate.",
    tip: "Update the FX rate in Settings whenever the exchange rate changes — it updates all open quotes immediately.",
  },
  {
    icon: <Printer className="w-10 h-10 text-blue-600" />,
    title: "Printing & PDF",
    body: "When the quote is ready, click the Print button at the top of the quote. This opens a print preview with the SITECH/Trimble header, all line items grouped by section, totals, and the Terms & Conditions on page 2. Use Print / Save PDF to export.",
    tip: "Only items with Show Price enabled appear on the customer copy. Use this to hide internal-only items.",
  },
  {
    icon: <Layers className="w-10 h-10 text-orange-600" />,
    title: "Saved Builds",
    body: "Built a standard dozer or excavator kit you quote often? Click Save Build on any quote to store the line items as a reusable template. On the Builds page, click Load into New Quote to instantly populate a new quote with that configuration.",
    tip: "Builds are organized by group (Dozer, Excavator, Grader, etc.) and show when they were last quoted.",
  },
  {
    icon: <Settings className="w-10 h-10 text-gray-600" />,
    title: "Settings & Admin",
    body: "Use the Settings page to manage the FX rate, vendor discounts, freight options, and labour rates. The Parts Database page lets you search and manage your parts catalog. Sales Reps and Install Times pages round out the reference data.",
    tip: "All pricing tables here feed into the quote builder — keep them updated and every quote stays accurate.",
  },
]

export function TourGuide() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem(TOUR_KEY)
    if (!seen) {
      setOpen(true)
    }
  }, [])

  function close() {
    localStorage.setItem(TOUR_KEY, "1")
    setOpen(false)
    setStep(0)
  }

  function openTour() {
    setStep(0)
    setOpen(true)
  }

  if (!mounted) return null

  const current = steps[step]
  const isFirst = step === 0
  const isLast = step === steps.length - 1

  return (
    <>
      {/* Persistent help button */}
      <button
        onClick={openTour}
        className="fixed top-4 right-4 z-40 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
        title="Open walkthrough guide"
      >
        <HelpCircle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div
                className="h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step counter */}
            <div className="px-8 pt-6 pb-0">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Step {step + 1} of {steps.length}
              </span>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                  {current.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{current.body}</p>
                  {current.tip && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-blue-700"><span className="font-semibold">Tip:</span> {current.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-1.5 pb-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all ${i === step ? "w-5 h-2 bg-blue-600" : "w-2 h-2 bg-gray-200 hover:bg-gray-300"}`}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
              <button
                onClick={close}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {!isFirst && (
                  <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                {isLast ? (
                  <Button size="sm" onClick={close} className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-700">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
