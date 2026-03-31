'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Sparkles,
  CreditCard,
  Crown,
  Search,
  BarChart2,
  RefreshCw,
  ShieldCheck,
  Shield,
  ShieldOff,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatXAF } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  premiumUsers: number
  totalGenerations: number
  totalRevenue: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    plan: string
    role: string
    generationsLeft: number
    createdAt: string
  }>
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

  useEffect(() => {
    fetchStats()
  }, [])

  const patchUser = async (userId: string, payload: Record<string, unknown>, successMessage: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action impossible')

      toast.success(successMessage)
      fetchStats()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action impossible')
    }
  }

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const nextPlan = currentPlan === 'PREMIUM' ? 'FREE' : 'PREMIUM'
    if (!confirm(`Changer le plan vers ${nextPlan} ?`)) return
    await patchUser(userId, { plan: nextPlan }, `Plan mis a jour: ${nextPlan}`)
  }

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Passer ce compte en ${nextRole} ?`)) return
    await patchUser(userId, { role: nextRole }, `Role mis a jour: ${nextRole}`)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Suppression impossible')

      toast.success('Utilisateur supprime')
      fetchStats()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-card" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-card" />)}
        </div>
        <div className="h-64 rounded-2xl bg-card" />
      </div>
    )
  }

  const filteredUsers = stats?.recentUsers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  ) || []

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="page-subtitle">Vue d&apos;ensemble de la plateforme et gestion des admins</p>
        </div>
        <button
          onClick={() => {
            setRefreshing(true)
            fetchStats()
          }}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Utilisateurs totaux', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Utilisateurs Premium', value: stats?.premiumUsers || 0, icon: Crown, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Generations totales', value: stats?.totalGenerations || 0, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Revenus totaux', value: formatXAF(stats?.totalRevenue || 0), icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {stats?.genByType && stats.genByType.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-text-primary">Generations par type</h2>
          </div>
          <div className="space-y-3">
            {stats.genByType.map(item => {
              const max = Math.max(...stats.genByType.map(g => g._count))
              const pct = max > 0 ? (item._count / max) * 100 : 0

              return (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm text-text-secondary">{item.type.replace('_', ' ')}</span>
                  <div className="h-2 flex-1 rounded-full bg-dark-50">
                    <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs text-text-muted">{item._count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-text-primary">Utilisateurs recents</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="input w-64 py-2 pl-9 text-sm"
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
                <th className="py-3 pr-4 font-medium text-text-secondary">Nom</th>
                <th className="py-3 pr-4 font-medium text-text-secondary">Email</th>
                <th className="py-3 pr-4 font-medium text-text-secondary">Plan</th>
                <th className="py-3 pr-4 font-medium text-text-secondary">Role</th>
                <th className="py-3 pr-4 font-medium text-text-secondary">Gen. restantes</th>
                <th className="py-3 pr-4 font-medium text-text-secondary">Inscrit le</th>
                <th className="py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filteredUsers.map(user => (
                <tr key={user.id} className="transition-colors hover:bg-dark-50">
                  <td className="py-3 pr-4 font-medium text-text-primary">{user.name}</td>
                  <td className="py-3 pr-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${user.plan === 'PREMIUM' ? 'badge-red' : 'border border-card-border bg-dark-50 text-text-muted'}`}>
                      {user.plan === 'PREMIUM' ? 'Premium' : 'Gratuit'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-gold' : 'border border-card-border bg-dark-50 text-text-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{user.generationsLeft === 9999 ? '∞' : user.generationsLeft}</td>
                  <td className="py-3 pr-4 text-xs text-text-muted">{formatDate(user.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleTogglePlan(user.id, user.plan)}
                        className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                          user.plan === 'PREMIUM'
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-primary/30 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.plan === 'PREMIUM' ? 'Downgrade' : 'Upgrade'}
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.role)}
                        className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 px-3 py-1 text-xs text-yellow-300 transition-all hover:bg-yellow-500/10"
                      >
                        {user.role === 'ADMIN' ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        {user.role === 'ADMIN' ? 'Retirer admin' : 'Rendre admin'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Paiements recents</h2>
        </div>
        {!stats?.recentPayments?.length ? (
          <p className="py-6 text-center text-sm text-text-muted">Aucun paiement pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="py-3 pr-4 font-medium text-text-secondary">Utilisateur</th>
                  <th className="py-3 pr-4 font-medium text-text-secondary">Montant</th>
                  <th className="py-3 pr-4 font-medium text-text-secondary">Statut</th>
                  <th className="py-3 font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40">
                {stats.recentPayments.map(payment => (
                  <tr key={payment.id} className="transition-colors hover:bg-dark-50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-text-primary">{payment.user.name}</p>
                      <p className="text-xs text-text-muted">{payment.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-text-primary">{formatXAF(payment.amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        payment.status === 'SUCCESS' ? 'badge-green' :
                        payment.status === 'PENDING' ? 'badge-gold' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-text-muted">{formatDate(payment.createdAt)}</td>
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
