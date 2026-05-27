// ── Scene 6: SPOK ───────────────────────────────────────────────────────────
// "Just A Rather Very Intelligent System" — Jarvis-style AI tutor

function SceneSpok({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const fade = localTime > duration - 0.5 ? (duration - localTime) / 0.5 : 1;

        // Orb assembles + scales
        const orbT = clamp(localTime / 1.4, 0, 1);
        const orbE = easeOutSoft(orbT);

        return (
          <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1), background: '#000' }}>
            {/* Background image with crop on orb area */}
            <div style={{
              position: 'absolute', inset: 0,
              opacity: clamp(localTime / 0.6, 0, 1),
            }}>
              <img src="assets/spok.png" style={{
                position: 'absolute', left: 0, top: 0,
                width: 1920, height: 1080, objectFit: 'cover',
                filter: 'brightness(1.05)',
              }}/>
              {/* darken the left chat side */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: 1100, bottom: 0,
                background: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.7) 100%)',
              }}/>
            </div>

            {/* Big orb ring overlays — animated */}
            <div style={{
              position: 'absolute', left: 1380, top: 540,
              transform: `translate(-50%, -50%) scale(${0.6 + orbE * 0.4})`,
              opacity: orbE,
              pointerEvents: 'none',
            }}>
              <OrbRings localTime={localTime} />
            </div>

            {/* Left-side text */}
            <div style={{
              position: 'absolute', left: 120, top: 280,
              maxWidth: 760,
            }}>
              <div style={{
                fontSize: 20, letterSpacing: '0.5em', color: SQ_AMBER_HI,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
                marginBottom: 28, textTransform: 'uppercase',
                opacity: clamp((localTime - 0.3) / 0.5, 0, 1),
              }}>
                Meet SPOK
              </div>
              <div style={{
                fontSize: 100, fontWeight: 700, letterSpacing: '-0.04em',
                color: '#fff', lineHeight: 1.0,
                opacity: clamp((localTime - 0.5) / 0.6, 0, 1),
                transform: `translateY(${(1 - clamp((localTime - 0.5) / 0.6, 0, 1)) * 24}px)`,
              }}>
                A tutor that<br/>
                <span style={{ color: SQ_AMBER_HI }}>actually knows you.</span>
              </div>

              {/* JARVIS-style acronym readout */}
              <div style={{
                marginTop: 56,
                fontSize: 22, color: 'rgba(255,255,255,0.55)',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.15em',
                lineHeight: 1.8,
                opacity: clamp((localTime - 1.4) / 0.6, 0, 1),
              }}>
                <AcronymLine letter="J" word="ust" subword="" delay={0.0} localTime={localTime - 1.4} />
                <AcronymLine letter="A" word="" subword="" delay={0.18} localTime={localTime - 1.4} hide />
                <AcronymLine letter="R" word="ather" subword="" delay={0.28} localTime={localTime - 1.4} />
                <AcronymLine letter="V" word="ery" subword="" delay={0.42} localTime={localTime - 1.4} />
                <AcronymLine letter="I" word="ntelligent" subword="" delay={0.56} localTime={localTime - 1.4} />
                <AcronymLine letter="S" word="ystem" subword="" delay={0.70} localTime={localTime - 1.4} />
              </div>
            </div>

            {/* Voice waveform readout — bottom right */}
            <div style={{
              position: 'absolute', right: 200, bottom: 180,
              display: 'flex', alignItems: 'center', gap: 4,
              opacity: clamp((localTime - 1.0) / 0.5, 0, 1),
            }}>
              {Array.from({ length: 24 }).map((_, i) => {
                const v = 0.3 + 0.7 * Math.abs(Math.sin(localTime * 4 + i * 0.5) * Math.cos(localTime * 2 + i * 0.3));
                return (
                  <div key={i} style={{
                    width: 3, height: 20 + v * 60,
                    background: SQ_AMBER_HI,
                    borderRadius: 2,
                    opacity: 0.7,
                  }}/>
                );
              })}
            </div>

            {/* Tag below waveform */}
            <div style={{
              position: 'absolute', right: 200, bottom: 130,
              fontSize: 14, color: SQ_AMBER_HI,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.4em', textTransform: 'uppercase',
              opacity: clamp((localTime - 1.2) / 0.5, 0, 1),
            }}>
              ◆ Ready · Tap to speak
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

function AcronymLine({ letter, word, delay, localTime, hide }) {
  const t = clamp((localTime - delay) / 0.4, 0, 1);
  const eased = easeOutSoft(t);
  return (
    <div style={{
      opacity: eased,
      transform: `translateX(${(1 - eased) * 16}px)`,
    }}>
      <span style={{ color: SQ_AMBER_HI, fontWeight: 600, fontSize: 26 }}>{letter}</span>
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{word}</span>
      {hide ? null : null}
    </div>
  );
}

function OrbRings({ localTime }) {
  // Animated rotating wireframe rings around a central glow
  return (
    <div style={{ position: 'relative', width: 800, height: 800 }}>
      {/* Outer ellipse 1 */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '1px solid rgba(251,191,36,0.15)',
        borderRadius: '50%',
        transform: `rotateX(75deg) rotateZ(${localTime * 12}deg)`,
      }}/>
      {/* Outer ellipse 2 */}
      <div style={{
        position: 'absolute', inset: 100,
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '50%',
        transform: `rotateX(60deg) rotateY(20deg) rotateZ(${-localTime * 18}deg)`,
      }}/>
      {/* Central glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 220, height: 220,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(251,191,36,0.15) 40%, transparent 70%)',
        filter: `blur(${8 + Math.sin(localTime * 3) * 4}px)`,
      }}/>
      {/* Inner core */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 30, height: 30,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: '#fbbf24',
        boxShadow: '0 0 80px 20px rgba(251,191,36,0.7)',
      }}/>
    </div>
  );
}
