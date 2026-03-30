'use client'
// src/app/(dashboard)/payment-success/page.tsx
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Crown, Sparkles, ArrowRight } from 'lucide-react'

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')
  const error = searchParams.get('error')

  const isSuccess = payment === 'success'

  return (
    <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
      {isSuccess ? (
        <>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
            Paiement réussi! 🎉
          </h1>
          <p className="text-text-secondary mb-2">
            Bienvenue dans le clan <span className="text-primary font-semibold">Premium</span>!
          </p>
          <p className="text-text-muted text-sm mb-8">
            Vous avez maintenant accès aux générations illimitées et toutes les fonctionnalités.
          </p>
          <div className="card border-primary/30 mb-6 py-4">
            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-primary font-semibold">⚡ Plan Premium activé</p>
            <p className="text-text-muted text-xs mt-1">Générations illimitées débloquées</p>
          </div>
          <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Commencer à créer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
            Paiement échoué
          </h1>
          <p className="text-text-secondary mb-2">
            Une erreur est survenue lors du traitement de votre paiement.
          </p>
          <p className="text-text-muted text-sm mb-8">
            Veuillez réessayer ou contacter le support si le problème persiste.
            {error && <span className="block mt-1 text-red-400">Code: {error}</span>}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing" className="btn-primary">
              Réessayer
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Retour au dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
