'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap,
  LayoutDashboard,
  Sparkles,
  History,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  ArrowDownToLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import WhatsAppChannelPopup from '@/components/whatsapp-channel-popup'

interface UserInfo {
  name: string
  email: string
  plan: string
  generationsLeft: number
  role: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => d.success && setUser(d.data))
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Deconnecte')
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/generate', icon: Sparkles, label: 'Generer' },
    { href: '/history', icon: History, label: 'Historique' },
    { href: '/favorites', icon: Heart, label: 'Favoris' },
    { href: '/trends', icon: TrendingUp, label: 'Tendances' },
    { href: '/downloads', icon: ArrowDownToLine, label: 'Telechargements' },
    { href: '/pricing', icon: CreditCard, label: 'Tarifs' },
    { href: '/settings', icon: Settings, label: 'Parametres' },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-card-border px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-white" fill="white" />
        </div>
        <span className="font-display text-lg font-bold text-text-primary">
          Creator<span className="text-primary">Zap</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn('sidebar-link', pathname === item.href && 'active')}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {pathname === item.href && <ChevronRight className="ml-auto h-3 w-3 text-primary" />}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={cn('sidebar-link mt-2 border border-primary/20', pathname.startsWith('/admin') && 'active')}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {user && (
        <div className="space-y-3 px-3 pb-4">
          {user.plan === 'FREE' && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Plan Gratuit</span>
                <span className="text-xs font-semibold text-primary">{user.generationsLeft} restants</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-dark-50">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${(user.generationsLeft / 5) * 100}%` }}
                />
              </div>
              <Link href="/pricing" className="mt-2 block text-center text-xs font-semibold text-primary hover:underline">
                Passer Premium
              </Link>
            </div>
          )}

          {user.plan === 'PREMIUM' && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-3 text-center">
              <span className="text-xs font-bold text-primary">Plan Premium</span>
              <p className="mt-0.5 text-xs text-text-muted">Generations illimitees</p>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <span className="text-sm font-bold text-primary">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Deconnexion</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <WhatsAppChannelPopup />

      <aside className="hidden w-64 shrink-0 flex-col border-r border-card-border bg-dark-100 lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 flex-col border-r border-card-border bg-dark-100 animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-card-border bg-dark-100 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-text-secondary hover:text-text-primary">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-text-primary">CreatorZap</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
