/* =========================================================================
   LIZKIDS — CORES E FORMAS (4 níveis)
   Nível 4: 5 opções + distratores mais difíceis.
   ========================================================================= */
import { el, pick, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const COLORS = [
  { id: 'blue',   name: 'Azul',    css: '#4F7CFF' },
  { id: 'yellow', name: 'Amarelo', css: '#FFD23F' },
  { id: 'pink',   name: 'Rosa',    css: '#FF7BB5' },
  { id: 'green',  name: 'Verde',   css: '#5BE0A3' },
  { id: 'lilac',  name: 'Lilás',   css: '#B57BFF' },
  { id: 'orange', name: 'Laranja', css: '#FF8A65' },
];
const SHAPES = [
  { id: 'circle',   name: 'Círculo',
    svg: c => `<svg viewBox="0 0 100 100"><defs><radialGradient id="g${c.replace('#','')}" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="white" stop-opacity=".6"/><stop offset="100%" stop-color="${c}"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill="url(#g${c.replace('#','')})" stroke="rgba(0,0,0,.12)" stroke-width="2"/><ellipse cx="38" cy="36" rx="13" ry="8" fill="rgba(255,255,255,.4)"/></svg>` },
  { id: 'square',   name: 'Quadrado',
    svg: c => `<svg viewBox="0 0 100 100"><defs><linearGradient id="s${c.replace('#','')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="white" stop-opacity=".55"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs><rect x="10" y="10" width="80" height="80" rx="14" fill="url(#s${c.replace('#','')})" stroke="rgba(0,0,0,.12)" stroke-width="2"/><rect x="18" y="18" width="36" height="13" rx="5" fill="rgba(255,255,255,.4)"/></svg>` },
  { id: 'triangle', name: 'Triângulo',
    svg: c => `<svg viewBox="0 0 100 100"><defs><linearGradient id="t${c.replace('#','')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity=".5"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs><path d="M50 8 L92 86 L8 86 Z" fill="url(#t${c.replace('#','')})" stroke="rgba(0,0,0,.12)" stroke-width="2" stroke-linejoin="round"/><path d="M50 20 L72 60 L28 60 Z" fill="rgba(255,255,255,.28)"/></svg>` },
  { id: 'star',     name: 'Estrela',
    svg: c => `<svg viewBox="0 0 100 100"><defs><radialGradient id="st${c.replace('#','')}" cx="40%" cy="30%" r="80%"><stop offset="0%" stop-color="white" stop-opacity=".55"/><stop offset="100%" stop-color="${c}"/></radialGradient></defs><path d="M50 8 L62 36 L92 40 L68 62 L76 92 L50 78 L24 92 L32 62 L8 40 L38 36 Z" fill="url(#st${c.replace('#','')})" stroke="rgba(0,0,0,.12)" stroke-width="2"/></svg>` },
  { id: 'heart',    name: 'Coração',
    svg: c => `<svg viewBox="0 0 100 100"><defs><radialGradient id="h${c.replace('#','')}" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="white" stop-opacity=".5"/><stop offset="100%" stop-color="${c}"/></radialGradient></defs><path d="M50 84 C16 60 10 34 28 24 C40 18 50 28 50 36 C50 28 60 18 72 24 C90 34 84 60 50 84 Z" fill="url(#h${c.replace('#','')})" stroke="rgba(0,0,0,.12)" stroke-width="2"/></svg>` },
];

const CFG = [
  { rounds: 6, optCount: 3, askMode: 'color', },
  { rounds: 6, optCount: 3, askMode: 'shape', },
  { rounds: 7, optCount: 4, askMode: 'mixed', },
  { rounds: 7, optCount: 5, askMode: 'mixed', },
];

export const ShapesGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return _ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg   = CFG[level - 1];
    let round = 0, correct = 0, locked = false;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt  = el('span', {}, ['1/' + cfg.rounds]);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: cfg.rounds }, () => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', justifyContent: 'center' } });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [gameDef.title + ' — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [roundTxt, comboPill]),
    ]));

    const stage = el('div', { class: 'liz-game__stage' });
    stage.appendChild(dotsRow);
    wrap.appendChild(stage);

    function nextRound () {
      stage.querySelectorAll('.shp-content').forEach(e => e.remove());
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round + '/' + cfg.rounds;

      /* Determinar modo de pergunta */
      let askByColor;
      if (cfg.askMode === 'color')  askByColor = true;
      else if (cfg.askMode === 'shape') askByColor = false;
      else askByColor = Math.random() < 0.5;

      const targetColor = pick(COLORS);
      const targetShape = pick(SHAPES);
      const qText = askByColor
        ? `Toque na figura ${targetColor.name.toUpperCase()}`
        : `Toque no ${targetShape.name.toUpperCase()}`;

      const options = buildOptions(askByColor, targetColor, targetShape, cfg.optCount);

      const content = el('div', { class: 'shp-content', style: { width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' } });
      const qBox = el('div', { style: { background: 'rgba(255,255,255,.97)', borderRadius: 'var(--r-xl)', padding: '28px', textAlign: 'center', boxShadow: 'var(--sh-lg)', width: '100%' } });
      qBox.appendChild(el('h2', { style: { fontFamily: 'Fredoka,sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: 'var(--ink)', marginBottom: '20px' } }, [qText]));

      const optsRow = el('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' } });
      options.forEach(opt => {
        const isCorrect = askByColor ? opt.color.id === targetColor.id : opt.shape.id === targetShape.id;
        const size = Math.max(80, Math.floor(360 / cfg.optCount));
        const btn = el('button', {
          style: { width: size+'px', height: size+'px', borderRadius: '20px', background: 'var(--cream)', cursor: 'pointer', padding: '8px', transition: 'transform 180ms var(--ease-pop)', border: '3px solid transparent', boxShadow: 'var(--sh-soft)' },
          html: opt.shape.svg(opt.color.css),
          data: { correct: isCorrect ? '1' : '0' },
        });
        btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-5px) scale(1.06)');
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
        btn.addEventListener('click', () => onAnswer(isCorrect, btn, optsRow));
        optsRow.appendChild(btn);
      });
      qBox.appendChild(optsRow);
      content.appendChild(qBox);
      stage.appendChild(content);
    }

    async function onAnswer (isRight, btn, container) {
      if (locked) return; locked = true;
      container.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
      if (isRight) {
        btn.style.border = '3px solid var(--liz-green)';
        btn.style.boxShadow = '0 0 0 5px rgba(91,224,163,.4)';
        btn.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.34,1.56,.64,1)'});
        Audio.correct(); showFloatingMessage(pickMsg(MOTIVATION.correct), 'good'); correct++;
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--correct');
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
      } else {
        btn.style.border = '3px solid #FF8A65';
        btn.animate([{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}],{duration:380});
        Audio.wrong();
        container.querySelectorAll('button').forEach(b => { if (b.dataset.correct === '1') { b.style.border = '3px solid var(--liz-green)'; b.style.boxShadow = '0 0 0 5px rgba(91,224,163,.35)'; } });
        if (dots[round - 1]) dots[round - 1].classList.replace('liz-round-dot--current','liz-round-dot--wrong');
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
      }
      await sleep(950); locked = false;
      if (round >= cfg.rounds) finish(); else nextRound();
    }

    function finish () {
      let stars = correct >= cfg.rounds ? 3 : correct >= cfg.rounds - 2 ? 2 : 1;
      const xp = 10 + correct * 4, coins = 5 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp, title: stars === 3 ? 'Artista das Cores!' : 'Muito bem!',
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

function buildOptions (askByColor, targetColor, targetShape, count) {
  const opts = [{ color: targetColor, shape: targetShape }];
  const seen = new Set([targetColor.id + '-' + targetShape.id]);
  let t = 0;
  while (opts.length < count && t++ < 80) {
    const c = pick(COLORS), s = pick(SHAPES);
    const wouldBeRight = askByColor ? c.id === targetColor.id : s.id === targetShape.id;
    const k = c.id + '-' + s.id;
    if (!wouldBeRight && !seen.has(k)) { seen.add(k); opts.push({ color: c, shape: s }); }
  }
  while (opts.length < count) opts.push({ color: pick(COLORS), shape: pick(SHAPES) });
  return shuffle(opts);
}
function _ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
