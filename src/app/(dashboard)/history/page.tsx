'use client'
// src/app/(dashboard)/history/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { History, Search, Trash2, Heart, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, getContentTypeLabel, getPlatformEmoji, truncate, copyToClipboard } from '@/lib/utils'

interface Generation {
  id: string
  type: string
  prompt: string
  result: string
  language: string
  isFavorite: boolean
  createdAt: string
}

const FILTERS = [
  { id: 'ALL', label: 'Tout' },
  { id: 'TIKTOK_CAPTION', label: 'TikTok' },
  { id: 'INSTAGRAM_CAPTION', label: 'Instagram' },
  { id: 'YOUTUBE_SCRIPT', label: 'YouTube' },
  { id: 'HASHTAGS', label: 'Hashtags' },
  { id: 'CONTENT_IDEAS', label: 'Idées' },
]

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '10',
        ...(filter !== 'ALL' && { type: filter }),
        ...(search && { search }),
      })
      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()
      if (data.success) {
        setGenerations(data.data.data)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method: current ? 'DELETE' : 'POST',
      })
      if (res.ok) {
        setGenerations(prev => prev.map(g => g.id === id ? { ...g, isFavorite: !current } : g))
        toast.success(current ? 'Retiré des favoris' : '❤️ Ajouté aux favoris')
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette génération?')) return
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setGenerations(prev => prev.filter(g => g.id !== id))
        toast.success('Supprimé')
      }
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Historique
        </h1>
        <p className="page-subtitle">Toutes vos générations passées</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-9 text-sm"
            placeholder="Rechercher..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-card-border text-text-secondary hover:border-primary/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-card rounded-2xl shimmer" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="card text-center py-16">
          <History className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Aucune génération trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map(gen => (
            <div key={gen.id} className="card hover:border-card-hover transition-all">
              {/* Item header */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
              >
                <span className="text-xl mt-0.5">{getPlatformEmoji(gen.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge-red text-xs">{getContentTypeLabel(gen.type)}</span>
                    <span className="text-xs text-text-muted">{formatDate(gen.createdAt)}</span>
                    {gen.language === 'fr' ? <span className="text-xs text-text-muted">🇫🇷</span> : <span className="text-xs text-text-muted">🇬🇧</span>}
                  </div>
                  <p className="text-text-secondary text-sm">{truncate(gen.prompt, 80)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleFavorite(gen.id, gen.isFavorite) }}
                    className={`p-2 rounded-lg transition-all ${gen.isFavorite ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary hover:bg-primary/10'}`}
                  >
                    <Heart className={`w-4 h-4 ${gen.isFavorite ? 'fill-primary' : ''}`} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); copyToClipboard(gen.result); toast.success('Copié!') }}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(gen.id) }}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded result */}
              {expandedId === gen.id && (
                <div className="mt-3 p-3 bg-dark-50 rounded-xl animate-slide-down">
                  <pre className="text-text-secondary text-xs whitespace-pre-wrap font-sans leading-relaxed">
                    {gen.result}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-text-secondary text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary py-2 px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
