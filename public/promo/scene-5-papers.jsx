// ── Scene 5: Mock Papers ────────────────────────────────────────────────────
// Shows the AQA Maths paper screenshot sliding in dramatically with annotations

function ScenePapers({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const fade = localTime > duration - 0.5 ? (duration - localTime) / 0.5 : 1;
        const slideT = clamp(localTime / 1.0, 0, 1);
        const slideE = easeOutSoft(slideT);

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1), background: '#000' }}>
            {/* Grid backdrop */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              opacity: clamp(localTime / 0.6, 0, 1),
              maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            }}/>

            {/* Paper screenshot */}
            <div style={{
              position: 'absolute',
              left: 920, top: 80,
              width: 900, height: 920,
              transform: `translateX(${(1 - slideE) * 200}px) rotate(${(1 - slideE) * 4}deg)`,
              opacity: slideE,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 40px 120px rgba(96,165,250,0.25), 0 0 0 1px rgba(255,255,255,0.08)',
            }}>
              <img src="assets/paper.png" style={{
                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
                display: 'block',
              }}/>
              {/* gradient mask at bottom */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: 200,
                background: 'linear-gradient(180deg, transparent, #000)',
              }}/>
            </div>

            {/* Left-side text */}
            <div style={{
              position: 'absolute', left: 120, top: 280,
              maxWidth: 720,
            }}>
              <div style={{
                fontSize: 20, letterSpacing: '0.5em', color: SQ_BLUE,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
                marginBottom: 28, textTransform: 'uppercase',
                opacity: clamp((localTime - 0.3) / 0.5, 0, 1),
                transform: `translateY(${(1 - clamp((localTime - 0.3) / 0.5, 0, 1)) * 16}px)`,
              }}>
                Mock Papers
              </div>
              <div style={{
                fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em',
                color: '#fff', lineHeight: 1.0,
                opacity: clamp((localTime - 0.5) / 0.6, 0, 1),
                transform: `translateY(${(1 - clamp((localTime - 0.5) / 0.6, 0, 1)) * 24}px)`,
              }}>
                Generated.<br/>
                <span style={{ color: SQ_BLUE }}>On demand.</span>
              </div>
              <div style={{
                fontSize: 26, color: 'rgba(255,255,255,0.65)',
                marginTop: 32, lineHeight: 1.45,
                opacity: clamp((localTime - 1.4) / 0.6, 0, 1),
              }}>
                Press a button. Get an exam paper that targets exactly<br/>
                what your model says you should be revising.
              </div>

              {/* Stat row */}
              <div style={{
                marginTop: 64,
                display: 'flex', gap: 60,
                opacity: clamp((localTime - 2.4) / 0.6, 0, 1),
                transform: `translateY(${(1 - clamp((localTime - 2.4) / 0.6, 0, 1)) * 16}px)`,
              }}>
                <BigStat value="75" suffix="min" label="Timed" />
                <BigStat value="60" suffix="marks" label="Mock paper" />
                <BigStat value="28" suffix="topics" label="Calibrated" />
              </div>
            </div>

            {/* Type-on annotations on the paper */}
            <PaperAnnotation
              localTime={localTime - 1.6}
              x={1280} y={310}
              text="targets weak topics"
              color={SQ_AMBER_HI}
            />
            <PaperAnnotation
              localTime={localTime - 2.3}
              x={1280} y={530}
              text="real exam format"
              color={SQ_BLUE}
            />
          </div>
        );
      }}
    </Sprite>
  );
}

function BigStat({ value, suffix, label }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <span style={{ fontSize: 88, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{suffix}</span>
      </div>
      <div style={{
        fontSize: 14, letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'JetBrains Mono, monospace',
        marginTop: 8, textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  );
}

function PaperAnnotation({ localTime, x, y, text, color }) {
  if (localTime < 0) return null;
  const t = clamp(localTime / 0.6, 0, 1);
  const chars = Math.floor(text.length * easeOutSoft(t));
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: clamp(localTime / 0.2, 0, 1),
    }}>
      <div style={{
        width: 40, height: 1, background: color,
      }}/>
      <div style={{
        padding: '8px 14px',
        background: 'rgba(10,14,26,0.92)',
        border: `1px solid ${color}66`,
        borderRadius: 4,
        fontSize: 16, color: '#fff',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}>
        {text.slice(0, chars)}<span style={{ opacity: chars < text.length ? 1 : 0, color }}>▍</span>
      </div>
    </div>
  );
}
