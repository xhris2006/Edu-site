// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const [
      totalUsers,
      premiumUsers,
      totalGenerations,
      revenueData,
      recentUsers,
      recentPayments,
      genByType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'PREMIUM' } }),
      prisma.generation.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, name: true, email: true, plan: true,
          generationsLeft: true, createdAt: true, role: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.generation.groupBy({
        by: ['type'],
        _count: true,
        orderBy: { _count: { type: 'desc' } },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        totalGenerations,
        totalRevenue: revenueData._sum.amount || 0,
        recentUsers,
        recentPayments,
        genByType: genByType.map(g => ({ type: g.type, _count: g._count })),
      },
    })
  } catch (err) {
    console.error('[ADMIN STATS]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
