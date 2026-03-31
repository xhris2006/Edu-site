'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

const SESSION_KEY = 'creatorzap_show_whatsapp_popup'
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vark1I1AYlUR1G8YMX31'

export function markWhatsAppPopupForNextAuthRedirect() {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SESSION_KEY, '1')
}

export default function WhatsAppChannelPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const shouldOpen = window.sessionStorage.getItem(SESSION_KEY) === '1'
    if (!shouldOpen) return

    window.sessionStorage.removeItem(SESSION_KEY)
    setOpen(true)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-primary/20 bg-dark-100 p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition hover:bg-card hover:text-text-primary"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
          <MessageCircle className="h-6 w-6" />
        </div>

        <h2 className="font-display text-2xl font-bold text-text-primary">
          Rejoignez notre chaîne WhatsApp
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Suivez la chaîne <span className="font-semibold text-text-primary">XD-TECH🤖🎗️</span> pour recevoir les nouveautés,
          astuces et annonces importantes de CreatorZap.
        </p>

        <div className="mt-6 flex gap-3">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex-1 text-center"
          >
            Suivre la chaîne
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary flex-1"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
