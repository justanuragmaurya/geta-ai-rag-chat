import type { Metadata } from 'next'
import { Yatra_One, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const yatra = Yatra_One({ subsets: ['latin'], weight: '400', variable: '--font-yatra' })
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Geta-AI — Ask Krishna',
  description: 'Bhagavad Gita wisdom for your everyday struggles',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${yatra.variable} ${sourceSerif.variable}`}>
      <body className="bg-cream text-deep-brown min-h-screen font-serif antialiased">
        {children}
      </body>
    </html>
  )
}
