// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { initiateFapshiPayment, PREMIUM_PLANS } from '@/lib/fapshi'

const initiateSchema = z.object({
  planId: z.enum(['monthly', 'quarterly', 'yearly']),
  amount: z.number().positive(),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await req.json()
    const { planId, amount } = initiateSchema.parse(body)

    const plan = PREMIUM_PLANS[planId]
    if (!plan || plan.amount !== amount) {
      return NextResponse.json({ success: false, error: 'Plan ou montant invalide' }, { status: 400 })
    }

    // Get user email
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return NextResponse.json({ success: false, error: 'Utilisateur introuvable' }, { status: 404 })

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.amount,
        currency: 'XAF',
        status: 'PENDING',
        plan: 'PREMIUM',
        expiresAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      },
    })

    // Initiate Fapshi payment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { link, transId } = await initiateFapshiPayment({
      amount: plan.amount,
      email: user.email,
      redirectUrl: `${baseUrl}/api/payments/verify?paymentId=${payment.id}`,
      userId: user.id,
      message: `CreatorZap Premium — ${plan.label}`,
      externalId: payment.id,
    })

    // Save Fapshi transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { fapshiTransId: transId },
    })

    return NextResponse.json({
      success: true,
      data: { paymentUrl: link, transId, paymentId: payment.id },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('[PAYMENT INITIATE]', err)
    const message = err instanceof Error ? err.message : 'Erreur de paiement'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
