/* =========================================================================
   LIZKIDS — PALAVRAS MÁGICAS
   CORREÇÃO: imagem permanece na tela; sílabas não somem.
   Só avança para próxima palavra após TODAS as sílabas colocadas.
   active flag impede avanço indevido após unmount.
   ========================================================================= */
import { el, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { WORDS }    from '../data/words-data.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';

const WORDS_PER_GAME = 5;
const SYLL_COLORS   = ['#FF7BB5','#4F7CFF','#5BE0A3','#FFD23F','#B57BFF','#FF8A65'];

export const MagicWordsGame = {
  _cleanup: null,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(()=>Router.navigate('profile-select'),0); return ph(); }

    const level    = Math.min(4, Math.max(1, gameDef.level||1));
    const wordPool = shuffle([...(WORDS[level]||WORDS[1])]).slice(0, WORDS_PER_GAME);
    let wordIdx    = 0;
    let correct    = 0;
    let active     = true;
    const combo    = new ComboSystem();

    this._cleanup = () => { active = false; };

    /* ── DOM principal ── */
    const wrap = el('div', { class:'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const progTxt  = el('span', {}, [`1/${WORDS_PER_GAME}`]);
    const comboPill= el('div', { class:'liz-combo-pill' }, [el('span',{html:ICONS.star()}),'×1']);

    /* Hint tutorial (só palavra 1) */
    const hintBanner = el('div', {
      style:{ background:'rgba(255,255,255,.92)', padding:'7px 18px', borderRadius:'var(--r-pill)', fontWeight:800, fontSize:'var(--fs-sm)', color:'var(--ink)', boxShadow:'var(--sh-soft)', textAlign:'center', animation:'lizPulse 2s ease-in-out 3' },
    }, ['Toque as sílabas na ordem certa!']);

    wrap.appendChild(el('div', { class:'liz-game__topbar' }, [
      el('button', { class:'liz-back', onClick:()=>{ Audio.click(); Router.navigate('game',{gameId:gameDef.id}); } },
        [el('span',{html:ICONS.back()}),'Níveis']),
      el('div', { class:'liz-game__title' }, ['Palavras Mágicas — Nv '+level]),
      el('div', { class:'liz-game__hud' }, [progTxt, comboPill]),
    ]));

    /* Stage estável — conteúdo atualizado in-place, não recriado */
    const stage = el('div', { class:'liz-game__stage', style:{gap:'14px'} });
    wrap.appendChild(stage);

    /* ── Elementos permanentes do stage ──
       Estes elementos NUNCA são removidos; apenas seu conteúdo é atualizado.
       Isso garante que nada "desapareça" durante a transição.               */
    const hintArea  = el('div');
    const imgBox    = el('div', {
      style:{ width:'clamp(100px,20vw,150px)', height:'clamp(100px,20vw,150px)', background:'rgba(255,255,255,.97)', borderRadius:'var(--r-xl)', padding:'14px', boxShadow:'var(--sh-lg)', display:'flex', alignItems:'center', justifyContent:'center' },
    });
    const wordLabel = el('div', { style:{ fontFamily:'Fredoka,sans-serif', fontWeight:700, fontSize:'clamp(1.4rem,4vw,2rem)', color:'#fff', letterSpacing:'.18em', textShadow:'0 4px 0 rgba(46,34,87,.2)' } });
    const slotsRow  = el('div', { style:{ display:'flex', gap:'10px', alignItems:'center', justifyContent:'center', flexWrap:'wrap' } });
    const optsRow   = el('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center' } });

    stage.appendChild(hintArea);
    stage.appendChild(imgBox);
    stage.appendChild(wordLabel);
    stage.appendChild(slotsRow);
    stage.appendChild(optsRow);

    /* ── Carregar palavra (atualizar conteúdo in-place) ── */
    function loadWord () {
      if (!active) return;
      if (wordIdx >= wordPool.length) { finish(); return; }

      const wd = wordPool[wordIdx];
      progTxt.textContent = `${wordIdx+1}/${WORDS_PER_GAME}`;

      /* Estado da palavra atual */
      let nextExpected = 0;

      /* Hint apenas na primeira palavra */
      hintArea.innerHTML = '';
      if (wordIdx === 0) hintArea.appendChild(hintBanner);

      /* Imagem — atualizar innerHTML, não recriar elemento */
      imgBox.innerHTML = wd.art;

      /* Rótulo da palavra */
      wordLabel.textContent = wd.word;

      /* Slots de sílabas */
      slotsRow.innerHTML = '';
      const slotEls = wd.syllables.map((_, i) => {
        const s = el('div', {
          style:{
            minWidth:'clamp(52px,12vw,72px)', height:'clamp(52px,12vw,72px)',
            border:`3px dashed ${SYLL_COLORS[i%SYLL_COLORS.length]}`,
            borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Fredoka,sans-serif', fontWeight:700,
            fontSize:'clamp(1.1rem,3vw,1.6rem)',
            color:SYLL_COLORS[i%SYLL_COLORS.length],
            background:'rgba(255,255,255,.88)',
            transition:'all 280ms var(--ease-pop)',
          },
        });
        slotsRow.appendChild(s);
        return s;
      });

      /* Opções de sílabas (corretas + distratores embaralhados) */
      optsRow.innerHTML = '';
      const allOpts = shuffle([...wd.syllables, ...wd.distract.slice(0,2)]);
      allOpts.forEach((syll, i) => {
        const col = SYLL_COLORS[i % SYLL_COLORS.length];
        const btn = el('button', {
          style:{
            background: col, color:'#fff',
            fontFamily:'Fredoka,sans-serif', fontWeight:700,
            fontSize:'clamp(1.2rem,3.5vw,1.8rem)',
            padding:'12px clamp(14px,3vw,22px)',
            borderRadius:'var(--r-pill)',
            boxShadow:`inset 0 -5px 0 rgba(0,0,0,.15),inset 0 2px 0 rgba(255,255,255,.35),0 8px 18px rgba(0,0,0,.18)`,
            transition:'transform 150ms var(--ease-pop)',
            minWidth:'clamp(50px,10vw,70px)',
            cursor:'pointer',
          },
          data:{ syll, used:'0' },
        }, [syll]);

        btn.addEventListener('mouseenter', ()=>{ if(btn.dataset.used==='0') btn.style.transform='translateY(-3px) scale(1.05)'; });
        btn.addEventListener('mouseleave', ()=>btn.style.transform='');

        btn.addEventListener('click', () => {
          if (!active || btn.dataset.used==='1') return;

          if (syll === wd.syllables[nextExpected]) {
            /* ✓ Sílaba correta */
            btn.dataset.used = '1';
            btn.style.opacity = '0.32';
            btn.style.transform = 'scale(.9)';
            btn.style.pointerEvents = 'none';

            /* Animar sílaba voando para o slot */
            const bRect = btn.getBoundingClientRect();
            const sRect = slotEls[nextExpected].getBoundingClientRect();
            const ghost = document.createElement('div');
            ghost.style.cssText = `position:fixed;left:${bRect.left}px;top:${bRect.top}px;width:${bRect.width}px;height:${bRect.height}px;background:${col};color:#fff;font-family:Fredoka,sans-serif;font-weight:700;font-size:${btn.style.fontSize};border-radius:var(--r-pill);display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;transition:all 380ms var(--ease-pop);`;
            ghost.textContent = syll;
            document.body.appendChild(ghost);
            requestAnimationFrame(()=>requestAnimationFrame(()=>{
              ghost.style.left  = (sRect.left + sRect.width*.12) + 'px';
              ghost.style.top   = (sRect.top  + sRect.height*.12) + 'px';
              ghost.style.width = sRect.width * .76 + 'px';
              ghost.style.height= sRect.height * .76 + 'px';
              ghost.style.borderRadius = '12px';
              ghost.style.fontSize = 'clamp(.9rem,2.5vw,1.4rem)';
            }));
            setTimeout(()=>{
              ghost.remove();
              const slot = slotEls[nextExpected];
              slot.textContent = syll;
              slot.style.border = `3px solid ${SYLL_COLORS[nextExpected%SYLL_COLORS.length]}`;
              slot.style.background = SYLL_COLORS[nextExpected%SYLL_COLORS.length]+'20';
              slot.style.transform = 'scale(1.12)';
              setTimeout(()=>slot.style.transform='', 280);
            }, 390);

            Audio.pop();
            nextExpected++;
            combo.hit(n=>{ comboPill.lastChild.textContent='×'+n; });

            /* Todos slots preenchidos → avançar */
            if (nextExpected === wd.syllables.length) {
              correct++;
              Audio.correct();
              showFloatingMessage('Incrível! 🌟', 'combo');
              wordIdx++;
              /* Aguardar 1.2s ANTES de trocar a palavra — garante que a imagem
                 continua visível enquanto a criança celebra */
              setTimeout(()=>{ if (active) loadWord(); }, 1250);
            }
          } else {
            /* ✗ Sílaba errada */
            btn.animate(
              [{transform:'translateX(-9px)'},{transform:'translateX(9px)'},{transform:'translateX(-5px)'},{transform:'translateX(0)'}],
              {duration:360}
            );
            Audio.wrong();
            combo.miss(()=>{ comboPill.lastChild.textContent='×1'; });
          }
        });
        optsRow.appendChild(btn);
      });
    }

    function finish () {
      if (!active) return;
      active = false;
      const stars = correct>=WORDS_PER_GAME ? 3 : correct>=WORDS_PER_GAME-1 ? 2 : 1;
      const xp = 15+correct*8, coins = 8+correct*4;
      Storage.saveGameRound(profile.id, gameDef.id, {stars, score:correct*100, xp, coins, level});
      ResultModal({
        stars, coins, xp,
        title: stars===3?'Leitor Mágico!':'Muito bem!',
        message:`${correct} de ${WORDS_PER_GAME} palavras formadas.`,
        nextLevel: level<4?level+1:null, gameId:gameDef.id, level,
        onPlayAgain:()=>Router.navigate('game',{gameId:gameDef.id,level}),
        onExit:()=>Router.navigate('game',{gameId:gameDef.id}),
      });
    }

    loadWord();
    return wrap;
  },

  unmount () {
    this._cleanup?.();
    this._cleanup = null;
  },
};

function ph () { return el('div',{style:{position:'absolute',inset:'0',background:'var(--bg-deep-1)'}}); }
