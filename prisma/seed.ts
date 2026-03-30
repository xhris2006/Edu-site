// prisma/seed.ts — Seeds admin user and trend topics
import { PrismaClient, Role, Plan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPwd = await bcrypt.hash('Admin@CreatorZap2024', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creatorzap.com' },
    update: {},
    create: {
      name: 'Admin CreatorZap',
      email: 'admin@creatorzap.com',
      password: hashedPwd,
      role: Role.ADMIN,
      plan: Plan.PREMIUM,
      generationsLeft: 9999,
    },
  })

  console.log('✅ Admin created:', admin.email)

  // Seed trend topics
  const trends = [
    { topic: '#AfricaTech', platform: 'tiktok', score: 95, language: 'fr', region: 'CM' },
    { topic: '#CamerounViral', platform: 'tiktok', score: 92, language: 'fr', region: 'CM' },
    { topic: '#DoualaLife', platform: 'instagram', score: 88, language: 'fr', region: 'CM' },
    { topic: '#YaoundéMode', platform: 'instagram', score: 85, language: 'fr', region: 'CM' },
    { topic: 'Entrepreneuriat Africain', platform: 'youtube', score: 90, language: 'fr', region: 'CM' },
    { topic: 'Cuisine Camerounaise', platform: 'youtube', score: 87, language: 'fr', region: 'CM' },
    { topic: '#AfricanCreators', platform: 'tiktok', score: 91, language: 'en', region: 'CM' },
    { topic: '#MadeInAfrica', platform: 'instagram', score: 89, language: 'en', region: 'CM' },
  ]

  for (const t of trends) {
    await prisma.trendTopic.upsert({
      where: { id: t.topic + t.platform },
      update: {},
      create: t as any,
    })
  }

  console.log('✅ Trend topics seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
