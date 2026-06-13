"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BarChart3, ClipboardList, FileText, Home, Menu, Shield, Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { lang, setLang, t } = useLanguage()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/submit", label: t.nav.submit, icon: ClipboardList },
    { href: "/leaderboard", label: t.nav.leaderboard, icon: Trophy },
    { href: "/results", label: t.nav.results, icon: BarChart3 },
    { href: "/rules", label: t.nav.rules, icon: Shield },
    { href: "/privacy", label: t.nav.privacy, icon: FileText },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 sm:h-11 sm:w-11">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>

          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold tracking-wide sm:text-base">{t.appName}</span>
            <span className="hidden text-xs text-white/55 md:block">{t.home.subtitle}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1">
            {(["en", "de"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors",
                  lang === code ? "bg-emerald-500 text-white" : "text-white/55 hover:text-white",
                )}
                aria-pressed={lang === code}
              >
                {code}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.common.toggleMenu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#07111f] lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((link) => {
              const active = pathname === link.href
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active ? "bg-white text-slate-950" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
