// src/app/(auth)/layout.tsx
import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Background glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-text-primary">
            Creator<span className="text-primary">Zap</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-text-muted text-xs">
          © 2024 CreatorZap —{' '}
          <a href="https://xhris84.netlify.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            Développé par Xhris Dior
          </a>
        </p>
      </footer>
    </div>
  )
}
