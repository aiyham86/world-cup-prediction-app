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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] px-6 py-10 text-white shadow-2xl shadow-slate-950/10 sm:px-10 lg:px-12">
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            {t.common.worldCup}
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">{t.admin.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">{t.admin.login.heroSubtitle}</p>
        </div>
      </section>

      <Card className="mx-auto max-w-md rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">{t.admin.login.title}</h2>
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
