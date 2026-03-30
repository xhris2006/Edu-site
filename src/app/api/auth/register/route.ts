// src/app/api/auth/register/route.ts
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken, getAuthCookieOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
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
    const parsed = registerSchema.parse(body)
    const name = parsed.name.trim()
    const email = parsed.email.trim().toLowerCase()
    const { password, language } = parsed

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cet email est deja utilise' }, { status: 409 })
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

    return NextResponse.json(
      {
        success: true,
        data: { role: user.role, name: user.name },
      },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Donnees invalides: ' + err.errors[0].message },
        { status: 400 }
      )
    }
    if (err instanceof Prisma.PrismaClientInitializationError) {
      console.error('[REGISTER][PRISMA_INIT]', err)
      return NextResponse.json(
        { success: false, error: 'Connexion a la base de donnees impossible' },
        { status: 503 }
      )
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[REGISTER][PRISMA_KNOWN]', err)
      return NextResponse.json(
        { success: false, error: 'Base de donnees non prete pour l inscription' },
        { status: 503 }
      )
    }

    console.error('[REGISTER]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
