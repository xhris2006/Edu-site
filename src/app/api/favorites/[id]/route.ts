// src/app/api/favorites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST — add specific generation to favorites
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const generationId = params.id

    // Verify ownership
    const gen = await prisma.generation.findFirst({ where: { id: generationId, userId: payload.sub } })
    if (!gen) return NextResponse.json({ success: false, error: 'Génération introuvable' }, { status: 404 })

    const favorite = await prisma.favorite.upsert({
      where: { userId_generationId: { userId: payload.sub, generationId } },
      update: {},
      create: { userId: payload.sub, generationId },
    })
    await prisma.generation.update({ where: { id: generationId }, data: { isFavorite: true } })

    return NextResponse.json({ success: true, data: favorite })
  } catch (err) {
    console.error('[FAV POST ID]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE — remove from favorites
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const generationId = params.id

    await prisma.favorite.deleteMany({
      where: { userId: payload.sub, generationId },
    })
    await prisma.generation.update({ where: { id: generationId }, data: { isFavorite: false } })

    return NextResponse.json({ success: true, message: 'Retiré des favoris' })
  } catch (err) {
    console.error('[FAV DELETE]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
