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

export class AIProviderError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = 'AIProviderError'
    this.status = status
    this.code = code
  }
}

function buildSystemPrompt(type: ContentType, language: Language): string {
  const lang = language === 'fr' ? 'francais' : 'English'
  const langNote = `Respond ONLY in ${lang}.`

  const prompts: Record<ContentType, string> = {
    TIKTOK_CAPTION: `You are a viral TikTok content expert specializing in African markets (Cameroon, Cote d'Ivoire, Senegal).
Create engaging, punchy TikTok captions that drive views and engagement.
Include hooks, emojis, and a call-to-action.
Keep it under 150 characters for the caption + relevant hashtags. ${langNote}`,

    INSTAGRAM_CAPTION: `You are an Instagram content strategist for African creators.
Create aesthetic, story-driven Instagram captions that connect emotionally.
Structure: Hook -> Story/Value -> CTA -> Hashtags.
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

function buildUserPrompt(options: GenerateOptions): string {
  const { type, prompt, platform, tone } = options
  const toneStr = tone ? ` Tone: ${tone}.` : ''
  const platformStr = platform ? ` Platform: ${platform}.` : ''

  const prefixes: Record<ContentType, string> = {
    TIKTOK_CAPTION: 'Create a viral TikTok caption for:',
    INSTAGRAM_CAPTION: 'Create an Instagram caption for:',
    YOUTUBE_SCRIPT: 'Write a complete YouTube video script about:',
    HASHTAGS: 'Generate hashtags for this content:',
    CONTENT_IDEAS: 'Generate viral content ideas about:',
  }

  return `${prefixes[type]} "${prompt}"${platformStr}${toneStr}`
}

export async function generateContent(options: GenerateOptions): Promise<string> {
  if (!AI_API_KEY) {
    throw new AIProviderError('AI_API_KEY is not configured on the server', 503, 'missing_api_key')
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
    const providerMessage = error.error?.message || error.message || `AI API error: ${response.status}`
    const providerCode = error.error?.code

    if (providerCode === 'insufficient_quota' || response.status === 429) {
      throw new AIProviderError(
        'Le quota OpenAI du serveur est epuise. Ajoutez du credit ou activez la facturation sur le compte OpenAI, puis reessayez.',
        503,
        providerCode || 'insufficient_quota'
      )
    }

    if (response.status === 401) {
      throw new AIProviderError(
        'La cle OpenAI du serveur est invalide ou expiree. Verifiez AI_API_KEY sur Vercel.',
        503,
        providerCode || 'invalid_api_key'
      )
    }

    throw new AIProviderError(providerMessage, response.status, providerCode)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Generation failed. Please try again.'
}

export function canGenerate(generationsLeft: number, plan: string): boolean {
  if (plan === 'PREMIUM') return true
  return generationsLeft > 0
}
