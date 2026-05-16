import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: 180, height: 180,
        background: '#0F1724',
        borderRadius: 40,
        display: 'flex',
        position: 'relative',
      }}>
        {/* Vertical connector */}
        <div style={{ position: 'absolute', left: 30, top: 34, width: 10, height: 112, borderRadius: 5, background: 'rgba(255,255,255,0.2)' }} />
        {/* Top block — blue, offset right */}
        <div style={{ position: 'absolute', left: 48, top: 34, width: 102, height: 30, borderRadius: 8, background: '#3B6FE8' }} />
        {/* Middle block — white, full width */}
        <div style={{ position: 'absolute', left: 38, top: 75, width: 112, height: 30, borderRadius: 8, background: '#ffffff' }} />
        {/* Bottom block — blue, shorter */}
        <div style={{ position: 'absolute', left: 38, top: 116, width: 66, height: 30, borderRadius: 8, background: '#3B6FE8' }} />
      </div>
    ),
    { ...size },
  )
}
