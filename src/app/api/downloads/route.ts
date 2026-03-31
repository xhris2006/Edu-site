import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  url: z.string().url(),
})

function getProviderUrl() {
  return process.env.DOWNLOAD_PROVIDER_URL || 'https://api.cobalt.tools/api/json'
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { url } = schema.parse(body)

    const providerResponse = await fetch(getProviderUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(process.env.DOWNLOAD_PROVIDER_TOKEN
          ? { Authorization: `Bearer ${process.env.DOWNLOAD_PROVIDER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        url,
        filenamePattern: 'basic',
        disableMetadata: false,
      }),
      cache: 'no-store',
    })

    const payload = await providerResponse.json().catch(() => null)

    if (!providerResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            payload?.text ||
            payload?.error?.message ||
            'Le service de téléchargement a refusé ce lien.',
        },
        { status: providerResponse.status }
      )
    }

    const pickerItem = Array.isArray(payload?.picker)
      ? payload.picker.find((item: { type?: string }) => item.type !== 'audio') || payload.picker[0]
      : null

    const downloadUrl = payload?.url || payload?.downloadUrl || pickerItem?.url

    if (!downloadUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun lien de téléchargement direct n’a été retourné par le fournisseur.',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        title: payload?.title || payload?.filename || 'Téléchargement prêt',
        platform: payload?.service || payload?.provider || payload?.host || 'Plateforme détectée',
        downloadUrl,
        filename: payload?.filename || pickerItem?.filename || null,
        thumbnail: payload?.thumbnail || pickerItem?.thumb || null,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Lien invalide.' }, { status: 400 })
    }

    console.error('[DOWNLOADS]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de préparer ce téléchargement pour le moment.',
      },
      { status: 500 }
    )
  }
}
