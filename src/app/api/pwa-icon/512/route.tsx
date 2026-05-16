import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const S = 512
const scale = S / 180

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: S, height: S,
        background: '#0F1724',
        borderRadius: Math.round(40 * scale),
        display: 'flex',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: Math.round(30 * scale), top: Math.round(34 * scale), width: Math.round(10 * scale), height: Math.round(112 * scale), borderRadius: Math.round(5 * scale), background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ position: 'absolute', left: Math.round(48 * scale), top: Math.round(34 * scale), width: Math.round(102 * scale), height: Math.round(30 * scale), borderRadius: Math.round(8 * scale), background: '#3B6FE8' }} />
        <div style={{ position: 'absolute', left: Math.round(38 * scale), top: Math.round(75 * scale), width: Math.round(112 * scale), height: Math.round(30 * scale), borderRadius: Math.round(8 * scale), background: '#ffffff' }} />
        <div style={{ position: 'absolute', left: Math.round(38 * scale), top: Math.round(116 * scale), width: Math.round(66 * scale), height: Math.round(30 * scale), borderRadius: Math.round(8 * scale), background: '#3B6FE8' }} />
      </div>
    ),
    { width: S, height: S },
  )
}
