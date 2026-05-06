import Link from 'next/link'
import { Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navItems, canSee, type AppRole } from '@/config/nav'
import { getSessionProfileFromCookie } from '@/lib/sessionUtils'

export async function Navigation() {
  const profile = await getSessionProfileFromCookie(false)

  const role = (profile?.role as AppRole | undefined) ?? undefined
  const visibleNav = navItems.filter((item) => canSee(item, role))

  // force string (Route types kunnen soms “branded” zijn)
  const normalNav = visibleNav.filter((i) => !String(i.href).startsWith('/admin'))
  const adminNav = visibleNav.filter((i) => String(i.href).startsWith('/admin'))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Gustaaf Bouldering</span>
          </Link>

          {/* READ links */}
          <nav className="hidden md:flex items-center gap-6">
            {normalNav.map((item) => (
              <Link
                key={String(item.href)}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Beheer dropdown */}
          {adminNav.length > 0 && (
            <div className="hidden md:block">
              <details className="relative">
                <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground hover:text-primary">
                  Beheer
                </summary>

                <div className="absolute left-0 mt-2 min-w-[180px] rounded-md border bg-background shadow-md overflow-hidden">
                  {adminNav.map((item) => (
                    <Link
                      key={String(item.href)}
                      href={item.href}
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {profile ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {profile.username} ({profile.role})
              </span>

              <Button asChild variant="outline" size="sm">
                <Link href="/logout">Logout</Link>
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
