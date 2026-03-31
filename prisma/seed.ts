import { PrismaClient, Role, Plan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function splitEmails(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

function getConfiguredAdminEmails() {
  const emails = [
    ...splitEmails(process.env.ADMIN_EMAILS),
    ...splitEmails(process.env.ADMIN_EMAIL),
  ]

  return Array.from(new Set(emails))
}

async function main() {
  const adminEmail = getConfiguredAdminEmails()[0]
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const hashedPwd = await bcrypt.hash(adminPassword, 10)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    const adminData = {
      name: process.env.ADMIN_NAME || 'CreatorZap Admin',
      email: adminEmail,
      password: hashedPwd,
      role: Role.ADMIN,
      plan: Plan.PREMIUM,
      generationsLeft: 9999,
    }

    const admin = existingAdmin
      ? await prisma.user.update({
          where: { id: existingAdmin.id },
          data: adminData,
        })
      : await prisma.user.create({
          data: adminData,
        })

    console.log('Admin seeded:', admin.email)
  } else {
    console.log('No seed admin created. Set ADMIN_EMAIL or ADMIN_EMAILS with ADMIN_PASSWORD to enable it.')
  }

  const trends = [
    { topic: '#AfricaTech', platform: 'tiktok', score: 95, language: 'fr', region: 'CM' },
    { topic: '#CamerounViral', platform: 'tiktok', score: 92, language: 'fr', region: 'CM' },
    { topic: '#DoualaLife', platform: 'instagram', score: 88, language: 'fr', region: 'CM' },
    { topic: '#YaoundeMode', platform: 'instagram', score: 85, language: 'fr', region: 'CM' },
    { topic: 'Entrepreneuriat Africain', platform: 'youtube', score: 90, language: 'fr', region: 'CM' },
    { topic: 'Cuisine Camerounaise', platform: 'youtube', score: 87, language: 'fr', region: 'CM' },
    { topic: '#AfricanCreators', platform: 'tiktok', score: 91, language: 'en', region: 'CM' },
    { topic: '#MadeInAfrica', platform: 'instagram', score: 89, language: 'en', region: 'CM' },
  ]

  for (const trend of trends) {
    const existingTrend = await prisma.trendTopic.findFirst({
      where: {
        topic: trend.topic,
        platform: trend.platform,
        language: trend.language,
        region: trend.region,
      },
    })

    if (!existingTrend) {
      await prisma.trendTopic.create({
        data: trend,
      })
    }
  }

  console.log('Trend topics seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
