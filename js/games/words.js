/* =========================================================================
   LIZKIDS — PALAVRAS MÁGICAS
   Imagem + sílabas embaralhadas → toca na ordem certa → voa pro slot.
   ========================================================================= */
import { el, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { WORDS }    from '../data/words-data.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const WORDS_PER_ROUND = 5;
const SYLL_COLORS = ['#FF7BB5','#4F7CFF','#5BE0A3','#FFD23F','#B57BFF','#FF8A65'];

export const MagicWordsGame = {
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level    = Math.min(4, Math.max(1, gameDef.level || 1));
    const wordPool = shuffle([...(WORDS[level] || WORDS[1])]).slice(0, WORDS_PER_ROUND);
    let wordIdx = 0, correct = 0;
    const combo  = new ComboSystem();

    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* Topbar */
    const progressTxt = el('span', {}, [`1/${WORDS_PER_ROUND}`]);
    const comboPill   = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.star() }), '×1']);

    /* Tutorial hint na 1ª palavra */
    const hintEl = el('div', {
      style: { position: 'absolute', bottom: '32%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,.9)', padding: '8px 18px', borderRadius: 'var(--r-pill)', fontWeight: 800, fontSize: 'var(--fs-sm)', color: 'var(--ink)', boxShadow: 'var(--sh-soft)', pointerEvents: 'none', animation: 'lizPulse 2s ease-in-out infinite', zIndex: 100, whiteSpace: 'nowrap' },
    }, ['Toque as sílabas na ordem!']);

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, ['Palavras Mágicas — Nv ' + level]),
      el('div', { class: 'liz-game__hud' }, [progressTxt, comboPill]),
    ]));

    const stage = el('div', { class: 'liz-game__stage' });
    wrap.appendChild(stage);

    /* Mostrar hint apenas na primeira vez */
    if (wordIdx === 0) {
      wrap.appendChild(hintEl);
      setTimeout(() => hintEl.remove(), 3000);
    }

    function loadWord () {
      stage.innerHTML = '';
      if (wordIdx >= wordPool.length) { finish(); return; }

      const wd = wordPool[wordIdx];
      progressTxt.textContent = `${wordIdx + 1}/${WORDS_PER_ROUND}`;
      let slotsFilled = 0;
      let nextExpected = 0;

      /* ── Imagem da palavra ── */
      const imgBox = el('div', {
        style: { width: 'clamp(100px,20vw,140px)', height: 'clamp(100px,20vw,140px)', background: 'rgba(255,255,255,.95)', borderRadius: 'var(--r-xl)', padding: '12px', boxShadow: 'var(--sh-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'lizPopIn .4s var(--ease-pop)' },
        html: wd.art,
      });
      stage.appendChild(imgBox);

      /* ── Slots de sílabas ── */
      const slotsRow = el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' } });
      const slotEls  = wd.syllables.map((syll, i) => {
        const slot = el('div', {
          style: {
            minWidth: 'clamp(52px,12vw,72px)', height: 'clamp(52px,12vw,72px)',
            border: `3px dashed ${SYLL_COLORS[i % SYLL_COLORS.length]}`,
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem,3vw,1.6rem)',
            color: SYLL_COLORS[i % SYLL_COLORS.length], background: 'rgba(255,255,255,.85)',
            transition: 'all 300ms var(--ease-pop)',
          },
          data: { idx: i },
        }, ['']);
        return slot;
      });
      slotEls.forEach(s => slotsRow.appendChild(s));
      stage.appendChild(slotsRow);

      /* ── Nome da palavra com slots (acessibilidade) ── */
      const wordLabel = el('div', {
        style: { fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#fff', letterSpacing: '0.18em', textShadow: '0 4px 0 rgba(46,34,87,.2)', animation: 'lizFadeIn .4s .1s both' },
      }, [wd.word]);
      stage.appendChild(wordLabel);

      /* ── Opções de sílabas (embaralhadas + distratores) ── */
      const distractors = wd.distract.slice(0, 2);
      const allOptions  = shuffle([...wd.syllables, ...distractors]);

      const optsRow = el('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', animation: 'lizSlideUp .4s .2s var(--ease-pop) both' } });

      allOptions.forEach((syll, i) => {
        const btn = el('button', {
          class: 'liz-syll-btn',
          style: {
            background: SYLL_COLORS[i % SYLL_COLORS.length],
            color: '#fff',
            fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
            fontSize: 'clamp(1.2rem,3.5vw,1.8rem)',
            padding: '12px clamp(14px,3vw,22px)',
            borderRadius: 'var(--r-pill)',
            boxShadow: `inset 0 -5px 0 rgba(0,0,0,.15), inset 0 2px 0 rgba(255,255,255,.35), 0 8px 18px rgba(0,0,0,.2)`,
            transition: 'transform 160ms var(--ease-pop)',
            minWidth: 'clamp(50px,10vw,70px)',
          },
          data: { syll },
        }, [syll]);

        btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-3px) scale(1.05)');
        btn.addEventListener('mouseleave', () => btn.style.transform = '');

        btn.addEventListener('click', () => {
          if (btn.dataset.used) return;

          if (syll === wd.syllables[nextExpected]) {
            /* Correto! */
            Audio.correct();
            btn.dataset.used = '1';
            btn.style.opacity = '0.35';
            btn.style.pointerEvents = 'none';

            /* Animar sílaba voando para o slot */
            const slot = slotEls[nextExpected];
            const btnRect  = btn.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();

            const ghost = el('div', {
              style: {
                position: 'fixed',
                left: btnRect.left + 'px', top: btnRect.top + 'px',
                width: btnRect.width + 'px', height: btnRect.height + 'px',
                background: SYLL_COLORS[nextExpected % SYLL_COLORS.length],
                color: '#fff', fontFamily: 'Fredoka,sans-serif', fontWeight: 700,
                fontSize: btn.style.fontSize, borderRadius: 'var(--r-pill)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, pointerEvents: 'none',
                transition: 'all 400ms var(--ease-pop)',
              },
            }, [syll]);
            document.body.appendChild(ghost);

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                ghost.style.left  = slotRect.left + 'px';
                ghost.style.top   = slotRect.top  + 'px';
                ghost.style.width = slotRect.width  + 'px';
                ghost.style.height= slotRect.height + 'px';
                ghost.style.borderRadius = '14px';
              });
            });

            setTimeout(() => {
              ghost.remove();
              slot.textContent = syll;
              slot.style.border = `3px solid ${SYLL_COLORS[nextExpected % SYLL_COLORS.length]}`;
              slot.style.background = SYLL_COLORS[nextExpected % SYLL_COLORS.length] + '22';
              slot.style.transform = 'scale(1.12)';
              setTimeout(() => { slot.style.transform = ''; }, 300);
            }, 400);

            nextExpected++;
            slotsFilled++;
            combo.hit(n => { comboPill.lastChild.textContent = '×' + n; });

            if (slotsFilled === wd.syllables.length) {
              /* Palavra completa! */
              correct++;
              showFloatingMessage('Incrível!', 'combo');
              Audio.victory();
              wordIdx++;
              setTimeout(() => loadWord(), 1200);
            }
          } else {
            /* Errado! Shake */
            btn.animate(
              [{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }],
              { duration: 360 }
            );
            Audio.wrong();
            combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
          }
        });

        optsRow.appendChild(btn);
      });
      stage.appendChild(optsRow);
    }

    function finish () {
      let stars = correct >= WORDS_PER_ROUND ? 3 : correct >= WORDS_PER_ROUND - 1 ? 2 : 1;
      const xp = 15 + correct * 8, coins = 8 + correct * 4;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: correct * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp,
        title: stars === 3 ? 'Leitor Mágico!' : 'Muito bem!',
        message: `${correct} de ${WORDS_PER_ROUND} palavras formadas.`,
        nextLevel: level < 4 ? level + 1 : null, gameId: gameDef.id, level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }

    loadWord();
    return wrap;
  },
  unmount () {},
};

function ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
