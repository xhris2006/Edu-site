'use client'

import { useMemo, useState } from 'react'
import { ArrowDownToLine, Download, Loader2, Link2, Sparkles, Video } from 'lucide-react'
import toast from 'react-hot-toast'

type DownloadResponse = {
  title?: string
  platform?: string
  downloadUrl: string
  filename?: string
  thumbnail?: string
}

const supportedPlatforms = [
  'TikTok',
  'Pinterest',
  'YouTube',
  'Instagram',
  'Facebook',
  'X / Twitter',
  'Snapchat',
  'Autres liens compatibles',
]

export default function DownloadsPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DownloadResponse | null>(null)

  const normalizedUrl = useMemo(() => url.trim(), [url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!normalizedUrl) {
      toast.error('Collez un lien vidéo avant de continuer.')
      return
    }

    setLoading(true)
    setData(null)

    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Téléchargement impossible')

      setData(payload.data)
      toast.success('Lien prêt au téléchargement.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Téléchargement impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <ArrowDownToLine className="h-6 w-6 text-primary" />
          Téléchargements sans filigrane
        </h1>
        <p className="page-subtitle">
          Collez un lien TikTok, Pinterest, YouTube, Instagram et d&apos;autres plateformes compatibles pour récupérer le média proprement.
        </p>
      </div>

      <div className="card border-primary/20 bg-primary/5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-text-primary">Plateformes prises en charge</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportedPlatforms.map(platform => (
            <span key={platform} className="rounded-full border border-card-border bg-dark px-3 py-1 text-xs text-text-secondary">
              {platform}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Lien de la vidéo</label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="url"
              className="input pl-11"
              placeholder="https://www.tiktok.com/@..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Préparation du lien...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Générer le lien de téléchargement
            </>
          )}
        </button>
      </form>

      {data && (
        <div className="card border border-primary/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Video className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                {data.platform || 'Média'}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
                {data.title || 'Téléchargement prêt'}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Ouvrez le lien ci-dessous pour télécharger la vidéo sans filigrane lorsque la plateforme le permet.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={data.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-center"
                >
                  Télécharger maintenant
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(data.downloadUrl)
                    toast.success('Lien copié.')
                  }}
                  className="btn-secondary"
                >
                  Copier le lien
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
