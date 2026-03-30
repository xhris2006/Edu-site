'use client'
// src/app/(admin)/admin/page.tsx
import { useState, useEffect } from 'react'
import {
  Users, Sparkles, CreditCard, TrendingUp, Crown,
  Search, ChevronDown, BarChart2, RefreshCw, ShieldCheck
} from 'lucide-react'
import { formatDate, formatXAF } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  premiumUsers: number
  totalGenerations: number
  totalRevenue: number
  recentUsers: Array<{ id: string; name: string; email: string; plan: string; generationsLeft: number; createdAt: string }>
  recentPayments: Array<{ id: string; amount: number; status: string; user: { name: string; email: string }; createdAt: string }>
  genByType: Array<{ type: string; _count: number }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) setStats(data.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'PREMIUM' ? 'FREE' : 'PREMIUM'
    if (!confirm(`Changer le plan vers ${newPlan}?`)) return
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      })
      fetchStats()
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-card rounded w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-2xl" />)}
      </div>
      <div className="h-64 bg-card rounded-2xl" />
    </div>
  )

  const filteredUsers = stats?.recentUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ) || []

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="page-subtitle">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchStats() }}
          disabled={refreshing}
          className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs totaux', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Utilisateurs Premium', value: stats?.premiumUsers || 0, icon: Crown, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Générations totales', value: stats?.totalGenerations || 0, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Revenus totaux', value: formatXAF(stats?.totalRevenue || 0), icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10', isString: true },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-text-primary">
              {stat.value}
            </div>
            <div className="text-text-muted text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Generations by type */}
      {stats?.genByType && stats.genByType.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-text-primary">Générations par type</h2>
          </div>
          <div className="space-y-3">
            {stats.genByType.map(item => {
              const max = Math.max(...stats.genByType.map(g => g._count))
              const pct = max > 0 ? (item._count / max) * 100 : 0
              return (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="text-text-secondary text-sm w-40 truncate">{item.type.replace('_', ' ')}</span>
                  <div className="flex-1 bg-dark-50 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-text-muted text-xs w-12 text-right">{item._count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-text-primary">Utilisateurs récents</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input pl-9 text-sm py-2 w-64"
              placeholder="Rechercher un utilisateur..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left">
                <th className="py-3 pr-4 text-text-secondary font-medium">Nom</th>
                <th className="py-3 pr-4 text-text-secondary font-medium">Email</th>
                <th className="py-3 pr-4 text-text-secondary font-medium">Plan</th>
                <th className="py-3 pr-4 text-text-secondary font-medium">Gén. restantes</th>
                <th className="py-3 pr-4 text-text-secondary font-medium">Inscrit le</th>
                <th className="py-3 text-text-secondary font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-dark-50 transition-colors">
                  <td className="py-3 pr-4 text-text-primary font-medium">{user.name}</td>
                  <td className="py-3 pr-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${user.plan === 'PREMIUM' ? 'badge-red' : 'bg-dark-50 text-text-muted border border-card-border'}`}>
                      {user.plan === 'PREMIUM' ? '⚡ Premium' : 'Gratuit'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{user.generationsLeft === 9999 ? '∞' : user.generationsLeft}</td>
                  <td className="py-3 pr-4 text-text-muted text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleTogglePlan(user.id, user.plan)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                        user.plan === 'PREMIUM'
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-primary/30 text-primary hover:bg-primary/10'
                      }`}
                    >
                      {user.plan === 'PREMIUM' ? '↓ Dégrader' : '↑ Upgrader'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent payments */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Paiements récents</h2>
        </div>
        {!stats?.recentPayments?.length ? (
          <p className="text-text-muted text-sm text-center py-6">Aucun paiement pour l&apos;instant</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="py-3 pr-4 text-text-secondary font-medium">Utilisateur</th>
                  <th className="py-3 pr-4 text-text-secondary font-medium">Montant</th>
                  <th className="py-3 pr-4 text-text-secondary font-medium">Statut</th>
                  <th className="py-3 text-text-secondary font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40">
                {stats.recentPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-dark-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-text-primary font-medium">{pay.user.name}</p>
                      <p className="text-text-muted text-xs">{pay.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-text-primary font-semibold">{formatXAF(pay.amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        pay.status === 'SUCCESS' ? 'badge-green' :
                        pay.status === 'PENDING' ? 'badge-gold' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pay.status === 'SUCCESS' ? '✓ Succès' : pay.status === 'PENDING' ? '⏳ En attente' : '✗ Échoué'}
                      </span>
                    </td>
                    <td className="py-3 text-text-muted text-xs">{formatDate(pay.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
