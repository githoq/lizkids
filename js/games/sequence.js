/* =========================================================================
   LIZKIDS — SEQUÊNCIA ENCANTADA
   Completar padrões lógicos.
   ========================================================================= */

import { el, pick, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS } from '../data/characters.js';

const COLORS  = ['blue', 'yellow', 'pink', 'green', 'lilac', 'orange'];
const SHAPES  = ['', 'square', 'triangle']; // '' = circle
const ROUNDS  = 6;

export const SequenceGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position:'absolute', inset:'0', background:'var(--bg-deep-1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontFamily:'Fredoka,sans-serif' } }, ['Redirecionando…']);
    }

    const progress = profile.gameProgress[gameDef.id] || {};
    const playerLevel = Math.min(4, progress.level || 1);

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
    const seqStage = el('div', { class: 'sequence-stage' });
    stage.appendChild(seqStage);
    wrap.appendChild(stage);

    function nextRound () {
      seqStage.innerHTML = '';
      round++;
      roundPill.children[1].textContent = round + '/' + ROUNDS;

      const pattern = generatePattern(playerLevel);
      const hideIdx = pattern.length - 1;

      seqStage.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff' } }, ['Complete a sequência']));
      const q = el('div', { class: 'sequence-question' });

      const row = el('div', { class: 'sequence-row' });
      pattern.forEach((tok, i) => {
        if (i === hideIdx) {
          row.appendChild(el('div', { class: 'sequence-cell sequence-cell--mystery' }, ['?']));
        } else {
          row.appendChild(makeTokenCell(tok));
        }
      });
      q.appendChild(row);
      seqStage.appendChild(q);

      // Opções
      const correctTok = pattern[hideIdx];
      const wrongOptions = generateWrongOptions(correctTok, pattern);
      const options = shuffle([correctTok, ...wrongOptions]);

      const optsRow = el('div', { class: 'sequence-options' });
      options.forEach(tok => {
        const btn = makeTokenCell(tok, 'sequence-option');
        btn.addEventListener('click', () => onAnswer(tok, correctTok, btn));
        optsRow.appendChild(btn);
      });
      seqStage.appendChild(optsRow);
    }

    async function onAnswer (chosen, correctTok, btn) {
      if (locked) return;
      locked = true;

      if (chosen.color === correctTok.color && chosen.shape === correctTok.shape) {
        btn.classList.add('sequence-option--correct');
        Audio.correct();
        correct++;
      } else {
        btn.classList.add('sequence-option--wrong');
        Audio.wrong();
        // Mostrar a correta
        seqStage.querySelectorAll('.sequence-option').forEach(b => {
          const c = b.dataset.color, s = b.dataset.shape || '';
          if (c === correctTok.color && s === (correctTok.shape || '')) {
            b.classList.add('sequence-option--correct');
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
      if (correct >= ROUNDS - 0) stars = 3;
      else if (correct >= ROUNDS - 2) stars = 2;

      const xp = 12 + correct * 5;
      const coins = 6 + correct * 3;

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score: correct * 100, xp, coins,
        level: Math.min(4, playerLevel + (stars === 3 ? 1 : 0)),
      });

      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Mente Brilhante!' : 'Você foi bem!',
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

function generatePattern (level) {
  // Padrões progressivos:
  // L1: ABAB com 2 cores (4 itens)
  // L2: ABCABC com 3 cores (5 itens)
  // L3: padrão com cor+forma (5 itens)
  // L4: padrão ABBC ou crescente
  const colors = shuffle(COLORS).slice(0, level === 1 ? 2 : level === 2 ? 3 : 3);
  const useShapes = level >= 3;
  const shapes = useShapes ? shuffle(SHAPES).slice(0, 2) : [''];

  const seqLen = level === 1 ? 4 : 5;
  const patternLen = level === 1 ? 2 : level === 2 ? 3 : 2;
  const basePattern = [];
  for (let i = 0; i < patternLen; i++) {
    basePattern.push({ color: colors[i % colors.length], shape: useShapes ? shapes[i % shapes.length] : '' });
  }

  const seq = [];
  for (let i = 0; i < seqLen; i++) seq.push(basePattern[i % patternLen]);
  return seq;
}

function generateWrongOptions (correct, pattern) {
  const out = [];
  const seen = new Set([correct.color + '-' + correct.shape]);
  while (out.length < 3) {
    const c = pick(COLORS);
    const s = correct.shape ? pick(SHAPES) : '';
    const key = c + '-' + s;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ color: c, shape: s });
  }
  return out;
}

function makeTokenCell (tok, extraClass = '') {
  const wrapClass = extraClass || 'sequence-cell';
  const tokenClasses = ['token', 'token--' + tok.color];
  if (tok.shape) tokenClasses.push('token--' + tok.shape);
  const node = el('div', { class: wrapClass, data: { color: tok.color, shape: tok.shape || '' } }, [
    el('div', { class: tokenClasses.join(' ') }),
  ]);
  return node;
}
