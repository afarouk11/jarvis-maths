// effects.jsx — After Effects-style visual primitives.
// Flash cuts, light sweeps, particles, lens flares, RGB split, screen shake.

// ── FlashCut: brief white flash at scene boundaries ─────────────────────────
function FlashCut({ at, color = '#fff', dur = 0.35, intensity = 1 }) {
  const time = useTime();
  const dt = time - at;
  if (dt < 0 || dt > dur) return null;
  const t = dt / dur;
  // Sharp ramp up, then exponential decay
  const a = t < 0.08 ? (t / 0.08) : Math.pow(1 - (t - 0.08) / (1 - 0.08), 3);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: color,
      opacity: a * intensity,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
      zIndex: 80,
    }}/>
  );
}

// ── Multiple flash cuts at scene boundaries ─────────────────────────────────
function FlashCutTrack({ cuts }) {
  return (
    <>
      {cuts.map((c, i) => (
        <FlashCut key={i} at={c.at} color={c.color || '#fff'} dur={c.dur || 0.35} intensity={c.intensity || 0.85} />
      ))}
    </>
  );
}

// ── LightSweep: horizontal bar of light that sweeps across screen ───────────
function LightSweep({ at, dur = 0.6, y = 540, height = 200, color = 'rgba(255,255,255,0.4)', angle = -8 }) {
  const time = useTime();
  const dt = time - at;
  if (dt < 0 || dt > dur) return null;
  const t = dt / dur;
  const x = -400 + t * 2400;
  const op = Math.sin(t * Math.PI);
  return (
    <div style={{
      position: 'absolute', left: x, top: y - height/2,
      width: 600, height,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      transform: `rotate(${angle}deg)`,
      filter: 'blur(20px)',
      opacity: op,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
      zIndex: 70,
    }}/>
  );
}

// ── ParticleField: ambient drifting particles ───────────────────────────────
function ParticleField({ count = 40, color = 'rgba(96,165,250,0.6)', speed = 1 }) {
  const time = useTime();
  const particles = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 1920,
    y: Math.random() * 1080,
    vx: (Math.random() - 0.5) * 30,
    vy: (Math.random() - 0.5) * 20 - 10,
    s: Math.random() * 3 + 0.5,
    o: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  })), [count]);

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      zIndex: 30, overflow: 'hidden',
    }}>
      {particles.map((p, i) => {
        const x = (p.x + p.vx * time * speed) % 1920;
        const y = (p.y + p.vy * time * speed + 1080) % 1080;
        const tw = 0.5 + 0.5 * Math.sin(time * 2 + p.phase);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x < 0 ? x + 1920 : x,
            top: y < 0 ? y + 1080 : y,
            width: p.s, height: p.s,
            background: color,
            borderRadius: '50%',
            opacity: p.o * tw,
            boxShadow: `0 0 ${p.s * 4}px ${color}`,
          }}/>
        );
      })}
    </div>
  );
}

// ── LensFlare: anamorphic-style horizontal flare ────────────────────────────
function LensFlare({ x = 960, y = 540, intensity = 1, color = 'rgba(255,200,120,0.6)' }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 1, height: 1,
      pointerEvents: 'none', zIndex: 75,
    }}>
      {/* Horizontal anamorphic streak */}
      <div style={{
        position: 'absolute', left: -800, top: -3,
        width: 1600, height: 6,
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        opacity: intensity * 0.8,
        filter: 'blur(4px)',
        mixBlendMode: 'screen',
      }}/>
      {/* Soft glow ball */}
      <div style={{
        position: 'absolute', left: -100, top: -100,
        width: 200, height: 200,
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
        opacity: intensity,
        filter: 'blur(10px)',
        mixBlendMode: 'screen',
      }}/>
      {/* Tight core */}
      <div style={{
        position: 'absolute', left: -20, top: -20,
        width: 40, height: 40,
        background: 'radial-gradient(circle, #fff 0%, transparent 70%)',
        opacity: intensity * 1.2,
        mixBlendMode: 'screen',
      }}/>
      {/* Hexagonal ghost flare */}
      <div style={{
        position: 'absolute', left: 200, top: -40,
        width: 80, height: 80,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: intensity * 0.3,
        mixBlendMode: 'screen',
      }}/>
    </div>
  );
}

// ── Screen shake wrapper ────────────────────────────────────────────────────
function ScreenShake({ at, dur = 0.5, intensity = 12, children }) {
  const time = useTime();
  const dt = time - at;
  let tx = 0, ty = 0, rot = 0;
  if (dt >= 0 && dt < dur) {
    const decay = Math.pow(1 - dt / dur, 2);
    tx = (Math.sin(time * 80) * Math.cos(time * 53)) * intensity * decay;
    ty = (Math.sin(time * 67) * Math.cos(time * 43)) * intensity * decay;
    rot = Math.sin(time * 91) * 0.3 * decay;
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
      willChange: 'transform',
    }}>
      {children}
    </div>
  );
}

// ── ChromaticText: RGB-split text for impact moments ────────────────────────
function ChromaticText({ text, x, y, size = 200, weight = 700, splitAmount = 4, color = '#fff', letterSpacing = '-0.04em', align = 'center' }) {
  const baseStyle = {
    position: 'absolute', left: x, top: y,
    transform: align === 'center' ? 'translate(-50%, -50%)' : 'translate(0,0)',
    fontSize: size, fontWeight: weight,
    letterSpacing, fontFamily: 'Inter, system-ui, sans-serif',
    lineHeight: 1, whiteSpace: 'nowrap',
  };
  return (
    <>
      <div style={{ ...baseStyle, color: '#ff0066', mixBlendMode: 'screen', transform: `${baseStyle.transform} translateX(-${splitAmount}px)`, opacity: 0.9 }}>{text}</div>
      <div style={{ ...baseStyle, color: '#00ffcc', mixBlendMode: 'screen', transform: `${baseStyle.transform} translateX(${splitAmount}px)`, opacity: 0.9 }}>{text}</div>
      <div style={{ ...baseStyle, color }}>{text}</div>
    </>
  );
}

// ── Vertical light shaft (god ray) ──────────────────────────────────────────
function LightShaft({ x = 960, angle = 0, width = 200, height = 1400, color = 'rgba(255,200,120,0.3)', opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: -200,
      width, height,
      background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
      transform: `translateX(-50%) rotate(${angle}deg)`,
      transformOrigin: 'top center',
      filter: 'blur(30px)',
      opacity,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
      zIndex: 25,
    }}/>
  );
}

// ── Letterbox bars (slide in at start, out at end) ──────────────────────────
function Letterbox({ inAt = 0, outAt = 32, barHeight = 80 }) {
  const time = useTime();
  const inT = clamp((time - inAt) / 0.8, 0, 1);
  const outT = clamp((time - outAt) / 0.8, 0, 1);
  const inE = 1 - Math.pow(1 - inT, 3);
  const outE = Math.pow(outT, 2);
  const h = barHeight * inE - barHeight * outE;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        height: Math.max(0, h),
        background: '#000', pointerEvents: 'none', zIndex: 90,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: Math.max(0, h),
        background: '#000', pointerEvents: 'none', zIndex: 90,
      }}/>
    </>
  );
}

// ── Scan line wipe transition ───────────────────────────────────────────────
function ScanWipe({ at, dur = 0.8, color = 'rgba(96,165,250,0.9)' }) {
  const time = useTime();
  const dt = time - at;
  if (dt < 0 || dt > dur) return null;
  const t = dt / dur;
  const e = 1 - Math.pow(1 - t, 3);
  const y = e * 1200 - 100;
  return (
    <>
      {/* Bright scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: y, height: 3,
        background: color,
        boxShadow: `0 0 40px 10px ${color}, 0 0 80px 20px ${color}`,
        pointerEvents: 'none', zIndex: 85,
      }}/>
      {/* Trailing glow */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: y - 80, height: 80,
        background: `linear-gradient(180deg, transparent, ${color.replace('0.9', '0.15')})`,
        pointerEvents: 'none', zIndex: 84,
      }}/>
    </>
  );
}

// Expose to window
Object.assign(window, {
  FlashCut, FlashCutTrack, LightSweep, ParticleField, LensFlare,
  ScreenShake, ChromaticText, LightShaft, Letterbox, ScanWipe,
});
