'use client'
// src/app/(auth)/register/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', language: 'fr' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const t = {
    fr: {
      title: 'Créer un compte',
      subtitle: 'Rejoins des milliers de créateurs africains',
      name: 'Nom complet',
      email: 'Email',
      password: 'Mot de passe',
      language: 'Langue préférée',
      btn: "S'inscrire",
      loading: 'Création...',
      hasAccount: 'Déjà un compte?',
      login: 'Se connecter',
      perks: ['5 générations gratuites/jour', 'Tous les types de contenu', 'FR & EN supporté'],
    },
    en: {
      title: 'Create Account',
      subtitle: 'Join thousands of African creators',
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      language: 'Preferred language',
      btn: 'Sign Up',
      loading: 'Creating...',
      hasAccount: 'Already have an account?',
      login: 'Sign In',
      perks: ['5 free generations/day', 'All content types', 'FR & EN supported'],
    },
  }[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error(lang === 'fr' ? 'Mot de passe trop court (min 6 chars)' : 'Password too short (min 6 chars)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(lang === 'fr' ? 'Compte créé! Bienvenue 🎉' : 'Account created! Welcome 🎉')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Lang toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
          className="text-xs text-text-muted hover:text-primary transition-colors border border-card-border rounded-full px-3 py-1"
        >
          {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      </div>

      <div className="card border-card-border/60 p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-primary" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-text-primary text-center mb-1">{t.title}</h1>
        <p className="text-text-secondary text-sm text-center mb-6">{t.subtitle}</p>

        {/* Perks */}
        <div className="bg-dark-50 rounded-xl p-4 mb-6 space-y-2">
          {t.perks.map(p => (
            <div key={p} className="flex items-center gap-2 text-xs text-text-secondary">
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {p}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t.name}</label>
            <input
              type="text"
              className="input"
              placeholder="Aminata Koné"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">{t.email}</label>
            <input
              type="email"
              className="input"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">{t.password}</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input pr-12"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Language select */}
          <div>
            <label className="label">{t.language}</label>
            <select
              className="input"
              value={lang}
              onChange={e => setLang(e.target.value as 'fr' | 'en')}
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.loading}
              </>
            ) : (
              t.btn
            )}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          {t.hasAccount}{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  )
}
