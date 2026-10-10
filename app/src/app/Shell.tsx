import { Suspense, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Icon, type IconName } from '../components/Icon'
import { TermDrawer } from '../components/TermDrawer'
import { CommandPalette } from '../components/CommandPalette'
import { useDueCount, useNow } from '../engine/hooks'
import { useUi } from '../state/ui'

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Today', icon: 'today' },
  { to: '/roadmap', label: 'Roadmap', icon: 'roadmap' },
  { to: '/review', label: 'Review', icon: 'review' },
  { to: '/mistakes', label: 'Mistakes', icon: 'mistakes' },
  { to: '/settings', label: 'Backup', icon: 'settings' },
]

export function Shell() {
  const now = useNow()
  const due = useDueCount(now)
  const setPaletteOpen = useUi((s) => s.setPaletteOpen)
  const closeDrawer = useUi((s) => s.closeDrawer)
  const { pathname } = useLocation()

  useEffect(() => {
    closeDrawer()
    window.scrollTo(0, 0)
  }, [pathname, closeDrawer])

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[208px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-rule bg-surface md:flex">
        <Brand />
        <nav aria-label="Main" className="mt-2 flex flex-col gap-0.5 px-3">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} badge={n.to === '/review' ? due : 0} />
          ))}
        </nav>
        <div className="mt-auto px-3 pb-4">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-rule px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
          >
            <Icon name="search" size={16} />
            <span className="flex-1 text-left">Search</span>
            <kbd className="font-mono text-[11px] text-ink-3">Ctrl K</kbd>
          </button>
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rule bg-surface/95 px-4 py-2.5 backdrop-blur md:hidden">
        <Brand compact />
        <button type="button" onClick={() => setPaletteOpen(true)} className="rounded-md p-2 text-ink-2" aria-label="Search">
          <Icon name="search" />
        </button>
      </header>

      <main id="main" className="min-w-0 px-4 pt-6 pb-28 sm:px-8 md:pt-10 md:pb-16 lg:px-12">
        <Suspense fallback={<div className="h-40" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Phone tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-rule bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-ink-3'}`
            }
          >
            <Icon name={n.icon} size={20} />
            {n.label}
            {n.to === '/review' && due > 0 && (
              <span className="absolute top-1 right-[22%] rounded-full bg-[var(--line-0)] px-1.5 font-mono text-[10px] leading-4 text-white">
                {due}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <TermDrawer />
      <CommandPalette />
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink to="/" className={`flex items-center gap-2.5 ${compact ? '' : 'px-5 pt-6 pb-4'}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--ink)" />
        <path d="M6 22 H14 L18 10 H26" stroke="var(--line-0)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="22" r="3" fill="var(--bg)" />
        <circle cx="26" cy="10" r="3" fill="var(--bg)" />
      </svg>
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight">System Design</span>
        <span className="block font-mono text-[10.5px] tracking-wider text-ink-3 uppercase">Study plan</span>
      </span>
    </NavLink>
  )
}

function NavItem({ to, label, icon, badge }: { to: string; label: string; icon: IconName; badge: number }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-semibold ${
          isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
        }`
      }
    >
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-[var(--line-0)] px-2 font-mono text-[11px] leading-5 text-white" aria-label={`${badge} cards due`}>
          {badge}
        </span>
      )}
    </NavLink>
  )
}
