/* =========================================================================
   LIZKIDS — CORES E FORMAS (tap-to-place)
   CORREÇÃO: bins sempre visíveis (layout split fixo 55%/40%).
   Tap objeto → seleciona. Tap bin correto → voa para o bin.
   ========================================================================= */
import { el, shuffle, sleep } from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';
import { Particles } from '../core/particles.js';

const COLORS = [
  { id:'vermelho', label:'Vermelho', css:'#FF4040', light:'#FFD0D0' },
  { id:'azul',     label:'Azul',     css:'#4F7CFF', light:'#C8DAFF' },
  { id:'amarelo',  label:'Amarelo',  css:'#FFD23F', light:'#FFF3B8' },
  { id:'verde',    label:'Verde',    css:'#5BE0A3', light:'#C0F4DA' },
  { id:'rosa',     label:'Rosa',     css:'#FF7BB5', light:'#FFD4EA' },
  { id:'roxo',     label:'Roxo',     css:'#B57BFF', light:'#E5D0FF' },
];

const SHAPES = [
  { id:'circulo',   label:'Círculo',
    svg:(c,s)=>`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="${c}" stroke="${s}" stroke-width="2.5"/><ellipse cx="22" cy="21" rx="8" ry="5" fill="rgba(255,255,255,.38)"/></svg>` },
  { id:'quadrado',  label:'Quadrado',
    svg:(c,s)=>`<svg viewBox="0 0 60 60"><rect x="6" y="6" width="48" height="48" rx="10" fill="${c}" stroke="${s}" stroke-width="2.5"/><rect x="12" y="12" width="20" height="10" rx="4" fill="rgba(255,255,255,.33)"/></svg>` },
  { id:'triangulo', label:'Triângulo',
    svg:(c,s)=>`<svg viewBox="0 0 60 60"><path d="M30 5 L56 54 L4 54 Z" fill="${c}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 14 L46 43 L14 43 Z" fill="rgba(255,255,255,.22)"/></svg>` },
  { id:'estrela',   label:'Estrela',
    svg:(c,s)=>`<svg viewBox="0 0 60 60"><path d="M30 4 L37 22 L56 24 L42 37 L46 56 L30 46 L14 56 L18 37 L4 24 L23 22 Z" fill="${c}" stroke="${s}" stroke-width="2" stroke-linejoin="round"/></svg>` },
];

/* nível → { mode, rounds, numColors, numShapes, objCount } */
const CFG = [
  { mode:'color', rounds:6, numColors:3, numShapes:2, objCount:6 },
  { mode:'shape', rounds:6, numColors:2, numShapes:3, objCount:6 },
  { mode:'both',  rounds:7, numColors:3, numShapes:3, objCount:8 },
  { mode:'both',  rounds:8, numColors:4, numShapes:4, objCount:9 },
];

export const ShapesSortGame = {
  _cleanup: null,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(()=>Router.navigate('profile-select'),0); return ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level||1));
    const cfg   = CFG[level-1];
    let round   = 0, correct = 0, active = true;
    const combo = new ComboSystem();
    this._cleanup = ()=>{ active = false; };

    /* ── Wrapper ── */
    const wrap = el('div', { class:'liz-game' });
    wrap.appendChild(SkyStage('day'));

    const roundTxt  = el('span',{},['1/'+cfg.rounds]);
    const comboPill = el('div',{class:'liz-combo-pill'},[el('span',{html:ICONS.flame()}),'×1']);
    const dots = Array.from({length:cfg.rounds},()=>el('div',{class:'liz-round-dot'}));
    const dotsRow = el('div',{class:'liz-round-dots',style:{flexWrap:'wrap',justifyContent:'center'}});
    dots.forEach(d=>dotsRow.appendChild(d));

    wrap.appendChild(el('div',{class:'liz-game__topbar'},[
      el('button',{class:'liz-back',onClick:()=>{Audio.click();Router.navigate('game',{gameId:gameDef.id});}},
        [el('span',{html:ICONS.back()}),'Níveis']),
      el('div',{class:'liz-game__title'},['Cores e Formas — Nv '+level]),
      el('div',{class:'liz-game__hud'},[roundTxt,comboPill]),
    ]));

    /* ── Layout split: 55% objetos + 40% bins, sempre visíveis ── */
    const outerStage = el('div',{style:{
      position:'absolute', inset:'0',
      paddingTop:'72px',
      display:'flex', flexDirection:'column',
      alignItems:'center',
    }});

    outerStage.appendChild(dotsRow);

    /* Hint nível 1 */
    if (level===1) {
      const hint = el('div',{style:{marginTop:'6px',background:'rgba(255,255,255,.9)',padding:'6px 16px',borderRadius:'var(--r-pill)',fontWeight:800,fontSize:'var(--fs-sm)',color:'var(--ink)',animation:'lizPulse 2s ease-in-out 3',textAlign:'center'}},
        ['Toque o objeto → toque na caixinha certa!']);
      outerStage.appendChild(hint);
      setTimeout(()=>hint.remove(), 4000);
    }

    /* Área dos objetos (scrollável se necessário) */
    const objArea = el('div',{style:{
      flex:'1', minHeight:'0',
      width:'100%', maxWidth:'760px',
      display:'flex', flexWrap:'wrap',
      gap:'10px', alignItems:'center', justifyContent:'center',
      padding:'10px 16px', overflowY:'auto',
    }});

    /* Área das bins — FLEX-SHRINK:0 garante que NUNCA some */
    const binsWrap = el('div',{style:{
      flexShrink:'0',
      width:'100%', maxWidth:'760px',
      display:'flex', gap:'10px', justifyContent:'center',
      flexWrap:'wrap',
      padding:'10px 16px 14px',
    }});

    outerStage.appendChild(objArea);
    outerStage.appendChild(binsWrap);
    wrap.appendChild(outerStage);

    /* ── Gerar rodada ── */
    function nextRound () {
      if (!active) return;
      objArea.innerHTML = '';
      binsWrap.innerHTML = '';
      round++;
      if (dots[round-1]) dots[round-1].classList.add('liz-round-dot--current');
      roundTxt.textContent = round+'/'+cfg.rounds;

      const usedColors = shuffle([...COLORS]).slice(0, cfg.numColors);
      const usedShapes = shuffle([...SHAPES]).slice(0, cfg.numShapes);

      /* Gerar objetos e bins conforme modo */
      let objects=[], bins=[];

      if (cfg.mode==='color') {
        bins = usedColors.map(c=>({ key:c.id, label:c.label, bg:c.light, border:c.css }));
        usedColors.forEach(col=>{
          const shp = usedShapes[Math.floor(Math.random()*usedShapes.length)];
          const perBin = Math.ceil(cfg.objCount/usedColors.length);
          for (let i=0;i<perBin;i++) objects.push({colorDef:col, shapeDef:shp, binKey:col.id});
        });
      } else if (cfg.mode==='shape') {
        bins = usedShapes.map(s=>({ key:s.id, label:s.label, bg:'#F0EEFF', border:'#B57BFF' }));
        usedShapes.forEach(shp=>{
          const col = usedColors[Math.floor(Math.random()*usedColors.length)];
          const perBin = Math.ceil(cfg.objCount/usedShapes.length);
          for (let i=0;i<perBin;i++) objects.push({colorDef:col, shapeDef:shp, binKey:shp.id});
        });
      } else {
        /* both: cada combinação cor+forma é uma bin */
        const pairs = usedColors.slice(0,Math.min(usedColors.length,usedShapes.length))
          .map((col,i)=>({col, shp:usedShapes[i%usedShapes.length]}));
        bins = pairs.map(p=>({ key:p.col.id+'-'+p.shp.id, label:p.col.label, sub:p.shp.label, bg:p.col.light, border:p.col.css }));
        pairs.forEach(p=>{
          const perBin = Math.ceil(cfg.objCount/pairs.length);
          for (let i=0;i<perBin;i++) objects.push({colorDef:p.col, shapeDef:p.shp, binKey:p.col.id+'-'+p.shp.id});
        });
      }
      objects = shuffle(objects).slice(0, cfg.objCount);

      /* Estado da rodada */
      let selected = null; // elemento obj atualmente selecionado
      let placed   = 0;

      /* Criar objetos */
      objects.forEach((obj, idx) => {
        const shadow = obj.colorDef.css+'55';
        const objEl = el('div',{
          style:{
            width:'clamp(54px,11vw,72px)', height:'clamp(54px,11vw,72px)',
            background:'rgba(255,255,255,.95)', borderRadius:'18px', padding:'8px',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', border:'3px solid transparent',
            transition:'transform 180ms var(--ease-pop), border-color 180ms, box-shadow 180ms',
            boxShadow:'0 4px 12px rgba(0,0,0,.14)',
            animationDelay:(idx*35)+'ms', animation:`lizPopIn .3s var(--ease-pop) ${idx*35}ms both`,
          },
          html: obj.shapeDef.svg(obj.colorDef.css, shadow),
          data:{ bin:obj.binKey, done:'0' },
        });

        objEl.addEventListener('mouseenter',()=>{ if(objEl.dataset.done==='0') objEl.style.transform='translateY(-4px) scale(1.06)'; });
        objEl.addEventListener('mouseleave',()=>{ if(objEl!==selected) objEl.style.transform=''; });

        objEl.addEventListener('click',()=>{
          if (!active || objEl.dataset.done==='1') return;
          /* Desselecionar anterior */
          if (selected && selected!==objEl) {
            selected.style.border='3px solid transparent';
            selected.style.boxShadow='0 4px 12px rgba(0,0,0,.14)';
          }
          selected = objEl;
          objEl.style.border='3px solid #FFD23F';
          objEl.style.boxShadow='0 0 0 4px rgba(255,210,63,.4)';
          Audio.click();
        });

        objArea.appendChild(objEl);
      });

      /* Criar bins */
      bins.forEach((bin,bi)=>{
        const binEl = el('div',{
          style:{
            minWidth:'clamp(68px,16vw,110px)', minHeight:'clamp(56px,12vw,82px)',
            background:bin.bg, border:`3px dashed ${bin.border}`,
            borderRadius:'var(--r-lg)', padding:'6px 10px',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer', gap:'3px',
            fontFamily:'Fredoka,sans-serif', fontWeight:700,
            fontSize:'var(--fs-sm)', color:'var(--ink)',
            transition:'transform 160ms var(--ease-pop)',
            boxShadow:'0 3px 10px rgba(0,0,0,.10)',
            animationDelay:(bi*50)+'ms', animation:`lizPopIn .35s var(--ease-pop) ${bi*50}ms both`,
          },
          data:{ bin:bin.key },
        });
        binEl.appendChild(el('div',{},[bin.label]));
        if (bin.sub) binEl.appendChild(el('div',{style:{fontSize:'11px',opacity:'.65'}},[bin.sub]));

        binEl.addEventListener('mouseenter',()=>binEl.style.transform='translateY(-3px)');
        binEl.addEventListener('mouseleave',()=>binEl.style.transform='');

        binEl.addEventListener('click', async ()=>{
          if (!active || !selected) return;

          const isRight = selected.dataset.bin === bin.key;

          /* Deselect */
          selected.style.border='3px solid transparent';
          selected.style.boxShadow='0 4px 12px rgba(0,0,0,.14)';
          const movedObj = selected;
          selected = null;

          if (isRight) {
            /* Animação: objeto voa para o bin */
            const oRect = movedObj.getBoundingClientRect();
            const bRect = binEl.getBoundingClientRect();
            const ghost = document.createElement('div');
            ghost.style.cssText = `position:fixed;left:${oRect.left}px;top:${oRect.top}px;width:${oRect.width}px;height:${oRect.height}px;background:rgba(255,255,255,.95);border-radius:18px;padding:8px;z-index:9999;pointer-events:none;transition:all 400ms var(--ease-pop);display:flex;align-items:center;justify-content:center;`;
            ghost.innerHTML = movedObj.innerHTML;
            document.body.appendChild(ghost);
            requestAnimationFrame(()=>requestAnimationFrame(()=>{
              ghost.style.left=(bRect.left+bRect.width*.25)+'px';
              ghost.style.top=(bRect.top+bRect.height*.25)+'px';
              ghost.style.width=bRect.width*.5+'px';
              ghost.style.height=bRect.height*.5+'px';
              ghost.style.opacity='0';
            }));
            setTimeout(()=>ghost.remove(), 420);

            movedObj.dataset.done='1';
            movedObj.style.opacity='.22';
            movedObj.style.cursor='default';

            binEl.animate([{transform:'scale(1)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],{duration:300});
            Particles.burst(bRect.left+bRect.width/2, bRect.top+bRect.height/2, 8);

            Audio.correct();
            combo.hit(n=>{ comboPill.lastChild.textContent='×'+n; });
            if (dots[round-1]) dots[round-1].classList.add('liz-round-dot--correct');
            showFloatingMessage(pickMsg(MOTIVATION.correct),'good');
            correct++;
            placed++;

            if (placed >= objects.length) {
              await sleep(600);
              if (!active) return;
              if (round >= cfg.rounds) finish();
              else nextRound();
            }
          } else {
            /* Errado: shake no bin */
            binEl.animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}],{duration:350});
            Audio.wrong();
            combo.miss(()=>{ comboPill.lastChild.textContent='×1'; });
          }
        });

        binsWrap.appendChild(binEl);
      });
    }

    function finish () {
      if (!active) return;
      active = false;
      const stars = correct >= cfg.rounds*2 ? 3 : correct >= cfg.rounds ? 2 : 1;
      const xp = 12+correct*3, coins = 6+correct*2;
      Storage.saveGameRound(profile.id, gameDef.id, {stars, score:correct*50, xp, coins, level});
      ResultModal({
        stars, coins, xp,
        title: stars===3?'Sorteiro Mestre!':'Muito bem!',
        message:`${correct} objetos separados corretamente!`,
        nextLevel: level<4?level+1:null, gameId:gameDef.id, level,
        onPlayAgain:()=>Router.navigate('game',{gameId:gameDef.id,level}),
        onExit:()=>Router.navigate('game',{gameId:gameDef.id}),
      });
    }

    nextRound();
    return wrap;
  },

  unmount () {
    this._cleanup?.();
    this._cleanup = null;
  },
};

function ph () { return el('div',{style:{position:'absolute',inset:'0',background:'var(--bg-deep-1)'}}); }
