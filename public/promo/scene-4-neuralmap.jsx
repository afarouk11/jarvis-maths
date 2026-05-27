// ── Scene 4: Neural Knowledge Map ───────────────────────────────────────────
// Showcases the 3D neural map. Image floats with parallax, labels point in,
// stat readouts type in monospaced.

function SceneNeuralMap({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const fade = localTime > duration - 0.5 ? (duration - localTime) / 0.5 : 1;
        // Slow camera-in zoom
        const camT = clamp(localTime / duration, 0, 1);
        const scale = 1.04 + camT * 0.06;
        const tx = (camT - 0.5) * -20;

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1) }}>
            {/* Backdrop gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 60% 50%, rgba(251,146,60,0.10) 0%, rgba(0,0,0,0) 60%)',
            }}/>

            {/* Image with parallax */}
            <div style={{
              position: 'absolute', inset: 0,
              transform: `translate(${tx}px, 0) scale(${scale})`,
              transformOrigin: '60% 50%',
              transition: 'none',
              opacity: clamp(localTime / 0.8, 0, 1),
            }}>
              <img src="assets/neural-map.png" style={{
                position: 'absolute', left: 0, top: 0,
                width: 1920, height: 1080,
                objectFit: 'cover',
                filter: 'brightness(1.15) saturate(1.15)',
              }}/>
            </div>

            {/* Headline left-side */}
            <div style={{
              position: 'absolute', left: 120, top: 360,
              maxWidth: 720,
              opacity: clamp((localTime - 0.6) / 0.6, 0, 1),
              transform: `translateY(${(1 - clamp((localTime - 0.6) / 0.6, 0, 1)) * 24}px)`,
            }}>
              <div style={{
                fontSize: 20, letterSpacing: '0.5em', color: SQ_AMBER_HI,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
                marginBottom: 28, textTransform: 'uppercase',
              }}>
                Neural Knowledge Map
              </div>
              <div style={{
                fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em',
                color: '#fff', lineHeight: 1.0,
              }}>
                See every gap.<br/>
                <span style={{ color: SQ_AMBER_HI }}>In real time.</span>
              </div>
              <div style={{
                fontSize: 26, color: 'rgba(255,255,255,0.65)',
                marginTop: 32, lineHeight: 1.45, fontWeight: 400,
                opacity: clamp((localTime - 1.6) / 0.6, 0, 1),
              }}>
                Every concept you've touched — mapped, weighted,<br/>and waiting to be mastered.
              </div>
            </div>

            {/* Floating callouts */}
            <Callout
              x={1340} y={300}
              dotX={1245} dotY={365}
              show={localTime > 1.2}
              localTime={localTime - 1.2}
              label="DIFFERENTIATION"
              value="92% mastery"
              color={SQ_BLUE}
            />
            <Callout
              x={1450} y={550}
              dotX={1340} dotY={580}
              show={localTime > 1.9}
              localTime={localTime - 1.9}
              label="VECTORS"
              value="needs work"
              color={SQ_AMBER}
            />
            <Callout
              x={1320} y={780}
              dotX={1265} dotY={745}
              show={localTime > 2.6}
              localTime={localTime - 2.6}
              label="HYPOTHESIS TESTING"
              value="not started"
              color="#ef4444"
            />

            {/* HUD frame corners */}
            <HudCorners opacity={clamp((localTime - 0.3) / 0.5, 0, 1)} />

            {/* Bottom readout strip */}
            <div style={{
              position: 'absolute', left: 120, bottom: 80,
              display: 'flex', gap: 64,
              opacity: clamp((localTime - 2.4) / 0.6, 0, 1),
              transform: `translateY(${(1 - clamp((localTime - 2.4) / 0.6, 0, 1)) * 12}px)`,
            }}>
              <ReadoutStat label="TOPICS" value="28" />
              <ReadoutStat label="MASTERED" value="01" />
              <ReadoutStat label="DUE" value="04" accent />
              <ReadoutStat label="LAST SYNC" value="LIVE" />
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

function Callout({ x, y, dotX, dotY, show, localTime, label, value, color }) {
  if (!show) return null;
  const t = clamp(localTime / 0.5, 0, 1);
  const eased = easeOutSoft(t);
  const lineLen = Math.hypot(x - dotX, y - dotY);
  const angle = Math.atan2(y - dotY, x - dotX) * 180 / Math.PI;
  return (
    <>
      {/* dot */}
      <div style={{
        position: 'absolute', left: dotX - 6, top: dotY - 6,
        width: 12, height: 12, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 16px ${color}`,
        opacity: eased,
      }}/>
      <div style={{
        position: 'absolute', left: dotX - 18, top: dotY - 18,
        width: 36, height: 36, borderRadius: '50%',
        border: `1px solid ${color}`,
        opacity: eased * 0.6,
        animation: 'pulse 2s ease-out infinite',
      }}/>
      {/* line */}
      <div style={{
        position: 'absolute', left: dotX, top: dotY,
        width: lineLen * eased, height: 1,
        background: `linear-gradient(90deg, ${color}80, ${color}40)`,
        transformOrigin: 'left center',
        transform: `rotate(${angle}deg)`,
      }}/>
      {/* card */}
      <div style={{
        position: 'absolute', left: x, top: y - 30,
        opacity: clamp((localTime - 0.35) / 0.4, 0, 1),
        transform: `translateX(${(1 - clamp((localTime - 0.35) / 0.4, 0, 1)) * 16}px)`,
        padding: '14px 22px',
        background: 'rgba(10,14,26,0.85)',
        border: `1px solid ${color}55`,
        borderLeft: `2px solid ${color}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 4,
      }}>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: color, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, color: '#fff', fontWeight: 600 }}>{value}</div>
      </div>
    </>
  );
}

function HudCorners({ opacity }) {
  const arm = 60;
  const inset = 60;
  const stroke = `1px solid rgba(251,191,36,${opacity * 0.5})`;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {/* TL */}
      <div style={{ position: 'absolute', left: inset, top: inset, width: arm, height: 1, background: 'rgba(251,191,36,0.5)' }}/>
      <div style={{ position: 'absolute', left: inset, top: inset, width: 1, height: arm, background: 'rgba(251,191,36,0.5)' }}/>
      {/* TR */}
      <div style={{ position: 'absolute', right: inset, top: inset, width: arm, height: 1, background: 'rgba(251,191,36,0.5)' }}/>
      <div style={{ position: 'absolute', right: inset, top: inset, width: 1, height: arm, background: 'rgba(251,191,36,0.5)' }}/>
      {/* BL */}
      <div style={{ position: 'absolute', left: inset, bottom: inset, width: arm, height: 1, background: 'rgba(251,191,36,0.5)' }}/>
      <div style={{ position: 'absolute', left: inset, bottom: inset, width: 1, height: arm, background: 'rgba(251,191,36,0.5)' }}/>
      {/* BR */}
      <div style={{ position: 'absolute', right: inset, bottom: inset, width: arm, height: 1, background: 'rgba(251,191,36,0.5)' }}/>
      <div style={{ position: 'absolute', right: inset, bottom: inset, width: 1, height: arm, background: 'rgba(251,191,36,0.5)' }}/>
    </div>
  );
}

function ReadoutStat({ label, value, accent }) {
  return (
    <div>
      <div style={{
        fontSize: 13, letterSpacing: '0.35em',
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'JetBrains Mono, monospace',
        marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontSize: 40, fontWeight: 600,
        color: accent ? SQ_AMBER_HI : '#fff',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.04em',
      }}>{value}</div>
    </div>
  );
}
