// src/app/api/auth/login/route.ts
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken, getAuthCookieOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { shouldResetGenerations } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'DATABASE_URL is not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const parsed = loginSchema.parse(body)
    const email = parsed.email.trim().toLowerCase()
    const { password } = parsed

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    if (shouldResetGenerations(user.lastResetAt)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { generationsLeft: user.plan === 'PREMIUM' ? 9999 : 5, lastResetAt: new Date() },
      })
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      name: user.name,
    })

    const opts = getAuthCookieOptions()
    cookies().set(opts.name, token, opts)

    return NextResponse.json({
      success: true,
      data: { role: user.role, name: user.name, plan: user.plan },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Donnees invalides' }, { status: 400 })
    }
    if (err instanceof Prisma.PrismaClientInitializationError) {
      console.error('[LOGIN][PRISMA_INIT]', err)
      return NextResponse.json(
        { success: false, error: 'Connexion a la base de donnees impossible' },
        { status: 503 }
      )
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[LOGIN][PRISMA_KNOWN]', err)

      if (err.code === 'P2021') {
        return NextResponse.json(
          { success: false, error: 'Schema base de donnees manquant en production. Lance prisma db push sur DATABASE_URL.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Base de donnees non prete pour la connexion' },
        { status: 503 }
      )
    }

    console.error('[LOGIN]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
