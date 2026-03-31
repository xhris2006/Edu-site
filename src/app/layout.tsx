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
  title: 'CreatorZap - AI Content for African Creators',
  description:
    'Generate viral TikTok captions, Instagram posts, YouTube scripts, download clean videos, and manage creators with AI.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  keywords: ['content creator', 'AI', 'TikTok', 'Instagram', 'YouTube', 'Africa', 'Cameroun'],
  authors: [{ name: 'CreatorZap' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'CreatorZap - AI Content for African Creators',
    description: 'Generate viral content, manage creator quotas, and download clean social videos.',
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorZap - AI Content for African Creators',
    description: 'Generate viral content and download clean social videos.',
    images: ['/twitter-image'],
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
