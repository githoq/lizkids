/* =========================================================================
   LIZKIDS — SEQUÊNCIA LÓGICA (versão premium)
   Nível 4: sequências numéricas com seta → próximo número.
   ========================================================================= */
import { el, pick, shuffle, sleep, rndInt } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const COLORS = ['blue','yellow','pink','green','lilac','orange'];
const SHAPES  = ['','square','triangle'];
const CFG     = [5, 6, 6, 7];

export const LogicSequenceGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level  = Math.min(4, Math.max(1, gameDef.level || 1));
    const rounds = CFG[level - 1];
    let round = 0, correct = 0, locked = false;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const progressTxt = el('span', {}, [`1/${rounds}`]);
    const comboPill   = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: rounds }, () => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', justifyContent: 'center' } });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [`Sequência — Nv ${level}`]),
      el('div', { class: 'liz-game__hud' }, [progressTxt, comboPill]),
    ]));

    const stage   = el('div', { class: 'liz-game__stage', style: { gap: '12px' } });
    const seqArea = el('div', { class: 'sequence-stage' });
    stage.appendChild(dotsRow);
    stage.appendChild(seqArea);
    wrap.appendChild(stage);

    async function nextRound () {
      seqArea.innerHTML = '';
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      progressTxt.textContent = `${round}/${rounds}`;

      if (level === 4) { nextRoundNumber(); return; }

      const { pattern, answer } = makePattern(level);
      const hideIdx = pattern.length - 1;

      seqArea.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff', fontSize: 'var(--fs-md)', marginBottom: '8px' } }, ['Complete a sequência']));

      const qBox = el('div', { class: 'sequence-question' });
      qBox.appendChild(el('div', { class: 'sequence-question__pre' }, ['Qual vem a seguir?']));

      /* Preview: mostra tudo, depois esconde o último (efeito mágico) */
      const row = el('div', { class: 'sequence-row' });
      const cells = pattern.map((tok, i) => {
        const cell = i === hideIdx
          ? el('div', { class: 'sequence-cell', style: { animationDelay: i * 80 + 'ms' }, html: '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%"><svg viewBox="0 0 24 24" fill="none" stroke="#A89EC4" stroke-width="2" width="28" height="28"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z"/></svg></div>' })
          : makeTokenCell(tok, 'sequence-cell', i * 60 + 'ms');
        row.appendChild(cell);
        return cell;
      });
      qBox.appendChild(row);
      seqArea.appendChild(qBox);

      /* Opções */
      const wrongs  = makeWrongTokens(answer, 3);
      const options = shuffle([answer, ...wrongs]);

      /* Pequeno delay antes de mostrar opções (ênfase no padrão) */
      await sleep(200);

      const optsRow = el('div', { class: 'sequence-options' });
      options.forEach((tok, i) => {
        const btn = makeTokenCell(tok, 'sequence-option', i * 60 + 'ms');
        btn.dataset.color = tok.color;
        btn.dataset.shape = tok.shape || '';
        btn.addEventListener('click', () => {
          const isRight = tok.color === answer.color && (tok.shape || '') === (answer.shape || '');
          onAnswer(isRight, btn, optsRow, answer);
        });
        optsRow.appendChild(btn);
      });
      seqArea.appendChild(optsRow);
    }

    /* Nível 4: sequência numérica */
    function nextRoundNumber () {
      const steps  = [1,2,3,5,10];
      const step   = pick(steps);
      const asc    = Math.random() < 0.65;
      const start  = rndInt(asc ? 1 : step * 4, 30);
      const seq    = Array.from({ length: 3 }, (_, i) => asc ? start + step * i : start - step * i).filter(n => n >= 0);
      if (seq.length < 3) { seq.push(1); }
      const correctV = asc ? seq[2] + step : Math.max(0, seq[2] - step);

      seqArea.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff', fontSize: 'var(--fs-md)', marginBottom: '8px' } }, ['Qual número vem a seguir?']));

      const qBox = el('div', { class: 'sequence-question' });
      qBox.appendChild(el('div', { class: 'sequence-question__pre' }, [`+${step} a cada passo ${asc ? '→' : '←'}`]));

      const row = el('div', { class: 'sequence-row' });
      seq.forEach((n, i) => {
        row.appendChild(el('div', {
          class: 'sequence-cell',
          style: { background: 'linear-gradient(135deg,#DCC2FF,#B57BFF)', justifyContent: 'center', animationDelay: i * 80 + 'ms' },
        }, [el('span', { style: { fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#fff' } }, [String(n)])]));
      });
      row.appendChild(el('div', { class: 'sequence-cell sequence-cell--mystery' }, ['?']));
      qBox.appendChild(row);
      seqArea.appendChild(qBox);

      /* Opções */
      const dists = new Set([correctV]);
      let t = 0;
      while (dists.size < 4 && t++ < 60) {
        const d = rndInt(1, Math.max(2, step * 2));
        const v = Math.random() < 0.5 ? correctV + d : correctV - d;
        if (v >= 0 && v !== correctV) dists.add(v);
      }
      while (dists.size < 4) dists.add(correctV + dists.size);

      const optsRow = el('div', { class: 'sequence-options' });
      shuffle([...dists]).forEach((n, i) => {
        const btn = el('div', {
          class: 'sequence-option',
          style: { background: 'linear-gradient(135deg,#DCC2FF,#B57BFF)', justifyContent: 'center', animationDelay: i * 60 + 'ms' },
        }, [el('span', { style: { fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#fff' } }, [String(n)])]);
        btn.dataset.val = n;
        btn.addEventListener('click', () => onAnswerNum(n === correctV, n, correctV, btn, optsRow));
        optsRow.appendChild(btn);
      });
      seqArea.appendChild(optsRow);
    }

    async function onAnswer (isRight, btn, container, answer) {
      if (locked) return; locked = true;
      container.querySelectorAll('.sequence-option').forEach(b => b.style.pointerEvents = 'none');
      if (isRight) {
        btn.classList.add('sequence-option--correct'); Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good'); correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('sequence-option--wrong'); Audio.wrong();
        container.querySelectorAll('.sequence-option').forEach(b => {
          if (b.dataset.color === answer.color && b.dataset.shape === (answer.shape || '')) b.classList.add('sequence-option--reveal');
        });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(900); locked = false;
      if (round >= rounds) finish(); else nextRound();
    }

    async function onAnswerNum (isRight, chosen, correctV, btn, container) {
      if (locked) return; locked = true;
      container.querySelectorAll('.sequence-option').forEach(b => b.style.pointerEvents = 'none');
      if (isRight) {
        btn.classList.add('sequence-option--correct'); Audio.correct();
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good'); correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.classList.add('sequence-option--wrong'); Audio.wrong();
        container.querySelectorAll('.sequence-option').forEach(b => { if (Number(b.dataset.val) === correctV) b.classList.add('sequence-option--correct'); });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(900); locked = false;
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
  const nc   = level <= 2 ? 2 : 3;
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
  const out  = []; let t = 0;
  while (out.length < count && t++ < 80) {
    const c = pick(COLORS), s = correct.shape ? pick(SHAPES.filter(x => x !== '')) : '';
    const k = c + '-' + s;
    if (!seen.has(k)) { seen.add(k); out.push({ color: c, shape: s }); }
  }
  while (out.length < count) out.push({ color: COLORS[out.length], shape: '' });
  return out;
}
function makeTokenCell (tok, cls, delay = '0ms') {
  const tCls = ['token', 'token--' + tok.color];
  if (tok.shape) tCls.push('token--' + tok.shape);
  return el('div', { class: cls, style: { animationDelay: delay } }, [el('div', { class: tCls.join(' ') })]);
}
function ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
