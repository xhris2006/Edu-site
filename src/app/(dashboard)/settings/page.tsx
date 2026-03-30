'use client'
// src/app/(dashboard)/settings/page.tsx
import { useState, useEffect } from 'react'
import { Settings, User, Globe, Bell, Shield, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  name: string
  email: string
  language: string
  plan: string
  createdAt: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [form, setForm] = useState({ name: '', language: 'fr' })
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) {
        setUser(d.data)
        setForm({ name: d.data.name, language: d.data.language || 'fr' })
      }
    })
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(prev => prev ? { ...prev, ...form } : null)
      toast.success('Profil mis à jour! ✓')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPwd !== passwords.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwords.newPwd.length < 6) {
      toast.error('Minimum 6 caractères')
      return
    }
    setPwdLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPwd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Mot de passe changé! ✓')
      setPasswords({ current: '', newPwd: '', confirm: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setPwdLoading(false)
    }
  }

  if (!user) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-card rounded w-48" />
      <div className="h-48 bg-card rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Paramètres
        </h1>
        <p className="page-subtitle">Gérez votre compte et préférences</p>
      </div>

      {/* Profile section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Informations du profil</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-dark-50 rounded-xl">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
            <span className="text-primary text-2xl font-bold">{user.name[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-text-primary">{user.name}</p>
            <p className="text-text-muted text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge text-xs ${user.plan === 'PREMIUM' ? 'badge-red' : 'bg-dark text-text-muted border border-card-border'}`}>
                {user.plan === 'PREMIUM' ? '⚡ Premium' : 'Gratuit'}
              </span>
              <span className="text-text-muted text-xs">
                Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-CM')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input opacity-60" value={user.email} disabled />
            <p className="text-text-muted text-xs mt-1">L&apos;email ne peut pas être modifié</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Sauvegarder
          </button>
        </form>
      </div>

      {/* Language */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Langue préférée</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'fr', flag: '🇫🇷', label: 'Français' },
            { id: 'en', flag: '🇬🇧', label: 'English' },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setForm(f => ({ ...f, language: lang.id }))}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                form.language === lang.id
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-card-border hover:border-primary/30'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-text-primary">{lang.label}</span>
              {form.language === lang.id && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          ))}
        </div>
        <button onClick={handleUpdateProfile} disabled={loading} className="btn-secondary mt-4 flex items-center gap-2 text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sauvegarder la langue
        </button>
      </div>

      {/* Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Sécurité</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Mot de passe actuel</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={passwords.newPwd}
              onChange={e => setPasswords(p => ({ ...p, newPwd: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              required
            />
          </div>
          <button type="submit" disabled={pwdLoading} className="btn-secondary flex items-center gap-2">
            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Changer le mot de passe
          </button>
        </form>
      </div>

      {/* Notification prefs */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-text-primary">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { id: 'email_gen', label: 'Résumé hebdomadaire par email', default: true },
            { id: 'email_promo', label: 'Offres et promotions', default: false },
            { id: 'email_tips', label: 'Conseils et astuces créateur', default: true },
          ].map(notif => (
            <div key={notif.id} className="flex items-center justify-between py-2">
              <span className="text-text-secondary text-sm">{notif.label}</span>
              <input type="checkbox" defaultChecked={notif.default} className="accent-primary w-4 h-4 cursor-pointer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
