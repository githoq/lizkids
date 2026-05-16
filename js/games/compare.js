/* =========================================================================
   LIZKIDS — MAIOR OU MENOR (4 níveis)
   Nível 4: qual é o MAIOR ou MENOR de 3 números?
   ========================================================================= */
import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const CFG = [
  { rounds: 6,  max: 20, threeWay: false },
  { rounds: 7,  max: 50, threeWay: false },
  { rounds: 8,  max: 100, threeWay: false },
  { rounds: 8,  max: 50,  threeWay: true  },
];

export const CompareGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return _ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg   = CFG[level - 1];
    let round = 0, correct = 0, locked = false;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt  = el('span', {}, ['1/' + cfg.rounds]);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: cfg.rounds }, () => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', justifyContent: 'center' } });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [gameDef.title + ' — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [roundTxt, comboPill]),
    ]));

    const stage = el('div', { class: 'liz-game__stage' });
    stage.appendChild(dotsRow);
    wrap.appendChild(stage);

    function nextRound () {
      stage.querySelectorAll('.cmp-content').forEach(e => e.remove());
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round + '/' + cfg.rounds;

      const wantBigger = Math.random() < 0.5;
      const label      = wantBigger ? 'MAIOR' : 'MENOR';

      let numbers, correctV;
      if (cfg.threeWay) {
        const set = new Set();
        while (set.size < 3) set.add(rndInt(1, cfg.max));
        numbers = shuffle([...set]);
        correctV = wantBigger ? Math.max(...numbers) : Math.min(...numbers);
      } else {
        let a = rndInt(1, cfg.max), b = rndInt(1, cfg.max);
        let tries = 0;
        while (a === b && tries++ < 10) b = rndInt(1, cfg.max);
        if (a === b) b = a + 1;
        numbers = [a, b];
        correctV = wantBigger ? Math.max(a, b) : Math.min(a, b);
      }

      const content = el('div', { class: 'cmp-content', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '720px' } });

      content.appendChild(el('div', {
        style: { background: 'rgba(255,255,255,.97)', borderRadius: 'var(--r-xl)', padding: '28px 32px', textAlign: 'center', boxShadow: 'var(--sh-lg)', width: '100%' }
      }, [
        el('div', { class: 't-eyebrow', style: { marginBottom: '20px', fontSize: 'var(--fs-md)' } },
          ['Toque no número ', el('strong', { style: { color: 'var(--liz-blue)', fontStyle: 'normal' } }, [label])]),
        el('div', { style: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' } },
          numbers.map(n => {
            const btn = el('button', {
              class: 'math-question__slot compare-card',
              style: { minWidth: '120px', height: '120px', fontSize: 'clamp(2.5rem,7vw,3.8rem)', cursor: 'pointer', transition: 'transform 160ms' },
              data: { val: n },
            }, [String(n)]);
            btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-4px) scale(1.06)');
            btn.addEventListener('mouseleave', () => btn.style.transform = '');
            btn.addEventListener('click', () => onAnswer(n, correctV, btn, content));
            return btn;
          })),
      ]));

      stage.appendChild(content);
    }

    async function onAnswer (chosen, correctV, btn, content) {
      if (locked) return; locked = true;
      content.querySelectorAll('.compare-card').forEach(b => b.style.pointerEvents = 'none');

      if (chosen === correctV) {
        btn.classList.add('math-option--correct');
        btn.style.boxShadow = '0 0 0 6px rgba(91,224,163,.5)';
        Audio.correct(); showFloatingMessage(pickMsg(MOTIVATION.correct), 'good'); correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('math-option--wrong'); Audio.wrong();
        content.querySelectorAll('.compare-card').forEach(b => {
          if (Number(b.dataset.val) === correctV) { b.classList.add('math-option--correct'); b.style.boxShadow = '0 0 0 6px rgba(91,224,163,.5)'; }
        });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(900); locked = false;
      if (round >= cfg.rounds) finish(); else nextRound();
    }

    function finish () {
      let stars = correct >= cfg.rounds - 1 ? 3 : correct >= cfg.rounds - 3 ? 2 : 1;
      const xp = 10 + correct * 4, coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp, title: stars === 3 ? 'Campeão dos Números!' : 'Muito bem!',
        message: `${correct} de ${cfg.rounds} corretos.`,
        nextLevel: level < 4 ? level + 1 : null, gameId: gameDef.id, level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};

function _ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
