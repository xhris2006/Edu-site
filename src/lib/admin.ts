import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { PREMIUM_DAILY_QUOTA, getDailyQuotaForPlan } from '@/lib/utils'

function splitEmails(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getConfiguredAdminEmails(): string[] {
  const emails = [
    ...splitEmails(process.env.ADMIN_EMAILS),
    ...splitEmails(process.env.ADMIN_EMAIL),
  ]

  return Array.from(new Set(emails))
}

export function isConfiguredAdminEmail(email: string): boolean {
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase())
}

export async function syncConfiguredAdminStatus<T extends {
  id: string
  email: string
  role: Role
  plan: 'FREE' | 'PREMIUM'
  generationsLeft: number
  name: string
}>(user: T): Promise<T> {
  const shouldBeAdmin = isConfiguredAdminEmail(user.email)

  if (!shouldBeAdmin || user.role === 'ADMIN') {
    return user
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'ADMIN',
      plan: 'PREMIUM',
      generationsLeft: PREMIUM_DAILY_QUOTA,
      lastResetAt: new Date(),
    },
  }) as Promise<T>
}

export function getUserSeedData({
  email,
  name,
  hashedPassword,
  language,
}: {
  email: string
  name: string
  hashedPassword: string
  language: 'fr' | 'en'
}) {
  const admin = isConfiguredAdminEmail(email)

  return {
    name,
    email,
    password: hashedPassword,
    language,
    role: admin ? 'ADMIN' : 'USER',
    plan: admin ? 'PREMIUM' : 'FREE',
    generationsLeft: admin ? PREMIUM_DAILY_QUOTA : getDailyQuotaForPlan('FREE'),
  }
}
