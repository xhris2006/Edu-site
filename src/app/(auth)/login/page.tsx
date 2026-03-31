'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { markWhatsAppPopupForNextAuthRedirect } from '@/components/whatsapp-channel-popup'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const t = {
    fr: {
      title: 'Connexion',
      subtitle: 'Accedez a votre espace createur',
      email: 'Email',
      password: 'Mot de passe',
      forgot: 'Mot de passe oublie ?',
      btn: 'Se connecter',
      loading: 'Connexion...',
      noAccount: 'Pas encore de compte ?',
      register: "S'inscrire",
      error: 'Email ou mot de passe incorrect',
    },
    en: {
      title: 'Sign In',
      subtitle: 'Access your creator space',
      email: 'Email',
      password: 'Password',
      forgot: 'Forgot password?',
      btn: 'Sign In',
      loading: 'Signing in...',
      noAccount: 'No account yet?',
      register: 'Sign Up',
      error: 'Invalid email or password',
    },
  }[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.error)

      markWhatsAppPopupForNextAuthRedirect()
      toast.success(lang === 'fr' ? 'Connexion reussie !' : 'Login successful!')
      router.push(data.data?.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.error)
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
        <p className="mb-8 text-center text-sm text-text-secondary">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">{t.email}</label>
            <input
              type="email"
              className="input"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">{t.password}</label>
              <span className="cursor-pointer text-xs text-primary hover:underline">{t.forgot}</span>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input pr-12"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(value => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
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
          {t.noAccount}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  )
}
