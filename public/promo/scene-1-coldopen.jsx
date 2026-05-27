// ── Scene 1: Cold open ──────────────────────────────────────────────────────
// Black space → particle bloom → single bright dot expands

function SceneColdOpen({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        // Bright pulse on dot
        const dotT = clamp(localTime / 1.6, 0, 1);
        const dotSize = 4 + easeOutSoft(dotT) * 12;
        const dotGlow = 60 + easeOutSoft(dotT) * 300;

        // Ring expansion
        const ringT = clamp((localTime - 1.0) / 1.8, 0, 1);
        const ringSize = ringT * 1600;
        const ringOp = (1 - ringT) * 0.7;

        // Stars
        const stars = React.useMemo(() => Array.from({ length: 80 }, (_, i) => ({
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          s: Math.random() * 2 + 0.4,
          d: Math.random() * 1.2,
          tw: Math.random() * 3,
        })), []);

        // Outro fade
        const fade = localTime > duration - 0.6 ? (duration - localTime) / 0.6 : 1;

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1) }}>
            {/* Starfield */}
            {stars.map((s, i) => {
              const a = clamp((localTime - s.d) / 0.6, 0, 1);
              const tw = 0.4 + 0.6 * Math.abs(Math.sin(localTime * 1.5 + s.tw));
              return (
                <div key={i} style={{
                  position: 'absolute', left: s.x, top: s.y,
                  width: s.s, height: s.s, borderRadius: '50%',
                  background: '#fff',
                  opacity: a * tw * 0.7,
                  boxShadow: `0 0 ${s.s * 4}px rgba(255,255,255,0.5)`,
                }}/>
              );
            })}

            {/* Expanding ring */}
            <div style={{
              position: 'absolute', left: 960, top: 540,
              width: ringSize, height: ringSize,
              marginLeft: -ringSize/2, marginTop: -ringSize/2,
              borderRadius: '50%',
              border: `1px solid rgba(96,165,250,${ringOp})`,
              boxShadow: `0 0 60px rgba(96,165,250,${ringOp * 0.5})`,
            }}/>

            {/* Second ring */}
            {localTime > 1.6 && (() => {
              const r2 = clamp((localTime - 1.6) / 1.6, 0, 1);
              const s2 = r2 * 1400;
              return (
                <div style={{
                  position: 'absolute', left: 960, top: 540,
                  width: s2, height: s2,
                  marginLeft: -s2/2, marginTop: -s2/2,
                  borderRadius: '50%',
                  border: `1px solid rgba(251,191,36,${(1 - r2) * 0.55})`,
                }}/>
              );
            })()}

            {/* Hero dot */}
            <div style={{
              position: 'absolute', left: 960, top: 540,
              width: dotSize, height: dotSize,
              marginLeft: -dotSize/2, marginTop: -dotSize/2,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: `0 0 ${dotGlow}px ${dotGlow*0.4}px rgba(96,165,250,0.8), 0 0 ${dotGlow*0.6}px ${dotGlow*0.2}px rgba(251,191,36,0.4)`,
            }}/>

            {/* Tiny corner code */}
            <div style={{
              position: 'absolute', left: 80, bottom: 80,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, color: 'rgba(96,165,250,0.55)',
              letterSpacing: '0.2em',
              opacity: clamp(localTime / 1.2, 0, 1),
            }}>
              STUDIQ · 2026 · A-LEVEL
            </div>
            <div style={{
              position: 'absolute', right: 80, bottom: 80,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, color: 'rgba(96,165,250,0.55)',
              letterSpacing: '0.2em',
              opacity: clamp(localTime / 1.2, 0, 1),
            }}>
              ◆ TRANSMISSION OPEN
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}
