'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shield, ShieldOff, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  plan: string
  generationsLeft: number
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) setUsers(data.data.recentUsers || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return users
    return users.filter(user =>
      user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    )
  }, [query, users])

  const patchUser = async (id: string, payload: Record<string, unknown>, successMessage: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action impossible')
      toast.success(successMessage)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action impossible')
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Suppression impossible')
      toast.success('Utilisateur supprime')
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Gestion des utilisateurs
        </h1>
        <p className="page-subtitle">Ajoutez des admins, modifiez les plans et supprimez les comptes si besoin.</p>
      </div>

      <div className="card">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="input"
        />
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-text-muted">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left">
                <th className="py-3 pr-4">Nom</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Inscription</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="py-3 pr-4 text-text-primary">{user.name}</td>
                  <td className="py-3 pr-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 pr-4">{user.role}</td>
                  <td className="py-3 pr-4">{user.plan}</td>
                  <td className="py-3 pr-4 text-xs text-text-muted">{formatDate(user.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => patchUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }, 'Role mis a jour')}
                        className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 px-3 py-1 text-xs text-yellow-300 hover:bg-yellow-500/10"
                      >
                        {user.role === 'ADMIN' ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        {user.role === 'ADMIN' ? 'Retirer admin' : 'Rendre admin'}
                      </button>
                      <button
                        onClick={() => patchUser(user.id, { plan: user.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM' }, 'Plan mis a jour')}
                        className="rounded-lg border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        {user.plan === 'PREMIUM' ? 'Downgrade' : 'Upgrade'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
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
        )}
      </div>
    </div>
  )
}
