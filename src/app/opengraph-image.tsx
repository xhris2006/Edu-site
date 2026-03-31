import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CreatorZap'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at top left, rgba(230,57,70,0.35), transparent 30%), linear-gradient(135deg, #09090f 0%, #11121a 45%, #1a1b28 100%)',
          color: 'white',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '24px',
              background: '#e63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 800,
            }}
          >
            Z
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '58px', fontWeight: 800 }}>CreatorZap</div>
            <div style={{ fontSize: '24px', color: '#d2d4dc' }}>
              IA, téléchargements vidéo et outils créateurs
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '54px', lineHeight: 1.1, fontWeight: 700, maxWidth: '900px' }}>
            Générez du contenu viral et téléchargez vos vidéos propres depuis TikTok, Instagram, Pinterest et YouTube.
          </div>
          <div style={{ fontSize: '24px', color: '#f2b1b6' }}>
            Pensé pour les créateurs africains
          </div>
        </div>
      </div>
    ),
    size
  )
}
