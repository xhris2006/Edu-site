// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('creatorzap_token')
  return NextResponse.json({ success: true, message: 'Déconnecté' })
}
