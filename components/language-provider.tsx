"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { translations, type Translation } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("simex-lang") as Lang | null) : null
    if (stored === "en" || stored === "de") {
      setLangState(stored)
    }
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("simex-lang", next)
      document.documentElement.lang = next
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
