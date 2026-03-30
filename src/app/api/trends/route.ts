// src/app/api/trends/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform') || undefined
    const language = searchParams.get('language') || undefined

    const trends = await prisma.trendTopic.findMany({
      where: {
        ...(platform && { platform }),
        ...(language && { language }),
      },
      orderBy: { score: 'desc' },
      take: 20,
    })

    // If no trends exist yet, return mock data
    if (trends.length === 0) {
      return NextResponse.json({
        success: true,
        data: getMockTrends(platform),
      })
    }

    return NextResponse.json({ success: true, data: trends })
  } catch (err) {
    console.error('[TRENDS]', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// Mock trend data when DB is empty (basic logic based on African social trends)
function getMockTrends(platform?: string) {
  const all = [
    { id: '1', topic: '#AfricaTech2024', platform: 'tiktok', score: 98, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '2', topic: '#CamerounViral', platform: 'tiktok', score: 95, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '3', topic: '#DoualaLifestyle', platform: 'instagram', score: 92, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '4', topic: 'Entrepreneuriat Africa', platform: 'youtube', score: 90, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '5', topic: '#MadeInAfrica', platform: 'instagram', score: 89, language: 'en', region: 'CM', createdAt: new Date().toISOString() },
    { id: '6', topic: '#YaoundéMode', platform: 'instagram', score: 87, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '7', topic: 'Cuisine Camerounaise', platform: 'youtube', score: 85, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '8', topic: '#AbidjanLife', platform: 'tiktok', score: 84, language: 'fr', region: 'CI', createdAt: new Date().toISOString() },
    { id: '9', topic: '#AfricanCreators', platform: 'tiktok', score: 82, language: 'en', region: 'CM', createdAt: new Date().toISOString() },
    { id: '10', topic: 'Business en Afrique', platform: 'youtube', score: 80, language: 'fr', region: 'CM', createdAt: new Date().toISOString() },
    { id: '11', topic: '#DakarStyle', platform: 'instagram', score: 78, language: 'fr', region: 'SN', createdAt: new Date().toISOString() },
    { id: '12', topic: '#AfroBeats2024', platform: 'tiktok', score: 76, language: 'en', region: 'NG', createdAt: new Date().toISOString() },
  ]
  if (!platform) return all
  return all.filter(t => t.platform === platform)
}
