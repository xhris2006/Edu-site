'use client'
// src/app/(dashboard)/pricing/page.tsx
import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, Zap, Loader2, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatXAF } from '@/lib/utils'

const PLANS = [
  { id: 'monthly', label: 'Mensuel', amount: 2500, duration: '30 jours', badge: null },
  { id: 'quarterly', label: 'Trimestriel', amount: 6500, duration: '90 jours', badge: '⭐ Populaire', savings: '-13%' },
  { id: 'yearly', label: 'Annuel', amount: 20000, duration: '365 jours', badge: '🔥 Meilleure offre', savings: '-33%' },
]

const PREMIUM_FEATURES = [
  'Générations illimitées chaque jour',
  'TikTok, Instagram, YouTube, Hashtags, Idées',
  'Historique complet de toutes vos générations',
  'Sauvegarde en favoris illimitée',
  'Analyseur de tendances africaines',
  'Bilingue Français & Anglais',
  'Support prioritaire',
  'Accès aux nouvelles fonctionnalités',
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) {
        setUserPlan(d.data.plan)
        setUserEmail(d.data.email)
      }
    })
  }, [])

  const handleSubscribe = async () => {
    if (userPlan === 'PREMIUM') {
      toast.success('Vous êtes déjà Premium! 🎉')
      return
    }
    const plan = PLANS.find(p => p.id === selectedPlan)!
    setLoading(true)
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, amount: plan.amount, email: userEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Redirect to Fapshi payment page
      window.location.href = data.data.paymentUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="page-title flex items-center justify-center gap-2 text-3xl">
          <CreditCard className="w-7 h-7 text-primary" />
          Choisissez votre plan
        </h1>
        <p className="page-subtitle mt-2 text-base">
          Payez avec <strong className="text-text-primary">MTN MoMo</strong> ou <strong className="text-text-primary">Orange Money</strong> 🇨🇲
        </p>
      </div>

      {/* Current plan banner */}
      {userPlan === 'PREMIUM' && (
        <div className="card border-primary/40 bg-gradient-to-r from-primary/10 to-secondary/10 text-center py-6">
          <Crown className="w-10 h-10 text-primary mx-auto mb-2" />
          <h2 className="font-display text-xl font-bold text-text-primary">Vous êtes déjà Premium! 🎉</h2>
          <p className="text-text-secondary text-sm mt-1">Profitez de toutes les fonctionnalités illimitées</p>
        </div>
      )}

      {/* Plan selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`card text-left transition-all duration-200 relative ${
              selectedPlan === plan.id
                ? 'border-primary/60 bg-primary/5 shadow-glow-red'
                : 'hover:border-primary/30'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm font-medium">{plan.label}</span>
              {plan.savings && (
                <span className="badge-green text-xs">{plan.savings}</span>
              )}
            </div>
            <div className="font-display text-2xl font-bold text-text-primary">
              {formatXAF(plan.amount)}
            </div>
            <div className="text-text-muted text-xs mt-1">{plan.duration}</div>
            {selectedPlan === plan.id && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Ce qui est inclus dans Premium
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREMIUM_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <button
          onClick={handleSubscribe}
          disabled={loading || userPlan === 'PREMIUM'}
          className="btn-premium text-base py-4 px-10 flex items-center justify-center gap-2 mx-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirection vers le paiement...
            </>
          ) : userPlan === 'PREMIUM' ? (
            <>
              <Crown className="w-5 h-5" />
              Plan actuel — Premium
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              S&apos;abonner — {formatXAF(PLANS.find(p => p.id === selectedPlan)!.amount)}
            </>
          )}
        </button>

        <p className="text-text-muted text-xs">
          🔒 Paiement 100% sécurisé via Fapshi · MTN MoMo · Orange Money
        </p>
      </div>

      {/* Compare table */}
      <div className="card overflow-hidden">
        <h3 className="font-display font-semibold text-text-primary mb-4">Comparaison des plans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-2 text-text-secondary font-medium">Fonctionnalité</th>
                <th className="text-center py-2 text-text-secondary font-medium">Gratuit</th>
                <th className="text-center py-2 text-primary font-medium">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              {[
                ['Générations/jour', '5', '∞'],
                ['Types de contenu', '✓ Tous', '✓ Tous'],
                ['Historique', '7 jours', '∞ illimité'],
                ['Favoris', '✗', '✓'],
                ['Analyseur tendances', '✗', '✓'],
                ['Support prioritaire', '✗', '✓'],
              ].map(([feat, free, premium]) => (
                <tr key={feat}>
                  <td className="py-2.5 text-text-secondary">{feat}</td>
                  <td className="py-2.5 text-center text-text-muted">{free}</td>
                  <td className="py-2.5 text-center text-primary font-medium">{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
