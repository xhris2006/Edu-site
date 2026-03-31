import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { AIProviderError, canGenerate, generateContent } from '@/lib/ai'
import { FREE_DAILY_QUOTA, getDailyQuotaForPlan, getGenerationsUsedToday, shouldResetGenerations } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Non authentifie' }, { status: 401 })
    }

    const body = await req.json()
    const { type, prompt, language, tone, platform } = generateSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })
    }

    let generationsLeft = user.generationsLeft
    if (shouldResetGenerations(user.lastResetAt)) {
      generationsLeft = getDailyQuotaForPlan(user.plan)
      await prisma.user.update({
        where: { id: user.id },
        data: { generationsLeft, lastResetAt: new Date() },
      })
    }

    if (!canGenerate(generationsLeft, user.plan)) {
      return NextResponse.json({
        success: false,
        error: language === 'fr'
          ? 'Limite de generations atteinte. Passez au Premium pour continuer.'
          : 'Generation limit reached. Upgrade to Premium.',
      }, { status: 403 })
    }

    const result = await generateContent({ type, prompt, language, tone, platform })

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
      ...(user.plan !== 'PREMIUM'
        ? [
            prisma.user.update({
              where: { id: user.id },
              data: { generationsLeft: { decrement: 1 } },
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      success: true,
      data: {
        id: generation.id,
        result,
        generationsLeft: user.plan === 'PREMIUM' ? getDailyQuotaForPlan(user.plan) : generationsLeft - 1,
        generationsUsed: user.plan === 'PREMIUM' ? 0 : getGenerationsUsedToday(generationsLeft - 1, user.plan),
        generationsLimit: user.plan === 'PREMIUM' ? null : FREE_DAILY_QUOTA,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Donnees invalides: ' + err.errors[0].message },
        { status: 400 }
      )
    }

    if (err instanceof AIProviderError) {
      return NextResponse.json(
        { success: false, error: err.message, code: err.code },
        { status: err.status }
      )
    }

    console.error('[GENERATE]', err)
    const message = err instanceof Error ? err.message : 'Erreur de generation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
