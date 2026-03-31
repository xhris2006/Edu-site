'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

interface TrendItem {
  id: string
  topic: string
  platform: string
  score: number
  language: string
  region: string
}

export default function AdminTrendsPage() {
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trends')
      .then(r => r.json())
      .then(data => setTrends(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Tendances
        </h1>
        <p className="page-subtitle">Vue admin des tendances disponibles pour les generateurs.</p>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-text-muted">Chargement...</p>
        ) : trends.length === 0 ? (
          <p className="text-sm text-text-muted">Aucune tendance disponible.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left">
                <th className="py-3 pr-4">Sujet</th>
                <th className="py-3 pr-4">Plateforme</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Langue</th>
                <th className="py-3">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {trends.map(trend => (
                <tr key={trend.id}>
                  <td className="py-3 pr-4 text-text-primary">{trend.topic}</td>
                  <td className="py-3 pr-4 text-text-secondary">{trend.platform}</td>
                  <td className="py-3 pr-4 text-primary">{trend.score}</td>
                  <td className="py-3 pr-4 text-text-secondary">{trend.language}</td>
                  <td className="py-3 text-text-secondary">{trend.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
