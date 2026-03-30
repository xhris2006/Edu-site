// src/lib/fapshi.ts — Fapshi Payment Gateway Integration
// Docs: https://fapshi.com/docs

const FAPSHI_BASE_URL = 'https://live.fapshi.com'
const FAPSHI_API_USER = process.env.FAPSHI_API_USER || ''
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY || ''

/** Headers for Fapshi API requests */
function getFapshiHeaders() {
  return {
    'Content-Type': 'application/json',
    apiuser: FAPSHI_API_USER,
    apikey: FAPSHI_API_KEY,
  }
}

/** Initialize a payment with Fapshi */
export async function initiateFapshiPayment(params: {
  amount: number
  email: string
  redirectUrl: string
  userId: string
  message?: string
  externalId?: string
}): Promise<{ link: string; transId: string }> {
  const response = await fetch(`${FAPSHI_BASE_URL}/initiate-pay`, {
    method: 'POST',
    headers: getFapshiHeaders(),
    body: JSON.stringify({
      amount: params.amount,
      email: params.email,
      redirectUrl: params.redirectUrl,
      userId: params.userId,
      message: params.message || 'CreatorZap Premium Subscription',
      externalId: params.externalId,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Fapshi payment initiation failed')
  }

  const data = await response.json()
  return {
    link: data.link,
    transId: data.transId,
  }
}

/** Verify a Fapshi transaction */
export async function verifyFapshiPayment(transId: string): Promise<{
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'EXPIRED'
  amount: number
  payer?: string
  externalId?: string
}> {
  const response = await fetch(`${FAPSHI_BASE_URL}/payment-status/${transId}`, {
    method: 'GET',
    headers: getFapshiHeaders(),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Fapshi verification failed')
  }

  const data = await response.json()
  return {
    status: data.status,
    amount: data.amount,
    payer: data.payer,
    externalId: data.externalId,
  }
}

/** Premium plan pricing in XAF */
export const PREMIUM_PLANS = {
  monthly: {
    amount: 2500,  // 2,500 XAF/month
    label: 'Mensuel',
    labelEn: 'Monthly',
    duration: 30,
  },
  quarterly: {
    amount: 6500,  // 6,500 XAF/3 months
    label: 'Trimestriel',
    labelEn: 'Quarterly',
    duration: 90,
  },
  yearly: {
    amount: 20000, // 20,000 XAF/year
    label: 'Annuel',
    labelEn: 'Yearly',
    duration: 365,
  },
}
