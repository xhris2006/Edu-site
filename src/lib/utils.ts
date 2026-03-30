// src/lib/utils.ts — Utility functions
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format date in French or English */
export function formatDate(date: string | Date, locale: 'fr' | 'en' = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CM' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Format currency in XAF */
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Get content type label */
export function getContentTypeLabel(type: string, lang: 'fr' | 'en' = 'fr'): string {
  const labels: Record<string, Record<string, string>> = {
    TIKTOK_CAPTION: { fr: 'Caption TikTok', en: 'TikTok Caption' },
    INSTAGRAM_CAPTION: { fr: 'Caption Instagram', en: 'Instagram Caption' },
    YOUTUBE_SCRIPT: { fr: 'Script YouTube', en: 'YouTube Script' },
    HASHTAGS: { fr: 'Hashtags', en: 'Hashtags' },
    CONTENT_IDEAS: { fr: 'Idées Contenu', en: 'Content Ideas' },
  }
  return labels[type]?.[lang] || type
}

/** Get platform icon emoji */
export function getPlatformEmoji(platform: string): string {
  const emojis: Record<string, string> = {
    tiktok: '🎵',
    instagram: '📸',
    youtube: '🎬',
    TIKTOK_CAPTION: '🎵',
    INSTAGRAM_CAPTION: '📸',
    YOUTUBE_SCRIPT: '🎬',
    HASHTAGS: '#️⃣',
    CONTENT_IDEAS: '💡',
  }
  return emojis[platform] || '✨'
}

/** Reset generations count if new day */
export function shouldResetGenerations(lastResetAt: Date): boolean {
  const now = new Date()
  const last = new Date(lastResetAt)
  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  )
}

/** Copy to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
