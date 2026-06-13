"use client";

/**
 * Efectos de sonido ligeros sintetizados con Web Audio API (sin assets).
 * Varias variantes para que el feedback no sea siempre idéntico.
 * Silencioso si el navegador no soporta AudioContext.
 */

interface Note {
  freq: number;
  at: number; // segundos desde ahora
  dur?: number;
  type?: OscillatorType;
  gain?: number;
}

function play(notes: Note[]) {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const now = ctx.currentTime;
    let end = 0;

    for (const n of notes) {
      const dur = n.dur ?? 0.28;
      const peak = n.gain ?? 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0, now + n.at);
      gain.gain.linearRampToValueAtTime(peak, now + n.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.at);
      osc.stop(now + n.at + dur + 0.02);
      end = Math.max(end, n.at + dur);
    }

    setTimeout(() => void ctx.close(), (end + 0.1) * 1000 + 100);
  } catch {
    // El feedback de audio nunca debe romper la UX.
  }
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Varias melodías cortas y agradables para "agregado".
const SUCCESS_VARIANTS: Note[][] = [
  [{ freq: 880.0, at: 0 }, { freq: 1318.5, at: 0.09 }], // A5 → E6
  [{ freq: 783.99, at: 0 }, { freq: 1174.66, at: 0.1 }], // G5 → D6
  [{ freq: 1046.5, at: 0 }, { freq: 1567.98, at: 0.08 }], // C6 → G6
  [{ freq: 659.25, at: 0 }, { freq: 987.77, at: 0.08 }, { freq: 1318.5, at: 0.16 }], // E5 B5 E6
  [{ freq: 698.46, at: 0 }, { freq: 1046.5, at: 0.09 }], // F5 → C6
];

/** Éxito corto (agregar al carrito). Varía cada vez. */
export function playSuccess() {
  play(pick(SUCCESS_VARIANTS));
}

/** Toque muy breve (cambios de cantidad). */
export function playPop() {
  play([{ freq: pick([587.33, 659.25, 698.46, 783.99]), at: 0, dur: 0.09, gain: 0.08 }]);
}

/** Tono descendente suave (eliminar). */
export function playRemove() {
  play([
    { freq: 493.88, at: 0, dur: 0.12, gain: 0.1 },
    { freq: 349.23, at: 0.07, dur: 0.16, gain: 0.1 },
  ]);
}

// Arpegios ascendentes festivos para confirmar el pedido.
const CELEBRATE_VARIANTS: Note[][] = [
  [
    { freq: 523.25, at: 0 },
    { freq: 659.25, at: 0.08 },
    { freq: 783.99, at: 0.16 },
    { freq: 1046.5, at: 0.24, dur: 0.4 },
  ], // C E G C
  [
    { freq: 587.33, at: 0 },
    { freq: 739.99, at: 0.08 },
    { freq: 880.0, at: 0.16 },
    { freq: 1174.66, at: 0.24, dur: 0.4 },
  ], // D F# A D
  [
    { freq: 659.25, at: 0 },
    { freq: 830.61, at: 0.08 },
    { freq: 987.77, at: 0.16 },
    { freq: 1318.5, at: 0.24, dur: 0.4 },
  ], // E G# B E
];

/** Celebración más larga (pedido confirmado / checkout). */
export function playCelebrate() {
  play(pick(CELEBRATE_VARIANTS));
}
