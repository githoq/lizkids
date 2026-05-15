/* =========================================================================
   LIZKIDS — ENGINE DE ÁUDIO PREMIUM CINEMATOGRÁFICO
   Inspirado na atmosfera sonora de Disney, Pixar, Lingokids.
   100% procedural via Web Audio API. Sem arquivos externos.

   Arquitetura:
   - Camada 1: Pad de acordes (C→Am→F→G, 6s cada)
   - Camada 2: Melodia glockenspiel pentatônica aleatória
   - Camada 3: SFX premium com harmonics e envelopes ricos
   ========================================================================= */

import { Storage } from './storage.js';
import { Bus }     from './state.js';

/* ───── CONSTANTES MUSICAIS ──────────────────────────────────────────── */

// Progressão clássica infantil: C → Am → F → G
const CHORDS = [
  [130.81, 164.81, 196.00, 261.63, 329.63],   // C major  (C3 E3 G3 C4 E4)
  [110.00, 130.81, 164.81, 220.00, 261.63],   // A minor  (A2 C3 E3 A3 C4)
  [174.61, 220.00, 261.63, 349.23, 440.00],   // F major  (F3 A3 C4 F4 A4)
  [146.83, 196.00, 246.94, 293.66, 392.00],   // G major  (D3 G3 B3 D4 G4)
];

// Escala pentatônica de C (sempre soa bem sobre a progressão)
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];

const CHORD_DURATION = 6.0;   // segundos por acorde
const LOOK_AHEAD     = 12.0;  // quanto adiantar o agendamento
const TARGET_MUSIC   = 0.22;  // volume alvo da música

/* ───── ENGINE ────────────────────────────────────────────────────────── */

class AudioEngine {
  constructor () {
    this.ctx          = null;
    this.masterGain   = null;
    this.musicGain    = null;
    this.fxGain       = null;
    this._unlocked    = false;
    this._musicOn     = false;
    this._chordIdx    = 0;
    this._nextTime    = 0;
    this._chordTimer  = null;
    this._melodyTimer = null;
  }

  /* ── Unlock ─────────────────────────────────────────────────────────── */

  unlock () {
    if (this._unlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.88;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;           // começa mudo, faz fade-in
      this.musicGain.connect(this.masterGain);

      this.fxGain = this.ctx.createGain();
      this.fxGain.gain.value = 0.70;
      this.fxGain.connect(this.masterGain);

      this._unlocked = true;

      const s = Storage.data.settings;
      if (s.music !== false) this.startMusic();
    } catch (e) {
      console.warn('[Audio] unlock falhou:', e.message);
    }
  }

  /* ── Música: ligar/desligar ────────────────────────────────────────── */

  startMusic () {
    if (!this.ctx || this._musicOn) return;
    this._musicOn = true;
    this._nextTime = this.ctx.currentTime + 0.3;
    this._chordIdx = 0;
    this._scheduleChords();
    this._scheduleMelody();
    // Fade-in suave: 2.5 segundos
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(TARGET_MUSIC, this.ctx.currentTime + 2.5);
  }

  stopMusic () {
    this._musicOn = false;
    clearTimeout(this._chordTimer);
    clearTimeout(this._melodyTimer);
    if (!this.ctx || !this.musicGain) return;
    // Fade-out: 1.2 segundos
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
  }

  /* ── Agendamento de acordes ─────────────────────────────────────────── */

  _scheduleChords () {
    if (!this._musicOn || !this.ctx) return;

    const now = this.ctx.currentTime;
    while (this._nextTime < now + LOOK_AHEAD) {
      const chord = CHORDS[this._chordIdx % 4];
      chord.forEach((freq, i) => {
        // Cada nota do acorde entra com pequeno stagger (estilo piano)
        this._playPad(freq, this._nextTime + i * 0.06, CHORD_DURATION, 0.022);
      });
      this._chordIdx++;
      this._nextTime += CHORD_DURATION;
    }

    this._chordTimer = setTimeout(() => this._scheduleChords(), 4000);
  }

  _playPad (freq, when, dur, vol) {
    if (!this.ctx || !this._musicOn) return;

    // Dois osciladores levemente desafinados → "ensemble" quente
    const DETUNE = [0, 4]; // cents
    DETUNE.forEach((cents, i) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lp   = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = cents;

      lp.type      = 'lowpass';
      lp.frequency.value = 1100;
      lp.Q.value   = 0.4;

      const v = i === 0 ? vol : vol * 0.55;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(v, when + 1.2);        // attack: 1.2s
      gain.gain.setValueAtTime(v, when + dur - 1.5);
      gain.gain.linearRampToValueAtTime(0, when + dur);         // release: 1.5s

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.musicGain);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    });
  }

  /* ── Agendamento de melodia glockenspiel ──────────────────────────── */

  _scheduleMelody () {
    if (!this._musicOn) return;

    const playPhrase = () => {
      if (!this._musicOn || !this.ctx) return;

      // Escolhe 2-4 notas e ordena (ascendente ou descendente) para fraseado musical
      const count = 2 + Math.floor(Math.random() * 3);
      const notes = [...PENTA].sort(() => Math.random() - 0.5).slice(0, count);
      if (Math.random() < 0.6) notes.sort((a, b) => a - b);
      else notes.sort((a, b) => b - a);

      let t = this.ctx.currentTime + 0.05;
      notes.forEach(freq => {
        this._playGlock(freq, t, 0.10);
        t += 0.16 + Math.random() * 0.20;
      });

      // Eco fantasma (octave up, muito suave) — efeito mágico
      if (Math.random() < 0.45) {
        const echo = notes[Math.floor(Math.random() * notes.length)];
        this._playGlock(echo * 2, t + 0.25, 0.038);
      }

      const delay = 3800 + Math.random() * 5200;
      this._melodyTimer = setTimeout(playPhrase, delay);
    };

    this._melodyTimer = setTimeout(playPhrase, 2200 + Math.random() * 2500);
  }

  _playGlock (freq, when, vol = 0.10) {
    if (!this.ctx || !this._musicOn) return;

    // Tônica fundamental: decay rápido (como metalofone / caixinha de música)
    this._schedOsc(freq, when, vol, 0.002, 0.32, this.musicGain);

    // 2º parcial: f*2.756 (3ª harmônica "esticada") → timbre bell
    this._schedOsc(freq * 2.756, when, vol * 0.28, 0.001, 0.10, this.musicGain);

    // 3º parcial muito suave: f*5 → brilho
    this._schedOsc(freq * 5.0,  when, vol * 0.07, 0.001, 0.06, this.musicGain);
  }

  /** Agenda um oscilador com envelope simples */
  _schedOsc (freq, when, vol, attack, decay, destination) {
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + attack);
    gain.gain.setTargetAtTime(0.00001, when + attack, decay);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(when);
    osc.stop(when + decay * 6 + 0.1);
  }

  /* ── Helper SFX ─────────────────────────────────────────────────────── */

  _fx (freq, dur, type, vol, attack, decay, when = 0, freqEnd = null) {
    if (!this.ctx || Storage.data.settings.sound === false) return;
    const t = this.ctx.currentTime + when;
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + 0.01));

    osc.connect(gain);
    gain.connect(this.fxGain);
    osc.start(t);
    osc.stop(t + Math.max(dur, attack + 0.01) + 0.05);
  }

  /* ── SFX PREMIUM ─────────────────────────────────────────────────────── */

  click () {
    // Toque limpo e preciso
    this._fx(1300, 0.04, 'sine', 0.14, 0.001, 0.04);
  }

  pop () {
    // Glide ascendente — sensação de "pulo"
    this._fx(500, 0.09, 'sine', 0.28, 0.001, 0.09, 0, 1300);
  }

  hover () {
    this._fx(1500, 0.03, 'sine', 0.07, 0.001, 0.03);
  }

  correct () {
    // C-E-G: sino alegre com shimmer
    const notes = [[523.25, 0], [659.25, 0.08], [783.99, 0.16]];
    notes.forEach(([f, d]) => {
      this._fx(f, 0.28, 'sine', 0.36, 0.003, 0.28, d);
      this._fx(f * 2, 0.12, 'sine', 0.09, 0.001, 0.12, d);   // shimmer
    });
    // Sparkle final
    this._fx(1567.98, 0.10, 'sine', 0.12, 0.001, 0.10, 0.30);
  }

  wrong () {
    // Descendente suave — não assustador para crianças
    this._fx(349.23, 0.18, 'triangle', 0.20, 0.006, 0.18);
    this._fx(293.66, 0.22, 'triangle', 0.16, 0.006, 0.22, 0.14);
  }

  coin () {
    // Ping brilhante com harmonics: C6-E6-G6
    [[1046.50, 0], [1318.51, 0.04], [1567.98, 0.08]].forEach(([f, d]) => {
      this._fx(f, 0.18, 'sine', 0.28 - d * 0.5, 0.002, 0.18, d);
    });
  }

  star () {
    // Brilho mágico ascendente
    [1174.66, 1396.91, 1661.22, 2093.00].forEach((f, i) => {
      this._fx(f, 0.14, 'sine', 0.20 - i * 0.04, 0.001, 0.14, i * 0.07);
    });
  }

  victory () {
    // Fanfarra completa: arpejo + acorde final
    [[523.25,0],[659.25,0.10],[783.99,0.20],[1046.50,0.30]].forEach(([f,d]) => {
      this._fx(f, 0.40, 'sine', 0.38, 0.005, 0.40, d);
      this._fx(f * 2, 0.18, 'sine', 0.10, 0.001, 0.18, d);
    });
    // Acorde final sustentado
    [523.25, 659.25, 783.99, 1046.50].forEach(f => {
      this._fx(f, 1.0, 'sine', 0.28, 0.025, 1.0, 0.55);
    });
  }

  levelUp () {
    // Escala ascendente triunfante
    [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
      this._fx(f, 0.22, 'triangle', 0.22 + i * 0.04, 0.012, 0.22, i * 0.09);
    });
    // Swell final
    [523.25, 659.25, 783.99].forEach(f => {
      this._fx(f, 1.2, 'sine', 0.24, 0.06, 1.2, 0.60);
    });
  }

  /* ── Controles de usuário ────────────────────────────────────────────── */

  /** Toggle global (música + SFX). Retorna o novo estado (true = ligado). */
  toggleAll () {
    const current = Storage.data.settings.music !== false && Storage.data.settings.sound !== false;
    const next = !current;
    Storage.setSetting('music', next);
    Storage.setSetting('sound', next);
    if (next) {
      if (this._unlocked) this.startMusic();
    } else {
      this.stopMusic();
    }
    Bus.emit('audio:changed', next);
    return next;
  }

  isMuted () {
    return Storage.data.settings.music === false || Storage.data.settings.sound === false;
  }

  setMusic (on) {
    Storage.setSetting('music', on);
    if (on) this.startMusic(); else this.stopMusic();
  }

  setSound (on) {
    Storage.setSetting('sound', on);
  }
}

export const Audio = new AudioEngine();

/* Unlock no primeiro gesto humano */
const _unlock = () => {
  Audio.unlock();
  ['click','touchstart','keydown'].forEach(ev => document.removeEventListener(ev, _unlock));
};
['click','touchstart','keydown'].forEach(ev =>
  document.addEventListener(ev, _unlock, { once: false, passive: true }));
