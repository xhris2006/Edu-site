import { NextResponse } from 'next/server'

const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#E63946"/>
  <path d="M36 10 18 36h12l-2 18 18-26H34z" fill="#fff"/>
</svg>
`

export function GET() {
  return new NextResponse(faviconSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
