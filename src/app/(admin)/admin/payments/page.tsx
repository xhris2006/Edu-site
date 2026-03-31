'use client'

import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { formatDate, formatXAF } from '@/lib/utils'

interface PaymentItem {
  id: string
  amount: number
  status: string
  user: { name: string; email: string }
  createdAt: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) setPayments(data.data.recentPayments || [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Paiements
        </h1>
        <p className="page-subtitle">Suivi des paiements premium les plus recents.</p>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-text-muted">Chargement...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-text-muted">Aucun paiement disponible.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left">
                <th className="py-3 pr-4">Utilisateur</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Montant</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="py-3 pr-4 text-text-primary">{payment.user.name}</td>
                  <td className="py-3 pr-4 text-text-secondary">{payment.user.email}</td>
                  <td className="py-3 pr-4 text-text-primary">{formatXAF(payment.amount)}</td>
                  <td className="py-3 pr-4">{payment.status}</td>
                  <td className="py-3 text-xs text-text-muted">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
