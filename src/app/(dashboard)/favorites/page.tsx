'use client'
// src/app/(dashboard)/favorites/page.tsx
import { useState, useEffect } from 'react'
import { Heart, Copy, Trash2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate, getContentTypeLabel, getPlatformEmoji, truncate, copyToClipboard } from '@/lib/utils'

interface Favorite {
  id: string
  generationId: string
  createdAt: string
  generation: {
    id: string
    type: string
    prompt: string
    result: string
    language: string
    createdAt: string
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/favorites')
      .then(r => r.json())
      .then(d => d.success && setFavorites(d.data))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (favoriteId: string, generationId: string) => {
    try {
      const res = await fetch(`/api/favorites/${generationId}`, { method: 'DELETE' })
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.id !== favoriteId))
        toast.success('Retiré des favoris')
      }
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" fill="currentColor" />
          Favoris
        </h1>
        <p className="page-subtitle">Vos contenus sauvegardés</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-card rounded-2xl shimmer" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="card text-center py-16">
          <Heart className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-4">Aucun favori pour l&apos;instant</p>
          <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Générer du contenu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map(fav => (
            <div key={fav.id} className="card-hover group">
              {/* Header */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === fav.id ? null : fav.id)}
              >
                <span className="text-2xl">{getPlatformEmoji(fav.generation.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-red text-xs">{getContentTypeLabel(fav.generation.type)}</span>
                    <span className={`text-xs ${fav.generation.language === 'fr' ? 'text-text-muted' : 'text-text-muted'}`}>
                      {fav.generation.language === 'fr' ? '🇫🇷' : '🇬🇧'}
                    </span>
                  </div>
                  <p className="text-text-primary text-sm font-medium">
                    {truncate(fav.generation.prompt, 60)}
                  </p>
                  <p className="text-text-muted text-xs mt-1">{formatDate(fav.generation.createdAt)}</p>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === fav.id && (
                <div className="mt-3 p-3 bg-dark-50 rounded-xl animate-slide-down">
                  <pre className="text-text-secondary text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {fav.generation.result}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { copyToClipboard(fav.generation.result); toast.success('Copié!') }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-50 hover:bg-card-hover rounded-lg text-xs text-text-secondary hover:text-text-primary transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </button>
                <button
                  onClick={() => handleRemove(fav.id, fav.generation.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-dark-50 hover:bg-red-500/10 rounded-lg text-xs text-text-muted hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
