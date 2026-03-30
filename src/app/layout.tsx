// src/app/layout.tsx — Root layout
import type { Metadata } from 'next'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'CreatorZap — AI Content for African Creators',
  description:
    'Generate viral TikTok captions, Instagram posts, YouTube scripts and more. Powered by AI, built for African creators.',
  keywords: ['content creator', 'AI', 'TikTok', 'Instagram', 'YouTube', 'Africa', 'Cameroun'],
  authors: [{ name: 'CreatorZap' }],
  openGraph: {
    title: 'CreatorZap — AI Content for African Creators',
    description: 'Generate viral content in seconds',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${syne.variable} ${inter.variable} ${jetbrains.variable} font-sans bg-dark text-text-primary antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A24',
              color: '#F1F1F5',
              border: '1px solid #2A2A38',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#E63946', secondary: '#F1F1F5' },
            },
            error: {
              iconTheme: { primary: '#E63946', secondary: '#F1F1F5' },
            },
          }}
        />
      </body>
    </html>
  )
}
