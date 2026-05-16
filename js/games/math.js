/* =========================================================================
   LIZKIDS — AVENTURA MATEMÁTICA (RPG)
   CORREÇÃO: sem this._ em callbacks, active flag em TODOS os async paths.
   A questão só troca APÓS o usuário responder ou timeout real.
   ========================================================================= */
import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION } from '../core/game-engine.js';
import { Particles } from '../core/particles.js';

const BATTLES = [
  { char:'bobo',  name:'Bobo',  quests:5, ops:['sum'],           max:10,  timerSec:null, col:'#4F7CFF' },
  { char:'mel',   name:'Mel',   quests:6, ops:['sum','sub'],     max:20,  timerSec:null, col:'#FFD23F' },
  { char:'drako', name:'Drako', quests:7, ops:['sum','sub','mul'],max:30, timerSec:null, col:'#5BE0A3' },
  { char:'owly',  name:'Owly',  quests:8, ops:['all'],           max:50,  timerSec:14,   col:'#B57BFF' },
];

const TAUNT   = ['Você consegue isso?','Tente me vencer!','Isso é fácil para mim!'];
const HURT    = ['Ai!','Boa!','Não!','Isso deu!'];
const P_HIT   = ['Quase!','Não desista!','Cuidado!'];

export const MathAdventureGame = {
  /* Guarda apenas a função de cleanup — sem estado de gameplay aqui */
  _cleanup: null,

  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level  = Math.min(4, Math.max(1, gameDef.level || 1));
    const battle = BATTLES[level - 1];

    /* ── Estado do jogo (closure, não this) ── */
    let active      = true;   // vira false no unmount — todo callback verifica
    let answered    = 0;
    let playerLives = 3;
    let locked      = false;
    let qTimerId    = null;   // setInterval do timer por questão
    const combo     = new ComboSystem();

    /* Cleanup capturado para unmount */
    this._cleanup = () => {
      active = false;
      if (qTimerId) { clearInterval(qTimerId); qTimerId = null; }
    };

    /* ── DOM ── */
    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* Vidas */
    const livesRow = el('div', { style: { display:'flex', gap:'6px' } });
    const renderLives = () => {
      livesRow.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        livesRow.appendChild(el('span', {
          style: { fontSize:'22px', opacity: i < playerLives ? '1' : '0.22', transition:'opacity 300ms' },
          html: ICONS.star(),
        }));
      }
    };
    renderLives();

    const comboPill = el('div', { class:'liz-combo-pill' }, [el('span',{html:ICONS.flame()}),'×1']);

    wrap.appendChild(el('div', { class:'liz-game__topbar' }, [
      el('button', { class:'liz-back', onClick:() => { Audio.click(); Router.navigate('game', { gameId:gameDef.id }); } },
        [el('span',{html:ICONS.back()}),'Níveis']),
      el('div', { class:'liz-game__title' }, [`vs ${battle.name}!`]),
      el('div', { style:{display:'flex',gap:'10px',alignItems:'center'} }, [livesRow, comboPill]),
    ]));

    /* Stage */
    const stage = el('div', { class:'liz-game__stage', style:{gap:'10px',justifyContent:'flex-start',paddingTop:'6px'} });

    /* HP bar do inimigo */
    const hpFill = el('div', { class:'liz-progress__fill', style:{width:'100%',background:battle.col} });
    const hpWrap = el('div', { style:{width:'100%',maxWidth:'560px',background:'rgba(255,255,255,.9)',borderRadius:'var(--r-xl)',padding:'12px 18px',boxShadow:'var(--sh-md)'} }, [
      el('div', { class:'t-eyebrow', style:{marginBottom:'7px'} }, [`Vida de ${battle.name}`]),
      el('div', { class:'liz-progress', style:{height:'12px'} }, [hpFill]),
    ]);
    stage.appendChild(hpWrap);

    /* Personagem inimigo */
    const charEl = el('div', {
      style:{ width:'clamp(110px,18vw,170px)', animation:'lizFloat 3.5s ease-in-out infinite', filter:'drop-shadow(0 16px 24px rgba(0,0,0,.28))' },
      html:(CHARACTERS[battle.char]||CHARACTERS.lumi)(),
    });
    const bubble = el('div', { style:{display:'none',position:'absolute',left:'50%',top:'0',transform:'translate(-50%,-120%)',background:'white',borderRadius:'14px',padding:'7px 14px',fontWeight:800,fontSize:'var(--fs-sm)',color:'var(--ink)',boxShadow:'var(--sh-soft)',whiteSpace:'nowrap',zIndex:10} });
    const speak = (txt, ms=1600) => { bubble.textContent=txt; bubble.style.display='block'; setTimeout(()=>bubble.style.display='none', ms); };
    const charWrap = el('div', { style:{position:'relative'} }, [charEl, bubble]);
    stage.appendChild(charWrap);

    /* Timer bar (nível 4) */
    const timerBar  = el('div', { class:'liz-timer-bar', style:{width:'100%',maxWidth:'560px'} }, [el('div',{class:'liz-timer-bar__fill'})]);
    const timerFill = timerBar.firstChild;
    if (battle.timerSec) stage.appendChild(timerBar);

    /* Área da questão — ELEMENTO PERSISTENTE que nunca é removido do DOM */
    const qArea = el('div', { style:{width:'100%',maxWidth:'560px',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'} });
    stage.appendChild(qArea);
    wrap.appendChild(stage);

    /* Fala de abertura */
    setTimeout(() => { if (active) speak(pickMsg(TAUNT)); }, 700);

    /* ─── Renderizar próxima questão ───────────────────────────────── */
    function showQuestion () {
      if (!active) return;

      /* Limpar apenas o interior da área, não remover o container */
      qArea.innerHTML = '';
      if (qTimerId) { clearInterval(qTimerId); qTimerId = null; }

      const op = genOp(battle.ops, battle.max);

      /* Card da questão */
      const qCard = el('div', { class:'math-question' }, [
        el('div', { class:'math-question__pre' }, [`Questão ${answered+1} de ${battle.quests}`]),
        el('div', { class:'math-question__expr' }, [
          el('span', { class:'math-question__slot' }, [String(op.a)]),
          op.sign,
          el('span', { class:'math-question__slot' }, [String(op.b)]),
          '=',
          el('span', { class:'math-question__slot math-question__slot--empty' }, ['?']),
        ]),
      ]);
      qArea.appendChild(qCard);

      /* Timer por questão (nível 4 apenas) */
      if (battle.timerSec) {
        const start = Date.now();
        timerFill.style.transform = 'scaleX(1)';
        timerFill.classList.remove('liz-timer-bar__fill--danger');
        qTimerId = setInterval(() => {
          if (!active) { clearInterval(qTimerId); return; }
          const pct = Math.max(0, 1 - (Date.now()-start)/(battle.timerSec*1000));
          timerFill.style.transform = `scaleX(${pct})`;
          if (pct < 0.28) timerFill.classList.add('liz-timer-bar__fill--danger');
          if (pct <= 0) {
            clearInterval(qTimerId); qTimerId = null;
            if (!locked && active) processAnswer(null, op.answer, null, optGrid);
          }
        }, 60);
      }

      /* Opções */
      const opts    = genOptions(op.answer, op.type);
      const optGrid = el('div', { class:'math-options' });
      opts.forEach(v => {
        const btn = el('button', { class:'math-option' }, [String(v)]);
        /* Closure estável — v e op.answer capturados corretamente */
        btn.addEventListener('click', () => processAnswer(v, op.answer, btn, optGrid));
        optGrid.appendChild(btn);
      });
      qArea.appendChild(optGrid);
    }

    /* ─── Processar resposta ──────────────────────────────────────── */
    async function processAnswer (chosen, correctV, btn, grid) {
      if (!active || locked) return;
      locked = true;

      /* Parar timer */
      if (qTimerId) { clearInterval(qTimerId); qTimerId = null; }

      /* Desabilitar opções */
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);

      if (chosen === correctV) {
        /* ACERTO */
        btn?.classList.add('math-option--correct');
        Audio.correct();
        answered++;
        combo.hit(n => { comboPill.lastChild.textContent = '×'+n; });
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
        if (active) speak(pickMsg(HURT), 1100);

        /* Dano visual no personagem */
        charEl.animate([{filter:'brightness(2) saturate(0)'},{filter:'drop-shadow(0 16px 24px rgba(0,0,0,.28))'}],{duration:500});

        /* HP bar */
        const pct = Math.max(0, (battle.quests - answered) / battle.quests * 100);
        hpFill.style.width = pct + '%';
        hpFill.style.background = pct < 30 ? '#FF4040' : battle.col;

        if (answered >= battle.quests) {
          /* VITÓRIA */
          await sleep(600);
          if (active) victory();
          return;
        }
      } else {
        /* ERRO */
        btn?.classList.add('math-option--wrong');
        /* Revelar correta */
        grid.querySelectorAll('.math-option').forEach(b => {
          if (Number(b.textContent) === correctV) b.classList.add('math-option--correct');
        });
        Audio.wrong();
        if (active) speak(pickMsg(P_HIT), 1100);
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
        playerLives--;
        renderLives();

        if (playerLives <= 0) {
          await sleep(600);
          if (active) defeat();
          return;
        }
      }

      await sleep(950);
      locked = false;
      if (active) showQuestion();
    }

    function victory () {
      const stars = playerLives === 3 ? 3 : playerLives === 2 ? 2 : 1;
      const xp = 15 + stars * 12, coins = 10 + stars * 8;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score:answered*100, xp, coins, level });
      Particles.confetti(50);
      ResultModal({ stars, coins, xp,
        title:`${battle.name} foi derrotado!`,
        message: stars===3 ? 'Perfeito! Sem vidas perdidas!' : `Você venceu! ${playerLives} vida(s) sobrando.`,
        nextLevel: level<4 ? level+1 : null, gameId:gameDef.id, level,
        onPlayAgain:()=>Router.navigate('game',{gameId:gameDef.id,level}),
        onExit:()=>Router.navigate('game',{gameId:gameDef.id}),
      });
    }
    function defeat () {
      ResultModal({ stars:0, coins:2, xp:5,
        title:'Não desta vez!', message:'Tente de novo, você consegue!',
        gameId:gameDef.id, level,
        onPlayAgain:()=>Router.navigate('game',{gameId:gameDef.id,level}),
        onExit:()=>Router.navigate('game',{gameId:gameDef.id}),
      });
    }

    showQuestion();
    return wrap;
  },

  unmount () {
    this._cleanup?.();
    this._cleanup = null;
  },
};

/* ── helpers ─────────────────────────────────────────────────────────── */
function genOp (ops, max) {
  const all  = ops.includes('all') ? ['sum','sub','mul'] : ops;
  const type = all[Math.floor(Math.random()*all.length)];
  if (type==='mul') { const a=rndInt(1,Math.min(10,max)), b=rndInt(1,Math.min(10,max)); return {a,b,sign:'×',answer:a*b,type}; }
  if (type==='sub') { let a=rndInt(1,max),b=rndInt(1,max); if(b>a)[a,b]=[b,a]; return {a,b,sign:'−',answer:a-b,type}; }
  const a=rndInt(0,max),b=rndInt(0,max); return {a,b,sign:'+',answer:a+b,type};
}
function genOptions (correct, type) {
  const range = type==='mul' ? 8 : Math.max(4, Math.ceil(correct*0.35));
  const set   = new Set([correct]);
  let t=0;
  while (set.size<4 && t++<60) {
    const d=rndInt(1,range), v=Math.random()<.5 ? correct+d : correct-d;
    if (v>=0 && v!==correct) set.add(v);
  }
  while (set.size<4) set.add(correct+set.size);
  return shuffle([...set]);
}
function ph () { return el('div',{style:{position:'absolute',inset:'0',background:'var(--bg-deep-1)'}}); }
