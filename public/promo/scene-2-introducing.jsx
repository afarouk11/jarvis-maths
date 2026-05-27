// ── Scene 2: "Introducing" wordmark assembly ────────────────────────────────

function SceneIntroducing({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        // "Introducing" small label fades in
        const labelT = clamp(localTime / 0.6, 0, 1);
        // Wordmark glyphs assemble from various offsets
        const wordmarkT = clamp((localTime - 0.4) / 1.0, 0, 1);

        // Fade out at end
        const fade = localTime > duration - 0.5 ? (duration - localTime) / 0.5 : 1;

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1) }}>
            {/* Top label */}
            <div style={{
              position: 'absolute', left: '50%', top: 450,
              transform: `translate(-50%, ${(1 - labelT) * 20}px)`,
              opacity: labelT,
              fontSize: 22, letterSpacing: '0.55em',
              color: SQ_AMBER, fontWeight: 500,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Introducing
            </div>

            {/* Wordmark — "studiq" big lockup */}
            <Wordmark progress={wordmarkT} />

            {/* Lower meta lines */}
            <div style={{
              position: 'absolute', left: '50%', top: 720,
              transform: `translate(-50%, ${(1 - clamp((localTime - 1.4) / 0.7, 0, 1)) * 10}px)`,
              opacity: clamp((localTime - 1.4) / 0.7, 0, 1),
              fontSize: 18, letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.55)', fontWeight: 400,
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
            }}>
              studiq.org · the operating system for learning
            </div>

            {/* Side rule lines */}
            <SideRule x={500} y={580} delay={0.2} progress={labelT} />
            <SideRule x={1420} y={580} delay={0.2} progress={labelT} flip />
          </div>
        );
      }}
    </Sprite>
  );
}

function Wordmark({ progress }) {
  // Render "studiq" with each letter sliding in
  const letters = ['s', 't', 'u', 'd', 'i', 'q'];
  return (
    <div style={{
      position: 'absolute', left: '50%', top: 540,
      transform: 'translate(-50%, -50%)',
      display: 'flex', gap: 0,
      fontSize: 260, fontWeight: 800,
      letterSpacing: '-0.06em',
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1,
    }}>
      {letters.map((ch, i) => {
        const lt = clamp((progress * letters.length - i) / 1.2, 0, 1);
        const eased = easeOutSoft(lt);
        const isQ = ch === 'q';
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: eased,
            transform: `translateY(${(1 - eased) * 60}px) scale(${0.85 + 0.15 * eased})`,
            color: isQ ? SQ_AMBER_HI : '#fff',
            filter: isQ ? 'drop-shadow(0 0 24px rgba(251,191,36,0.5))' : 'none',
            willChange: 'transform, opacity',
          }}>{ch}</span>
        );
      })}
    </div>
  );
}

function SideRule({ x, y, delay, progress, flip = false }) {
  const t = clamp((progress - delay), 0, 1);
  const w = t * 200;
  return (
    <div style={{
      position: 'absolute', left: flip ? x : x - w, top: y,
      width: w, height: 1,
      background: 'linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.6) 100%)',
      transform: flip ? 'none' : 'scaleX(-1)',
    }}/>
  );
}
