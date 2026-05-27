// narration.js — speaks over the score using the browser's speech synthesis.
// Triggered from the Stage playhead. Cancels on scrub so it stays in sync.

(function () {
  const CUES = [
    { t: 3.6,  text: 'Introducing.' },
    { t: 4.8,  text: 'Studiq.' },
    { t: 6.8,  text: 'Built for A-Levels.' },
    { t: 9.0,  text: 'Built different.' },
    { t: 11.0, text: 'A neural map of every concept you\'ve learned.' },
    { t: 15.8, text: 'Mock papers, generated on demand.' },
    { t: 20.6, text: 'Meet S-P-O-K.' },
    { t: 22.2, text: 'Your Scientific Predictor of Knowledge.' },
    { t: 28.6, text: 'StudIQ. Available now at studiq dot org.' },
  ];

  let voice = null;
  let voicesReady = false;
  let firedIndex = -1;
  let enabled = true;

  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const all = speechSynthesis.getVoices();
    if (!all.length) return null;
    // Prefer deep, neutral male English voices for that Apple-keynote feel.
    const order = [
      v => /en-GB/i.test(v.lang) && /daniel/i.test(v.name),
      v => /en-GB/i.test(v.lang) && /(male|oliver|arthur)/i.test(v.name),
      v => /en-US/i.test(v.lang) && /(alex|tom|aaron|fred)/i.test(v.name),
      v => /google.*uk.*english.*male/i.test(v.name),
      v => /google.*us.*english/i.test(v.name),
      v => /en-GB/i.test(v.lang),
      v => /en/i.test(v.lang),
    ];
    for (const test of order) {
      const found = all.find(test);
      if (found) return found;
    }
    return all[0];
  }

  function ensureVoice() {
    if (voice) return voice;
    voice = pickVoice();
    return voice;
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => { voicesReady = true; ensureVoice(); };
    ensureVoice();
  }

  function speak(text) {
    if (!enabled || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = ensureVoice();
      if (v) u.voice = v;
      u.rate = 0.95;
      u.pitch = 0.9;
      u.volume = 1.0;
      speechSynthesis.speak(u);
    } catch (e) { /* swallow */ }
  }

  function cancel() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  // Called each frame from Stage. `t` is current playhead seconds.
  function tick(t) {
    if (!enabled) return;
    // Find the highest cue whose time has passed
    let idx = -1;
    for (let i = 0; i < CUES.length; i++) {
      if (t >= CUES[i].t && t < CUES[i].t + 4.0) idx = i;
    }
    if (idx !== -1 && idx !== firedIndex) {
      firedIndex = idx;
      speak(CUES[idx].text);
    }
    // If we scrubbed back before all cues, reset
    if (idx === -1 && t < 3.5) {
      firedIndex = -1;
      cancel();
    }
  }

  function reset() {
    firedIndex = -1;
    cancel();
  }

  function setEnabled(on) {
    enabled = on;
    if (!on) cancel();
  }

  window.StudiqNarration = { tick, reset, setEnabled, cancel };
})();
