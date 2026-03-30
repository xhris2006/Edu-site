// src/app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined

    const where = {
      userId: payload.sub,
      ...(type && { type: type as any }),
      ...(search && {
        OR: [
          { prompt: { contains: search, mode: 'insensitive' as any } },
          { result: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
    }

    const [data, total, thisMonthCount, favoritesCount] = await Promise.all([
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.generation.count({ where }),
      prisma.generation.count({
        where: {
          userId: payload.sub,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.favorite.count({ where: { userId: payload.sub } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        thisMonth: thisMonthCount,
        favorites: favoritesCount,
      },
    })
  } catch (err) {
    console.error('[HISTORY]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
