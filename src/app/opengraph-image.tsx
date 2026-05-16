import { ImageResponse } from 'next/og'

export const alt = 'StudiQ — AI Maths Tutor for A-Level'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0F1724',
          padding: '72px 96px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
        }}
      >
        {/* Blue radial glow — center background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          background: 'radial-gradient(ellipse 900px 500px at 40% 50%, rgba(59,111,232,0.1) 0%, transparent 70%)',
        }} />

        {/* Top section — logo + headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, position: 'relative' }}>

          {/* Logo row: icon mark + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>

            {/* Icon mark */}
            <div style={{ display: 'flex', position: 'relative', width: 88, height: 88 }}>
              {/* Vertical connector */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: 6, height: 88, borderRadius: 3,
                background: 'rgba(255,255,255,0.18)',
              }} />
              {/* Top block — blue, offset right */}
              <div style={{
                position: 'absolute', left: 18, top: 0,
                width: 70, height: 22, borderRadius: 6,
                background: '#3B6FE8',
              }} />
              {/* Middle block — white, full width */}
              <div style={{
                position: 'absolute', left: 10, top: 33,
                width: 78, height: 22, borderRadius: 6,
                background: '#ffffff',
              }} />
              {/* Bottom block — blue, shorter */}
              <div style={{
                position: 'absolute', left: 10, top: 66,
                width: 46, height: 22, borderRadius: 6,
                background: '#3B6FE8',
              }} />
            </div>

            {/* Wordmark: STUD white + IQ blue */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
              <span style={{
                fontSize: 86,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-4px',
                lineHeight: 1,
              }}>
                STUD
              </span>
              <span style={{
                fontSize: 86,
                fontWeight: 800,
                color: '#3B6FE8',
                letterSpacing: '-4px',
                lineHeight: 1,
              }}>
                IQ
              </span>
            </div>
          </div>

          {/* Divider rule */}
          <div style={{
            width: 64, height: 3, borderRadius: 2,
            background: '#3B6FE8',
          }} />

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
              AI A-Level Maths tutoring that knows
            </span>
            <span style={{ fontSize: 40, fontWeight: 400, color: '#4a6a9a', lineHeight: 1.25 }}>
              exactly what you don't know — and fixes it.
            </span>
          </div>
        </div>

        {/* Bottom row — tagline left, url right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#2d3a4a',
            letterSpacing: '4px',
          }}>
            STUDY SMARTER NOT HARDER
          </span>
          <span style={{
            fontSize: 22,
            fontWeight: 500,
            color: '#2d4a6a',
            letterSpacing: '0.5px',
          }}>
            studiq.org
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
