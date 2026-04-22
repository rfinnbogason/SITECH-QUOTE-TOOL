"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HelpCircle } from "lucide-react"

const TOUR_SEEN_KEY = "sitech_tour_v2_seen"
const TOUR_STATE_KEY = "sitech_tour_v2_state"

interface TourState {
  active: boolean
  step: number
  quoteId?: number
}

interface StepDef {
  page: string | RegExp
  element: string
  title: string
  description: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  navigateTo?: (state: TourState) => string
}

const STEPS: StepDef[] = [
  {
    page: "/",
    element: "#tour-new-quote",
    title: "New Quote",
    description: "Click here any time to start a fresh quote. Each quote gets a unique number automatically and auto-saves as you work — no manual saving needed.",
    side: "right",
    align: "start",
  },
  {
    page: "/",
    element: "#tour-fx-rate",
    title: "Exchange Rate",
    description: "All USD-priced items are converted to CAD using this rate. Update it in Settings whenever the exchange rate changes — every open quote reflects the new rate immediately.",
    side: "bottom",
  },
  {
    page: "/",
    element: "#tour-stats",
    title: "Quick Stats",
    description: "At a glance: total quotes in the system, parts in your catalog, active sales reps, and saved build templates. Click any card to jump to that section.",
    side: "bottom",
  },
  {
    page: "/",
    element: "#tour-recent-quotes",
    title: "Recent Quotes",
    description: "Your most recently updated quotes listed here. Click any row to open it and pick up where you left off. Use the Quotes page for the full list with filtering.",
    side: "top",
    navigateTo: (s) => s.quoteId ? `/quotes/${s.quoteId}` : "/",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-quote-topbar",
    title: "Quote Actions",
    description: "The main action bar. Paste Import lets you paste messy vendor data and auto-detect columns. Save Build stores this configuration as a reusable template. Preview and Download PDF generate the customer-ready document.",
    side: "bottom",
    align: "end",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-paste-import",
    title: "Paste Import",
    description: "Copy a list of parts from a vendor email, Excel, or PDF — then click here. The tool detects columns (description, part #, price, qty) and shows a preview. One click adds all rows to your quote.",
    side: "bottom",
    align: "end",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-kpi-cards",
    title: "Live KPIs",
    description: "These update in real time as you edit. Total CAD, Total USD, Profit, and Margin tell you the health of the quote at a glance. Margin turns amber under 20% to flag low-margin deals.",
    side: "bottom",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-customer-info",
    title: "Customer Details",
    description: "Fill in who you're quoting: company, contact, email, phone. You can also override the FX rate per-quote here if a customer needs a locked-in rate.",
    side: "bottom",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-machine-info",
    title: "Machine Details",
    description: "The machine being equipped. Make, model, serial number, and install type all appear on the printed quote so the customer can reference back to their specific unit.",
    side: "bottom",
    align: "end",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-line-items",
    title: "Line Items",
    description: "Each row is one product. Set part number, description, list price (USD or CAD), quantity, and your discount %. The CAD sell price, profit, and margin calculate instantly. Use the Section column to group items on the printed quote.",
    side: "top",
  },
  {
    page: /^\/quotes\/\d+/,
    element: "#tour-freight-labour",
    title: "Freight & Labour",
    description: "Add installation labour hours (rate pulls from Settings), freight charges, and travel here. These appear as separate line items on the customer quote with their own totals.",
    side: "top",
    navigateTo: () => "/builds",
  },
  {
    page: "/builds",
    element: "#tour-builds-page",
    title: "Saved Builds",
    description: "A standard dozer kit, excavator package, or survey setup you quote often? Save any quote as a Build template. Next time, load it into a new quote — all line items copy over instantly. Organized by machine type group.",
    side: "bottom",
    navigateTo: () => "/settings",
  },
  {
    page: "/settings",
    element: "#tour-settings-fx",
    title: "Settings",
    description: "Keep the FX rate updated here — it feeds every open quote. You also manage vendor discount levels, freight options, labour rates, and markup defaults from this page. Changes take effect immediately across all quotes.",
    side: "bottom",
  },
]

function getTourState(): TourState {
  try {
    const raw = localStorage.getItem(TOUR_STATE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { active: false, step: 0 }
}

function saveTourState(state: TourState) {
  localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(state))
}

function clearTourState() {
  localStorage.removeItem(TOUR_STATE_KEY)
  localStorage.setItem(TOUR_SEEN_KEY, "1")
}

function pageMatches(pageDef: string | RegExp, pathname: string): boolean {
  if (typeof pageDef === "string") return pageDef === pathname
  return pageDef.test(pathname)
}

export function TourGuide() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [driverLoaded, setDriverLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    import("driver.js").then(() => setDriverLoaded(true))
  }, [mounted])

  useEffect(() => {
    if (!mounted || !driverLoaded) return
    const state = getTourState()
    if (!state.active) return

    const stepsForPage = STEPS.filter((s, idx) => idx >= state.step && pageMatches(s.page, pathname))
    if (stepsForPage.length === 0) return

    startDriverFromStep(state.step, state, pathname, router)
  }, [mounted, driverLoaded, pathname])

  async function startTour() {
    let state = getTourState()
    if (!state.active || state.step === 0) {
      // Create a tour quote if we don't have one
      if (!state.quoteId) {
        try {
          const res = await fetch("/api/quotes/create", { method: "POST" })
          const data = await res.json()
          if (data.id) state = { active: true, step: 0, quoteId: data.id }
        } catch {}
      }
      state = { ...state, active: true, step: 0 }
    }
    saveTourState(state)

    if (!pageMatches(STEPS[0].page, pathname)) {
      router.push("/")
      return
    }
    startDriverFromStep(0, state, pathname, router)
  }

  function startDriverFromStep(fromStep: number, state: TourState, currentPath: string, nav: ReturnType<typeof useRouter>) {
    import("driver.js").then(async ({ driver }) => {
      await import("driver.js/dist/driver.css")

      const stepsOnPage = STEPS
        .map((s, idx) => ({ ...s, globalIdx: idx }))
        .filter(s => s.globalIdx >= fromStep && pageMatches(s.page, currentPath))

      if (stepsOnPage.length === 0) return

      const driverSteps = stepsOnPage.map((s) => ({
        element: s.element,
        popover: {
          title: s.title,
          description: s.description,
          side: s.side ?? "bottom",
          align: s.align ?? "start",
        },
      }))

      const lastStep = stepsOnPage[stepsOnPage.length - 1]

      const d = driver({
        showProgress: true,
        progressText: `Step {{current}} of ${STEPS.length}`,
        allowClose: true,
        smoothScroll: true,
        steps: driverSteps,
        onDestroyStarted: () => {
          clearTourState()
          d.destroy()
        },
        onNextClick: (el, step, opts) => {
          const currentLocalIdx = d.getActiveIndex() ?? 0
          const isLastOnPage = currentLocalIdx === stepsOnPage.length - 1
          const currentGlobalStep = stepsOnPage[currentLocalIdx]

          if (isLastOnPage && lastStep.navigateTo) {
            const nextGlobalIdx = lastStep.globalIdx + 1
            const newState: TourState = { active: true, step: nextGlobalIdx, quoteId: state.quoteId }
            saveTourState(newState)
            d.destroy()
            const target = lastStep.navigateTo(state)
            nav.push(target)
          } else {
            d.moveNext()
          }
        },
        onPrevClick: () => {
          d.movePrevious()
        },
      })

      d.drive()
    })
  }

  if (!mounted) return null

  const seen = localStorage.getItem(TOUR_SEEN_KEY)
  const state = getTourState()

  return (
    <>
      {/* Auto-start for first-time users */}
      {!seen && !state.active && mounted && (
        <AutoStart onStart={startTour} />
      )}

      {/* Persistent help button */}
      <button
        onClick={startTour}
        className="fixed top-4 right-4 z-40 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
        title="Start walkthrough tour"
      >
        <HelpCircle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
      </button>
    </>
  )
}

function AutoStart({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onStart, 800)
    return () => clearTimeout(timer)
  }, [onStart])
  return null
}
