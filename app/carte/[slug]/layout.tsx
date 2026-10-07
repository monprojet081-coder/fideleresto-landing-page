import type { Metadata } from "next"

// Page privee ou propre a un restaurant : inutile (et contre-productive) dans Google
export const metadata: Metadata = {
  title: "Ma carte de fidélité",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
