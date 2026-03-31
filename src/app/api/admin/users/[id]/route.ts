// src/app/api/admin/users/[id]/route.ts
import { Plan, Prisma, Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isConfiguredAdminEmail } from '@/lib/admin'
import { getDailyQuotaForPlan } from '@/lib/utils'

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
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (payload.sub === params.id && data.role === 'USER') {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas retirer votre propre rôle admin.' }, { status: 400 })
    }

    if (isConfiguredAdminEmail(targetUser.email) && data.role === 'USER') {
      return NextResponse.json({ success: false, error: 'Cet admin est protégé par les variables d’environnement.' }, { status: 400 })
    }

    const updateData: Prisma.UserUpdateInput = {}

    if (typeof data.generationsLeft === 'number') {
      updateData.generationsLeft = data.generationsLeft
    }

    if (data.plan) {
      updateData.plan = data.plan === 'PREMIUM' ? Plan.PREMIUM : Plan.FREE
      updateData.generationsLeft =
        data.plan === 'PREMIUM' ? 9999 : getDailyQuotaForPlan('FREE')
    }

    if (data.role) {
      updateData.role = data.role === 'ADMIN' ? Role.ADMIN : Role.USER

      if (data.role === 'ADMIN') {
        updateData.plan = Plan.PREMIUM
        updateData.generationsLeft = 9999
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, plan: true, role: true, generationsLeft: true },
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

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (isConfiguredAdminEmail(targetUser.email)) {
      return NextResponse.json({ success: false, error: 'Cet admin est protégé par les variables d’environnement.' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Utilisateur supprimé' })
  } catch (err) {
    console.error('[ADMIN USER DELETE]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
