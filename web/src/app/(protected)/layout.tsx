import type { ReactNode } from 'react'
import { Navigation } from '@/components/navigation'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="p-6">{children}</main>
    </div>
  )
}
