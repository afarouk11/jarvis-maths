// ── Scene 3: Hero tagline ───────────────────────────────────────────────────
// "The way A-Levels were meant to be studied."
// Apple-style kinetic typography: words swap, scale, glow

function SceneHero({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const fade = localTime > duration - 0.5 ? (duration - localTime) / 0.5 : 1;
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1) }}>
            <HeroTagline localTime={localTime} />
            {/* Background gradient that brightens */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 1200px 600px at 50% 50%, rgba(96,165,250,${0.08 * clamp(localTime / 1.2, 0, 1)}) 0%, transparent 70%)`,
              zIndex: -1,
            }}/>
          </div>
        );
      }}
    </Sprite>
  );
}

function HeroTagline({ localTime }) {
  // Three-phase tagline. Each phase replaces the previous.
  // 0.0–1.3 : "Built for"
  // 1.3–2.6 : "A-Levels."
  // 2.6–end : "Built different."  (with subtle accent on "different")
  const phases = [
    { text: 'Built for',         start: 0.0, end: 1.4, size: 200 },
    { text: 'A-Levels.',         start: 1.3, end: 2.7, size: 220, accent: true },
    { text: 'Built different.',  start: 2.6, end: 4.2, size: 200, accentWord: 'different.' },
  ];

  return (
    <>
      {phases.map((p, i) => {
        if (localTime < p.start - 0.1 || localTime > p.end + 0.1) return null;
        const lt = localTime - p.start;
        const phaseDur = p.end - p.start;
        const inT = clamp(lt / 0.4, 0, 1);
        const outT = clamp((lt - (phaseDur - 0.4)) / 0.4, 0, 1);
        const op = easeOutSoft(inT) * (1 - easeOutSoft(outT));
        const ty = (1 - easeOutSoft(inT)) * 50 - easeOutSoft(outT) * 30;
        const blur = (1 - easeOutSoft(inT)) * 16 + easeOutSoft(outT) * 16;

        const words = p.text.split(' ');
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: 540,
            transform: `translate(-50%, calc(-50% + ${ty}px))`,
            opacity: op,
            fontSize: p.size, fontWeight: 700,
            letterSpacing: '-0.04em',
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: '#fff',
            filter: `blur(${blur}px)`,
            textShadow: p.accent ? '0 0 60px rgba(251,191,36,0.4)' : 'none',
            willChange: 'transform, opacity, filter',
          }}>
            {words.map((w, wi) => (
              <span key={wi} style={{
                color: (p.accentWord === w) ? SQ_AMBER_HI : '#fff',
                marginRight: wi < words.length - 1 ? 24 : 0,
                textShadow: (p.accentWord === w) ? '0 0 50px rgba(251,191,36,0.6)' : 'none',
              }}>{w}</span>
            ))}
          </div>
        );
      })}

      {/* Persistent meta tag */}
      <div style={{
        position: 'absolute', left: '50%', top: 740,
        transform: 'translate(-50%, 0)',
        fontSize: 22, letterSpacing: '0.4em',
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'JetBrains Mono, monospace',
        textTransform: 'uppercase',
        opacity: clamp((localTime - 0.4) / 0.5, 0, 1),
      }}>
        AQA · OCR · Edexcel
      </div>
    </>
  );
}
