// ── Scene 7: Rapid Feature Cascade ──────────────────────────────────────────
// Quick cuts of features. ~4s, 8 cells of 0.5s each.

function SceneCascade({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const fade = localTime > duration - 0.4 ? (duration - localTime) / 0.4 : 1;

        const features = [
          { t: 0.0,  label: 'Predicted Grade',     value: 'A*',   color: '#10b981' },
          { t: 0.5,  label: 'Topic Mastery',       value: '47%',  color: SQ_AMBER },
          { t: 1.0,  label: 'XP Streak',           value: '12d',  color: '#a78bfa' },
          { t: 1.5,  label: 'Past Papers',         value: '28',   color: SQ_BLUE },
          { t: 2.0,  label: 'Voice Tutor',         value: 'LIVE', color: SQ_AMBER_HI },
          { t: 2.5,  label: 'Marks Earned',        value: '60/60',color: '#10b981' },
          { t: 3.0,  label: 'Boards Supported',    value: '3',    color: SQ_BLUE },
          { t: 3.5,  label: 'Built for A-Level',   value: '24/7', color: SQ_AMBER_HI },
        ];

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1), background: '#000' }}>
            {/* Grid backdrop */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
            }}/>

            {/* Section header */}
            <div style={{
              position: 'absolute', left: '50%', top: 80,
              transform: 'translateX(-50%)',
              fontSize: 18, letterSpacing: '0.6em',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase', fontWeight: 500,
              opacity: clamp(localTime / 0.4, 0, 1),
            }}>
              The whole system
            </div>

            {/* Current feature in center */}
            <CascadeCard features={features} localTime={localTime} />

            {/* Ticker at bottom */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 80,
              display: 'flex', justifyContent: 'center', gap: 12,
              opacity: clamp((localTime - 0.2) / 0.4, 0, 1),
            }}>
              {features.map((f, i) => {
                const active = localTime >= f.t && localTime < f.t + 0.5;
                return (
                  <div key={i} style={{
                    width: 60, height: 4,
                    background: active ? f.color : 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    transition: 'background 0.2s',
                  }}/>
                );
              })}
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

function CascadeCard({ features, localTime }) {
  // Show whichever feature's t-window contains localTime
  const active = features.findIndex(f => localTime >= f.t && localTime < f.t + 0.5);
  if (active < 0) return null;
  const f = features[active];
  const lt = localTime - f.t;
  const inT = clamp(lt / 0.18, 0, 1);
  const outT = clamp((lt - 0.32) / 0.18, 0, 1);
  const e = easeOutSoft(inT);
  const o = e * (1 - easeOutSoft(outT));
  const tx = (1 - e) * 80 - easeOutSoft(outT) * 60;

  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: `translate(-50%, -50%) translateX(${tx}px)`,
      opacity: o,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      willChange: 'transform, opacity',
    }}>
      <div style={{
        fontSize: 24, letterSpacing: '0.4em',
        color: f.color, textTransform: 'uppercase',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500, marginBottom: 32,
      }}>{f.label}</div>
      <div style={{
        fontSize: 320, fontWeight: 800,
        color: '#fff', letterSpacing: '-0.06em',
        lineHeight: 1,
        textShadow: `0 0 80px ${f.color}40, 0 0 180px ${f.color}20`,
      }}>
        {f.value}
      </div>
      {/* Underline accent */}
      <div style={{
        marginTop: 32,
        width: 200, height: 3,
        background: f.color,
        boxShadow: `0 0 24px ${f.color}`,
        transform: `scaleX(${e})`,
        transformOrigin: 'center',
      }}/>
    </div>
  );
}
