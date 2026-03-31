'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { markWhatsAppPopupForNextAuthRedirect } from '@/components/whatsapp-channel-popup'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', language: 'fr' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const t = {
    fr: {
      title: 'Creer un compte',
      subtitle: 'Rejoignez des milliers de createurs africains',
      name: 'Nom complet',
      email: 'Email',
      password: 'Mot de passe',
      language: 'Langue preferee',
      btn: "S'inscrire",
      loading: 'Creation...',
      hasAccount: 'Deja un compte ?',
      login: 'Se connecter',
      perks: ['0/5 utilise au depart', '5 generations maximum par jour', 'Tous les types de contenu'],
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
      perks: ['Start at 0/5 used', '5 generations max per day', 'All content types included'],
    },
  }[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password.length < 6) {
      toast.error(lang === 'fr' ? 'Mot de passe trop court (min 6 caracteres)' : 'Password too short (min 6 chars)')
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
      if (!res.ok) throw new Error(data.error || 'Erreur')

      markWhatsAppPopupForNextAuthRedirect()
      toast.success(lang === 'fr' ? 'Compte cree !' : 'Account created!')
      router.push(data.data?.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setLang(current => current === 'fr' ? 'en' : 'fr')}
          className="rounded-full border border-card-border px-3 py-1 text-xs text-text-muted transition-colors hover:text-primary"
        >
          {lang === 'fr' ? 'FR' : 'EN'}
        </button>
      </div>

      <div className="card border-card-border/60 p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Zap className="h-7 w-7 text-primary" />
          </div>
        </div>

        <h1 className="mb-1 text-center font-display text-2xl font-bold text-text-primary">{t.title}</h1>
        <p className="mb-6 text-center text-sm text-text-secondary">{t.subtitle}</p>

        <div className="mb-6 space-y-2 rounded-xl bg-dark-50 p-4">
          {t.perks.map(item => (
            <div key={item} className="flex items-center gap-2 text-xs text-text-secondary">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
              {item}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t.name}</label>
            <input
              type="text"
              className="input"
              placeholder="Aminata Kone"
              value={form.name}
              onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
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
              onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
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
                onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd(value => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">{t.language}</label>
            <select
              className="input"
              value={lang}
              onChange={e => setLang(e.target.value as 'fr' | 'en')}
            >
              <option value="fr">Francais</option>
              <option value="en">English</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2 flex w-full items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.loading}
              </>
            ) : (
              t.btn
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t.hasAccount}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  )
}
