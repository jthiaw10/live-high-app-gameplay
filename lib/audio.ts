/**
 * AudioManager — procedurally generated sound effects via Web Audio API.
 *
 * Why procedural? The project ships with no audio files. Rather than
 * blocking on asset delivery, we synthesize tiny chiptune-style blips
 * for each game event. Drop-in replacement with real samples later is
 * straightforward: swap the `play*` implementations to call
 * `new Audio(require('../assets/...'))` or expo-av's `Sound` API.
 *
 * Falls back gracefully to a no-op if Web Audio is unavailable
 * (e.g. on native without expo-av installed).
 */

type SoundEvent =
  | 'menuClick'
  | 'jump'
  | 'coin'
  | 'hit'
  | 'death'
  | 'levelComplete'
  | 'victory'
  | 'gameOver';

interface AudioSettings {
  masterEnabled: boolean;
  sfxVolume: number; // 0..1
  musicVolume: number; // 0..1 (reserved for future)
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private settings: AudioSettings = {
    masterEnabled: true,
    sfxVolume: 0.5,
    musicVolume: 0.3,
  };

  /**
   * Web Audio contexts must be created in response to a user gesture
   * on many browsers. Call `ensureReady` from a tap/click handler
   * before the first sound plays.
   */
  ensureReady() {
    if (this.initialized) return;
    try {
      const g = (globalThis as any);
      const Ctor = g.AudioContext || g.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.initialized = true;
    } catch {
      // no-op on platforms without Web Audio
    }
  }

  setSfxVolume(v: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, v));
  }

  setMusicVolume(v: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, v));
  }

  setEnabled(enabled: boolean) {
    this.settings.masterEnabled = enabled;
  }

  getSettings(): Readonly<AudioSettings> {
    return { ...this.settings };
  }

  /**
   * Core tone generator — a short oscillator + gain envelope.
   * Used by all play* helpers so we have one well-tuned primitive.
   */
  private tone(
    frequency: number,
    durationSec: number,
    type: OscillatorType = 'square',
    attack = 0.005,
    release = 0.12,
    delay = 0
  ) {
    if (!this.settings.masterEnabled) return;
    this.ensureReady();
    const ctx = this.ctx;
    if (!ctx) return;

    const start = ctx.currentTime + delay;
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);

    const vol = this.settings.sfxVolume * 0.25;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + attack);
    gain.gain.linearRampToValueAtTime(0, start + attack + durationSec + release);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + attack + durationSec + release + 0.05);
  }

  private sweep(from: number, to: number, durationSec: number, type: OscillatorType = 'square') {
    if (!this.settings.masterEnabled) return;
    this.ensureReady();
    const ctx = this.ctx;
    if (!ctx) return;

    const start = ctx.currentTime;
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();

    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + durationSec);

    const vol = this.settings.sfxVolume * 0.25;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.linearRampToValueAtTime(0, start + durationSec + 0.05);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationSec + 0.1);
  }

  play(event: SoundEvent) {
    switch (event) {
      case 'menuClick':
        this.tone(660, 0.04, 'square');
        return;
      case 'jump':
        this.sweep(320, 780, 0.14, 'square');
        return;
      case 'coin':
        this.tone(988, 0.05, 'triangle');
        this.tone(1319, 0.08, 'triangle', 0.005, 0.15, 0.05);
        return;
      case 'hit':
        this.sweep(400, 90, 0.2, 'sawtooth');
        return;
      case 'death':
        this.sweep(520, 60, 0.55, 'square');
        return;
      case 'levelComplete':
        this.tone(523, 0.12, 'triangle');
        this.tone(659, 0.12, 'triangle', 0.005, 0.12, 0.12);
        this.tone(784, 0.12, 'triangle', 0.005, 0.12, 0.24);
        this.tone(1047, 0.25, 'triangle', 0.005, 0.2, 0.36);
        return;
      case 'victory':
        this.tone(659, 0.14, 'triangle');
        this.tone(784, 0.14, 'triangle', 0.005, 0.12, 0.14);
        this.tone(988, 0.14, 'triangle', 0.005, 0.12, 0.28);
        this.tone(1319, 0.35, 'triangle', 0.005, 0.25, 0.42);
        return;
      case 'gameOver':
        this.sweep(420, 110, 0.6, 'square');
        this.tone(180, 0.35, 'sawtooth', 0.01, 0.3, 0.5);
        return;
    }
  }
}

// Singleton — one audio context for the whole app.
export const audio = new AudioManager();
export type { SoundEvent, AudioSettings };
