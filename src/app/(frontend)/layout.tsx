import type { Metadata } from 'next'
import React from 'react'
import { Manrope } from 'next/font/google'
const sans = Manrope({ subsets: ['latin'], variable: '--font-brand-sans', display: 'swap' })
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { getSiteData } from '@/site/data'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData()
  return (
    <html data-scroll-behavior="smooth" lang="sv" className={sans.variable}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only">
          Hoppa till innehåll
        </a>
        <Header data={data} />
        <main id="main">{children}</main>
        <Footer data={data} />
      </body>
    </html>
  )
}
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'DK Byggkoncept',
  description: 'Renovering, fönsterbyte och nybyggnation i Göteborg med omnejd.',
  openGraph: { type: 'website', locale: 'sv_SE', siteName: 'DK Byggkoncept' },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/logo-dk.png' },
}
