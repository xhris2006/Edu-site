// src/app/api/payments/verify/route.ts
// Called by Fapshi as redirect after payment + can be polled manually
import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { verifyFapshiPayment } from '@/lib/fapshi'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')
    const transId = searchParams.get('transId') // Fapshi may append this

    if (!paymentId) {
      redirect('/pricing?error=missing_payment_id')
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId! } })
    if (!payment) {
      redirect('/pricing?error=payment_not_found')
    }

    // Use stored transId or the one from query
    const fapshiTransId = payment.fapshiTransId || transId
    if (!fapshiTransId) {
      redirect('/pricing?error=no_trans_id')
    }

    // Verify with Fapshi
    const verification = await verifyFapshiPayment(fapshiTransId!)
    const isSuccess = verification.status === 'SUCCESSFUL'

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId! },
      data: {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        fapshiRef: fapshiTransId,
      },
    })

    if (isSuccess) {
      // Upgrade user to Premium
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: 'PREMIUM',
          generationsLeft: 9999,
        },
      })
      redirect('/dashboard?payment=success')
    } else {
      redirect('/pricing?payment=failed')
    }
  } catch (err) {
    console.error('[PAYMENT VERIFY]', err)
    redirect('/pricing?error=verification_failed')
  }
}

// POST — manual verification endpoint (for webhooks or manual checks)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transId } = body

    if (!transId) return NextResponse.json({ success: false, error: 'transId requis' }, { status: 400 })

    const payment = await prisma.payment.findFirst({ where: { fapshiTransId: transId } })
    if (!payment) return NextResponse.json({ success: false, error: 'Paiement introuvable' }, { status: 404 })

    const verification = await verifyFapshiPayment(transId)
    const isSuccess = verification.status === 'SUCCESSFUL'

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: isSuccess ? 'SUCCESS' : 'FAILED' },
    })

    if (isSuccess) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan: 'PREMIUM', generationsLeft: 9999 },
      })
    }

    return NextResponse.json({ success: true, data: { status: verification.status, isSuccess } })
  } catch (err) {
    console.error('[PAYMENT VERIFY POST]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
