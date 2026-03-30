'use client'
// src/app/(dashboard)/generate/page.tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles, Film, Instagram, Youtube, Hash, Lightbulb,
  Copy, Heart, Loader2, ChevronDown, Zap, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { copyToClipboard } from '@/lib/utils'

type ContentType = 'TIKTOK_CAPTION' | 'INSTAGRAM_CAPTION' | 'YOUTUBE_SCRIPT' | 'HASHTAGS' | 'CONTENT_IDEAS'
type Language = 'fr' | 'en'

const CONTENT_TYPES = [
  { id: 'TIKTOK_CAPTION' as ContentType, label: 'TikTok Caption', icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'INSTAGRAM_CAPTION' as ContentType, label: 'Instagram Caption', icon: Instagram, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'YOUTUBE_SCRIPT' as ContentType, label: 'YouTube Script', icon: Youtube, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { id: 'HASHTAGS' as ContentType, label: 'Hashtags', icon: Hash, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'CONTENT_IDEAS' as ContentType, label: 'Idées de Contenu', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
]

const TONES = [
  { id: 'funny', fr: '😄 Drôle', en: '😄 Funny' },
  { id: 'serious', fr: '🎯 Sérieux', en: '🎯 Serious' },
  { id: 'inspirational', fr: '✨ Inspirant', en: '✨ Inspirational' },
  { id: 'educational', fr: '📚 Éducatif', en: '📚 Educational' },
  { id: 'promotional', fr: '🚀 Promo', en: '🚀 Promotional' },
]

const EXAMPLE_PROMPTS: Record<ContentType, Record<Language, string>> = {
  TIKTOK_CAPTION: {
    fr: 'Recette de ndolé camerounais facile à préparer chez soi',
    en: 'Easy homemade Cameroonian ndolé recipe for beginners',
  },
  INSTAGRAM_CAPTION: {
    fr: 'Coucher de soleil magnifique à Kribi, plage paradisiaque',
    en: 'Beautiful sunset in Kribi, paradise beach in Cameroon',
  },
  YOUTUBE_SCRIPT: {
    fr: 'Comment créer une entreprise au Cameroun avec 0 FCFA de capital',
    en: 'How to start a business in Africa with zero capital',
  },
  HASHTAGS: {
    fr: 'Mode africaine, tenues traditionnelles camerounaises tendance',
    en: 'African fashion, trendy Cameroonian traditional outfits',
  },
  CONTENT_IDEAS: {
    fr: 'Entrepreneur africain qui vend des produits locaux en ligne',
    en: 'African entrepreneur selling local products online',
  },
}

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as ContentType) || 'TIKTOK_CAPTION'

  const [selectedType, setSelectedType] = useState<ContentType>(initialType)
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('funny')
  const [language, setLanguage] = useState<Language>('fr')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [generationsLeft, setGenerationsLeft] = useState(5)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success) {
        setUserPlan(d.data.plan)
        setGenerationsLeft(d.data.generationsLeft)
        setLanguage(d.data.language || 'fr')
      }
    })
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(language === 'fr' ? 'Décrivez votre contenu d\'abord' : 'Describe your content first')
      return
    }
    if (userPlan === 'FREE' && generationsLeft <= 0) {
      toast.error(language === 'fr' ? 'Limite atteinte. Passez au Premium!' : 'Limit reached. Upgrade to Premium!')
      return
    }

    setLoading(true)
    setResult('')
    setSaved(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, prompt, tone, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.data.result)
      setGenerationsLeft(prev => Math.max(0, prev - 1))
      toast.success(language === 'fr' ? 'Contenu généré! 🎉' : 'Content generated! 🎉')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de génération')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(result)
    if (ok) toast.success(language === 'fr' ? 'Copié! ✓' : 'Copied! ✓')
  }

  const handleSaveFavorite = async () => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, result, type: selectedType, language }),
      })
      if (res.ok) {
        setSaved(true)
        toast.success(language === 'fr' ? 'Sauvegardé en favoris! ❤️' : 'Saved to favorites! ❤️')
      }
    } catch {
      toast.error('Erreur de sauvegarde')
    }
  }

  const selectedTypeInfo = CONTENT_TYPES.find(t => t.id === selectedType)!

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          {language === 'fr' ? 'Générer du Contenu' : 'Generate Content'}
        </h1>
        <p className="page-subtitle">
          {language === 'fr' ? 'Créez du contenu viral en quelques secondes' : 'Create viral content in seconds'}
        </p>
      </div>

      {/* Free plan warning */}
      {userPlan === 'FREE' && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">
              {language === 'fr'
                ? `${generationsLeft} génération(s) restante(s) aujourd'hui`
                : `${generationsLeft} generation(s) left today`}
            </span>
          </div>
          <a href="/pricing" className="text-xs text-primary font-semibold hover:underline">
            {language === 'fr' ? 'Passer Premium →' : 'Upgrade →'}
          </a>
        </div>
      )}

      {/* Content type selector */}
      <div>
        <label className="label">{language === 'fr' ? 'Type de contenu' : 'Content type'}</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CONTENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                selectedType === type.id
                  ? `${type.bg} ${type.border} shadow-md`
                  : 'border-card-border hover:border-card-hover bg-card hover:bg-card-hover'
              }`}
            >
              <div className={`w-8 h-8 ${selectedType === type.id ? type.bg : 'bg-dark-50'} rounded-lg flex items-center justify-center`}>
                <type.icon className={`w-4 h-4 ${type.color}`} />
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${selectedType === type.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt + settings */}
      <div className="card space-y-4">
        {/* Prompt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">
              {language === 'fr' ? 'Décrivez votre contenu' : 'Describe your content'}
            </label>
            <button
              onClick={() => setPrompt(EXAMPLE_PROMPTS[selectedType][language])}
              className="text-xs text-primary hover:underline"
            >
              {language === 'fr' ? 'Exemple →' : 'Example →'}
            </button>
          </div>
          <textarea
            className="textarea"
            rows={4}
            placeholder={EXAMPLE_PROMPTS[selectedType][language]}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tone */}
          <div>
            <label className="label">{language === 'fr' ? 'Ton' : 'Tone'}</label>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                {TONES.map(t => (
                  <option key={t.id} value={t.id}>{language === 'fr' ? t.fr : t.en}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="label">{language === 'fr' ? 'Langue' : 'Language'}</label>
            <div className="relative">
              <select
                className="input appearance-none pr-8"
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || (userPlan === 'FREE' && generationsLeft <= 0)}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === 'fr' ? 'Génération en cours...' : 'Generating...'}
            </>
          ) : userPlan === 'FREE' && generationsLeft <= 0 ? (
            <>
              <Lock className="w-5 h-5" />
              {language === 'fr' ? 'Limite atteinte — Passer Premium' : 'Limit reached — Upgrade'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {language === 'fr' ? 'Générer' : 'Generate'}
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`card border ${selectedTypeInfo.border} animate-slide-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${selectedTypeInfo.bg} rounded-lg flex items-center justify-center`}>
                <selectedTypeInfo.icon className={`w-4 h-4 ${selectedTypeInfo.color}`} />
              </div>
              <span className="font-display font-semibold text-text-primary text-sm">{selectedTypeInfo.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveFavorite}
                disabled={saved}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  saved
                    ? 'bg-primary/20 text-primary'
                    : 'bg-card-hover text-text-secondary hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-primary' : ''}`} />
                {saved ? (language === 'fr' ? 'Sauvegardé' : 'Saved') : (language === 'fr' ? 'Sauvegarder' : 'Save')}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card-hover hover:bg-primary/10 hover:text-primary rounded-lg text-xs font-medium text-text-secondary transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                {language === 'fr' ? 'Copier' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-dark-50 rounded-xl p-4">
            <pre className="text-text-primary text-sm whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
          </div>

          {/* Regenerate */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary w-full mt-4 text-sm"
          >
            🔄 {language === 'fr' ? 'Régénérer' : 'Regenerate'}
          </button>
        </div>
      )}
    </div>
  )
}
