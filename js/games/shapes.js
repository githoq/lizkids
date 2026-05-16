/* =========================================================================
   LIZKIDS — CORES E FORMAS (tap-to-place)
   Toca um objeto → fica selecionado → toca a caixinha certa → voa!
   ========================================================================= */
import { el, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';
import { Particles } from '../core/particles.js';

/* ── Paleta de cores e formas ─────────────────────────────────────────── */
const COLOR_DEF = [
  { id: 'vermelho', label: 'Vermelho', css: '#FF4040', light: '#FFB8B8' },
  { id: 'azul',     label: 'Azul',     css: '#4F7CFF', light: '#B8CDFF' },
  { id: 'amarelo',  label: 'Amarelo',  css: '#FFD23F', light: '#FFF0A8' },
  { id: 'verde',    label: 'Verde',    css: '#5BE0A3', light: '#B8F4D9' },
  { id: 'rosa',     label: 'Rosa',     css: '#FF7BB5', light: '#FFD0E8' },
  { id: 'roxo',     label: 'Roxo',     css: '#B57BFF', light: '#E0C8FF' },
];
const SHAPE_DEF = [
  { id: 'circulo',   label: 'Círculo',   draw: (c,s) => `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="${c}" stroke="${s}" stroke-width="3"/><ellipse cx="22" cy="22" rx="8" ry="5" fill="rgba(255,255,255,.4)"/></svg>` },
  { id: 'quadrado',  label: 'Quadrado',  draw: (c,s) => `<svg viewBox="0 0 60 60"><rect x="6" y="6" width="48" height="48" rx="10" fill="${c}" stroke="${s}" stroke-width="3"/><rect x="12" y="12" width="22" height="10" rx="4" fill="rgba(255,255,255,.35)"/></svg>` },
  { id: 'triangulo', label: 'Triângulo', draw: (c,s) => `<svg viewBox="0 0 60 60"><path d="M30 5 L56 54 L4 54 Z" fill="${c}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/><path d="M30 14 L48 44 L12 44 Z" fill="rgba(255,255,255,.25)"/></svg>` },
  { id: 'estrela',   label: 'Estrela',   draw: (c,s) => `<svg viewBox="0 0 60 60"><path d="M30 4 L37 22 L56 24 L42 37 L46 56 L30 46 L14 56 L18 37 L4 24 L23 22 Z" fill="${c}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/></svg>` },
];

/* ── Configuração por nível ─────────────────────────────────────────── */
const CFG = [
  { mode: 'color',  rounds: 6, objCount: 6, binCount: 3 },  // 3 cores, 6 objetos
  { mode: 'shape',  rounds: 6, objCount: 6, binCount: 3 },  // 3 formas
  { mode: 'both',   rounds: 7, objCount: 8, binCount: 4 },  // cores E formas
  { mode: 'both',   rounds: 8, objCount: 8, binCount: 4 },  // tudo misturado
];

export const ShapesSortGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level || 1));
    const cfg   = CFG[level - 1];
    let round = 0, correct = 0, locked = false;
    const combo = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt  = el('span', {}, [`1/${cfg.rounds}`]);
    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);
    const dots = Array.from({ length: cfg.rounds }, () => el('div', { class: 'liz-round-dot' }));
    const dotsRow = el('div', { class: 'liz-round-dots', style: { flexWrap: 'wrap', justifyContent: 'center' } });
    dots.forEach(d => dotsRow.appendChild(d));

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [`Cores e Formas — Nv ${level}`]),
      el('div', { class: 'liz-game__hud' }, [roundTxt, comboPill]),
    ]));

    const stage = el('div', { class: 'liz-game__stage', style: { gap: '10px', justifyContent: 'flex-start', paddingTop: '8px' } });
    stage.appendChild(dotsRow);
    wrap.appendChild(stage);

    /* Tutorial hint nível 1 */
    if (level === 1) {
      const hint = el('div', {
        style: { background: 'rgba(255,255,255,.92)', padding: '8px 18px', borderRadius: 'var(--r-pill)', fontWeight: 800, fontSize: 'var(--fs-sm)', color: 'var(--ink)', boxShadow: 'var(--sh-soft)', animation: 'lizPulse 2s ease-in-out 3', textAlign: 'center' },
      }, ['Toque o objeto → depois toque na caixinha certa!']);
      stage.appendChild(hint);
      setTimeout(() => hint.remove(), 4000);
    }

    function nextRound () {
      /* Limpar conteúdo anterior (exceto dots e hint) */
      stage.querySelectorAll('.sort-content').forEach(e => e.remove());
      round++;
      if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--current');
      roundTxt.textContent = `${round}/${cfg.rounds}`;

      /* Selecionar cores/formas para esta rodada */
      const usedColors  = shuffle([...COLOR_DEF]).slice(0, cfg.binCount);
      const usedShapes  = shuffle([...SHAPE_DEF]).slice(0, cfg.mode === 'shape' ? cfg.binCount : 2);

      /* Gerar objetos */
      const objects = [];
      if (cfg.mode === 'color') {
        usedColors.forEach(col => {
          const shape = shuffle([...SHAPE_DEF])[0];
          for (let i = 0; i < Math.ceil(cfg.objCount / cfg.binCount); i++) {
            objects.push({ colorDef: col, shapeDef: shape, binKey: col.id });
          }
        });
      } else if (cfg.mode === 'shape') {
        const fixColor = usedColors[0];
        usedShapes.forEach(shp => {
          for (let i = 0; i < Math.ceil(cfg.objCount / cfg.binCount); i++) {
            objects.push({ colorDef: fixColor, shapeDef: shp, binKey: shp.id });
          }
        });
      } else {
        usedColors.forEach((col, ci) => {
          const shp = usedShapes[ci % usedShapes.length];
          for (let i = 0; i < Math.ceil(cfg.objCount / cfg.binCount); i++) {
            objects.push({ colorDef: col, shapeDef: shp, binKey: col.id + '-' + shp.id });
          }
        });
      }
      const objs = shuffle(objects).slice(0, cfg.objCount);

      /* Caixinhas (bins) */
      const bins = cfg.mode === 'color'
        ? usedColors.map(col => ({ key: col.id, label: col.label, bg: col.light, border: col.css }))
        : cfg.mode === 'shape'
        ? usedShapes.map(shp => ({ key: shp.id, label: shp.label, bg: '#F4F1FF', border: '#B57BFF' }))
        : usedColors.map((col, ci) => {
          const shp = usedShapes[ci % usedShapes.length];
          return { key: col.id + '-' + shp.id, label: col.label, sub: shp.label, bg: col.light, border: col.css };
        });

      /* ── Construir UI ── */
      const content = el('div', { class: 'sort-content', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '760px' } });

      /* Pergunta */
      const qLabel = cfg.mode === 'color' ? 'Separe por COR' : cfg.mode === 'shape' ? 'Separe por FORMA' : 'Separe por COR e FORMA';
      content.appendChild(el('div', { class: 't-eyebrow', style: { color: '#fff', fontSize: 'var(--fs-md)' } }, [qLabel]));

      /* Área de objetos */
      const objArea = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '12px', background: 'rgba(255,255,255,.12)', borderRadius: 'var(--r-xl)' } });
      let selectedObj = null;

      const objEls = objs.map((obj, i) => {
        const objEl = el('div', {
          style: {
            width: 'clamp(56px,12vw,76px)', height: 'clamp(56px,12vw,76px)',
            background: 'rgba(255,255,255,.9)', borderRadius: '18px', padding: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '3px solid transparent',
            transition: 'transform 180ms var(--ease-pop), border-color 180ms, box-shadow 180ms',
            boxShadow: 'var(--sh-soft)',
            animationDelay: i * 40 + 'ms', animation: `lizPopIn .3s var(--ease-pop) ${i * 40}ms both`,
          },
          html: obj.shapeDef.draw(obj.colorDef.css, obj.colorDef.css.replace('FF','AA') + '88' || 'rgba(0,0,0,.15)'),
          data: { bin: obj.binKey },
        });

        objEl.addEventListener('mouseenter', () => { if (!objEl.dataset.done) objEl.style.transform = 'translateY(-4px) scale(1.06)'; });
        objEl.addEventListener('mouseleave', () => { if (objEl !== selectedObj) objEl.style.transform = ''; });
        objEl.addEventListener('click', () => {
          if (objEl.dataset.done) return;
          if (selectedObj) {
            selectedObj.style.border = '3px solid transparent';
            selectedObj.style.boxShadow = 'var(--sh-soft)';
          }
          selectedObj = objEl;
          objEl.style.border = '3px solid #FFD23F';
          objEl.style.boxShadow = '0 0 0 4px rgba(255,210,63,.4)';
          Audio.click();
        });

        objArea.appendChild(objEl);
        return objEl;
      });
      content.appendChild(objArea);

      /* Área de bins */
      const binsArea = el('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' } });
      let placed = 0;

      bins.forEach(bin => {
        const binEl = el('div', {
          style: {
            minWidth: 'clamp(70px,18vw,110px)', minHeight: 'clamp(60px,14vw,90px)',
            background: bin.bg, border: `3px dashed ${bin.border}`,
            borderRadius: 'var(--r-lg)', padding: '8px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: '4px', fontFamily: 'Fredoka,sans-serif', fontWeight: 700,
            fontSize: 'var(--fs-sm)', color: 'var(--ink)',
            transition: 'transform 180ms var(--ease-pop), box-shadow 180ms',
            boxShadow: 'var(--sh-soft)',
          },
          data: { bin: bin.key },
        });
        binEl.appendChild(el('div', {}, [bin.label]));
        if (bin.sub) binEl.appendChild(el('div', { style: { fontSize: '11px', opacity: '.7' } }, [bin.sub]));

        binEl.addEventListener('mouseenter', () => binEl.style.transform = 'translateY(-3px)');
        binEl.addEventListener('mouseleave', () => binEl.style.transform = '');

        binEl.addEventListener('click', async () => {
          if (!selectedObj || locked) return;

          const objBin  = selectedObj.dataset.bin;
          const binKey  = binEl.dataset.bin;

          /* Deselect visual */
          selectedObj.style.border = '3px solid transparent';
          selectedObj.style.boxShadow = 'var(--sh-soft)';

          if (objBin === binKey) {
            /* Correto! Animar voando para o bin */
            const objRect = selectedObj.getBoundingClientRect();
            const binRect = binEl.getBoundingClientRect();
            const ghost = el('div', {
              style: {
                position: 'fixed',
                left: objRect.left + 'px', top: objRect.top + 'px',
                width: objRect.width + 'px', height: objRect.height + 'px',
                background: 'rgba(255,255,255,.9)', borderRadius: '18px', padding: '8px',
                zIndex: 9999, pointerEvents: 'none', transition: 'all 450ms var(--ease-pop)',
              },
              html: selectedObj.innerHTML,
            });
            document.body.appendChild(ghost);
            requestAnimationFrame(() => requestAnimationFrame(() => {
              ghost.style.left   = binRect.left + binRect.width / 4 + 'px';
              ghost.style.top    = binRect.top  + binRect.height / 4 + 'px';
              ghost.style.width  = binRect.width / 2 + 'px';
              ghost.style.height = binRect.height / 2 + 'px';
              ghost.style.opacity = '0';
            }));
            setTimeout(() => ghost.remove(), 460);

            selectedObj.dataset.done = '1';
            selectedObj.style.opacity = '0.25';
            selectedObj.style.cursor  = 'default';
            selectedObj = null;

            /* Efeito na caixinha */
            binEl.style.background = bin.border + '33';
            binEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 300 });
            setTimeout(() => { binEl.style.background = bin.bg; }, 500);

            Audio.correct();
            combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });
            Particles.burst(binRect.left + binRect.width / 2, binRect.top + binRect.height / 2, 10);
            showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');

            placed++;
            correct++;
            if (dots[round - 1]) dots[round - 1].classList.add('liz-round-dot--correct');

            if (placed >= objs.length) {
              if (round >= cfg.rounds) { await sleep(600); finish(); }
              else { await sleep(700); nextRound(); }
            }
          } else {
            /* Errado! Shake no bin */
            binEl.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 350 });
            Audio.wrong();
            combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
            selectedObj = null;
          }
        });

        binsArea.appendChild(binEl);
      });
      content.appendChild(binsArea);
      stage.appendChild(content);
    }

    function finish () {
      let stars = correct >= cfg.rounds * 2 ? 3 : correct >= cfg.rounds ? 2 : 1;
      const xp = 12 + correct * 3, coins = 6 + correct * 2;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 50, xp, coins, level });
      ResultModal({
        stars, coins, xp, title: stars === 3 ? 'Sorteiro Mestre!' : 'Muito bem!',
        message: `${correct} objetos corretamente separados!`,
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

function ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
