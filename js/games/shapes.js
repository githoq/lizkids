/* =========================================================================
   LIZKIDS — CORES E FORMAS   QA-APROVADO
   ========================================================================= */

import { el, pick, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS } from '../data/characters.js';

const COLORS = [
  { id: 'blue',   name: 'Azul',    css: '#4F7CFF' },
  { id: 'yellow', name: 'Amarelo', css: '#FFD23F' },
  { id: 'pink',   name: 'Rosa',    css: '#FF7BB5' },
  { id: 'green',  name: 'Verde',   css: '#5BE0A3' },
  { id: 'lilac',  name: 'Lilás',   css: '#B57BFF' },
  { id: 'orange', name: 'Laranja', css: '#FF8A65' },
];

const SHAPES = [
  {
    id: 'circle',   name: 'Círculo',
    render: c => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="sc${c.replace('#','')}" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="white" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="1"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="44" fill="url(#sc${c.replace('#','')})" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
      <ellipse cx="38" cy="36" rx="14" ry="8" fill="rgba(255,255,255,0.45)"/>
    </svg>`,
  },
  {
    id: 'square',   name: 'Quadrado',
    render: c => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sq${c.replace('#','')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.6"/><stop offset="100%" stop-color="${c}"/>
      </linearGradient></defs>
      <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#sq${c.replace('#','')})" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
      <rect x="18" y="18" width="38" height="14" rx="6" fill="rgba(255,255,255,0.45)"/>
    </svg>`,
  },
  {
    id: 'triangle', name: 'Triângulo',
    render: c => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="tr${c.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.55"/><stop offset="100%" stop-color="${c}"/>
      </linearGradient></defs>
      <path d="M50 8 L92 86 L8 86 Z" fill="url(#tr${c.replace('#','')})" stroke="rgba(0,0,0,0.12)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 20 L72 62 L28 62 Z" fill="rgba(255,255,255,0.3)"/>
    </svg>`,
  },
  {
    id: 'star',     name: 'Estrela',
    render: c => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="st${c.replace('#','')}" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stop-color="white" stop-opacity="0.6"/><stop offset="100%" stop-color="${c}"/>
      </radialGradient></defs>
      <path d="M50 8 L62 36 L92 40 L68 62 L76 92 L50 78 L24 92 L32 62 L8 40 L38 36 Z"
        fill="url(#st${c.replace('#','')})" stroke="rgba(0,0,0,0.12)" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'heart',    name: 'Coração',
    render: c => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="ht${c.replace('#','')}" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stop-color="white" stop-opacity="0.55"/><stop offset="100%" stop-color="${c}"/>
      </radialGradient></defs>
      <path d="M50 84 C 16 60 10 34 28 24 C 40 18 50 28 50 36 C 50 28 60 18 72 24 C 90 34 84 60 50 84 Z"
        fill="url(#ht${c.replace('#','')})" stroke="rgba(0,0,0,0.12)" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
];

const ROUNDS = 6;

export const ShapesGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } });
    }

    const level = Math.min(3, profile.gameProgress[gameDef.id]?.level || 1);
    let round = 0, correct = 0, locked = false;

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt = el('span', {}, [`1/${ROUNDS}`]);
    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } }, [el('span', { html: ICONS.back() }), 'Sair']),
      el('div',    { class: 'liz-game__title' }, [gameDef.title]),
      el('div',    { class: 'liz-game__hud' }, [
        el('div', { class: 'liz-pill liz-pill--stars' }, [el('span', { html: ICONS.star() }), roundTxt]),
      ]),
    ]));

    const stage = el('div', { class: 'liz-game__stage' });
    wrap.appendChild(stage);

    function nextRound () {
      stage.innerHTML = '';
      round++;
      roundTxt.textContent = `${round}/${ROUNDS}`;

      const askByColor = level === 1 ? true : Math.random() < 0.5;
      const targetColor = pick(COLORS);
      const targetShape = pick(SHAPES);

      const optCount = level === 1 ? 3 : level === 2 ? 4 : 5;
      const question = askByColor
        ? `Toque na figura ${targetColor.name.toUpperCase()}`
        : `Toque no ${targetShape.name.toUpperCase()}`;

      // Gerar opções com garantia de unicidade
      const options = makeOptions(askByColor, targetColor, targetShape, optCount);

      const qBox = el('div', {
        style: {
          background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--r-xl)',
          padding: '28px', textAlign: 'center', boxShadow: 'var(--sh-lg)',
          maxWidth: '720px', width: '100%',
        }
      });

      qBox.appendChild(el('h2', {
        class: 't-display-md',
        style: { color: 'var(--ink)', marginBottom: '22px', fontSize: 'clamp(1.6rem,4vw,2.5rem)' },
      }, [question]));

      const optRow = el('div', { style: { display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' } });
      options.forEach(opt => {
        const isCorrect = askByColor ? opt.color.id === targetColor.id : opt.shape.id === targetShape.id;
        const btn = el('button', {
          style: {
            width: 'clamp(90px,16vw,120px)', height: 'clamp(90px,16vw,120px)',
            borderRadius: '22px', background: 'var(--cream)', cursor: 'pointer',
            padding: '8px',
            transition: 'transform 180ms var(--ease-pop), box-shadow 180ms',
            border: '3px solid transparent',
            boxShadow: 'var(--sh-soft)',
          },
          html: opt.shape.render(opt.color.css),
          data: { correct: isCorrect ? '1' : '0' },
        });
        btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-5px) scale(1.06)'; });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        btn.addEventListener('click', () => onAnswer(isCorrect, btn, optRow));
        optRow.appendChild(btn);
      });

      qBox.appendChild(optRow);
      stage.appendChild(qBox);
    }

    async function onAnswer (isRight, btn, container) {
      if (locked) return;
      locked = true;
      container.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

      if (isRight) {
        btn.style.border = '3px solid var(--liz-green)';
        btn.style.boxShadow = '0 0 0 5px rgba(91,224,163,0.4)';
        btn.animate([{ transform: 'scale(1)' },{ transform: 'scale(1.12)' },{ transform: 'scale(1)' }],{ duration: 400, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
        Audio.correct();
        Audio.star();
        correct++;
      } else {
        btn.style.border = '3px solid #FF8A65';
        btn.animate([{ transform: 'translateX(-7px)' },{ transform: 'translateX(7px)' },{ transform: 'translateX(-5px)' },{ transform: 'translateX(0)' }],{ duration: 400 });
        Audio.wrong();
        // Revelar a correta
        container.querySelectorAll('button').forEach(b => {
          if (b.dataset.correct === '1') {
            b.style.border = '3px solid var(--liz-green)';
            b.style.boxShadow = '0 0 0 5px rgba(91,224,163,0.35)';
          }
        });
      }

      await sleep(950);
      locked = false;
      if (round >= ROUNDS) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS)     stars = 3;
      else if (correct >= ROUNDS - 2) stars = 2;
      const xp = 10 + correct * 4, coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(3, level + (stars >= 2 ? 1 : 0)),
      });
      ResultModal({
        stars, coins, xp,
        title:   stars === 3 ? 'Artista das Cores!' : 'Muito bem!',
        message: `${correct} de ${ROUNDS} acertos.`,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function makeOptions (askByColor, targetColor, targetShape, count) {
  const options = [{ color: targetColor, shape: targetShape }];
  const seen    = new Set([targetColor.id + '-' + targetShape.id]);
  let tries = 0;

  while (options.length < count && tries < 60) {
    let c = pick(COLORS), s = pick(SHAPES);
    // Garantir que a opção errada NÃO seja correta acidentalmente
    const wouldBeCorrect = askByColor ? c.id === targetColor.id : s.id === targetShape.id;
    if (wouldBeCorrect) { tries++; continue; }
    const k = c.id + '-' + s.id;
    if (seen.has(k)) { tries++; continue; }
    seen.add(k);
    options.push({ color: c, shape: s });
    tries++;
  }

  // Fallback: preencher com variações de cor
  while (options.length < count) {
    const c = COLORS[options.length % COLORS.length];
    const s = SHAPES[0];
    options.push({ color: c, shape: s });
  }

  return shuffle(options);
}
