'use client'
// src/app/(dashboard)/trends/page.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, Flame, BarChart2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Trend {
  id: string
  topic: string
  platform: string
  score: number
  language: string
  region: string
  createdAt: string
}

const PLATFORM_FILTERS = [
  { id: 'all', label: 'Toutes', emoji: '🌍' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'youtube', label: 'YouTube', emoji: '🎬' },
]

const platformStyle: Record<string, string> = {
  tiktok: 'bg-pink-500/20 text-pink-400',
  instagram: 'bg-purple-500/20 text-purple-400',
  youtube: 'bg-red-500/20 text-red-400',
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchTrends = async () => {
    setLoading(true)
    try {
      const params = platform !== 'all' ? `?platform=${platform}` : ''
      const res = await fetch(`/api/trends${params}`)
      const data = await res.json()
      if (data.success) setTrends(data.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchTrends() }, [platform])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTrends()
  }

  const topTrend = trends[0]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Analyseur de Tendances
          </h1>
          <p className="page-subtitle">Ce qui buzze en Afrique 🌍</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Top trend spotlight */}
      {topTrend && !loading && (
        <div className="card border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-semibold">Trending #1</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">{topTrend.topic}</h2>
            <div className="flex items-center gap-3">
              <span className={`badge ${platformStyle[topTrend.platform] || 'bg-gray-500/20 text-gray-400'}`}>
                {topTrend.platform}
              </span>
              <div className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-sm">Score: {topTrend.score}</span>
              </div>
              <span className="text-xs text-text-muted">{topTrend.region}</span>
            </div>
            <Link
              href={`/generate?prompt=${encodeURIComponent(topTrend.topic)}`}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm py-2 px-4"
            >
              ✨ Créer du contenu sur ce trend
            </Link>
          </div>
        </div>
      )}

      {/* Platform filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {PLATFORM_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setPlatform(f.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              platform === f.id
                ? 'bg-primary text-white shadow-glow-red'
                : 'bg-card border border-card-border text-text-secondary hover:border-primary/30'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Trends list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-card rounded-2xl shimmer" />)}
        </div>
      ) : trends.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Aucune tendance disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trends.map((trend, i) => (
            <div key={trend.id} className="card-hover flex items-center gap-4">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${
                i === 0 ? 'bg-primary text-white' :
                i === 1 ? 'bg-secondary/20 text-secondary-light' :
                i === 2 ? 'bg-accent/20 text-accent' :
                'bg-dark-50 text-text-muted'
              }`}>
                {i + 1}
              </div>

              {/* Topic + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-primary font-medium text-sm">{trend.topic}</span>
                  <span className="text-primary text-xs font-bold ml-2">{trend.score}</span>
                </div>
                <div className="w-full bg-dark-50 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      i === 0 ? 'bg-primary' :
                      i === 1 ? 'bg-secondary-light' :
                      'bg-text-muted'
                    }`}
                    style={{ width: `${trend.score}%` }}
                  />
                </div>
              </div>

              {/* Platform + region */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge text-xs ${platformStyle[trend.platform] || 'bg-gray-500/20 text-gray-400'}`}>
                  {trend.platform}
                </span>
                <span className="text-xs text-text-muted">{trend.region}</span>
              </div>

              {/* Use button */}
              <Link
                href={`/generate?prompt=${encodeURIComponent(trend.topic)}`}
                className="text-xs text-primary hover:underline whitespace-nowrap flex-shrink-0"
              >
                Utiliser →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="text-center py-4">
        <p className="text-text-muted text-xs">
          📊 Données basées sur les tendances africaines (CM, CI, SN) — mise à jour quotidienne
        </p>
      </div>
    </div>
  )
}
