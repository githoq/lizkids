/* =========================================================================
   LIZKIDS — CORES E FORMAS
   Associar formas pela cor ou cor pela forma.
   ========================================================================= */

import { el, pick, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS } from '../data/characters.js';

const COLORS = [
  { id: 'blue',   name: 'Azul',     css: '#4F7CFF' },
  { id: 'yellow', name: 'Amarelo',  css: '#FFD23F' },
  { id: 'pink',   name: 'Rosa',     css: '#FF7BB5' },
  { id: 'green',  name: 'Verde',    css: '#5BE0A3' },
  { id: 'lilac',  name: 'Lilás',    css: '#B57BFF' },
  { id: 'orange', name: 'Laranja',  css: '#FF8A65' },
];

const SHAPES = [
  { id: 'circle',   name: 'Círculo',   render: (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3"/><ellipse cx="40" cy="38" rx="14" ry="8" fill="rgba(255,255,255,0.45)"/></svg>` },
  { id: 'square',   name: 'Quadrado',  render: (color) => `<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="14" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3"/><rect x="22" y="22" width="40" height="14" rx="6" fill="rgba(255,255,255,0.4)"/></svg>` },
  { id: 'triangle', name: 'Triângulo', render: (color) => `<svg viewBox="0 0 100 100"><path d="M50 14 L88 84 L12 84 Z" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3" stroke-linejoin="round"/><path d="M50 26 L68 60 L32 60 Z" fill="rgba(255,255,255,0.32)"/></svg>` },
  { id: 'star',     name: 'Estrela',   render: (color) => `<svg viewBox="0 0 100 100"><path d="M50 10 L62 38 L92 42 L68 62 L76 92 L50 76 L24 92 L32 62 L8 42 L38 38 Z" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3" stroke-linejoin="round"/></svg>` },
  { id: 'heart',    name: 'Coração',   render: (color) => `<svg viewBox="0 0 100 100"><path d="M50 86 C 18 64 12 38 28 26 C 40 18 50 28 50 36 C 50 28 60 18 72 26 C 88 38 82 64 50 86 Z" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3" stroke-linejoin="round"/></svg>` },
];

const ROUNDS = 6;

export const ShapesGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position:'absolute', inset:'0', background:'var(--bg-deep-1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontFamily:'Fredoka,sans-serif' } }, ['Redirecionando…']);
    }
    const progress = profile.gameProgress[gameDef.id] || {};
    const playerLevel = Math.min(3, progress.level || 1);

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    let round = 0, correct = 0, locked = false;
    const roundPill = el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.star() }), el('span', {}, ['1/' + ROUNDS])]);

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } },
        [el('span', { html: ICONS.back() }), 'Sair']),
      el('div', { class: 'liz-game__title' }, [gameDef.title]),
      el('div', { class: 'liz-game__hud' }, [roundPill]),
    ]));

    const stage = el('div', { class: 'liz-game__stage' });
    wrap.appendChild(stage);

    function nextRound () {
      stage.innerHTML = '';
      round++;
      roundPill.children[1].textContent = round + '/' + ROUNDS;

      const askByColor = playerLevel === 1 ? true : Math.random() < 0.5;
      const targetColor = pick(COLORS);
      const targetShape = pick(SHAPES);

      // Pergunta
      const questionText = askByColor
        ? `Toque na figura ${targetColor.name.toUpperCase()}`
        : `Toque no ${targetShape.name.toUpperCase()}`;

      // Gera 4 opções; só 1 corresponde
      const optionCount = playerLevel === 1 ? 3 : 4;
      const options = [];
      // correta
      const correctItem = { color: targetColor, shape: askByColor ? pick(SHAPES) : targetShape };
      options.push(correctItem);
      while (options.length < optionCount) {
        const c = pick(COLORS), s = pick(SHAPES);
        if (askByColor && c.id === targetColor.id) continue;
        if (!askByColor && s.id === targetShape.id) continue;
        options.push({ color: c, shape: s });
      }
      const shuffled = shuffle(options);

      stage.appendChild(el('div', {
        style: { background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--r-xl)', padding: '28px', textAlign: 'center', boxShadow: 'var(--sh-lg)', maxWidth: '720px', width: '100%' }
      }, [
        el('h2', { class: 't-display-md', style: { color: 'var(--ink)', marginBottom: '20px' } }, [questionText]),
        (() => {
          const wrap = el('div', { style: { display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' } });
          shuffled.forEach(opt => {
            const btn = el('button', {
              style: { width: '110px', height: '110px', borderRadius: '24px', background: 'transparent', cursor: 'pointer', padding: '6px', transition: 'transform 0.18s' },
              html: opt.shape.render(opt.color.css),
              data: { color: opt.color.id, shape: opt.shape.id },
            });
            btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-6px) scale(1.05)');
            btn.addEventListener('mouseleave', () => btn.style.transform = '');
            btn.addEventListener('click', () => {
              const isCorrect = askByColor
                ? opt.color.id === targetColor.id
                : opt.shape.id === targetShape.id;
              onAnswer(isCorrect, btn);
            });
            wrap.appendChild(btn);
          });
          return wrap;
        })(),
      ]));
    }

    async function onAnswer (isCorrect, btn) {
      if (locked) return;
      locked = true;
      if (isCorrect) {
        btn.style.animation = 'lizCorrect 0.8s var(--ease-pop)';
        Audio.correct();
        correct++;
      } else {
        btn.style.animation = 'lizWrong 0.5s';
        Audio.wrong();
      }
      await sleep(900);
      locked = false;
      if (round >= ROUNDS) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS) stars = 3;
      else if (correct >= ROUNDS - 2) stars = 2;
      const xp = 10 + correct * 4;
      const coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(3, playerLevel + (stars === 3 ? 1 : 0)),
      });
      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Artista das Cores!' : 'Muito bom!',
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
