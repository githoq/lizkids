/* =========================================================================
   LIZKIDS — MEMÓRIA ENCANTADA  (versão premium)
   ========================================================================= */
import { el, shuffle, sleep, formatTime } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';
import { Particles } from '../core/particles.js';

const POOL = ['lumi','bobo','pip','mel','drako','owly','zap','robo'];
const CFG  = [
  { pairs: 4,  cols: 4, timeLimit: null },
  { pairs: 6,  cols: 4, timeLimit: 90 },
  { pairs: 8,  cols: 4, timeLimit: 70 },
  { pairs: 10, cols: 5, timeLimit: 55 },
];

export const MemoryMagicGame = {
  _iv: null, _running: false,
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg   = CFG[level - 1];
    const { pairs, cols, timeLimit } = cfg;
    this._running = true;

    let moves = 0, matched = 0, flipped = [], locked = false, elapsed = 0;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* Mascote pequeno no canto (reage) */
    const mascotEl = el('div', {
      style: { position: 'fixed', bottom: '20px', right: '16px', width: '80px', height: '80px', zIndex: 50, animation: 'lizFloat 3.5s ease-in-out infinite', pointerEvents: 'none', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,.25))' },
      html: (CHARACTERS[profile.avatarId] || CHARACTERS.lumi)(),
    });

    const movesTxt = el('span', {}, ['0']);
    const timeTxt  = el('span', {}, [timeLimit ? `${timeLimit}s` : '0:00']);
    const comboPill= el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);

    /* Dots de progresso */
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' } });
    const dots    = Array.from({ length: pairs }, (_, i) => {
      const d = el('div', { class: 'liz-round-dot' }); dotsRow.appendChild(d); return d;
    });

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); clearInterval(this._iv); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [`Memória Nv ${level}`]),
      el('div', { class: 'liz-game__hud' }, [
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.flame() }), movesTxt]),
        el('div', { class: 'liz-pill' }, [el('span', { html: ICONS.clock()  }), timeTxt ]),
        comboPill,
      ]),
    ]));

    /* Timer */
    let remaining = timeLimit;
    this._iv = setInterval(() => {
      if (!this._running) return;
      elapsed++;
      if (timeLimit) {
        remaining--;
        timeTxt.textContent = remaining + 's';
        if (remaining <= 5) timeTxt.style.color = '#FF4040';
        if (remaining <= 0) { this._running = false; clearInterval(this._iv); finish(true); }
      } else {
        timeTxt.textContent = formatTime(elapsed);
      }
    }, 1000);

    /* Tabuleiro */
    const symbols = POOL.slice(0, pairs);
    const deck    = shuffle([...symbols, ...symbols]);
    const board   = el('div', { class: 'memory-board', style: { gridTemplateColumns: `repeat(${cols},1fr)` } });

    deck.forEach((sym, idx) => {
      const card = el('div', { class: 'memory-card' }, [
        el('div', { class: 'memory-card__face memory-card__face--back', html: `<div style="color:rgba(255,255,255,.7);width:40%;height:40%;">${ICONS.star()}</div>` }),
        el('div', { class: 'memory-card__face memory-card__face--front', html: CHARACTERS[sym]() }),
      ]);
      card.dataset.sym = sym;
      card.style.animationDelay = (idx * 28) + 'ms';
      card.style.animation = `lizPopIn .3s var(--ease-pop) ${idx*28}ms both`;
      card.addEventListener('click', () => onFlip.call(this, card));
      board.appendChild(card);
    });

    const stage = el('div', { class: 'liz-game__stage', style: { gap: '8px' } });
    stage.appendChild(dotsRow);
    stage.appendChild(board);
    wrap.appendChild(stage);
    wrap.appendChild(mascotEl);

    async function onFlip (card) {
      if (!this._running || locked) return;
      if (card.classList.contains('memory-card--flipped') || card.classList.contains('memory-card--matched')) return;
      if (flipped.length >= 2) return;

      Audio.pop();
      card.classList.add('memory-card--flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        locked = true;
        moves++;
        movesTxt.textContent = moves;

        const [a, b] = flipped;
        if (a.dataset.sym === b.dataset.sym) {
          /* PAR! */
          await sleep(350);
          a.classList.add('memory-card--matched');
          b.classList.add('memory-card--matched');

          /* Brilho mágico */
          [a, b].forEach(c => c.style.boxShadow = '0 0 0 4px rgba(255,210,63,.8), 0 0 24px rgba(255,210,63,.5)');
          setTimeout(() => [a, b].forEach(c => c.style.boxShadow = ''), 1200);

          Audio.correct(); Audio.star();
          combo.hit(n => { comboPill.lastChild.textContent = '×' + n; comboPill.classList.add('liz-combo-pill--active'); setTimeout(() => comboPill.classList.remove('liz-combo-pill--active'), 700); });
          showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');

          /* Mascote pula */
          mascotEl.style.animation = 'lizHop .8s var(--ease-pop)';
          setTimeout(() => { mascotEl.style.animation = 'lizFloat 3.5s ease-in-out infinite'; }, 900);

          /* Dot */
          if (dots[matched]) dots[matched].classList.add('liz-round-dot--correct');
          matched++;
          flipped = [];
          locked  = false;

          if (matched === pairs) {
            this._running = false;
            clearInterval(this._iv);
            await sleep(500);
            finish(false);
          }
        } else {
          await sleep(750);
          a.classList.remove('memory-card--flipped');
          b.classList.remove('memory-card--flipped');
          Audio.wrong();
          combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
          flipped = [];
          locked  = false;
        }
      }
    }

    function finish (timedOut) {
      mascotEl.remove();
      let stars = timedOut ? 0 : (moves <= pairs + 2 ? 3 : moves <= pairs + 5 ? 2 : 1);
      const coins = timedOut ? 0 : 6 + stars * 7;
      const xp    = timedOut ? 2 : 12 + stars * 10;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: Math.max(0, 1000 - moves * 10), xp, coins, level });
      if (!timedOut && stars >= 2) Particles.confetti(40);
      ResultModal({
        stars, coins, xp,
        title:   timedOut ? 'Tempo esgotado!' : stars === 3 ? 'Memória Perfeita!' : 'Muito bem!',
        message: timedOut ? 'Tente mais rápido!' : `${matched} pares em ${moves} jogadas.`,
        nextLevel: level < 4 ? level + 1 : null, gameId: gameDef.id, level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }

    return wrap;
  },
  unmount () { this._running = false; clearInterval(this._iv); },
};

function ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
