/* =========================================================================
   LIZKIDS — SEQUÊNCIA ENCANTADA (4 níveis)
   Nível 4: sequências numéricas (+step).
   ========================================================================= */
import { el, pick, shuffle, sleep, rndInt } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const COLORS = ['blue','yellow','pink','green','lilac','orange'];
const SHAPES = ['','square','triangle'];
const ROUNDS_CFG = [5, 5, 6, 6];

export const SequenceGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return _ph(); }

    const level  = Math.min(4, Math.max(1, gameDef.level || 1));
    const rounds = ROUNDS_CFG[level - 1];
    let round = 0, correct = 0, locked = false;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt  = el('span', {}, ['1/' + rounds]);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: rounds }, () => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots' });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [gameDef.title + ' — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [roundTxt, comboPill]),
    ]));

    const stage   = el('div', { class: 'liz-game__stage' });
    const seqArea = el('div', { class: 'sequence-stage' });
    stage.appendChild(dotsRow);
    stage.appendChild(seqArea);
    wrap.appendChild(stage);

    function nextRound () {
      seqArea.innerHTML = '';
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round + '/' + rounds;

      if (level === 4) nextRoundNumber();
      else nextRoundColor();
    }

    /* ── Níveis 1-3: padrão de cores/formas ── */
    function nextRoundColor () {
      const { pattern, answer } = makePattern(level);
      const hideIdx = pattern.length - 1;

      seqArea.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff' } }, ['Complete a sequência']));
      const qBox = el('div', { class: 'sequence-question' }, [
        el('div', { class: 'sequence-question__pre' }, ['Qual vem a seguir?']),
      ]);
      const row = el('div', { class: 'sequence-row' });
      pattern.forEach((tok, i) => {
        row.appendChild(i === hideIdx
          ? el('div', { class: 'sequence-cell sequence-cell--mystery' }, ['?'])
          : makeTokenCell(tok));
      });
      qBox.appendChild(row);
      seqArea.appendChild(qBox);

      const wrongs  = makeWrongTokens(answer, 3);
      const options = shuffle([answer, ...wrongs]);
      const optsRow = el('div', { class: 'sequence-options' });
      options.forEach(tok => {
        const btn = makeTokenCell(tok, 'sequence-option');
        btn.dataset.color = tok.color;
        btn.dataset.shape = tok.shape || '';
        btn.addEventListener('click', () => {
          const isRight = tok.color === answer.color && (tok.shape || '') === (answer.shape || '');
          onAnswer(isRight, btn, optsRow, answer.color, answer.shape || '');
        });
        optsRow.appendChild(btn);
      });
      seqArea.appendChild(optsRow);
    }

    /* ── Nível 4: sequência numérica ── */
    function nextRoundNumber () {
      const steps = [1, 2, 3, 5, 10];
      const step  = pick(steps);
      const asc   = Math.random() < 0.6;
      const start = rndInt(1, 30);
      const seq   = Array.from({ length: 4 }, (_, i) => asc ? start + step * i : start - step * i).filter(n => n >= 0);
      while (seq.length < 4) seq.push(seq[seq.length - 1] + step);
      const correctV = asc ? seq[3] + step : Math.max(0, seq[3] - step);

      seqArea.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff' } }, ['Qual número vem a seguir?']));
      const qBox = el('div', { class: 'sequence-question' });
      qBox.appendChild(el('div', { class: 'sequence-question__pre' }, ['Complete a sequência numérica']));
      const row = el('div', { class: 'sequence-row' });
      seq.forEach(n => {
        row.appendChild(el('div', { class: 'sequence-cell', style: { background: 'linear-gradient(135deg,#DCC2FF,#B57BFF)', justifyContent: 'center' } },
          [el('span', { style: { fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#fff' } }, [String(n)])]));
      });
      row.appendChild(el('div', { class: 'sequence-cell sequence-cell--mystery' }, ['?']));
      qBox.appendChild(row);
      seqArea.appendChild(qBox);

      const dists = new Set([correctV]);
      while (dists.size < 4) { const d = rndInt(1, Math.max(2, step * 2)); const v = correctV + (Math.random() < 0.5 ? d : -d); if (v >= 0 && v !== correctV) dists.add(v); }
      while (dists.size < 4) dists.add(correctV + dists.size);

      const optsRow = el('div', { class: 'sequence-options' });
      shuffle([...dists]).forEach(n => {
        const btn = el('div', { class: 'sequence-option', style: { background: 'linear-gradient(135deg,#DCC2FF,#B57BFF)', justifyContent: 'center' } },
          [el('span', { style: { fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#fff' } }, [String(n)])]);
        btn.addEventListener('click', () => onAnswerNum(n === correctV, n, correctV, btn, optsRow));
        optsRow.appendChild(btn);
      });
      seqArea.appendChild(optsRow);
    }

    async function onAnswer (isRight, btn, container, correctColor, correctShape) {
      if (locked) return; locked = true;
      container.querySelectorAll('.sequence-option').forEach(b => b.style.pointerEvents = 'none');
      if (isRight) {
        btn.classList.add('sequence-option--correct'); Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
        correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('sequence-option--wrong'); Audio.wrong();
        container.querySelectorAll('.sequence-option').forEach(b => {
          if (b.dataset.color === correctColor && b.dataset.shape === correctShape) b.classList.add('sequence-option--reveal');
        });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(950); locked = false;
      if (round >= rounds) finish(); else nextRound();
    }

    async function onAnswerNum (isRight, chosen, correctV, btn, container) {
      if (locked) return; locked = true;
      container.querySelectorAll('.sequence-option').forEach(b => b.style.pointerEvents = 'none');
      if (isRight) {
        btn.classList.add('sequence-option--correct'); Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
        correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('sequence-option--wrong'); Audio.wrong();
        container.querySelectorAll('.sequence-option').forEach(b => {
          const span = b.querySelector('span');
          if (span && Number(span.textContent) === correctV) b.classList.add('sequence-option--correct');
        });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(950); locked = false;
      if (round >= rounds) finish(); else nextRound();
    }

    function finish () {
      let stars = correct >= rounds ? 3 : correct >= rounds - 2 ? 2 : 1;
      const xp = 12 + correct * 5, coins = 7 + correct * 3;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp, title: stars === 3 ? 'Mente Brilhante!' : 'Muito bem!',
        message: `${correct} de ${rounds} acertos.`,
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
function makePattern (level) {
  const nc = level <= 2 ? 2 : 3;
  const cols = shuffle([...COLORS]).slice(0, nc);
  const useS = level >= 3;
  const shps = useS ? shuffle([...SHAPES]).slice(0, 2) : [''];
  const len  = level === 1 ? 4 : 5;
  const bLen = level <= 2 ? 2 : 3;
  const base = Array.from({ length: bLen }, (_, i) => ({ color: cols[i % nc], shape: useS ? shps[i % 2] : '' }));
  const pattern = Array.from({ length: len }, (_, i) => ({ ...base[i % bLen] }));
  return { pattern, answer: pattern[len - 1] };
}
function makeWrongTokens (correct, count) {
  const seen = new Set([correct.color + '-' + (correct.shape || '')]);
  const out = []; let t = 0;
  while (out.length < count && t++ < 60) {
    const c = pick(COLORS), s = correct.shape ? pick(SHAPES.filter(x => x !== '')) : '';
    const k = c + '-' + s;
    if (!seen.has(k)) { seen.add(k); out.push({ color: c, shape: s }); }
  }
  while (out.length < count) out.push({ color: COLORS[out.length], shape: '' });
  return out;
}
function makeTokenCell (tok, extraClass = 'sequence-cell') {
  const cls = ['token', 'token--' + tok.color];
  if (tok.shape) cls.push('token--' + tok.shape);
  return el('div', { class: extraClass }, [el('div', { class: cls.join(' ') })]);
}
function _ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
