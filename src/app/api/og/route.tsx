import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const name    = searchParams.get('name') ?? 'Student'
  const grade   = searchParams.get('grade') ?? 'A*'
  const mastery = parseInt(searchParams.get('mastery') ?? '0', 10)
  const topic   = searchParams.get('topic') ?? 'A-level Maths'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080d19 0%, #0d1526 50%, #080d19 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}>
        {/* Background grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        }} />

        {/* StudiQ badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '32px',
          padding: '8px 20px', borderRadius: '100px',
          border: '1px solid rgba(245,158,11,0.3)',
          background: 'rgba(245,158,11,0.08)',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            StudiQ · SPOK
          </span>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
            {name} is aiming for
          </div>
          <div style={{
            fontSize: '120px', fontWeight: 900, lineHeight: 1,
            color: grade === 'A*' ? '#f59e0b' : grade === 'A' ? '#4ade80' : grade.startsWith('9') ? '#f59e0b' : '#60a5fa',
          }}>
            {grade}
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
            in {topic}
          </div>
        </div>

        {/* Mastery bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '40px' }}>
          <div style={{ width: '400px', height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              width: `${Math.min(100, mastery)}%`,
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            }} />
          </div>
          <span style={{ fontSize: '14px', color: 'rgba(245,158,11,0.7)' }}>
            {mastery}% avg mastery · studiq.org
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
