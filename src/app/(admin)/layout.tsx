'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Zap, ShieldCheck, LayoutDashboard, Users, CreditCard, TrendingUp, LogOut, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import WhatsAppChannelPopup from '@/components/whatsapp-channel-popup'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.success || d.data?.role !== 'ADMIN') {
          toast.error('Acces refuse - Admins uniquement')
          router.push('/dashboard')
        } else {
          setChecking(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-text-muted">Verification des droits admin...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: "Vue d'ensemble" },
    { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
    { href: '/admin/trends', icon: TrendingUp, label: 'Tendances' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <WhatsAppChannelPopup />

      <aside className="flex w-60 shrink-0 flex-col border-r border-card-border bg-dark-100">
        <div className="flex items-center gap-2 border-b border-card-border px-4 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <div>
            <span className="font-display text-sm font-bold text-text-primary">CreatorZap</span>
            <p className="text-xs font-semibold text-primary">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', pathname === item.href && 'active')}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-1 px-3 pb-4">
          <Link href="/dashboard" className="sidebar-link text-text-muted">
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-left hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-4 w-4" />
            Deconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
