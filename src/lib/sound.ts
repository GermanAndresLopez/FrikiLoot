"use client";

/**
 * Sonido de éxito ligero (tipo iOS), sintetizado con Web Audio API.
 * No requiere ningún archivo de audio. Silencioso si el navegador no soporta
 * AudioContext o si el usuario aún no interactuó con la página.
 */
export function playSuccess() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const now = ctx.currentTime;

    // Dos notas ascendentes (A5 → E6): chime corto y agradable.
    const notes = [
      { freq: 880.0, at: 0 },
      { freq: 1318.5, at: 0.09 },
    ];

    for (const { freq, at } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + at);
      gain.gain.linearRampToValueAtTime(0.16, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.3);
    }

    setTimeout(() => void ctx.close(), 700);
  } catch {
    // Silencio: el feedback de audio nunca debe romper la UX.
  }
}
