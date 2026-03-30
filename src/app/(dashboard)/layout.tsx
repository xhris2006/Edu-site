'use client'
// src/app/(dashboard)/layout.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap, LayoutDashboard, Sparkles, History, Heart,
  CreditCard, Settings, LogOut, TrendingUp, Menu, X,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

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
      .catch(() => router.push('/auth/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Déconnecté')
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelEn: 'Dashboard' },
    { href: '/generate', icon: Sparkles, label: 'Générer', labelEn: 'Generate' },
    { href: '/history', icon: History, label: 'Historique', labelEn: 'History' },
    { href: '/favorites', icon: Heart, label: 'Favoris', labelEn: 'Favorites' },
    { href: '/trends', icon: TrendingUp, label: 'Tendances', labelEn: 'Trends' },
    { href: '/pricing', icon: CreditCard, label: 'Tarifs', labelEn: 'Pricing' },
    { href: '/settings', icon: Settings, label: 'Paramètres', labelEn: 'Settings' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-card-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="font-display font-bold text-lg text-text-primary">
          Creator<span className="text-primary">Zap</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'sidebar-link',
              pathname === item.href && 'active'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
            {pathname === item.href && (
              <ChevronRight className="w-3 h-3 ml-auto text-primary" />
            )}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={cn('sidebar-link border border-primary/20 mt-2', pathname.startsWith('/admin') && 'active')}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* User info + plan */}
      {user && (
        <div className="px-3 pb-4 space-y-3">
          {/* Plan badge */}
          {user.plan === 'FREE' && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Plan Gratuit</span>
                <span className="text-xs text-primary font-semibold">{user.generationsLeft} restants</span>
              </div>
              <div className="w-full bg-dark-50 rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${(user.generationsLeft / 5) * 100}%` }}
                />
              </div>
              <Link
                href="/pricing"
                className="block text-center text-xs text-primary font-semibold mt-2 hover:underline"
              >
                ⚡ Passer Premium
              </Link>
            </div>
          )}
          {user.plan === 'PREMIUM' && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-3 text-center">
              <span className="text-xs text-primary font-bold">⚡ Plan Premium</span>
              <p className="text-xs text-text-muted mt-0.5">Générations illimitées</p>
            </div>
          )}

          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm font-bold">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{user.name}</p>
              <p className="text-text-muted text-xs truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-100 border-r border-card-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-100 border-r border-card-border flex flex-col animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-card-border bg-dark-100">
          <button onClick={() => setSidebarOpen(true)} className="text-text-secondary hover:text-text-primary">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-text-primary">CreatorZap</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
