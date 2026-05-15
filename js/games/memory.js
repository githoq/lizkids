/* =========================================================================
   LIZKIDS — JOGO DA MEMÓRIA (Pares Mágicos)
   ========================================================================= */

import { el, shuffle, sleep, formatTime } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage } from '../components/ui.js';
import { ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

const SYMBOLS_POOL = ['lumi','bobo','pip','mel','drako','owly','zap','robo'];

export const MemoryGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return el('div', { style: { position:'absolute', inset:'0', background:'var(--bg-deep-1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontFamily:'Fredoka,sans-serif' } }, ['Redirecionando…']);
    }

    // Nível baseado no progresso anterior
    const progress = profile.gameProgress[gameDef.id] || {};
    const playerLevel = Math.min(3, (progress.level || 1));
    const pairs = playerLevel === 1 ? 4 : playerLevel === 2 ? 6 : 8;
    const cols = pairs === 4 ? 4 : pairs === 6 ? 4 : 4;

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    // Topbar
    let moves = 0, matched = 0, startTime = Date.now(), flipped = [];
    const movesPill = el('div', { class: 'liz-pill' }, [
      el('span', { html: ICONS.flame() }), el('span', {}, ['0 jogadas']),
    ]);
    const timePill = el('div', { class: 'liz-pill' }, [
      el('span', { html: ICONS.clock() }), el('span', {}, ['0:00']),
    ]);

    const topbar = el('div', { class: 'liz-game__topbar' }, [
      el('button', {
        class: 'liz-back',
        onClick: () => { Audio.click(); Router.navigate('library'); },
      }, [el('span', { html: ICONS.back() }), 'Sair']),
      el('div', { class: 'liz-game__title' }, [gameDef.title]),
      el('div', { class: 'liz-game__hud' }, [movesPill, timePill]),
    ]);
    wrap.appendChild(topbar);

    const timer = setInterval(() => {
      timePill.children[1].textContent = formatTime((Date.now() - startTime) / 1000);
    }, 500);
    this._timer = timer;

    const stage = el('div', { class: 'liz-game__stage' });

    // Tabuleiro
    const symbols = SYMBOLS_POOL.slice(0, pairs);
    const deck = shuffle([...symbols, ...symbols]);
    const board = el('div', {
      class: 'memory-board',
      style: { gridTemplateColumns: `repeat(${cols}, 1fr)` },
    });

    deck.forEach((sym, idx) => {
      const card = el('div', { class: 'memory-card', data: { sym, idx: idx } }, [
        el('div', { class: 'memory-card__face memory-card__face--back', html: `<div style="color:#fff;width:50%;height:50%;display:flex;align-items:center;justify-content:center;">${ICONS.star()}</div>` }),
        el('div', { class: 'memory-card__face memory-card__face--front', html: CHARACTERS[sym]() }),
      ]);
      card.addEventListener('click', () => onCardClick(card));
      board.appendChild(card);
    });

    stage.appendChild(board);
    wrap.appendChild(stage);

    async function onCardClick (card) {
      if (card.classList.contains('memory-card--flipped') || card.classList.contains('memory-card--matched')) return;
      if (flipped.length >= 2) return;

      Audio.pop();
      card.classList.add('memory-card--flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        moves++;
        movesPill.children[1].textContent = moves + (moves === 1 ? ' jogada' : ' jogadas');

        const [a, b] = flipped;
        if (a.dataset.sym === b.dataset.sym) {
          await sleep(420);
          a.classList.add('memory-card--matched');
          b.classList.add('memory-card--matched');
          Audio.correct();
          flipped = [];
          matched++;

          if (matched === pairs) {
            clearInterval(timer);
            const timeSec = (Date.now() - startTime) / 1000;
            await sleep(700);
            finish(moves, timeSec);
          }
        } else {
          await sleep(800);
          a.classList.remove('memory-card--flipped');
          b.classList.remove('memory-card--flipped');
          Audio.wrong();
          flipped = [];
        }
      }
    }

    function finish (moves, timeSec) {
      // Cálculo de estrelas: depende de moves vs pares
      let stars = 1;
      const perfect = pairs;
      if (moves <= perfect + 2) stars = 3;
      else if (moves <= perfect + 5) stars = 2;

      const score = Math.max(100, 1000 - moves * 20 - Math.floor(timeSec) * 5);
      const coins = 10 + stars * 5;
      const xp    = 15 + stars * 10;

      Storage.saveGameRound(profile.id, gameDef.id, {
        stars, score, xp, coins,
        timeMs: timeSec * 1000,
        level: Math.min(3, playerLevel + (stars === 3 ? 1 : 0)),
      });

      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Memória de Ouro!' : 'Muito bem!',
        message: stars === 3 ? 'Você foi incrível!' : 'Continue praticando!',
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id }),
        onExit:      () => Router.navigate('library'),
      });
    }

    return wrap;
  },
  unmount () { clearInterval(this._timer); },
};
