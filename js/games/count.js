/* =========================================================================
   LIZKIDS — CONTAR COM O BOBO (4 níveis)
   Nível 4: dois grupos — some o total.
   ========================================================================= */
import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const ANIMALS = ['bobo','pip','mel','zap','drako'];
const CFG = [
  { min: 2, max: 5,  rounds: 5, twoGroups: false },
  { min: 2, max: 10, rounds: 6, twoGroups: false },
  { min: 3, max: 15, rounds: 6, twoGroups: false },
  { min: 2, max: 8,  rounds: 7, twoGroups: true  },
];

export const CountGame = {
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
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', maxWidth: '320px', justifyContent: 'center' } });
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
      stage.querySelectorAll('.count-content').forEach(e => e.remove());
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round + '/' + cfg.rounds;

      const animal1 = shuffle([...ANIMALS])[0];
      const n1      = rndInt(cfg.min, cfg.max);
      let correctV  = n1;
      let animal2 = null, n2 = 0;

      const content = el('div', { class: 'count-content', style: { width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' } });

      const qBox = el('div', { style: { background: 'rgba(255,255,255,.97)', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--sh-lg)', width: '100%', textAlign: 'center' } });

      if (cfg.twoGroups) {
        animal2 = shuffle([...ANIMALS].filter(a => a !== animal1))[0];
        n2 = rndInt(cfg.min, cfg.max);
        correctV = n1 + n2;

        qBox.appendChild(el('div', { class: 't-eyebrow', style: { marginBottom: '10px' } }, ['Quantos amiguinhos no total?']));

        /* Grupo A */
        const grpA = makeAnimalGrid(animal1, n1, 'var(--liz-blue-soft)');
        /* Grupo B */
        const grpB = makeAnimalGrid(animal2, n2, 'var(--liz-pink-soft)');
        const groupsRow = el('div', { style: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' } });
        groupsRow.appendChild(grpA);
        groupsRow.appendChild(el('div', { style: { display: 'flex', alignItems: 'center', fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: '2.5rem', color: 'var(--ink)', padding: '0 8px' } }, ['+']));
        groupsRow.appendChild(grpB);
        qBox.appendChild(groupsRow);
      } else {
        qBox.appendChild(el('div', { class: 't-eyebrow', style: { marginBottom: '12px' } }, ['Quantos amiguinhos você vê?']));
        qBox.appendChild(makeAnimalGrid(animal1, n1, 'transparent').style.setProperty ? makeAnimalGrid(animal1, n1, 'transparent') : makeAnimalGrid(animal1, n1, 'transparent'));
      }
      content.appendChild(qBox);

      /* Opções */
      const dists = makeDistractors(correctV, cfg.max);
      const opts  = shuffle([correctV, ...dists]);
      const optGrid = el('div', { class: 'math-options', style: { maxWidth: '420px' } });
      opts.forEach(v => {
        const btn = el('button', { class: 'math-option' }, [String(v)]);
        btn.addEventListener('click', () => onAnswer(v, correctV, btn, optGrid));
        optGrid.appendChild(btn);
      });
      content.appendChild(optGrid);
      stage.appendChild(content);
    }

    async function onAnswer (chosen, correctV, btn, grid) {
      if (locked) return; locked = true;
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);
      if (chosen === correctV) {
        btn.classList.add('math-option--correct'); Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good'); correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('math-option--wrong'); Audio.wrong();
        grid.querySelectorAll('.math-option').forEach(b => { if (Number(b.textContent) === correctV) b.classList.add('math-option--correct'); });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(900); locked = false;
      if (round >= cfg.rounds) finish(); else nextRound();
    }

    function finish () {
      let stars = correct >= cfg.rounds ? 3 : correct >= cfg.rounds - 2 ? 2 : 1;
      const xp = 10 + correct * 4, coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp, title: stars === 3 ? 'Contador Mestre!' : 'Muito bem!',
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

function makeAnimalGrid (animal, count, bgColor) {
  const grid = el('div', { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', background: bgColor, borderRadius: '16px' } });
  for (let i = 0; i < count; i++) {
    const size = Math.max(44, Math.min(72, Math.floor(360 / count)));
    grid.appendChild(el('div', {
      style: { width: size + 'px', height: size + 'px', animation: `lizFloat ${(3 + Math.random() * 2).toFixed(1)}s ease-in-out infinite ${(Math.random() * 2).toFixed(1)}s` },
      html: CHARACTERS[animal](),
    }));
  }
  return grid;
}
function makeDistractors (n, maxN) {
  const set = new Set(); let t = 0;
  while (set.size < 3 && t++ < 50) {
    const d = rndInt(1, Math.max(2, Math.ceil(n * 0.4)));
    const v = Math.random() < 0.5 ? n + d : n - d;
    if (v >= 1 && v !== n && v <= maxN * 2 + 5) set.add(v);
  }
  while (set.size < 3) set.add(n + set.size + 1);
  return [...set];
}
function _ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
