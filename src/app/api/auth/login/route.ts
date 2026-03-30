// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { signToken, getAuthCookieOptions } from '@/lib/auth'
import { shouldResetGenerations } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Reset daily generations if new day
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
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('[LOGIN]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
