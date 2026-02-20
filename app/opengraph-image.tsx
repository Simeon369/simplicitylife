import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Simplicity Blog'
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#0a0a0a',
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          SIMPLICITY
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#525252',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Order in a chaotic world
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 20,
            color: '#a3a3a3',
          }}
        >
          simplicityblog.com
        </div>
      </div>
    ),
    size
  )
}