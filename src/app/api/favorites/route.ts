// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET all favorites
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const favorites = await prisma.favorite.findMany({
      where: { userId: payload.sub },
      include: { generation: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: favorites })
  } catch (err) {
    console.error('[FAVORITES GET]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST — add a generation to favorites (also saves a new generation if needed)
export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await req.json()
    const { generationId, prompt, result, type, language } = body

    let gId = generationId

    // If no generationId, create a new generation entry first
    if (!gId && prompt && result && type) {
      const gen = await prisma.generation.create({
        data: {
          userId: payload.sub,
          type,
          prompt,
          result,
          language: language || 'fr',
          isFavorite: true,
        },
      })
      gId = gen.id
    }

    if (!gId) {
      return NextResponse.json({ success: false, error: 'generationId requis' }, { status: 400 })
    }

    // Upsert favorite
    const favorite = await prisma.favorite.upsert({
      where: { userId_generationId: { userId: payload.sub, generationId: gId } },
      update: {},
      create: { userId: payload.sub, generationId: gId },
    })

    // Mark generation as favorite
    await prisma.generation.update({ where: { id: gId }, data: { isFavorite: true } })

    return NextResponse.json({ success: true, data: favorite }, { status: 201 })
  } catch (err) {
    console.error('[FAVORITES POST]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
