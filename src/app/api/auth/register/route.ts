// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { signToken, getAuthCookieOptions } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, language } = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, language },
    })

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
      data: { role: user.role, name: user.name },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides: ' + err.errors[0].message }, { status: 400 })
    }
    console.error('[REGISTER]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
