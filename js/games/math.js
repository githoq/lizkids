/* =========================================================================
   LIZKIDS — AVENTURA MATEMÁTICA   QA-APROVADO
   ========================================================================= */

import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';

const ROUNDS = 8;

export const MathGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } });
    }

    const level = Math.min(5, profile.gameProgress[gameDef.id]?.level || 1);
    let round = 0, correct = 0, streak = 0, locked = false;

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* Topbar */
    const roundTxt  = el('span', {}, [`1/${ROUNDS}`]);
    const streakTxt = el('span', {}, ['Combo 0']);
    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } }, [el('span', { html: ICONS.back() }), 'Sair']),
      el('div',    { class: 'liz-game__title' }, [gameDef.title]),
      el('div',    { class: 'liz-game__hud' }, [
        el('div', { class: 'liz-pill liz-pill--stars'  }, [el('span', { html: ICONS.star() }), roundTxt  ]),
        el('div', { class: 'liz-pill liz-pill--yellow' }, [el('span', { html: ICONS.flame()}), streakTxt ]),
      ]),
    ]));

    const stage    = el('div', { class: 'liz-game__stage' });
    const mathArea = el('div', { class: 'math-stage' });
    stage.appendChild(mathArea);
    wrap.appendChild(stage);

    function nextRound () {
      mathArea.innerHTML = '';
      round++;
      roundTxt.textContent = `${round}/${ROUNDS}`;

      const op = pickOp(level);

      /* Pergunta */
      const questionEl = el('div', { class: 'math-question' }, [
        el('div', { class: 'math-question__pre' }, ['Quanto é?']),
        el('div', { class: 'math-question__expr' }, [
          el('span', { class: 'math-question__slot' }, [String(op.a)]),
          op.sign,
          el('span', { class: 'math-question__slot' }, [String(op.b)]),
          '=',
          el('span', { class: 'math-question__slot math-question__slot--empty' }, ['?']),
        ]),
      ]);
      mathArea.appendChild(questionEl);

      /* Opções: 1 correta + 3 distratores, embaralhadas */
      const opts = buildOptions(op.answer, op.type);
      const optGrid = el('div', { class: 'math-options' });
      opts.forEach(val => {
        const btn = el('button', { class: 'math-option' }, [String(val)]);
        btn.addEventListener('click', () => answer(val, op.answer, btn, optGrid));
        optGrid.appendChild(btn);
      });
      mathArea.appendChild(optGrid);
    }

    async function answer (chosen, correct_, btn, grid) {
      if (locked) return;
      locked = true;

      // Desabilitar todos os botões
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);

      if (chosen === correct_) {
        btn.classList.add('math-option--correct');
        Audio.correct();
        correct++;
        streak++;
        streakTxt.textContent = 'Combo ' + streak;
      } else {
        btn.classList.add('math-option--wrong');
        Audio.wrong();
        streak = 0;
        streakTxt.textContent = 'Combo 0';
        // Mostrar a correta em verde
        grid.querySelectorAll('.math-option').forEach(b => {
          if (Number(b.textContent) === correct_) b.classList.add('math-option--correct');
        });
      }

      await sleep(920);
      locked = false;

      if (round >= ROUNDS) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS)     stars = 3;
      else if (correct >= ROUNDS - 2) stars = 2;

      const xp    = 10 + correct * 5  + (stars === 3 ? 20 : 0);
      const coins = 6  + correct * 2  + (stars === 3 ? 10 : 0);

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(5, level + (stars >= 2 ? 1 : 0)),
      });

      ResultModal({
        stars, coins, xp,
        title:   stars === 3 ? 'Gênio da Matemática!' : stars === 2 ? 'Muito bem!' : 'Continue praticando!',
        message: `${correct} de ${ROUNDS} respostas certas.`,
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

function pickOp (level) {
  const ops = {
    1: () => makeSum(0, 10),
    2: () => Math.random() < 0.5 ? makeSum(0, 20) : makeSub(0, 20),
    3: () => Math.random() < 0.5 ? makeSum(0, 50) : makeSub(0, 30),
    4: () => Math.random() < 0.4 ? makeMul(1, 5)  : (Math.random() < 0.5 ? makeSum(0, 50) : makeSub(0, 40)),
    5: () => Math.random() < 0.4 ? makeMul(1, 10) : (Math.random() < 0.5 ? makeSum(0, 80) : makeSub(0, 60)),
  };
  return (ops[level] || ops[1])();
}

function makeSum (min, max) { const a = rndInt(min, max), b = rndInt(min, max); return { a, b, sign: '+', answer: a + b, type: 'sum' }; }
function makeSub (min, max) { let a = rndInt(min, max), b = rndInt(min, max); if (b > a) [a, b] = [b, a]; return { a, b, sign: '−', answer: a - b, type: 'sub' }; }
function makeMul (min, max) { const a = rndInt(min, max), b = rndInt(min, max); return { a, b, sign: '×', answer: a * b, type: 'mul' }; }

function buildOptions (correct, type) {
  const range = type === 'mul' ? 8 : Math.max(4, Math.ceil(correct * 0.35));
  const set   = new Set([correct]);
  let attempts = 0;
  while (set.size < 4 && attempts < 40) {
    const d = rndInt(1, range);
    const v = Math.random() < 0.5 ? correct + d : correct - d;
    if (v >= 0 && v !== correct) set.add(v);
    attempts++;
  }
  // Fallback: adicionar valores próximos se não conseguiu 4 únicos
  while (set.size < 4) { set.add(correct + set.size); }
  return shuffle([...set]);
}
