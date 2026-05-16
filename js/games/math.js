/* =========================================================================
   LIZKIDS — AVENTURA MATEMÁTICA (4 níveis + timer no nível 4)
   ========================================================================= */
import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }     from '../data/characters.js';
import { ComboSystem, QuestionTimer, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

/* Configuração por nível */
const CFG = [
  { rounds: 6,  ops: ['sum'],                 max: 10,  timer: null },
  { rounds: 8,  ops: ['sum','sub'],           max: 20,  timer: null },
  { rounds: 8,  ops: ['sum','sub','mul'],     max: 50,  timer: null },
  { rounds: 12, ops: ['sum','sub','mul'],     max: 100, timer: 12   },
];

export const MathGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return _ph(); }

    const level  = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg    = CFG[level - 1];
    let round    = 0, correct = 0, locked = false;
    const combo  = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* HUD */
    const roundTxt  = el('span', {}, ['1/' + cfg.rounds]);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: cfg.rounds }, (_, i) => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', maxWidth: '360px', justifyContent: 'center' } });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [gameDef.title + ' — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [roundTxt, comboPill]),
    ]));

    const stage   = el('div', { class: 'liz-game__stage' });
    const mathArea = el('div', { class: 'math-stage' });
    stage.appendChild(dotsRow);
    stage.appendChild(mathArea);
    wrap.appendChild(stage);

    let qTimer = null;

    function nextRound () {
      mathArea.innerHTML = '';
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round + '/' + cfg.rounds;

      const op = pickOp(cfg.ops, cfg.max);
      const questionEl = buildQuestion(op);
      mathArea.appendChild(questionEl);

      /* Timer bar (nível 4) */
      let timerFill = null;
      if (cfg.timer) {
        const bar = el('div', { class: 'liz-timer-bar' }, [
          el('div', { class: 'liz-timer-bar__fill' }),
        ]);
        timerFill = bar.firstChild;
        mathArea.appendChild(bar);

        qTimer = new QuestionTimer(cfg.timer,
          (pct) => {
            timerFill.style.transform = `scaleX(${pct})`;
            if (pct < 0.3) timerFill.classList.add('liz-timer-bar__fill--danger');
          },
          () => onAnswer(-99999, op.answer, null, optGrid)  // timeout → wrong
        );
        qTimer.start();
      }

      /* Opções */
      const opts = buildOptions(op.answer, op.type);
      const optGrid = el('div', { class: 'math-options' });
      opts.forEach(v => {
        const btn = el('button', { class: 'math-option' }, [String(v)]);
        btn.addEventListener('click', () => onAnswer(v, op.answer, btn, optGrid));
        optGrid.appendChild(btn);
      });
      mathArea.appendChild(optGrid);
    }

    async function onAnswer (chosen, correctV, btn, grid) {
      if (locked) return;
      locked = true;
      qTimer?.stop();
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);

      if (chosen === correctV) {
        btn?.classList.add('math-option--correct');
        Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
        correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current', 'liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn?.classList.add('math-option--wrong');
        Audio.wrong();
        grid.querySelectorAll('.math-option').forEach(b => {
          if (Number(b.textContent) === correctV) b.classList.add('math-option--correct');
        });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current', 'liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }

      await sleep(900);
      locked = false;
      if (round >= cfg.rounds) finish();
      else nextRound();
    }

    function finish () {
      const mult  = combo.getMultiplier();
      let stars   = correct >= cfg.rounds ? 3 : correct >= cfg.rounds - 2 ? 2 : 1;
      const xp    = Math.floor((10 + correct * 5) * mult);
      const coins = 6 + correct * 2 + (stars === 3 ? 10 : 0);
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Gênio da Matemática!' : 'Muito bem!',
        message: `${correct} de ${cfg.rounds} acertos.`,
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

/* helpers */
function pickOp (ops, max) {
  const type = ops[Math.floor(Math.random() * ops.length)];
  if (type === 'mul') { const a = rndInt(1, Math.min(max, 10)), b = rndInt(1, Math.min(max, 10)); return { a, b, sign: '×', answer: a * b, type }; }
  if (type === 'sub') { let a = rndInt(0, max), b = rndInt(0, max); if (b > a) [a, b] = [b, a]; return { a, b, sign: '−', answer: a - b, type }; }
  const a = rndInt(0, max), b = rndInt(0, max); return { a, b, sign: '+', answer: a + b, type };
}
function buildQuestion (op) {
  return el('div', { class: 'math-question', style: { animation: 'lizPopIn .35s var(--ease-pop)' } }, [
    el('div', { class: 'math-question__pre' }, ['Quanto é?']),
    el('div', { class: 'math-question__expr' }, [
      el('span', { class: 'math-question__slot' }, [String(op.a)]),
      op.sign,
      el('span', { class: 'math-question__slot' }, [String(op.b)]),
      '=',
      el('span', { class: 'math-question__slot math-question__slot--empty' }, ['?']),
    ]),
  ]);
}
function buildOptions (correct, type) {
  const range = type === 'mul' ? 8 : Math.max(4, Math.ceil(correct * 0.35));
  const set = new Set([correct]);
  let tries = 0;
  while (set.size < 4 && tries++ < 40) {
    const d = rndInt(1, range);
    const v = Math.random() < 0.5 ? correct + d : correct - d;
    if (v >= 0 && v !== correct) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size);
  return shuffle([...set]);
}
function _ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
