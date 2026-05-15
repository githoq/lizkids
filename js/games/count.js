/* =========================================================================
   LIZKIDS — CONTAR COM O BOBO
   Conta amiguinhos na tela.
   ========================================================================= */

import { el, rndInt, shuffle, sleep, rnd } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS, CHARACTERS } from '../data/characters.js';

const ROUNDS = 6;
const ANIMALS = ['bobo','pip','mel','zap','drako'];

export const CountGame = {
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

    const topbar = el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } },
        [el('span', { html: ICONS.back() }), 'Sair']),
      el('div', { class: 'liz-game__title' }, [gameDef.title]),
      el('div', { class: 'liz-game__hud' }, [roundPill]),
    ]);
    wrap.appendChild(topbar);

    const stage = el('div', { class: 'liz-game__stage' });
    wrap.appendChild(stage);

    function nextRound () {
      stage.innerHTML = '';
      round++;
      roundPill.children[1].textContent = round + '/' + ROUNDS;

      const maxN = playerLevel === 1 ? 5 : playerLevel === 2 ? 8 : 12;
      const minN = playerLevel === 1 ? 2 : 3;
      const n = rndInt(minN, maxN);
      const animal = shuffle(ANIMALS)[0];

      const question = el('div', {
        style: { textAlign: 'center', background: 'rgba(255,255,255,0.95)', padding: '24px 32px', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-lg)', maxWidth: '720px', width: '100%' }
      }, [
        el('div', { class: 't-eyebrow' }, ['Quantos amiguinhos você vê?']),
        el('div', {
          style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px', minHeight: '180px', padding: '20px 0' }
        }, Array.from({ length: n }, () =>
          el('div', {
            style: {
              width: rndInt(60, 90) + 'px',
              height: rndInt(60, 90) + 'px',
              transform: `rotate(${rndInt(-8, 8)}deg)`,
              animation: `lizFloat ${(3 + Math.random() * 2)}s ease-in-out infinite ${Math.random()}s`,
            },
            html: CHARACTERS[animal](),
          })
        )),
      ]);
      stage.appendChild(question);

      // Opções
      const distractors = new Set();
      while (distractors.size < 3) {
        const d = n + rndInt(-3, 3);
        if (d !== n && d >= 1) distractors.add(d);
      }
      const options = shuffle([n, ...distractors]);

      const opts = el('div', { class: 'math-options', style: { maxWidth: '420px' } });
      options.forEach(v => {
        const btn = el('button', { class: 'math-option' }, [String(v)]);
        btn.addEventListener('click', () => onAnswer(v, n, btn));
        opts.appendChild(btn);
      });
      stage.appendChild(opts);
    }

    async function onAnswer (chosen, correctVal, btn) {
      if (locked) return;
      locked = true;
      if (chosen === correctVal) { btn.classList.add('math-option--correct'); Audio.correct(); correct++; }
      else { btn.classList.add('math-option--wrong'); Audio.wrong(); }
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
        title: stars === 3 ? 'Contador Mestre!' : 'Mandou bem!',
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
