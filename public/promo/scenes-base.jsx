// StudIQ promo — scene library.
// Apple-keynote aesthetics: deep black, amber/blue accent, kinetic typography,
// product reveals with parallax, rapid feature cascade, final logo glow.

// ── Shared visual atoms ─────────────────────────────────────────────────────

const SQ_AMBER = '#f59e0b';
const SQ_AMBER_HI = '#fbbf24';
const SQ_BLUE = '#60a5fa';
const SQ_INK = '#0a0e1a';
const SQ_INK2 = '#0d1322';

// Cinematic vignette behind every scene
function Vignette() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(20,30,60,0.35) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse at center, transparent 30%, #000 95%)',
      pointerEvents: 'none', zIndex: 50,
    }}/>
  );
}

// Subtle film grain
function FilmGrain() {
  const time = useTime();
  const offset = Math.floor(time * 24) % 8;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: 0.07,
      mixBlendMode: 'overlay',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${offset}'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
      pointerEvents: 'none', zIndex: 60,
    }}/>
  );
}

// Cross-scene easings
const easeOutSoft = (t) => 1 - Math.pow(1 - t, 3);
const easeInSoft = (t) => t * t * t;

// Scene fade helper — fades inner content in/out at edges
function SceneFade({ start, end, fadeIn = 0.6, fadeOut = 0.6, children, style = {} }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        let o = 1;
        if (localTime < fadeIn) o = easeOutSoft(localTime / fadeIn);
        else if (localTime > duration - fadeOut) o = easeOutSoft((duration - localTime) / fadeOut);
        o = clamp(o, 0, 1);
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: o, ...style }}>
            {children}
          </div>
        );
      }}
    </Sprite>
  );
}

// Letter-by-letter reveal text
function KineticText({ text, x, y, size = 120, weight = 700, color = '#fff', letterSpacing = '-0.04em', align = 'center', delayPer = 0.04, startAt = 0, blur = false }) {
  const { localTime } = useSprite();
  const letters = text.split('');
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: align === 'center' ? 'translate(-50%, -50%)' : 'translate(0,0)',
      display: 'flex', gap: 0,
      fontSize: size, fontWeight: weight, color,
      letterSpacing, fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1,
      whiteSpace: 'pre',
    }}>
      {letters.map((ch, i) => {
        const t = clamp((localTime - startAt - i * delayPer) / 0.6, 0, 1);
        const eased = easeOutSoft(t);
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: eased,
            transform: `translateY(${(1 - eased) * 30}px)`,
            filter: blur ? `blur(${(1 - eased) * 12}px)` : 'none',
            willChange: 'transform, opacity',
          }}>{ch === ' ' ? '\u00A0' : ch}</span>
        );
      })}
    </div>
  );
}
