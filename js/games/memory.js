/* =========================================================================
   LIZKIDS — MEMÓRIA ENCANTADA
   CORREÇÃO CRÍTICA: flip via JS scaleX (não CSS rotateY).
   CSS rotateY quebrava porque .liz-screen tinha will-change:transform.
   Agora: scaleX 1→0 (troca conteúdo) →1. 100% confiável.
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
  { pairs:4,  cols:4, timeLimit:null },
  { pairs:6,  cols:4, timeLimit:90   },
  { pairs:8,  cols:4, timeLimit:70   },
  { pairs:10, cols:5, timeLimit:55   },
];

/* SVG da face oculta */
const BACK_HTML = `<svg viewBox="0 0 60 60" style="width:55%;height:55%;opacity:.7"><path d="M30 4 L37 22 L56 24 L42 37 L46 56 L30 46 L14 56 L18 37 L4 24 L23 22 Z" fill="white"/></svg>`;

export const MemoryMagicGame = {
  _cleanup: null,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(()=>Router.navigate('profile-select'),0); return ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level||1));
    const cfg   = CFG[level-1];
    const { pairs, cols, timeLimit } = cfg;

    /* ── Estado via closure ── */
    let active   = true;
    let flipped  = [];     // cartas atualmente viradas (máx 2)
    let locked   = false;  // bloqueia novos cliques durante animação/comparação
    let matched  = 0;
    let moves    = 0;
    let elapsed  = 0;
    let remaining = timeLimit;
    let ivId     = null;
    const combo  = new ComboSystem();

    this._cleanup = () => {
      active = false;
      if (ivId) { clearInterval(ivId); ivId = null; }
    };

    /* ── DOM ── */
    const wrap = el('div', { class:'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const movesTxt = el('span', {}, ['0']);
    const timeTxt  = el('span', {}, [timeLimit ? timeLimit+'s' : '0:00']);
    const comboPill= el('div', { class:'liz-combo-pill' }, [el('span',{html:ICONS.flame()}),'×1']);

    /* Dots de pares */
    const dotsRow = el('div', { class:'liz-round-dots', style:{flexWrap:'wrap',justifyContent:'center',maxWidth:'420px'} });
    const dots    = Array.from({length:pairs}, () => {
      const d = el('div',{class:'liz-round-dot'}); dotsRow.appendChild(d); return d;
    });

    wrap.appendChild(el('div', { class:'liz-game__topbar' }, [
      el('button', { class:'liz-back', onClick:()=>{ Audio.click(); Router.navigate('game',{gameId:gameDef.id}); } },
        [el('span',{html:ICONS.back()}),'Níveis']),
      el('div', { class:'liz-game__title' }, [`Memória — Nv ${level}`]),
      el('div', { class:'liz-game__hud' }, [
        el('div',{class:'liz-pill'},[el('span',{html:ICONS.flame()}),movesTxt]),
        el('div',{class:'liz-pill'},[el('span',{html:ICONS.clock()}),timeTxt]),
        comboPill,
      ]),
    ]));

    /* Timer */
    ivId = setInterval(() => {
      if (!active) return;
      elapsed++;
      if (timeLimit) {
        remaining--;
        timeTxt.textContent = remaining+'s';
        if (remaining <= 5) timeTxt.style.color='#FF4040';
        if (remaining <= 0) {
          if (ivId) { clearInterval(ivId); ivId = null; }
          finish(true);
        }
      } else {
        timeTxt.textContent = formatTime(elapsed);
      }
    }, 1000);

    /* ── Tabuleiro ── */
    const symbols = POOL.slice(0, pairs);
    const deck    = shuffle([...symbols, ...symbols]);
    const board   = el('div', { class:'memory-board', style:{gridTemplateColumns:`repeat(${cols},1fr)`} });

    deck.forEach((sym, idx) => {
      const card = makeCard(sym, idx);
      board.appendChild(card);
    });

    const stage = el('div', { class:'liz-game__stage', style:{gap:'8px'} });
    stage.appendChild(dotsRow);
    stage.appendChild(board);
    wrap.appendChild(stage);

    /* ── Criar card com face oculta ── */
    function makeCard (sym, idx) {
      const card = el('div', {
        style:{
          aspectRatio:'1', borderRadius:'var(--r-lg)', cursor:'pointer',
          boxShadow:'0 6px 18px rgba(46,34,87,.22)',
          animationDelay:(idx*28)+'ms',
          animation:`lizPopIn .3s var(--ease-pop) ${idx*28}ms both`,
        },
        data:{ sym, state:'hidden' },
      });

      /* Face interna que faz o flip */
      const face = el('div', {
        style:{
          width:'100%', height:'100%', borderRadius:'var(--r-lg)',
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#5B8FFF,#9B5EFF)',
          transition:'transform 150ms ease-in-out',
          overflow:'hidden',
        },
        html: BACK_HTML,
      });
      card.appendChild(face);

      card.addEventListener('click', () => onCardClick(card, face));
      return card;
    }

    /* ── Flip JS: scaleX 1→0→1 (swap conteúdo no meio) ── */
    async function flipReveal (card, face) {
      /* Fase 1: encolher */
      face.style.transition = 'transform 140ms ease-in';
      face.style.transform  = 'scaleX(0)';
      await sleep(145);
      if (!active) return;

      /* Trocar conteúdo → mostrar personagem */
      const sym = card.dataset.sym;
      face.style.background = 'linear-gradient(135deg,#fff,#FFF6E0)';
      face.innerHTML = `<div style="width:88%;height:88%;display:flex;align-items:center;justify-content:center;">${CHARACTERS[sym]()}</div>`;

      /* Fase 2: expandir */
      face.style.transition = 'transform 140ms ease-out';
      face.style.transform  = 'scaleX(1)';
      await sleep(145);
    }

    async function flipHide (card, face) {
      face.style.transition = 'transform 140ms ease-in';
      face.style.transform  = 'scaleX(0)';
      await sleep(145);
      if (!active) return;

      face.style.background = 'linear-gradient(135deg,#5B8FFF,#9B5EFF)';
      face.innerHTML = BACK_HTML;

      face.style.transition = 'transform 140ms ease-out';
      face.style.transform  = 'scaleX(1)';
      await sleep(145);
    }

    /* ── Lógica de clique ── */
    async function onCardClick (card, face) {
      if (!active || locked) return;
      if (card.dataset.state !== 'hidden') return;
      if (flipped.length >= 2) return;

      /* Marcar como sendo revelado */
      card.dataset.state = 'revealing';
      Audio.pop();
      await flipReveal(card, face);
      if (!active) return;
      card.dataset.state = 'revealed';
      flipped.push({ card, face });

      if (flipped.length === 2) {
        locked = true;
        moves++;
        movesTxt.textContent = moves;

        const [a, b] = flipped;

        if (a.card.dataset.sym === b.card.dataset.sym) {
          /* ✓ PAR ENCONTRADO */
          await sleep(300);
          if (!active) return;

          /* Glow dourado */
          [a, b].forEach(({ card: c }) => {
            c.style.boxShadow = '0 0 0 4px rgba(255,210,63,.8), 0 0 18px rgba(255,210,63,.5)';
          });

          Audio.correct();
          Audio.star();
          combo.hit(n => {
            comboPill.lastChild.textContent = '×'+n;
            comboPill.classList.add('liz-combo-pill--active');
            setTimeout(()=>comboPill.classList.remove('liz-combo-pill--active'), 700);
          });
          showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');

          if (dots[matched]) dots[matched].classList.add('liz-round-dot--correct');
          matched++;
          flipped = [];
          locked  = false;

          if (matched === pairs) {
            if (ivId) { clearInterval(ivId); ivId = null; }
            await sleep(500);
            if (active) finish(false);
          }
        } else {
          /* ✗ NÃO É PAR */
          await sleep(700);
          if (!active) return;

          Audio.wrong();
          combo.miss(() => { comboPill.lastChild.textContent = '×1'; });

          await Promise.all([flipHide(a.card, a.face), flipHide(b.card, b.face)]);
          if (!active) return;
          a.card.dataset.state = 'hidden';
          b.card.dataset.state = 'hidden';
          flipped = [];
          locked  = false;
        }
      }
    }

    /* ── Fim de jogo ── */
    function finish (timedOut) {
      if (!active) return;
      active = false;
      const stars = timedOut ? 0 : (moves <= pairs+2 ? 3 : moves <= pairs+5 ? 2 : 1);
      const coins = timedOut ? 0 : 6+stars*7;
      const xp    = timedOut ? 2 : 12+stars*10;
      Storage.saveGameRound(profile.id, gameDef.id, {stars, score:Math.max(0,1000-moves*10), xp, coins, level});
      if (!timedOut && stars>=2) Particles.confetti(40);
      ResultModal({
        stars, coins, xp,
        title:  timedOut?'Tempo esgotado!':(stars===3?'Memória Perfeita!':'Muito bem!'),
        message:timedOut?'Tente mais rápido!':`${matched} pares em ${moves} jogadas.`,
        nextLevel: level<4 ? level+1 : null, gameId:gameDef.id, level,
        onPlayAgain:()=>Router.navigate('game',{gameId:gameDef.id,level}),
        onExit:()=>Router.navigate('game',{gameId:gameDef.id}),
      });
    }

    return wrap;
  },

  unmount () {
    this._cleanup?.();
    this._cleanup = null;
  },
};

function ph () { return el('div',{style:{position:'absolute',inset:'0',background:'var(--bg-deep-1)'}}); }
