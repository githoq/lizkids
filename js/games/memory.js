/* =========================================================================
   LIZKIDS — PARES MÁGICOS  (4 níveis)
   ========================================================================= */
import { el, shuffle, sleep, formatTime } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION, isLevelUnlocked, getLevelStars } from '../core/game-engine.js';

const POOL   = ['lumi','bobo','pip','mel','drako','owly','zap','robo'];
const CONFIG = [
  { pairs: 4,  cols: 4, timeLimit: null },
  { pairs: 6,  cols: 4, timeLimit: 90   },
  { pairs: 8,  cols: 4, timeLimit: 75   },
  { pairs: 10, cols: 5, timeLimit: 60   },
];

export const MemoryGame = {
  _interval: null,
  _running:  false,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return _ph(); }

    const level  = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg    = CONFIG[level - 1];
    const { pairs, cols, timeLimit } = cfg;
    this._running = true;

    let moves = 0, matched = 0, flipped = [], locked = false;
    let elapsed = 0;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* HUD */
    const movesTxt  = el('span', {}, ['0']);
    const timeTxt   = el('span', {}, [timeLimit ? `${timeLimit}s` : '0:00']);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);

    const dots = el('div', { class: 'liz-round-dots' });
    for (let i = 0; i < pairs; i++) {
      const d = el('div', { class: 'liz-round-dot' });
      d.dataset.i = i;
      dots.appendChild(d);
    }

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [gameDef.title + ' — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.flame() }), movesTxt]),
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.clock()  }), timeTxt ]),
        comboPill,
      ]),
    ]));

    /* Tabuleiro */
    const symbols = POOL.slice(0, pairs);
    const deck    = shuffle([...symbols, ...symbols]);
    const board   = el('div', { class: 'memory-board', style: { gridTemplateColumns: `repeat(${cols},1fr)` } });

    deck.forEach((sym, idx) => {
      const card = el('div', { class: 'memory-card' }, [
        el('div', { class: 'memory-card__face memory-card__face--back', html: ICONS.star() }),
        el('div', { class: 'memory-card__face memory-card__face--front', html: CHARACTERS[sym]() }),
      ]);
      card.dataset.sym = sym;
      card.style.animationDelay = (idx * 30) + 'ms';
      card.style.animation = `lizPopIn .3s var(--ease-pop) ${idx*30}ms both`;
      card.addEventListener('click', () => onFlip(card));
      board.appendChild(card);
    });

    const stage = el('div', { class: 'liz-game__stage' });
    stage.appendChild(el('div', { class: 'liz-round-dots', style: { marginBottom: '8px' } }, [dots]));
    stage.appendChild(board);
    wrap.appendChild(stage);

    /* Timer */
    let remaining = timeLimit;
    this._interval = setInterval(() => {
      if (!this._running) return;
      elapsed++;
      if (timeLimit) {
        remaining--;
        timeTxt.textContent = remaining + 's';
        if (remaining <= 0) { this._running = false; clearInterval(this._interval); finish(moves, elapsed, true); }
      } else {
        timeTxt.textContent = formatTime(elapsed);
      }
    }, 1000);

    async function onFlip (card) {
      if (!this._running || locked) return;
      if (card.classList.contains('memory-card--flipped') || card.classList.contains('memory-card--matched')) return;
      if (flipped.length >= 2) return;
      Audio.pop(); card.classList.add('memory-card--flipped'); flipped.push(card);

      if (flipped.length === 2) {
        locked = true; moves++;
        movesTxt.textContent = moves;
        const [a, b] = flipped;
        if (a.dataset.sym === b.dataset.sym) {
          await sleep(350); a.classList.add('memory-card--matched'); b.classList.add('memory-card--matched');
          Audio.correct();
          const c = combo.hit(n => {
            comboPill.lastChild.textContent = '×' + n;
            comboPill.classList.add('liz-combo-pill--active');
            setTimeout(() => comboPill.classList.remove('liz-combo-pill--active'), 800);
          });
          showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
          /* atualizar dot */
          const dot = dots.children[matched];
          if (dot) dot.classList.add('liz-round-dot--correct');
          matched++; flipped = []; locked = false;
          if (matched === pairs) {
            this._running = false; clearInterval(this._interval);
            await sleep(500); finish(moves, elapsed, false);
          }
        } else {
          await sleep(700); a.classList.remove('memory-card--flipped'); b.classList.remove('memory-card--flipped');
          Audio.wrong(); combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
          flipped = []; locked = false;
        }
      }
    }
    board.querySelectorAll('.memory-card').forEach(c => {
      c.removeEventListener('click', () => {});
      c.addEventListener('click', (e) => onFlip.call(this, e.currentTarget));
    });

    function finish (totalMoves, secs, timedOut) {
      let stars = timedOut ? 0 : (totalMoves <= pairs + 2 ? 3 : totalMoves <= pairs + 5 ? 2 : 1);
      const coins = timedOut ? 0 : 6 + stars * 7;
      const xp    = timedOut ? 2 : 10 + stars * 10;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: Math.max(0, 1000 - totalMoves * 10), xp, coins, level });

      const progress = Storage.getProfile(profile.id)?.gameProgress[gameDef.id] || {};
      const canNext  = level < 4 && isLevelUnlocked(level + 1, progress) || stars >= 1;

      ResultModal({
        stars, coins, xp,
        title:   timedOut ? 'Tempo esgotado!' : stars === 3 ? 'Memória Perfeita!' : stars === 2 ? 'Muito bem!' : 'Continue praticando!',
        message: timedOut ? 'Você quase conseguiu!' : `${matched} de ${pairs} pares encontrados.`,
        nextLevel: canNext && level < 4 ? level + 1 : null,
        gameId:  gameDef.id,
        level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }
    return wrap;
  },
  unmount () { this._running = false; clearInterval(this._interval); },
};

function _ph () {
  return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } });
}
