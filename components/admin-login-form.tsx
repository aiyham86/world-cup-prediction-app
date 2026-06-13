"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Lock, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { adminLogin } from "@/app/actions"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLoginForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const result = await adminLogin(password)

      if (result.ok) {
        toast.success(t.admin.login.success)
        router.refresh()
      } else {
        toast.error(t.errors.invalidPassword)
      }
    } catch {
      toast.error(t.errors.generic)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] px-4 py-6 text-white shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-12">
        <Image
          src="/images/rules.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/65" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300 sm:mb-5 sm:px-4 sm:py-2 sm:tracking-[0.2em]">
            <ShieldCheck className="h-4 w-4" />
            {t.common.worldCup}
          </div>
          <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.admin.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">{t.admin.login.heroSubtitle}</p>
        </div>
      </section>

      <Card className="mx-auto max-w-md rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{t.admin.login.title}</h2>
                <p className="text-sm text-slate-500">{t.admin.login.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adminPassword">{t.admin.login.password}</Label>
              <Input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-full bg-emerald-500 font-bold text-white hover:bg-emerald-400"
            >
              {submitting ? t.admin.login.submitting : t.admin.login.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
