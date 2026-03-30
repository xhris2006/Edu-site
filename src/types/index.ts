// src/types/index.ts — Shared TypeScript types

export type Role = 'USER' | 'ADMIN'
export type Plan = 'FREE' | 'PREMIUM'
export type Language = 'fr' | 'en'

export type ContentType =
  | 'TIKTOK_CAPTION'
  | 'INSTAGRAM_CAPTION'
  | 'YOUTUBE_SCRIPT'
  | 'HASHTAGS'
  | 'CONTENT_IDEAS'

export type Platform = 'tiktok' | 'instagram' | 'youtube'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  plan: Plan
  language: Language
  generationsLeft: number
  createdAt: string
}

export interface JWTPayload {
  sub: string
  email: string
  role: Role
  plan: Plan
  name: string
  iat?: number
  exp?: number
}

export interface Generation {
  id: string
  userId: string
  type: ContentType
  prompt: string
  result: string
  language: Language
  platform?: Platform
  isFavorite: boolean
  createdAt: string
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  fapshiRef?: string
  fapshiTransId?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  plan: Plan
  expiresAt?: string
  createdAt: string
}

export interface TrendTopic {
  id: string
  topic: string
  platform: Platform
  score: number
  language: Language
  region: string
  createdAt: string
}

export interface GenerateRequest {
  type: ContentType
  prompt: string
  platform?: Platform
  language: Language
  tone?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Fapshi types
export interface FapshiInitPayment {
  amount: number
  email: string
  redirectUrl: string
  userId: string
  externalId?: string
}

export interface FapshiPaymentResponse {
  message: string
  link: string
  transId: string
}

export interface FapshiVerifyResponse {
  message: string
  amount: number
  status: string
  transId: string
  userId?: string
  externalId?: string
  payer?: string
}
