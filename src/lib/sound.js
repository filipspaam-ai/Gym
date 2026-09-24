// Timer alerts: a short synth chime + vibration. Audio must be unlocked by a user gesture first.

let ctx = null;

export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq, start, dur, gain = 0.18) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function chime(kind = "done") {
  try {
    navigator.vibrate?.(kind === "done" ? [180, 90, 180] : 60);
  } catch {
    // vibration unsupported
  }
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  if (kind === "done") {
    tone(880, t, 0.16);
    tone(1175, t + 0.16, 0.16);
    tone(1760, t + 0.32, 0.32);
  } else {
    tone(660, t, 0.09, 0.12);
  }
}
