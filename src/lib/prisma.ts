// src/lib/prisma.ts — Prisma client singleton (prevents hot-reload issues)
import { PrismaClient } from '@prisma/client'

const ensureRailwaySsl = (url?: string) => {
  if (!url) return url

  const railwayHostPattern = /\.up\.railway\.app$/i

  try {
    const parsedUrl = new URL(url)
    const isRailwayHost = railwayHostPattern.test(parsedUrl.hostname)

    if (!isRailwayHost) {
      return url
    }

    if (!parsedUrl.searchParams.has('sslmode')) {
      parsedUrl.searchParams.set('sslmode', 'require')
    }

    return parsedUrl.toString()
  } catch {
    return url
  }
}

const databaseUrl = ensureRailwaySsl(process.env.DATABASE_URL)

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
