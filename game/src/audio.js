// Synthesized sound: tiny WebAudio bleeps, no audio files, no network.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
  return muted;
}

export function isMuted() {
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function blip(freq, dur, type = 'sine', gain = 0.12, when = 0) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSound(kind) {
  if (kind === 'play') { blip(520, 0.12, 'triangle', 0.14); blip(780, 0.14, 'triangle', 0.1, 0.06); }
  else if (kind === 'hit') { blip(180, 0.18, 'sawtooth', 0.16); blip(90, 0.22, 'square', 0.1, 0.05); }
  else if (kind === 'draw') { blip(660, 0.08, 'sine', 0.08); }
  else if (kind === 'turn') { blip(440, 0.1, 'sine', 0.1); blip(587, 0.12, 'sine', 0.1, 0.08); }
  else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.14, i * 0.12)); }
  else if (kind === 'lose') { [392, 330, 262, 196].forEach((f, i) => blip(f, 0.26, 'sawtooth', 0.1, i * 0.14)); }
  else if (kind === 'error') { blip(140, 0.15, 'square', 0.1); }
}
