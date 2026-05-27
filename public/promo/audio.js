// Apple-keynote-style synth score. Generated entirely with Web Audio.
// Auto-starts once the user clicks anywhere (browser autoplay policy).

(function () {
  let ctx = null;
  let started = false;
  let masterGain = null;
  const startTime = { value: 0 };

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    // Soft master fade-in
    masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.2);
    return ctx;
  }

  // Pad voice: two detuned sawtooths through lowpass, slow attack
  function padNote(freq, t0, dur, vol = 0.06) {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.value = freq;
    o2.frequency.value = freq * 1.005;

    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 800;
    filt.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(vol, t0 + 0.6);
    g.gain.linearRampToValueAtTime(vol * 0.9, t0 + dur - 0.4);
    g.gain.linearRampToValueAtTime(0, t0 + dur);

    // Slow filter sweep upward
    filt.frequency.setValueAtTime(600, t0);
    filt.frequency.linearRampToValueAtTime(2400, t0 + dur);

    o1.connect(filt); o2.connect(filt); filt.connect(g); g.connect(masterGain);
    o1.start(t0); o2.start(t0);
    o1.stop(t0 + dur + 0.1); o2.stop(t0 + dur + 0.1);
  }

  // Sine bell — used for keynote-style chimes
  function bell(freq, t0, dur = 1.4, vol = 0.18) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    // Subtle harmonic
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(vol * 0.35, t0 + 0.005);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.7);

    o.connect(g); g.connect(masterGain);
    o2.connect(g2); g2.connect(masterGain);
    o.start(t0); o2.start(t0);
    o.stop(t0 + dur + 0.1); o2.stop(t0 + dur + 0.1);
  }

  // Sub-bass pulse — heartbeat
  function sub(freq, t0, dur = 0.8, vol = 0.22) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 2, t0);
    o.frequency.exponentialRampToValueAtTime(freq, t0 + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  // Noise riser — that "whoosh" before a hero moment
  function riser(t0, dur = 1.5, vol = 0.12) {
    const bufLen = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (i / bufLen);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.Q.value = 6;
    filt.frequency.setValueAtTime(400, t0);
    filt.frequency.exponentialRampToValueAtTime(6000, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.85);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  // Tick — UI click accent
  function tick(t0, vol = 0.08) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(2400, t0);
    o.frequency.exponentialRampToValueAtTime(800, t0 + 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + 0.08);
  }

  // Schedule the full ~32s score
  function scheduleScore(t0) {
    // Minor key — C minor: C(130.81) Eb(155.56) G(196.00) Bb(233.08) D(146.83)
    const C2 = 65.41, C3 = 130.81, Eb3 = 155.56, G3 = 196.00, Bb3 = 233.08, D4 = 293.66, F4 = 349.23, G4 = 392.00, Bb4 = 466.16, C5 = 523.25, Eb5 = 622.25, G5 = 783.99;

    // Bed: 32s evolving pad
    padNote(C3, t0 + 0.0, 16, 0.05);
    padNote(Eb3, t0 + 0.0, 16, 0.04);
    padNote(G3, t0 + 0.0, 16, 0.035);

    padNote(Bb3, t0 + 16, 16, 0.05);
    padNote(D4, t0 + 16, 16, 0.04);
    padNote(F4, t0 + 16, 16, 0.035);

    // Heartbeat sub pulses 0–8
    for (let i = 0; i < 8; i++) sub(C2, t0 + i * 1.0, 0.5, 0.13);

    // Opening chimes
    bell(C5, t0 + 0.2, 2.0, 0.16);
    bell(G5, t0 + 2.8, 2.0, 0.14);

    // Scene transition risers + bells
    riser(t0 + 4.0, 1.5, 0.10);
    bell(Eb5, t0 + 5.5, 1.8, 0.14);

    riser(t0 + 8.0, 1.2, 0.10);
    bell(G5, t0 + 9.2, 1.6, 0.13);

    riser(t0 + 13.5, 1.4, 0.10);
    bell(Bb4, t0 + 14.9, 1.6, 0.13);

    riser(t0 + 19.0, 1.3, 0.10);
    bell(C5, t0 + 20.3, 1.6, 0.13);

    // Rapid feature cascade ticks 24–28
    for (let i = 0; i < 8; i++) tick(t0 + 24 + i * 0.5, 0.07);

    // Climax riser + final hit
    riser(t0 + 27.5, 2.2, 0.18);
    bell(C5, t0 + 29.8, 3.0, 0.20);
    bell(Eb5, t0 + 29.8, 3.0, 0.14);
    bell(G5, t0 + 29.8, 3.0, 0.10);
    sub(C2, t0 + 29.8, 2.0, 0.28);
  }

  function startScore() {
    if (started) return;
    started = true;
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    startTime.value = ctx.currentTime + 0.05;
    scheduleScore(startTime.value);
    // Loop after 32s
    setInterval(() => {
      const next = ctx.currentTime + 0.1;
      startTime.value = next;
      scheduleScore(next);
    }, 32000);
  }

  function stopScore() {
    if (!ctx) return;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    started = false;
  }

  window.StudiqAudio = {
    start: startScore,
    stop: stopScore,
    isStarted: () => started,
  };
})();
