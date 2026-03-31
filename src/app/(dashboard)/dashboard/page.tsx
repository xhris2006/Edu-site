'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  History,
  Heart,
  Zap,
  ArrowRight,
  Film,
  Instagram,
  Youtube,
  Hash,
  Lightbulb,
  ArrowDownToLine,
} from 'lucide-react'
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
  { type: 'CONTENT_IDEAS', label: 'Idees', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/generate?type=CONTENT_IDEAS' },
  { type: 'DOWNLOADS', label: 'Downloads', icon: ArrowDownToLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/downloads' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/history?page=1&perPage=5').then(r => r.json()),
      fetch('/api/trends').then(r => r.json()),
    ])
      .then(([userRes, historyRes, trendsRes]) => {
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
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-xl bg-card" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-card" />)}
        </div>
        <div className="h-48 rounded-2xl bg-card" />
      </div>
    )
  }

  const user = data?.user
  const usedToday = user ? 5 - user.generationsLeft : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Bonjour, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Pret a creer du contenu viral ?</p>
        </div>
        <Link href="/generate" className="btn-primary flex w-fit items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generer du contenu
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="badge-red text-xs">{user?.plan === 'PREMIUM' ? 'Premium' : 'Gratuit'}</span>
          </div>
          <div className="stat-value">{data?.stats.total || 0}</div>
          <div className="stat-label">Generations totales</div>
        </div>

        <div className="stat-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <History className="h-5 w-5 text-secondary-light" />
          </div>
          <div className="stat-value">{data?.stats.thisMonth || 0}</div>
          <div className="stat-label">Ce mois-ci</div>
        </div>

        <div className="stat-card">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Heart className="h-5 w-5 text-accent" />
          </div>
          <div className="stat-value">{data?.stats.favorites || 0}</div>
          <div className="stat-label">Favoris sauvegardes</div>
        </div>
      </div>

      {user?.plan === 'FREE' && (
        <div className="card border-primary/20 bg-primary/5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Quota du jour</span>
                <span className="text-sm font-bold text-primary">{usedToday}/5 utilise</span>
              </div>
              <div className="h-2 w-full rounded-full bg-dark">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(usedToday / 5) * 100}%` }}
                />
              </div>
            </div>
            <Link href="/pricing" className="btn-primary flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
              <Zap className="h-4 w-4" />
              Passer Premium
            </Link>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">Acces rapide</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(action => (
            <Link
              key={action.type}
              href={action.href}
              className="card-hover flex flex-col items-center gap-2 p-4 text-center"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-text-secondary">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-text-primary">Activite recente</h2>
            <Link href="/history" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data?.recent?.length === 0 ? (
            <div className="py-8 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-muted">Aucune generation pour le moment</p>
              <Link href="/generate" className="mt-1 inline-block text-sm text-primary hover:underline">
                Commencer -
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recent?.map(item => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl bg-dark-50 p-3">
                  <span className="mt-0.5 text-lg">{getPlatformEmoji(item.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">{getContentTypeLabel(item.type)}</span>
                    </div>
                    <p className="truncate text-xs text-text-secondary">{truncate(item.prompt, 60)}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-text-primary">Tendances en Afrique</h2>
            <Link href="/trends" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.trends?.map((trend, index) => (
              <div key={trend.topic} className="flex items-center gap-3">
                <span className="w-5 text-xs font-mono text-text-muted">{index + 1}</span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{trend.topic}</span>
                    <span className="text-xs font-bold text-primary">{trend.score}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-dark-50">
                    <div className="h-1 rounded-full bg-primary" style={{ width: `${trend.score}%` }} />
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
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
