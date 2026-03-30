// src/app/api/history/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const generation = await prisma.generation.findFirst({
      where: { id: params.id, userId: payload.sub },
    })
    if (!generation) return NextResponse.json({ success: false, error: 'Introuvable' }, { status: 404 })

    await prisma.generation.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Supprimé' })
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
