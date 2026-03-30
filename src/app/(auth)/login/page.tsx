'use client'
// src/app/(auth)/login/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const t = {
    fr: {
      title: 'Connexion',
      subtitle: 'Accédez à votre espace créateur',
      email: 'Email',
      password: 'Mot de passe',
      forgot: 'Mot de passe oublié?',
      btn: 'Se connecter',
      loading: 'Connexion...',
      noAccount: 'Pas encore de compte?',
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
      toast.success(lang === 'fr' ? 'Connexion réussie! 🎉' : 'Login successful! 🎉')
      router.push(data.data?.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.error)
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
        <p className="text-text-secondary text-sm text-center mb-8">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">{t.email}</label>
            <input
              type="email"
              className="input"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">{t.password}</label>
              <span className="text-xs text-primary hover:underline cursor-pointer">{t.forgot}</span>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input pr-12"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
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
          {t.noAccount}{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  )
}
