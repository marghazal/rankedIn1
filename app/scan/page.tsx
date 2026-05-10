import { Nav } from "@/components/nav"
import { ScanForm } from "@/components/scan/scan-form"

export const metadata = {
  title: "scan your profile — RankedIn",
  description: "drop your linkedin screenshot. the AI will handle the rest.",
}

export default function ScanPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <ScanForm />
    </main>
  )
}
