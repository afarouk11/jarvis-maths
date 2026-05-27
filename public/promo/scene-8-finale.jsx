// ── Scene 8: Finale ─────────────────────────────────────────────────────────
// Wordmark assembles + glow, "studiq.org" URL

function SceneFinale({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = clamp(localTime / 1.0, 0, 1);
        const inE = easeOutSoft(inT);
        const outT = localTime > duration - 0.3 ? (duration - localTime) / 0.3 : 1;

        // glow pulse on the q
        const pulse = 0.6 + 0.4 * Math.sin(localTime * 2);

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(outT, 0, 1), background: '#000' }}>
            {/* central bloom */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 1400, height: 1400,
              transform: `translate(-50%, -50%) scale(${0.6 + inE * 0.4})`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(251,191,36,${0.15 * inE}) 0%, rgba(96,165,250,${0.08 * inE}) 30%, transparent 60%)`,
              filter: 'blur(40px)',
              opacity: inE,
            }}/>

            {/* Wordmark */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%, -50%) translateY(${(1 - inE) * 24}px) scale(${0.95 + inE * 0.05})`,
              opacity: inE,
              fontSize: 360, fontWeight: 800,
              letterSpacing: '-0.06em',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1, whiteSpace: 'nowrap',
              color: '#fff',
              willChange: 'transform, opacity',
            }}>
              studi<span style={{
                color: SQ_AMBER_HI,
                textShadow: `0 0 ${60 * pulse}px rgba(251,191,36,${0.7 * pulse}), 0 0 ${120 * pulse}px rgba(251,191,36,${0.3 * pulse})`,
              }}>q</span>
            </div>

            {/* URL */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%, calc(-50% + 220px))`,
              fontSize: 32, fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.5em', textTransform: 'lowercase',
              opacity: clamp((localTime - 0.8) / 0.6, 0, 1),
            }}>
              studiq.org
            </div>

            {/* Available now */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%, calc(-50% + 290px))`,
              fontSize: 16, fontWeight: 500,
              color: SQ_AMBER_HI,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.6em', textTransform: 'uppercase',
              opacity: clamp((localTime - 1.2) / 0.6, 0, 1),
            }}>
              Available now
            </div>

            {/* Bottom corner credit */}
            <div style={{
              position: 'absolute', left: 80, bottom: 80,
              fontSize: 12, letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              opacity: clamp((localTime - 1.4) / 0.6, 0, 1),
            }}>
              ◆ STUDIQ · A-LEVEL · 2026
            </div>
            <div style={{
              position: 'absolute', right: 80, bottom: 80,
              fontSize: 12, letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              opacity: clamp((localTime - 1.4) / 0.6, 0, 1),
            }}>
              END · TRANSMISSION CLOSE
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}
