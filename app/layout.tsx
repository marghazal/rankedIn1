import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600'],
})


export const metadata: Metadata = {
  title: 'RankedIn — your career has a rank.',
  description: 'linkedin, but with the receipts. find out your aura score, get roasted by AI, and see where you stand.',
  generator: 'rankedin.app',
  keywords: ['linkedin', 'career ranking', 'aura score', 'gen z', 'internship', 'job hunt'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'RankedIn — your career has a rank.',
    description: 'linkedin, but with the receipts.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#FFFFFF',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
