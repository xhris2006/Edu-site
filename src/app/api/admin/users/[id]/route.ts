// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  plan: z.enum(['FREE', 'PREMIUM']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  generationsLeft: z.number().int().min(0).optional(),
})

// PATCH — update user (plan, role, etc.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUser()
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    // If upgrading to premium, give unlimited generations
    const updateData = {
      ...data,
      ...(data.plan === 'PREMIUM' && { generationsLeft: 9999 }),
      ...(data.plan === 'FREE' && { generationsLeft: 5 }),
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, plan: true, role: true, generationsLeft: true },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('[ADMIN USER PATCH]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE — delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUser()
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    // Prevent deleting yourself
    if (params.id === payload.sub) {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas vous supprimer' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Utilisateur supprimé' })
  } catch (err) {
    console.error('[ADMIN USER DELETE]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
