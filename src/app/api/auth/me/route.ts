// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { shouldResetGenerations } from '@/lib/utils'

export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, name: true, email: true, role: true, plan: true,
        language: true, generationsLeft: true, lastResetAt: true, createdAt: true,
      },
    })
    if (!user) return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })

    // Reset daily quota if new day
    if (shouldResetGenerations(user.lastResetAt)) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { generationsLeft: user.plan === 'PREMIUM' ? 9999 : 5, lastResetAt: new Date() },
      })
      return NextResponse.json({ success: true, data: { ...user, generationsLeft: updated.generationsLeft } })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('[ME]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
