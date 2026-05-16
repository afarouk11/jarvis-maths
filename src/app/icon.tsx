import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 32, height: 32,
        background: '#0F1724',
        borderRadius: 7,
        display: 'flex',
        position: 'relative',
      }}>
        {/* Vertical connector */}
        <div style={{ position: 'absolute', left: 5, top: 6, width: 2, height: 20, borderRadius: 1, background: 'rgba(255,255,255,0.2)' }} />
        {/* Top block — blue, offset right */}
        <div style={{ position: 'absolute', left: 9, top: 6, width: 18, height: 5, borderRadius: 2, background: '#3B6FE8' }} />
        {/* Middle block — white, full width */}
        <div style={{ position: 'absolute', left: 7, top: 14, width: 20, height: 5, borderRadius: 2, background: '#ffffff' }} />
        {/* Bottom block — blue, shorter */}
        <div style={{ position: 'absolute', left: 7, top: 22, width: 12, height: 5, borderRadius: 2, background: '#3B6FE8' }} />
      </div>
    ),
    { ...size },
  )
}
