// src/lib/ai.ts — AI generation service (OpenAI-compatible abstraction)
// Supports OpenAI, Together AI, Groq, or any OpenAI-compatible endpoint

import { ContentType, Language, Platform } from '@/types'

interface GenerateOptions {
  type: ContentType
  prompt: string
  language: Language
  platform?: Platform
  tone?: string
}

const AI_BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

/** Build system prompt based on content type and language */
function buildSystemPrompt(type: ContentType, language: Language): string {
  const lang = language === 'fr' ? 'français' : 'English'
  const langNote = `Respond ONLY in ${lang}.`

  const prompts: Record<ContentType, string> = {
    TIKTOK_CAPTION: `You are a viral TikTok content expert specializing in African markets (Cameroon, Côte d'Ivoire, Sénégal). 
Create engaging, punchy TikTok captions that drive views and engagement. 
Include hooks, emojis, and a call-to-action. 
Keep it under 150 characters for the caption + relevant hashtags. ${langNote}`,

    INSTAGRAM_CAPTION: `You are an Instagram content strategist for African creators. 
Create aesthetic, story-driven Instagram captions that connect emotionally. 
Structure: Hook → Story/Value → CTA → Hashtags. 
Tone: authentic, relatable, aspirational. ${langNote}`,

    YOUTUBE_SCRIPT: `You are a YouTube scriptwriter for African content creators. 
Create a complete video script with: 
- Attention-grabbing intro (first 30 seconds crucial)
- Main content sections with timestamps
- Engaging outro with subscribe CTA
Format with clear sections. ${langNote}`,

    HASHTAGS: `You are a hashtag research expert for African social media. 
Generate 20-30 relevant, trending hashtags mixing: 
- High-volume generic tags
- Medium niche tags  
- Local/African-specific tags
- Brand/community tags
Group them by category. ${langNote}`,

    CONTENT_IDEAS: `You are a viral content strategist for African creators. 
Generate 10 creative, trend-aware content ideas for the given topic.
For each idea include: Title, Format (video/reel/post), Hook, Why it will go viral.
Focus on African culture, trends, and audiences. ${langNote}`,
  }

  return prompts[type]
}

/** Build user prompt */
function buildUserPrompt(options: GenerateOptions): string {
  const { type, prompt, platform, tone } = options
  const toneStr = tone ? ` Tone: ${tone}.` : ''
  const platformStr = platform ? ` Platform: ${platform}.` : ''

  const prefixes: Record<ContentType, string> = {
    TIKTOK_CAPTION: `Create a viral TikTok caption for:`,
    INSTAGRAM_CAPTION: `Create an Instagram caption for:`,
    YOUTUBE_SCRIPT: `Write a complete YouTube video script about:`,
    HASHTAGS: `Generate hashtags for this content:`,
    CONTENT_IDEAS: `Generate viral content ideas about:`,
  }

  return `${prefixes[type]} "${prompt}"${platformStr}${toneStr}`
}

/** Main AI generation function */
export async function generateContent(options: GenerateOptions): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI_API_KEY is not configured on the server')
  }

  const systemPrompt = buildSystemPrompt(options.type, options.language)
  const userPrompt = buildUserPrompt(options)

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: options.type === 'YOUTUBE_SCRIPT' ? 2000 : 800,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(async () => ({ message: await response.text().catch(() => '') }))
    throw new Error(error.error?.message || error.message || `AI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Generation failed. Please try again.'
}

/** Check if user can generate based on plan */
export function canGenerate(generationsLeft: number, plan: string): boolean {
  if (plan === 'PREMIUM') return true
  return generationsLeft > 0
}
