'use client'
// src/app/(dashboard)/dashboard/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, History, Heart, TrendingUp, Zap, ArrowRight, Film, Instagram, Youtube, Hash, Lightbulb } from 'lucide-react'
import { formatDate, getContentTypeLabel, getPlatformEmoji, truncate } from '@/lib/utils'

interface DashboardData {
  user: { name: string; plan: string; generationsLeft: number }
  stats: { total: number; thisMonth: number; favorites: number }
  recent: Array<{ id: string; type: string; prompt: string; result: string; createdAt: string }>
  trends: Array<{ topic: string; platform: string; score: number }>
}

const quickActions = [
  { type: 'TIKTOK_CAPTION', label: 'TikTok', icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10', href: '/generate?type=TIKTOK_CAPTION' },
  { type: 'INSTAGRAM_CAPTION', label: 'Instagram', icon: Instagram, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/generate?type=INSTAGRAM_CAPTION' },
  { type: 'YOUTUBE_SCRIPT', label: 'YouTube', icon: Youtube, color: 'text-red-400', bg: 'bg-red-500/10', href: '/generate?type=YOUTUBE_SCRIPT' },
  { type: 'HASHTAGS', label: 'Hashtags', icon: Hash, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/generate?type=HASHTAGS' },
  { type: 'CONTENT_IDEAS', label: 'Idées', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/generate?type=CONTENT_IDEAS' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/history?page=1&perPage=5').then(r => r.json()),
      fetch('/api/trends').then(r => r.json()),
    ]).then(([userRes, historyRes, trendsRes]) => {
      setData({
        user: userRes.data,
        stats: {
          total: historyRes.data?.total || 0,
          thisMonth: historyRes.data?.thisMonth || 0,
          favorites: historyRes.data?.favorites || 0,
        },
        recent: historyRes.data?.data?.slice(0, 5) || [],
        trends: trendsRes.data?.slice(0, 5) || [],
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-card rounded-xl w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-card rounded-2xl" />)}
        </div>
        <div className="h-48 bg-card rounded-2xl" />
      </div>
    )
  }

  const user = data?.user

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Bonjour, <span className="text-primary">{user?.name?.split(' ')[0]} 👋</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">Prêt à créer du contenu viral?</p>
        </div>
        <Link href="/generate" className="btn-primary flex items-center gap-2 w-fit">
          <Sparkles className="w-4 h-4" />
          Générer du contenu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="badge-red text-xs">{user?.plan === 'PREMIUM' ? '⚡ Premium' : 'Gratuit'}</span>
          </div>
          <div className="stat-value">{data?.stats.total || 0}</div>
          <div className="stat-label">Générations totales</div>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mb-2">
            <History className="w-5 h-5 text-secondary-light" />
          </div>
          <div className="stat-value">{data?.stats.thisMonth || 0}</div>
          <div className="stat-label">Ce mois-ci</div>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-accent" />
          </div>
          <div className="stat-value">{data?.stats.favorites || 0}</div>
          <div className="stat-label">Favoris sauvegardés</div>
        </div>
      </div>

      {/* Free plan bar */}
      {user?.plan === 'FREE' && (
        <div className="card border-primary/20 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Générations aujourd&apos;hui</span>
                <span className="text-sm text-primary font-bold">{user.generationsLeft}/5</span>
              </div>
              <div className="w-full bg-dark rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(user.generationsLeft / 5) * 100}%` }}
                />
              </div>
            </div>
            <Link href="/pricing" className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap">
              <Zap className="w-4 h-4" />
              Passer Premium
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {quickActions.map(a => (
            <Link
              key={a.type}
              href={a.href}
              className="card-hover flex flex-col items-center gap-2 p-4 text-center"
            >
              <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <span className="text-text-secondary text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent generations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary">Activité récente</h2>
            <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data?.recent?.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm">Aucune génération pour l&apos;instant</p>
              <Link href="/generate" className="text-primary text-sm hover:underline mt-1 inline-block">
                Commencer →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recent?.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-dark-50 rounded-xl">
                  <span className="text-lg mt-0.5">{getPlatformEmoji(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary font-medium">{getContentTypeLabel(item.type)}</span>
                    </div>
                    <p className="text-text-secondary text-xs truncate">{truncate(item.prompt, 60)}</p>
                    <p className="text-text-muted text-xs mt-1">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending topics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary">🔥 Tendances en Afrique</h2>
            <Link href="/trends" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.trends?.map((trend, i) => (
              <div key={trend.topic} className="flex items-center gap-3">
                <span className="text-text-muted text-xs w-5 font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary text-sm font-medium">{trend.topic}</span>
                    <span className="text-primary text-xs font-bold">{trend.score}</span>
                  </div>
                  <div className="w-full bg-dark-50 rounded-full h-1">
                    <div
                      className="bg-primary rounded-full h-1"
                      style={{ width: `${trend.score}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  trend.platform === 'tiktok' ? 'bg-pink-500/20 text-pink-400' :
                  trend.platform === 'instagram' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {trend.platform}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
