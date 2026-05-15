/* =========================================================================
   LIZKIDS — CONTAR COM O BOBO   QA-APROVADO
   ========================================================================= */

import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';

const ANIMALS = ['bobo','pip','mel','zap','drako'];
const ROUNDS  = 6;

export const CountGame = {
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

      /* Quantidade e animal */
      const maxN   = level === 1 ? 5 : level === 2 ? 8 : 12;
      const minN   = level === 1 ? 2 : level === 2 ? 3 : 4;
      const n      = rndInt(minN, maxN);
      const animal = shuffle([...ANIMALS])[0];

      /* Caixa de animais */
      const animalBox = el('div', {
        style: {
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--r-xl)',
          padding: '24px',
          boxShadow: 'var(--sh-lg)',
          maxWidth: '720px', width: '100%',
          textAlign: 'center',
        }
      });
      animalBox.appendChild(el('div', { class: 't-eyebrow', style: { marginBottom: '12px' } }, ['Quantos amiguinhos você vê?']));

      const animalGrid = el('div', {
        style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px', minHeight: '160px', padding: '12px 0' }
      });

      for (let i = 0; i < n; i++) {
        const size = rndInt(56, 80);
        const anim = `lizFloat ${(3 + Math.random() * 2).toFixed(1)}s ease-in-out infinite ${(Math.random() * 2).toFixed(1)}s`;
        const item = el('div', {
          style: {
            width: size + 'px', height: size + 'px',
            transform: `rotate(${rndInt(-8, 8)}deg)`,
            animation: anim,
          },
          html: CHARACTERS[animal](),
        });
        animalGrid.appendChild(item);
      }

      animalBox.appendChild(animalGrid);
      stage.appendChild(animalBox);

      /* Opções */
      const distractors = makeDistractors(n, level);
      const opts = shuffle([n, ...distractors]);
      const optGrid = el('div', { class: 'math-options', style: { maxWidth: '420px' } });

      opts.forEach(v => {
        const btn = el('button', { class: 'math-option' }, [String(v)]);
        btn.addEventListener('click', () => onAnswer(v, n, btn, optGrid));
        optGrid.appendChild(btn);
      });
      stage.appendChild(optGrid);
    }

    async function onAnswer (chosen, correct_, btn, grid) {
      if (locked) return;
      locked = true;
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);

      if (chosen === correct_) {
        btn.classList.add('math-option--correct');
        Audio.correct();
        correct++;
      } else {
        btn.classList.add('math-option--wrong');
        Audio.wrong();
        grid.querySelectorAll('.math-option').forEach(b => {
          if (Number(b.textContent) === correct_) b.classList.add('math-option--correct');
        });
      }

      await sleep(900);
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
        title:   stars === 3 ? 'Contador Mestre!' : 'Mandou bem!',
        message: `${correct} de ${ROUNDS} contagens corretas.`,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};

function makeDistractors (n, level) {
  const range = level === 1 ? 2 : level === 2 ? 3 : 4;
  const set   = new Set();
  let tries   = 0;
  while (set.size < 3 && tries < 40) {
    const d = rndInt(1, range);
    const v = Math.random() < 0.5 ? n + d : n - d;
    if (v >= 1 && v !== n) set.add(v);
    tries++;
  }
  // Fallback
  let extra = 1;
  while (set.size < 3) { if (n + extra !== n) set.add(n + extra); extra++; }
  return [...set];
}
