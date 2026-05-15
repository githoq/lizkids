/* =========================================================================
   LIZKIDS — MAIOR OU MENOR   QA-APROVADO
   ========================================================================= */

import { el, rndInt, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS } from '../data/characters.js';

const ROUNDS = 8;

export const CompareGame = {
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

      const max  = level === 1 ? 20 : level === 2 ? 50 : 99;
      let a = rndInt(1, max), b = rndInt(1, max);
      // Garantir diferentes (máx 10 tentativas)
      let tries = 0;
      while (a === b && tries < 10) { b = rndInt(1, max); tries++; }
      if (a === b) b = a + 1; // fallback

      const wantBigger = Math.random() < 0.5;
      const correctVal = wantBigger ? Math.max(a, b) : Math.min(a, b);
      const label      = wantBigger ? 'MAIOR' : 'MENOR';

      const questionBox = el('div', {
        style: {
          background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--r-xl)',
          padding: '32px', textAlign: 'center', boxShadow: 'var(--sh-lg)',
          maxWidth: '640px', width: '100%',
        }
      }, [
        el('div', { class: 't-eyebrow', style: { marginBottom: '20px', fontSize: 'var(--fs-md)' } },
          ['Toque no número ', el('span', { class: 'text-gradient', style: { fontStyle: 'normal' } }, [label])]),
        el('div', { style: { display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' } }, [
          makeNumCard(a, correctVal, stage),
          makeNumCard(b, correctVal, stage),
        ]),
      ]);
      stage.appendChild(questionBox);

      // Registrar listener em cada card
      stage.querySelectorAll('.compare-card').forEach(c => {
        c.addEventListener('click', () => onAnswer(Number(c.dataset.val), correctVal, c));
      });
    }

    async function onAnswer (chosen, correctVal, btn) {
      if (locked) return;
      locked = true;
      stage.querySelectorAll('.compare-card').forEach(b => b.style.pointerEvents = 'none');

      if (chosen === correctVal) {
        btn.classList.add('math-option--correct');
        btn.style.boxShadow = '0 0 0 6px rgba(91,224,163,0.5)';
        Audio.correct();
        correct++;
      } else {
        btn.classList.add('math-option--wrong');
        Audio.wrong();
        stage.querySelectorAll('.compare-card').forEach(b => {
          if (Number(b.dataset.val) === correctVal) {
            b.classList.add('math-option--correct');
            b.style.boxShadow = '0 0 0 6px rgba(91,224,163,0.5)';
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
      if (correct >= ROUNDS - 1) stars = 3;
      else if (correct >= ROUNDS - 3) stars = 2;
      const xp = 10 + correct * 4, coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(3, level + (stars >= 2 ? 1 : 0)),
      });
      ResultModal({
        stars, coins, xp,
        title:   stars === 3 ? 'Campeão dos Números!' : 'Muito bem!',
        message: `${correct} de ${ROUNDS} comparações certas.`,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};

function makeNumCard (n, correctVal, stage) {
  return el('button', {
    class: 'math-question__slot compare-card',
    style: {
      minWidth: '130px', height: '130px',
      fontSize: 'var(--fs-3xl)', cursor: 'pointer',
      transition: 'transform 160ms, box-shadow 160ms',
    },
    data: { val: n },
  }, [String(n)]);
}
