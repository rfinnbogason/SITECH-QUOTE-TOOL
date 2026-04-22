import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { PageTransition } from "@/components/layout/PageTransition"
import { Toaster } from "@/components/ui/sonner"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SITECH Quote Tool",
  description: "SITECH Western Canada - Professional Quoting System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
