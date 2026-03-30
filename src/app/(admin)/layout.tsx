'use client'
// src/app/(admin)/layout.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, ShieldCheck, LayoutDashboard, Users, CreditCard, TrendingUp, LogOut, ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.success || d.data?.role !== 'ADMIN') {
        toast.error('Accès refusé — Admins uniquement')
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }).catch(() => router.push('/auth/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
          <p className="text-text-muted text-sm">Vérification des droits admin...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
    { href: '/admin/trends', icon: TrendingUp, label: 'Tendances' },
  ]

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-dark-100 border-r border-card-border flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-card-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-text-primary">CreatorZap</span>
            <p className="text-xs text-primary font-semibold">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', pathname === item.href && 'active')}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <Link href="/dashboard" className="sidebar-link text-text-muted">
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-left hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
