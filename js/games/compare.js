/* =========================================================================
   LIZKIDS — MAIOR OU MENOR
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

      const max = playerLevel === 1 ? 20 : playerLevel === 2 ? 50 : 99;
      let a = rndInt(1, max), b = rndInt(1, max);
      while (a === b) b = rndInt(1, max);
      const wantBigger = Math.random() < 0.5;
      const correctVal = wantBigger ? Math.max(a, b) : Math.min(a, b);

      stage.appendChild(el('div', {
        style: { background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--r-xl)', padding: '32px', textAlign: 'center', boxShadow: 'var(--sh-lg)', maxWidth: '640px', width: '100%' }
      }, [
        el('div', { class: 't-eyebrow' }, ['Toque no número ' + (wantBigger ? 'MAIOR' : 'MENOR')]),
        el('div', { class: 'math-question__expr', style: { gap: '32px', marginTop: '24px' } }, [
          makeNumberCard(a),
          makeNumberCard(b),
        ]),
      ]));

      stage.querySelectorAll('.compare-card').forEach(c => {
        c.addEventListener('click', () => onAnswer(Number(c.dataset.val), correctVal, c));
      });
    }

    function makeNumberCard (n) {
      return el('button', {
        class: 'math-question__slot compare-card',
        data: { val: n },
        style: { minWidth: '140px', height: '140px', fontSize: 'var(--fs-3xl)', cursor: 'pointer' },
      }, [String(n)]);
    }

    async function onAnswer (chosen, correctVal, btn) {
      if (locked) return;
      locked = true;
      if (chosen === correctVal) {
        btn.classList.add('math-option--correct');
        Audio.correct();
        correct++;
      } else {
        btn.classList.add('math-option--wrong');
        Audio.wrong();
        stage.querySelectorAll('.compare-card').forEach(b => {
          if (Number(b.dataset.val) === correctVal) b.classList.add('math-option--correct');
        });
      }
      await sleep(900);
      locked = false;
      if (round >= ROUNDS) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS - 1) stars = 3;
      else if (correct >= ROUNDS - 3) stars = 2;
      const xp = 10 + correct * 4;
      const coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(3, playerLevel + (stars === 3 ? 1 : 0)),
      });
      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Comparação Perfeita!' : 'Continua assim!',
        message: `${correct} de ${ROUNDS} comparações corretas.`,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};
