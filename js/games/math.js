/* =========================================================================
   LIZKIDS — AVENTURA MATEMÁTICA
   Soma, subtração e multiplicação progressivas.
   ========================================================================= */

import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS, CHARACTERS } from '../data/characters.js';

const ROUNDS_PER_GAME = 8;

export const MathGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position:'absolute', inset:'0', background:'var(--bg-deep-1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontFamily:'Fredoka,sans-serif' } }, ['Redirecionando…']);
    }

    const progress = profile.gameProgress[gameDef.id] || {};
    const playerLevel = Math.min(5, progress.level || 1);

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    let round = 0, correct = 0, streak = 0, locked = false;
    const roundPill = el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.star() }), el('span', {}, ['1/' + ROUNDS_PER_GAME])]);
    const streakPill = el('div', { class: 'liz-pill liz-pill--stars' }, [el('span', { html: ICONS.flame() }), el('span', {}, ['Combo 0'])]);

    const topbar = el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } },
        [el('span', { html: ICONS.back() }), 'Sair']),
      el('div', { class: 'liz-game__title' }, [gameDef.title]),
      el('div', { class: 'liz-game__hud' }, [roundPill, streakPill]),
    ]);
    wrap.appendChild(topbar);

    const stage = el('div', { class: 'liz-game__stage' });
    const mathStage = el('div', { class: 'math-stage' });
    stage.appendChild(mathStage);
    wrap.appendChild(stage);

    function nextRound () {
      mathStage.innerHTML = '';
      round++;
      roundPill.children[1].textContent = round + '/' + ROUNDS_PER_GAME;

      // Gera operação conforme nível
      const op = pickOperation(playerLevel);
      const { a, b, sign, answer } = op;

      mathStage.appendChild(el('div', { class: 'math-question' }, [
        el('div', { class: 'math-question__pre' }, ['Quanto é?']),
        el('div', { class: 'math-question__expr' }, [
          el('span', { class: 'math-question__slot' }, [String(a)]),
          sign,
          el('span', { class: 'math-question__slot' }, [String(b)]),
          '=',
          el('span', { class: 'math-question__slot math-question__slot--empty' }, ['?']),
        ]),
      ]));

      // Opções (1 correta + 3 distratores)
      const distractors = generateDistractors(answer, op);
      const options = shuffle([answer, ...distractors]);

      const opts = el('div', { class: 'math-options' });
      options.forEach(val => {
        const btn = el('button', { class: 'math-option' }, [String(val)]);
        btn.addEventListener('click', () => onAnswer(val, answer, btn));
        opts.appendChild(btn);
      });
      mathStage.appendChild(opts);
    }

    async function onAnswer (chosen, correctVal, btn) {
      if (locked) return;
      locked = true;

      if (chosen === correctVal) {
        btn.classList.add('math-option--correct');
        Audio.correct();
        correct++; streak++;
        streakPill.children[1].textContent = 'Combo ' + streak;
      } else {
        btn.classList.add('math-option--wrong');
        Audio.wrong();
        streak = 0;
        streakPill.children[1].textContent = 'Combo 0';
        // Mostra a correta
        mathStage.querySelectorAll('.math-option').forEach(b => {
          if (Number(b.textContent) === correctVal) b.classList.add('math-option--correct');
        });
      }

      await sleep(900);
      locked = false;

      if (round >= ROUNDS_PER_GAME) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS_PER_GAME - 1) stars = 3;
      else if (correct >= ROUNDS_PER_GAME - 3) stars = 2;

      const xp = 10 + correct * 5 + (stars === 3 ? 20 : 0);
      const coins = 5 + correct * 2 + (stars === 3 ? 10 : 0);

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(5, playerLevel + (stars === 3 ? 1 : 0)),
      });

      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Gênio da Matemática!' : 'Bom trabalho!',
        message: `${correct} de ${ROUNDS_PER_GAME} respostas certas.`,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    nextRound();
    return wrap;
  },
  unmount () {},
};

function pickOperation (level) {
  // Nível 1: soma 0-10
  // Nível 2: soma e subtração 0-20
  // Nível 3: soma 0-50, subtração 0-30
  // Nível 4: multiplicação simples 1-5
  // Nível 5: multiplicação 1-10
  const ops = {
    1: () => makeSum(0, 10),
    2: () => Math.random() < 0.5 ? makeSum(0, 20) : makeSub(0, 20),
    3: () => Math.random() < 0.5 ? makeSum(0, 50) : makeSub(0, 30),
    4: () => Math.random() < 0.3 ? makeSum(0, 50) : (Math.random() < 0.5 ? makeSub(0, 30) : makeMul(1, 5)),
    5: () => Math.random() < 0.4 ? makeMul(1, 10) : (Math.random() < 0.5 ? makeSum(0, 80) : makeSub(0, 60)),
  };
  return (ops[level] || ops[1])();
}

function makeSum (min, max) { const a = rndInt(min, max), b = rndInt(min, max); return { a, b, sign: '+', answer: a + b, type: 'sum' }; }
function makeSub (min, max) { let a = rndInt(min, max), b = rndInt(min, max); if (b > a) [a, b] = [b, a]; return { a, b, sign: '−', answer: a - b, type: 'sub' }; }
function makeMul (min, max) { const a = rndInt(min, max), b = rndInt(min, max); return { a, b, sign: '×', answer: a * b, type: 'mul' }; }

function generateDistractors (correct, op) {
  const range = op.type === 'mul' ? 8 : Math.max(5, Math.ceil(correct * 0.3));
  const set = new Set();
  while (set.size < 3) {
    const v = correct + rndInt(-range, range);
    if (v !== correct && v >= 0) set.add(v);
  }
  return [...set];
}
