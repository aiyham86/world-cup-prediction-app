import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Simex World Cup 2026 Tippspiel',
  description:
    'Internal Simex prediction game for the World Cup 2026. Predict match scores, collect points, and climb the leaderboard.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">{children}</main>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
