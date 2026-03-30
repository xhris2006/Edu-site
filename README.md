# ⚡ CreatorZap — AI Content Platform for African Creators

> Generate viral TikTok captions, Instagram posts, YouTube scripts, hashtags & content ideas — powered by AI, built for Africa.

![CreatorZap](https://img.shields.io/badge/CreatorZap-v1.0.0-E63946?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)

---

## ✨ Features

| Feature | Free Plan | Premium Plan |
|---------|-----------|-------------|
| TikTok Captions | ✅ (5/day) | ✅ Unlimited |
| Instagram Captions | ✅ (5/day) | ✅ Unlimited |
| YouTube Scripts | ✅ (5/day) | ✅ Unlimited |
| Hashtag Generator | ✅ (5/day) | ✅ Unlimited |
| Content Ideas | ✅ (5/day) | ✅ Unlimited |
| Generation History | ✅ Limited | ✅ Full history |
| Save Favorites | ❌ | ✅ |
| Trend Analyzer | ❌ | ✅ |
| FR + EN Support | ✅ | ✅ |
| Priority Support | ❌ | ✅ |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (jose) + httpOnly cookies
- **AI**: OpenAI-compatible API (works with OpenAI, Together AI, Groq, OpenRouter)
- **Payments**: Fapshi (MTN MoMo + Orange Money)
- **Deployment**: Vercel (frontend) + Railway (database)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/creatorzap.git
cd creatorzap
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
AI_API_KEY="your-ai-api-key"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-3.5-turbo"

# Payment (Fapshi)
FAPSHI_API_USER="your-api-user"
FAPSHI_API_KEY="your-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with admin user + trend topics
npm run db:seed
```

**Default Admin credentials:**
- Email: `admin@creatorzap.com`
- Password: `Admin@CreatorZap2024`
- ⚠️ **Change these immediately in production!**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌍 AI Provider Setup

CreatorZap uses an OpenAI-compatible API. Choose the provider that works best for you:

### Option A: OpenAI (recommended for quality)
```env
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="sk-..."
AI_MODEL="gpt-3.5-turbo"
```
> Sign up at [platform.openai.com](https://platform.openai.com)

### Option B: Together AI (cheaper, great for Africa)
```env
AI_BASE_URL="https://api.together.xyz/v1"
AI_API_KEY="..."
AI_MODEL="mistralai/Mixtral-8x7B-Instruct-v0.1"
```
> Sign up at [api.together.ai](https://api.together.ai)

### Option C: Groq (free tier available, very fast)
```env
AI_BASE_URL="https://api.groq.com/openai/v1"
AI_API_KEY="..."
AI_MODEL="llama3-8b-8192"
```
> Sign up at [console.groq.com](https://console.groq.com)

### Option D: OpenRouter (access to 100+ models)
```env
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_API_KEY="..."
AI_MODEL="meta-llama/llama-3-8b-instruct"
```
> Sign up at [openrouter.ai](https://openrouter.ai)

---

## 💳 Fapshi Payment Setup

1. Create an account at [fapshi.com](https://fapshi.com)
2. Go to **API Settings** and get your `apiuser` and `apikey`
3. Add to `.env.local`:

```env
FAPSHI_API_USER="your-api-user"
FAPSHI_API_KEY="your-api-key"
```

**Supported payment methods:**
- MTN Mobile Money (MTN MoMo) 🇨🇲
- Orange Money 🇨🇲
- Credit/Debit cards

**Payment flow:**
1. User clicks "Subscribe" → `/api/payments/initiate` → Fapshi payment page
2. User pays via Mobile Money
3. Fapshi redirects to `/api/payments/verify?paymentId=...`
4. System verifies with Fapshi API → upgrades user to Premium

---

## 🚀 Deployment

### Frontend: Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Railway/Supabase PostgreSQL URL (with `sslmode=require`) |
| `JWT_SECRET` | A strong random string |
| `AI_BASE_URL` | Your AI provider URL |
| `AI_API_KEY` | Your AI API key |
| `AI_MODEL` | The model name |
| `FAPSHI_API_USER` | Your Fapshi API user |
| `FAPSHI_API_KEY` | Your Fapshi API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Deploy! ✅

### Database: Railway (PostgreSQL)

1. Go to [railway.app](https://railway.app) → New Project → PostgreSQL
2. Copy the `DATABASE_URL` from Railway and ensure it includes `sslmode=require`
3. Add it to Vercel env vars as `DATABASE_URL`
4. After deploy, run migrations:

```bash
# Set your production DATABASE_URL locally, then:
npm run db:push
npm run db:seed
```

Or via Railway CLI:
```bash
railway run npx prisma db push
railway run npx ts-node prisma/seed.ts
```

### Alternative Database: Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to Settings → Database → Connection string
3. Use the **URI** connection string as `DATABASE_URL`

---

## 📁 Project Structure

```
creatorzap/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Protected user pages
│   │   │   ├── dashboard/     # Home dashboard
│   │   │   ├── generate/      # AI content generator
│   │   │   ├── history/       # Generation history
│   │   │   ├── favorites/     # Saved content
│   │   │   ├── trends/        # Trend analyzer
│   │   │   ├── pricing/       # Subscription plans
│   │   │   └── settings/      # User settings
│   │   ├── (admin)/           # Admin-only pages
│   │   │   └── admin/         # Admin dashboard
│   │   ├── api/
│   │   │   ├── auth/          # Login, register, me, logout
│   │   │   ├── generate/      # AI generation endpoint
│   │   │   ├── history/       # Generation CRUD
│   │   │   ├── favorites/     # Favorites management
│   │   │   ├── payments/      # Fapshi payment routes
│   │   │   ├── trends/        # Trend data
│   │   │   └── admin/         # Admin APIs
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── lib/
│   │   ├── ai.ts              # AI generation service
│   │   ├── auth.ts            # JWT utilities
│   │   ├── fapshi.ts          # Payment gateway
│   │   ├── i18n.ts            # FR/EN translations
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Helper functions
│   ├── middleware.ts           # Route protection
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example               # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔐 Authentication Flow

1. **Register** → POST `/api/auth/register` → JWT cookie set → redirect to `/dashboard`
2. **Login** → POST `/api/auth/login` → JWT cookie set → redirect based on role
3. **Protected routes** → Middleware checks JWT cookie → redirect to `/auth/login` if invalid
4. **Admin routes** → Middleware also checks `role === 'ADMIN'`

---

## 🌐 Multi-language Support

The platform supports **French (FR)** and **English (EN)**:
- UI language is saved per user in the database
- AI generates content in the user's selected language
- All prompts and system messages are language-aware

---

## 📊 Usage Limits

| Plan | Generations per day | Reset time |
|------|--------------------|-----------:|
| Free | 5 | Midnight (daily) |
| Premium | Unlimited | N/A |

The reset logic is in `src/lib/utils.ts → shouldResetGenerations()`.

---

## 🧑‍💻 Development

### Run Prisma Studio (DB GUI)
```bash
npm run db:studio
```

### Generate Prisma client
```bash
npx prisma generate
```

### Create a new migration
```bash
npm run db:migrate
```

### Lint
```bash
npm run lint
```

---

## 🙏 Credits

Developed with ❤️ by **[Xhris Dior](https://xhris84.netlify.app)** — Yaoundé, Cameroun 🇨🇲

---

## 📜 License

MIT License — feel free to use, modify, and distribute.
