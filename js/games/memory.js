/* =========================================================================
   LIZKIDS — PARES MÁGICOS (Memória)   QA-APROVADO
   ========================================================================= */

import { el, shuffle, sleep, formatTime } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage }  from '../components/ui.js';
import { ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

const POOL = ['lumi','bobo','pip','mel','drako','owly','zap','robo'];

export const MemoryGame = {
  _timer:   null,
  _running: false,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } });
    }

    /* Configuração de nível */
    const prevLevel = profile.gameProgress[gameDef.id]?.level || 1;
    const level     = Math.min(3, prevLevel);
    const pairs     = level === 1 ? 4 : level === 2 ? 6 : 8;
    const cols      = pairs <= 4 ? 4 : 4;  // grade: 2×4, 3×4, 4×4

    this._running = true;

    /* Estado do jogo */
    let moves = 0, matched = 0, startTime = Date.now(), flipped = [], locked = false;

    /* Wrap */
    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* HUD Topbar */
    const movesTxt = el('span', {}, ['0 jogadas']);
    const timeTxt  = el('span', {}, ['0:00']);
    const topbar   = el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('library'); } }, [el('span', { html: ICONS.back() }), 'Sair']),
      el('div',    { class: 'liz-game__title' }, [gameDef.title]),
      el('div',    { class: 'liz-game__hud' }, [
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.flame() }), movesTxt]),
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.clock()  }), timeTxt ]),
      ]),
    ]);
    wrap.appendChild(topbar);

    /* Timer display */
    this._timer = setInterval(() => {
      if (!this._running) return;
      timeTxt.textContent = formatTime((Date.now() - startTime) / 1000);
    }, 500);

    /* Stage */
    const stage = el('div', { class: 'liz-game__stage' });

    /* Descrição de nível */
    stage.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff' } },
      [`Nível ${level} — encontre os ${pairs} pares`]));

    /* Tabuleiro */
    const symbols = POOL.slice(0, pairs);
    const deck    = shuffle([...symbols, ...symbols]);
    const board   = el('div', {
      class: 'memory-board',
      style: { gridTemplateColumns: `repeat(${cols}, 1fr)` },
    });

    deck.forEach((sym, idx) => {
      const card = el('div', { class: 'memory-card' }, [
        el('div', { class: 'memory-card__face memory-card__face--back', html: ICONS.star() }),
        el('div', { class: 'memory-card__face memory-card__face--front', html: CHARACTERS[sym]() }),
      ]);
      card.dataset.sym = sym;
      card.dataset.idx = idx;

      card.addEventListener('click', () => onFlip(card));
      // Entrada stagger visual
      card.style.animationDelay = (idx * 35) + 'ms';
      card.style.animation = `lizPopIn 0.35s var(--ease-pop) ${idx * 35}ms both`;
      board.appendChild(card);
    });

    stage.appendChild(board);
    wrap.appendChild(stage);

    /* Lógica de flip */
    async function onFlip (card) {
      if (!this._running) return;
      if (locked) return;
      if (card.classList.contains('memory-card--flipped')) return;
      if (card.classList.contains('memory-card--matched')) return;
      if (flipped.length >= 2) return;

      Audio.pop();
      card.classList.add('memory-card--flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        locked = true;
        moves++;
        movesTxt.textContent = moves + (moves === 1 ? ' jogada' : ' jogadas');

        const [a, b] = flipped;
        if (a.dataset.sym === b.dataset.sym) {
          /* PAR! */
          await sleep(320);
          a.classList.add('memory-card--matched');
          b.classList.add('memory-card--matched');
          Audio.correct();
          Audio.coin();
          flipped = [];
          matched++;
          locked = false;

          if (matched === pairs) {
            this._running = false;
            clearInterval(this._timer);
            await sleep(600);
            finish(moves, (Date.now() - startTime) / 1000);
          }
        } else {
          /* Errou */
          await sleep(750);
          a.classList.remove('memory-card--flipped');
          b.classList.remove('memory-card--flipped');
          Audio.wrong();
          flipped = [];
          locked = false;
        }
      }
    }
    // bind para manter referência correta ao this
    board.querySelectorAll('.memory-card').forEach(c =>
      c.addEventListener('click', (e) => onFlip.call(this, e.currentTarget)));
    // Remove listener duplicado inserido acima; o forEach acima re-registra
    // Limpo: usar delegação no board
    board.removeEventListener('click', null);

    function finish (totalMoves, timeSec) {
      const perfect = pairs;
      let stars = 1;
      if (totalMoves <= perfect + 2) stars = 3;
      else if (totalMoves <= perfect + 5) stars = 2;

      const score  = Math.max(50, 1000 - totalMoves * 15 - Math.floor(timeSec) * 3);
      const coins  = 8 + stars * 6;
      const xp     = 12 + stars * 10;

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score, xp, coins,
        timeMs: timeSec * 1000,
        level: Math.min(3, level + (stars >= 2 ? 1 : 0)),
      });

      const msgs = ['Você tem memória de elefante!', 'Memória incrível!', 'Continue praticando!'];
      ResultModal({
        stars, coins, xp,
        title:   stars === 3 ? 'Memória Perfeita!' : stars === 2 ? 'Muito bem!' : 'Bom esforço!',
        message: msgs[3 - stars] || msgs[0],
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    return wrap;
  },

  unmount () {
    this._running = false;
    clearInterval(this._timer);
    this._timer = null;
  },
};
