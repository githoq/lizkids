/* =========================================================================
   LIZKIDS — SISTEMA DE ÁUDIO PROCEDURAL
   Gera sons educativos via Web Audio API (sem dependências externas).
   Sons: click, correct, wrong, victory, coin, levelUp, pop, ambient.
   ========================================================================= */

import { Storage } from './storage.js';

class AudioEngine {
  constructor () {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain  = null;
    this.fxGain     = null;
    this.musicNodes = [];
    this.musicTimer = null;
    this._unlocked  = false;
  }

  /** Cria o contexto na 1ª interação do usuário (políticas de autoplay) */
  unlock () {
    if (this._unlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.masterGain);

      this.fxGain = this.ctx.createGain();
      this.fxGain.gain.value = 0.55;
      this.fxGain.connect(this.masterGain);

      this._unlocked = true;
      if (Storage.data.settings.music) this.startAmbient();
    } catch (e) { console.warn('Audio unlock falhou', e); }
  }

  /* ----- Helper para tocar nota com envelope ----- */
  _tone ({ freq, dur = 0.18, type = 'sine', vol = 0.4, attack = 0.005, decay = 0.1, when = 0 }) {
    if (!this.ctx || !Storage.data.settings.sound) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(this.fxGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  _glide ({ from, to, dur = 0.25, type = 'triangle', vol = 0.4 }) {
    if (!this.ctx || !Storage.data.settings.sound) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(this.fxGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  /* ----- SFX PÚBLICOS ----- */
  click ()     { this._tone({ freq: 880, dur: 0.06, type: 'square',   vol: 0.18 }); }
  pop ()       { this._glide({ from: 600, to: 1100, dur: 0.12, vol: 0.35 }); }
  correct ()   {
    [0, 0.08, 0.16].forEach((d, i) =>
      this._tone({ freq: [523.25, 659.25, 783.99][i], dur: 0.22, type: 'triangle', vol: 0.35, when: d }));
  }
  wrong ()     {
    this._tone({ freq: 220, dur: 0.18, type: 'sawtooth', vol: 0.25 });
    this._tone({ freq: 180, dur: 0.22, type: 'sawtooth', vol: 0.25, when: 0.10 });
  }
  coin ()      {
    this._tone({ freq: 1175, dur: 0.08, type: 'square', vol: 0.3 });
    this._tone({ freq: 1568, dur: 0.16, type: 'square', vol: 0.28, when: 0.08 });
  }
  victory ()   {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => this._tone({ freq: f, dur: 0.30, type: 'triangle', vol: 0.4, when: i * 0.12 }));
    this._tone({ freq: 1318.51, dur: 0.6, type: 'triangle', vol: 0.45, when: 0.48 });
  }
  levelUp ()   {
    [392, 523.25, 659.25, 783.99, 1046.50].forEach((f, i) =>
      this._tone({ freq: f, dur: 0.18, type: 'triangle', vol: 0.4, when: i * 0.08 }));
  }
  hover ()     { this._tone({ freq: 1320, dur: 0.04, type: 'sine', vol: 0.10 }); }

  /* ----- MÚSICA AMBIENTE (loop suave) ----- */
  startAmbient () {
    if (!this.ctx) return;
    this.stopAmbient();
    // Pad suave: 3 osciladores afinados em maior
    const baseFreqs = [261.63, 329.63, 392.00]; // C, E, G
    baseFreqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0.045;
      // LFO suave para movimento
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.15 + Math.random() * 0.2;
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(g).connect(this.musicGain);
      osc.start(); lfo.start();
      this.musicNodes.push(osc, lfo);
    });
    // Melodia tipo música de caixinha (a cada 5s, aleatória)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const playNote = () => {
      if (!this.ctx) return;
      const f = scale[Math.floor(Math.random() * scale.length)];
      this._tone({ freq: f, dur: 0.45, type: 'triangle', vol: 0.12 });
    };
    this.musicTimer = setInterval(playNote, 3200);
  }

  stopAmbient () {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicNodes.forEach(n => { try { n.stop(); } catch {} });
    this.musicNodes = [];
  }

  setMusic (on) {
    Storage.setSetting('music', on);
    if (on) this.startAmbient(); else this.stopAmbient();
  }
  setSound (on) { Storage.setSetting('sound', on); }
}

export const Audio = new AudioEngine();

/* Unlock no primeiro gesto */
const unlockOnce = () => {
  Audio.unlock();
  ['click', 'touchstart', 'keydown'].forEach(ev => document.removeEventListener(ev, unlockOnce));
};
['click', 'touchstart', 'keydown'].forEach(ev =>
  document.addEventListener(ev, unlockOnce, { once: false, passive: true }));
