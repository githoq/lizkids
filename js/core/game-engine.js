/* =========================================================================
   LIZKIDS — GAME ENGINE COMPARTILHADO
   Level select premium, ComboSystem, mensagens flutuantes, timer bar.
   ========================================================================= */

import { el }       from './utils.js';
import { Audio }    from './audio.js';
import { Router }   from './router.js';
import { Storage }  from './storage.js';
import { CHARACTERS, ICONS } from '../data/characters.js';
import { SkyStage } from '../components/ui.js';

/* ── Injetar CSS uma única vez ──────────────────────────────────────── */
(function injectCSS () {
  if (document.getElementById('liz-engine-css')) return;
  const s = document.createElement('style');
  s.id = 'liz-engine-css';
  s.textContent = `
    @keyframes lizFloatMsg{
      0%  {opacity:0;transform:translateX(-50%) scale(.5) translateY(14px)}
      22% {opacity:1;transform:translateX(-50%) scale(1.08) translateY(0)}
      65% {opacity:1;transform:translateX(-50%) scale(1) translateY(-12px)}
      100%{opacity:0;transform:translateX(-50%) scale(.88) translateY(-34px)}
    }
    .liz-float-msg{
      position:fixed;top:22%;left:50%;
      color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;
      font-size:clamp(1.8rem,5vw,2.6rem);
      padding:10px 28px;border-radius:999px;
      box-shadow:0 8px 24px rgba(0,0,0,.26),inset 0 2px 0 rgba(255,255,255,.35);
      z-index:9500;pointer-events:none;white-space:nowrap;
      animation:lizFloatMsg 1.3s cubic-bezier(.22,.61,.36,1) forwards;
    }
  `;
  document.head.appendChild(s);
})();

/* ── Pool de mensagens motivacionais ────────────────────────────────── */
export const MOTIVATION = {
  correct:  ['Incrível!','Uau!','Perfeito!','Brilhante!','Que talento!','Ótimo!','Demais!'],
  combo3:   ['Combo x3!','Quente!','Arrasando!'],
  combo5:   ['Combo x5!','Imparável!','Você é uma estrela!'],
  combo7:   ['COMBO x7!','Impossível te parar!','Fenomenal!'],
  tryAgain: ['Quase!','Tente de novo!','Você consegue!','Não desista!','Vai conseguir!'],
  perfect:  ['Perfeito!','Sem erros!','Inacreditável!','Você é demais!'],
  start:    ['Boa sorte!','Vamos lá!','Mostre seu talento!'],
};

export function pickMsg (pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function showFloatingMessage (text, type = 'good') {
  const colors = {
    good:  'linear-gradient(135deg,#5BE0A3,#1FA76A)',
    great: 'linear-gradient(135deg,#FFD23F,#F4A300)',
    combo: 'linear-gradient(135deg,#FF7BB5,#B57BFF)',
    wrong: 'linear-gradient(135deg,#FF9B80,#C84800)',
  };
  const msg = document.createElement('div');
  msg.className = 'liz-float-msg';
  msg.style.background = colors[type] || colors.good;
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1350);
}

/* ── Sistema de Combo ────────────────────────────────────────────────── */
export class ComboSystem {
  constructor () { this.count = 0; }

  hit (updateFn) {
    this.count++;
    updateFn?.(this.count);
    if (this.count === 3) { Audio.star(); showFloatingMessage(pickMsg(MOTIVATION.combo3), 'great'); }
    else if (this.count === 5) { Audio.star(); showFloatingMessage(pickMsg(MOTIVATION.combo5), 'combo'); }
    else if (this.count >= 7 && this.count % 3 === 1) { showFloatingMessage(`COMBO ×${this.count}!`, 'combo'); }
    return this.count;
  }

  miss (updateFn) {
    const prev = this.count;
    this.count = 0;
    updateFn?.(0);
    if (prev >= 3) showFloatingMessage(pickMsg(MOTIVATION.tryAgain), 'wrong');
    return prev;
  }

  getMultiplier () {
    if (this.count >= 7) return 3;
    if (this.count >= 5) return 2;
    if (this.count >= 3) return 1.5;
    return 1;
  }
}

/* ── Timer por pergunta (math level 4) ──────────────────────────────── */
export class QuestionTimer {
  constructor (seconds, onTick, onTimeout) {
    this._secs     = seconds;
    this._onTick   = onTick;
    this._onTimeout = onTimeout;
    this._id       = null;
    this._start    = 0;
  }

  start () {
    this._start = Date.now();
    this._id = setInterval(() => {
      const elapsed = (Date.now() - this._start) / 1000;
      const remaining = Math.max(0, this._secs - elapsed);
      const pct = remaining / this._secs;
      this._onTick(pct, remaining);
      if (remaining <= 0) { this.stop(); this._onTimeout?.(); }
    }, 60);
  }

  stop () { clearInterval(this._id); this._id = null; }
  reset () { this.stop(); this.start(); }
}

/* ── Desbloqueio de nível ────────────────────────────────────────────── */
export function isLevelUnlocked (levelNum, progress) {
  if (levelNum <= 1) return true;
  if (levelNum === 2) return (progress.plays || 0) > 0;
  const key = `level_${levelNum - 1}_stars`;
  return (progress[key] || 0) >= 1;
}

export function getLevelStars (levelNum, progress) {
  return progress[`level_${levelNum}_stars`] || 0;
}

/* ── Level Select Screen ─────────────────────────────────────────────── */
export function buildLevelSelect ({ gameDef, profile, onSelect }) {
  const progress = profile.gameProgress[gameDef.id] || {};
  const levels   = gameDef.levels || [];

  /* Nível recomendado: próximo com menos de 3 estrelas */
  let recommended = 1;
  for (let i = 1; i <= 4; i++) {
    if (isLevelUnlocked(i, progress)) {
      if (getLevelStars(i, progress) < 3) { recommended = i; break; }
    }
  }
  let selected = recommended;

  /* ---- Elementos ---- */
  const wrap  = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;';

  wrap.appendChild(SkyStage('day'));

  /* Topbar */
  wrap.appendChild(el('div', { class: 'liz-topbar' }, [
    el('div', { class: 'liz-topbar__left' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } },
        [el('span', { html: ICONS.back() }), 'Biblioteca']),
    ]),
    el('div', { class: 'liz-topbar__right' }, [
      el('div', { class: 'liz-pill liz-pill--coins' }, [el('span', { html: ICONS.coin() }), String(profile.coins)]),
      el('div', { class: 'liz-pill liz-pill--stars' }, [el('span', { html: ICONS.star() }), String(profile.stars)]),
    ]),
  ]));

  /* Painel central */
  const panel = el('div', { class: 'liz-levelsel__panel' });

  const charSvg = (CHARACTERS[gameDef.character] || CHARACTERS.lumi)();
  panel.appendChild(el('div', { class: 'liz-levelsel__char', html: charSvg }));
  panel.appendChild(el('h1', { class: 'liz-levelsel__title' }, [gameDef.title]));
  panel.appendChild(el('p',  { class: 'liz-levelsel__sub'   }, [gameDef.desc]));

  /* Grade de níveis */
  const grid = el('div', { class: 'liz-level-grid' });

  levels.forEach((lvl, idx) => {
    const num      = idx + 1;
    const unlocked = isLevelUnlocked(num, progress);
    const stars    = getLevelStars(num, progress);
    const isRec    = num === recommended && unlocked;

    const card = el('div', {
      class: 'liz-level-card' +
        (unlocked    ? '' : ' liz-level-card--locked') +
        (num === selected ? ' liz-level-card--selected' : '') +
        (isRec ? ' liz-level-card--recommended' : ''),
    });

    if (isRec) card.appendChild(el('div', { class: 'liz-level-card__rec' }, ['Recomendado']));

    /* Estrelas conquistadas */
    const starsRow = el('div', { class: 'liz-level-card__stars' });
    for (let i = 0; i < 3; i++) {
      starsRow.appendChild(el('span', {
        class: 'liz-stars__item' + (i < stars ? ' liz-stars__item--on' : ''),
        html: ICONS.star(), style: { width: '18px', height: '18px' },
      }));
    }
    card.appendChild(starsRow);
    card.appendChild(el('div', { class: 'liz-level-card__num' }, [String(num)]));
    card.appendChild(el('div', { class: 'liz-level-card__label' }, [lvl.label]));
    card.appendChild(el('div', { class: 'liz-level-card__desc'  }, [lvl.desc]));

    if (!unlocked) {
      card.appendChild(el('div', { class: 'liz-level-card__overlay', html: ICONS.lock() }));
    } else {
      card.addEventListener('click', () => {
        Audio.click();
        selected = num;
        grid.querySelectorAll('.liz-level-card').forEach(c => c.classList.remove('liz-level-card--selected'));
        card.classList.add('liz-level-card--selected');
        playBtn.innerHTML = '';
        playBtn.appendChild(el('span', { html: ICONS.play() }));
        playBtn.appendChild(document.createTextNode(`Jogar Nível ${selected}`));
      });
    }

    card.style.animationDelay = (idx * 80) + 'ms';
    grid.appendChild(card);
  });
  panel.appendChild(grid);

  /* Botão principal */
  const playBtn = el('button', {
    class: 'liz-btn liz-btn--yellow liz-btn--lg liz-btn--glow',
    style: { marginTop: '24px' },
    onClick: () => { Audio.click(); onSelect(selected); },
  }, [el('span', { html: ICONS.play() }), `Jogar Nível ${selected}`]);
  panel.appendChild(playBtn);

  wrap.appendChild(panel);
  return wrap;
}
