// src/app/api/auth/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  language: z.enum(['fr', 'en']).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await req.json()
    const data = updateSchema.parse(body)

    const user = await prisma.user.update({ where: { id: payload.sub }, data })
    return NextResponse.json({ success: true, data: { name: user.name, language: user.language } })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
