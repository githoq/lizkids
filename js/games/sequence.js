/* =========================================================================
   LIZKIDS — SEQUÊNCIA ENCANTADA   QA-APROVADO
   ========================================================================= */

import { el, pick, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS } from '../data/characters.js';

const COLORS  = ['blue', 'yellow', 'pink', 'green', 'lilac', 'orange'];
const SHAPES  = ['', 'square', 'triangle'];
const ROUNDS  = 6;

export const SequenceGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } });
    }

    const level = Math.min(4, profile.gameProgress[gameDef.id]?.level || 1);
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

    const stage    = el('div', { class: 'liz-game__stage' });
    const seqArea  = el('div', { class: 'sequence-stage' });
    stage.appendChild(seqArea);
    wrap.appendChild(stage);

    async function nextRound () {
      seqArea.innerHTML = '';
      round++;
      roundTxt.textContent = `${round}/${ROUNDS}`;

      const pattern = makePattern(level);
      const hideIdx = pattern.length - 1;  // esconde sempre o último
      const answer  = pattern[hideIdx];

      /* Título */
      seqArea.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff' } }, ['Complete a sequência']));

      /* Caixa da questão */
      const qBox = el('div', { class: 'sequence-question' }, [
        el('div', { class: 'sequence-question__pre' }, ['Qual vem a seguir?']),
      ]);
      const row = el('div', { class: 'sequence-row' });

      pattern.forEach((tok, i) => {
        const isHidden = i === hideIdx;
        const cell = el('div', {
          class: 'sequence-cell' + (isHidden ? ' sequence-cell--mystery' : ''),
          style: { animationDelay: (i * 60) + 'ms' },
        }, [
          isHidden ? '?' : makeToken(tok),
        ]);
        row.appendChild(cell);
      });
      qBox.appendChild(row);
      seqArea.appendChild(qBox);

      /* Opções */
      const wrongs = makeWrongOptions(answer, pattern);
      const options = shuffle([answer, ...wrongs]);

      const optsRow = el('div', { class: 'sequence-options' });
      options.forEach(tok => {
        const opt = el('div', {
          class: 'sequence-option',
          style: { animationDelay: (options.indexOf(tok) * 60) + 'ms' },
        }, [makeToken(tok)]);
        opt.dataset.color = tok.color;
        opt.dataset.shape = tok.shape || '';
        opt.addEventListener('click', () => onAnswer(tok, answer, opt, optsRow));
        optsRow.appendChild(opt);
      });
      seqArea.appendChild(optsRow);
    }

    async function onAnswer (chosen, correct_, btn, container) {
      if (locked) return;
      locked = true;

      container.querySelectorAll('.sequence-option').forEach(b => b.style.pointerEvents = 'none');

      const isRight = chosen.color === correct_.color && (chosen.shape || '') === (correct_.shape || '');

      if (isRight) {
        btn.classList.add('sequence-option--correct');
        Audio.correct();
        Audio.star();
        correct++;
      } else {
        btn.classList.add('sequence-option--wrong');
        Audio.wrong();
        // Revelar a correta
        container.querySelectorAll('.sequence-option').forEach(b => {
          if (b.dataset.color === correct_.color && b.dataset.shape === (correct_.shape || '')) {
            b.classList.add('sequence-option--reveal');
          }
        });
      }

      await sleep(1000);
      locked = false;

      if (round >= ROUNDS) finish();
      else nextRound();
    }

    function finish () {
      let stars = 1;
      if (correct >= ROUNDS)     stars = 3;
      else if (correct >= ROUNDS - 2) stars = 2;

      const xp    = 12 + correct * 5;
      const coins = 7  + correct * 3;

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(4, level + (stars >= 2 ? 1 : 0)),
      });

      ResultModal({
        stars, coins, xp,
        title:   stars === 3 ? 'Mente Brilhante!' : stars === 2 ? 'Muito inteligente!' : 'Continue praticando!',
        message: `${correct} de ${ROUNDS} acertos.`,
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

function makePattern (level) {
  const colorCount = level <= 2 ? 2 : 3;
  const cols       = shuffle([...COLORS]).slice(0, colorCount);
  const useShapes  = level >= 3;
  const shapes     = useShapes ? shuffle([...SHAPES]).slice(0, 2) : [''];
  const len        = level === 1 ? 4 : 5;
  const baseLen    = level <= 2 ? 2 : 3;
  const base       = Array.from({ length: baseLen }, (_, i) => ({
    color: cols[i % cols.length],
    shape: useShapes ? shapes[i % shapes.length] : '',
  }));
  return Array.from({ length: len }, (_, i) => ({ ...base[i % baseLen] }));
}

function makeWrongOptions (correct, pattern) {
  const seen = new Set([key(correct)]);
  const out  = [];
  let tries  = 0;
  while (out.length < 3 && tries < 60) {
    const c = pick(COLORS);
    const s = correct.shape !== '' ? pick(SHAPES.filter(x => x !== '')) : '';
    const k = c + '-' + s;
    if (!seen.has(k)) { seen.add(k); out.push({ color: c, shape: s }); }
    tries++;
  }
  // Fallback: garantir sempre 3 opções distintas
  while (out.length < 3) {
    const c = COLORS[out.length % COLORS.length];
    out.push({ color: c, shape: '' });
  }
  return out;
}

function key (tok) { return tok.color + '-' + (tok.shape || ''); }

function makeToken (tok) {
  const classes = ['token', 'token--' + tok.color];
  if (tok.shape) classes.push('token--' + tok.shape);
  return el('div', { class: classes.join(' ') });
}
