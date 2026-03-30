// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateContent, canGenerate } from '@/lib/ai'
import { shouldResetGenerations } from '@/lib/utils'

const generateSchema = z.object({
  type: z.enum(['TIKTOK_CAPTION', 'INSTAGRAM_CAPTION', 'YOUTUBE_SCRIPT', 'HASHTAGS', 'CONTENT_IDEAS']),
  prompt: z.string().min(3).max(500),
  language: z.enum(['fr', 'en']).default('fr'),
  tone: z.string().optional(),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await req.json()
    const { type, prompt, language, tone, platform } = generateSchema.parse(body)

    // Get fresh user data
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })

    // Reset daily quota if needed
    let generationsLeft = user.generationsLeft
    if (shouldResetGenerations(user.lastResetAt)) {
      generationsLeft = user.plan === 'PREMIUM' ? 9999 : 5
      await prisma.user.update({
        where: { id: user.id },
        data: { generationsLeft, lastResetAt: new Date() },
      })
    }

    // Check plan limits
    if (!canGenerate(generationsLeft, user.plan)) {
      return NextResponse.json({
        success: false,
        error: language === 'fr'
          ? 'Limite de générations atteinte. Passez au Premium pour continuer!'
          : 'Generation limit reached. Upgrade to Premium!',
      }, { status: 403 })
    }

    // Call AI
    const result = await generateContent({ type, prompt, language, tone, platform })

    // Save to DB and decrement counter
    const [generation] = await prisma.$transaction([
      prisma.generation.create({
        data: {
          userId: user.id,
          type,
          prompt,
          result,
          language,
          platform: platform || null,
        },
      }),
      ...(user.plan !== 'PREMIUM' ? [
        prisma.user.update({
          where: { id: user.id },
          data: { generationsLeft: { decrement: 1 } },
        })
      ] : []),
    ])

    return NextResponse.json({
      success: true,
      data: {
        id: generation.id,
        result,
        generationsLeft: user.plan === 'PREMIUM' ? 9999 : generationsLeft - 1,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides: ' + err.errors[0].message }, { status: 400 })
    }
    console.error('[GENERATE]', err)
    const message = err instanceof Error ? err.message : 'Erreur de génération'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
