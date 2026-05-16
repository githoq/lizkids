/* =========================================================================
   LIZKIDS — AVENTURA MATEMÁTICA (RPG-lite)
   Personagens desafiam a criança. Resposta certa → oponente toma dano.
   Errou → perde uma vida. 4 batalhas (níveis), personagens crescentes.
   ========================================================================= */
import { el, rndInt, shuffle, sleep } from '../core/utils.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Router }    from '../core/router.js';
import { SkyStage, ResultModal } from '../components/ui.js';
import { CHARACTERS, ICONS }    from '../data/characters.js';
import { ComboSystem, showFloatingMessage, pickMsg, MOTIVATION, QuestionTimer } from '../core/game-engine.js';
import { Particles } from '../core/particles.js';

/* ── Configuração das batalhas ──────────────────────────────────────── */
const BATTLES = [
  { char: 'bobo',  name: 'Bobo',  quests: 5,  ops: ['sum'],           max: 10,  timer: null, color: '#4F7CFF' },
  { char: 'mel',   name: 'Mel',   quests: 6,  ops: ['sum','sub'],     max: 20,  timer: null, color: '#FFD23F' },
  { char: 'drako', name: 'Drako', quests: 7,  ops: ['sum','sub','mul'], max: 30, timer: null, color: '#5BE0A3' },
  { char: 'owly',  name: 'Owly',  quests: 8,  ops: ['all'],           max: 50,  timer: 14,   color: '#B57BFF' },
];

const TAUNT  = ['Você consegue isso?', 'Tente me vencer!', 'Muito fácil para mim!', 'Isso é fácil?'];
const HURT   = ['Ai!', 'Boa!', 'Isso deu!', 'Wow!'];
const PLAYER_HIT = ['Epa!', 'Cuidado!', 'Quase!', 'Não desista!'];

export const MathAdventureGame = {
  _qTimer: null,
  mount (gameDef) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const level = Math.min(4, Math.max(1, gameDef.level || 1));
    const battle = BATTLES[level - 1];
    let answered = 0, playerLives = 3, locked = false;
    const combo = new ComboSystem();

    /* ── Layout principal ── */
    const wrap = el('div', { class: 'liz-game' });
    wrap.appendChild(SkyStage('day'));

    /* ── Topbar ── */
    const livesEl = el('div', { class: 'liz-game__hud' });
    const updateLives = () => {
      livesEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        livesEl.appendChild(el('span', {
          style: { fontSize: '24px', opacity: i < playerLives ? '1' : '0.25', transition: 'opacity 300ms' },
          html: ICONS.star(),
        }));
      }
    };
    updateLives();

    const comboPill = el('div', { class: 'liz-combo-pill' }, [el('span', { html: ICONS.flame() }), '×1']);

    wrap.appendChild(el('div', { class: 'liz-game__topbar' }, [
      el('button', { class: 'liz-back', onClick: () => { Audio.click(); this._qTimer?.stop(); Router.navigate('game', { gameId: gameDef.id }); } },
        [el('span', { html: ICONS.back() }), 'Níveis']),
      el('div', { class: 'liz-game__title' }, [`vs ${battle.name}!`]),
      el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, [livesEl, comboPill]),
    ]));

    /* ── Arena de batalha ── */
    const stage = el('div', { class: 'liz-game__stage', style: { gap: '12px', justifyContent: 'flex-start', paddingTop: '8px' } });

    /* HP do inimigo */
    const hpWrap = el('div', { style: { width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,.9)', borderRadius: 'var(--r-xl)', padding: '14px 20px', boxShadow: 'var(--sh-md)' } });
    const hpLabel = el('div', { class: 't-eyebrow', style: { marginBottom: '8px' } }, [`Vida de ${battle.name}`]);
    const hpBarEl = el('div', { class: 'liz-progress', style: { height: '14px' } }, [
      el('div', { class: 'liz-progress__fill', style: { width: '100%', background: battle.color } }),
    ]);
    hpWrap.appendChild(hpLabel);
    hpWrap.appendChild(hpBarEl);
    stage.appendChild(hpWrap);

    /* Personagem inimigo */
    const charWrap = el('div', {
      style: { width: 'clamp(140px,22vw,200px)', animation: 'lizFloat 3.5s ease-in-out infinite', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.3))', cursor: 'default' },
      html: (CHARACTERS[battle.char] || CHARACTERS.lumi)(),
    });
    const speechBubble = el('div', {
      class: 'liz-math-bubble',
      style: { display: 'none', position: 'absolute', left: '50%', top: '0', transform: 'translate(-50%, -120%)', background: 'white', borderRadius: '16px', padding: '8px 16px', fontWeight: 800, fontSize: 'var(--fs-sm)', color: 'var(--ink)', boxShadow: 'var(--sh-soft)', whiteSpace: 'nowrap' },
    });
    const charContainer = el('div', { style: { position: 'relative' } }, [charWrap, speechBubble]);

    /* Função para mostrar fala do personagem */
    const speak = (text, ms = 1600) => {
      speechBubble.textContent = text;
      speechBubble.style.display = 'block';
      setTimeout(() => { speechBubble.style.display = 'none'; }, ms);
    };

    stage.appendChild(charContainer);

    /* Área da questão */
    const questionArea = el('div', { style: { width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' } });
    stage.appendChild(questionArea);
    wrap.appendChild(stage);

    /* Timer bar (nível 4) */
    let timerBar = null, timerFill = null;
    if (battle.timer) {
      timerBar = el('div', { class: 'liz-timer-bar', style: { width: '100%', maxWidth: '600px' } }, [
        el('div', { class: 'liz-timer-bar__fill' }),
      ]);
      timerFill = timerBar.firstChild;
      stage.insertBefore(timerBar, questionArea);
    }

    /* Fala de abertura */
    setTimeout(() => speak(pickMsg(TAUNT)), 600);

    /* ── Gerar próxima questão ── */
    function nextQuestion () {
      questionArea.innerHTML = '';
      this._qTimer?.stop();

      const op = genOp(battle.ops, battle.max);

      const qCard = el('div', {
        class: 'math-question',
        style: { animation: 'lizPopIn .35s var(--ease-pop)' },
      }, [
        el('div', { class: 'math-question__pre' }, [`Questão ${answered + 1} de ${battle.quests}`]),
        el('div', { class: 'math-question__expr' }, [
          el('span', { class: 'math-question__slot' }, [String(op.a)]),
          op.sign,
          el('span', { class: 'math-question__slot' }, [String(op.b)]),
          '=',
          el('span', { class: 'math-question__slot math-question__slot--empty' }, ['?']),
        ]),
      ]);
      questionArea.appendChild(qCard);

      /* Timer (nível 4) */
      if (battle.timer && timerFill) {
        timerFill.style.transform = 'scaleX(1)';
        timerFill.classList.remove('liz-timer-bar__fill--danger');
        this._qTimer = new QuestionTimer(battle.timer,
          (pct) => {
            timerFill.style.transform = `scaleX(${pct})`;
            if (pct < 0.3) timerFill.classList.add('liz-timer-bar__fill--danger');
          },
          () => onAnswer.call(this, -999, op.answer, null, optGrid)
        );
        this._qTimer.start();
      }

      /* Opções */
      const opts = genOptions(op.answer, op.type);
      const optGrid = el('div', { class: 'math-options' });
      opts.forEach(v => {
        const btn = el('button', { class: 'math-option' }, [String(v)]);
        btn.addEventListener('click', () => onAnswer.call(this, v, op.answer, btn, optGrid));
        optGrid.appendChild(btn);
      });
      questionArea.appendChild(optGrid);
    }

    /* ── Processar resposta ── */
    async function onAnswer (chosen, correctV, btn, grid) {
      if (locked) return;
      locked = true;
      this._qTimer?.stop();
      grid.querySelectorAll('.math-option').forEach(b => b.disabled = true);

      if (chosen === correctV) {
        /* Acertou → inimigo toma dano */
        btn?.classList.add('math-option--correct');
        Audio.correct();
        answered++;
        combo.hit(n => { comboPill.lastChild.textContent = '×' + n; comboPill.classList.add('liz-combo-pill--active'); setTimeout(() => comboPill.classList.remove('liz-combo-pill--active'), 700); });
        showFloatingMessage(pickMsg(MOTIVATION.correct), 'good');
        speak(pickMsg(HURT), 1200);

        /* Animar dano no personagem */
        charWrap.animate([{ filter: 'drop-shadow(0 0 0 red) brightness(2)' }, { filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.3)) brightness(1)' }], { duration: 500 });

        /* Atualizar HP bar */
        const hpPct = Math.max(0, ((battle.quests - answered) / battle.quests)) * 100;
        hpBarEl.firstChild.style.width = hpPct + '%';
        hpBarEl.firstChild.style.background = hpPct < 30 ? '#FF4040' : battle.color;

        if (answered >= battle.quests) {
          /* VITÓRIA */
          locked = false;
          await sleep(500);
          victory();
          return;
        }
      } else {
        /* Errou → player perde vida */
        btn?.classList.add('math-option--wrong');
        grid.querySelectorAll('.math-option').forEach(b => { if (Number(b.textContent) === correctV) b.classList.add('math-option--correct'); });
        Audio.wrong();
        speak(pickMsg(PLAYER_HIT), 1200);
        combo.miss(n => { comboPill.lastChild.textContent = '×1'; });
        playerLives--;
        updateLives();

        if (playerLives <= 0) {
          locked = false;
          await sleep(500);
          defeat();
          return;
        }
      }

      await sleep(900);
      locked = false;
      nextQuestion.call(this);
    }

    function victory () {
      Particles.confetti(50);
      const stars = playerLives === 3 ? 3 : playerLives === 2 ? 2 : 1;
      const xp = 15 + stars * 12 + Math.floor(combo.count * 3);
      const coins = 10 + stars * 8;
      Storage.saveGameRound(profile.id, gameDef.id, { stars, score: answered * 100, xp, coins, level });
      ResultModal({
        stars, coins, xp,
        title: `${battle.name} foi derrotado!`,
        message: stars === 3 ? 'Perfeito! Nenhuma vida perdida!' : `Você venceu com ${playerLives} vida(s) restante(s)!`,
        nextLevel: level < 4 ? level + 1 : null,
        gameId: gameDef.id, level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }

    function defeat () {
      ResultModal({
        stars: 0, coins: 2, xp: 5,
        title: 'Você perdeu!',
        message: 'Tente de novo, você consegue!',
        gameId: gameDef.id, level,
        onPlayAgain: () => Router.navigate('game', { gameId: gameDef.id, level }),
        onExit:      () => Router.navigate('game', { gameId: gameDef.id }),
      });
    }

    nextQuestion.call(this);
    return wrap;
  },
  unmount () { this._qTimer?.stop(); },
};

/* ── Helpers matemáticos ─────────────────────────────────────────────── */
function genOp (ops, max) {
  const all = ops.includes('all') ? ['sum','sub','mul'] : ops;
  const type = all[Math.floor(Math.random() * all.length)];
  if (type === 'mul') {
    const a = rndInt(1, Math.min(10, max)), b = rndInt(1, Math.min(10, max));
    return { a, b, sign: '×', answer: a * b, type };
  }
  if (type === 'sub') {
    let a = rndInt(1, max), b = rndInt(1, max);
    if (b > a) [a, b] = [b, a];
    return { a, b, sign: '−', answer: a - b, type };
  }
  const a = rndInt(0, max), b = rndInt(0, max);
  return { a, b, sign: '+', answer: a + b, type };
}

function genOptions (correct, type) {
  const range = type === 'mul' ? 8 : Math.max(4, Math.ceil(correct * 0.35));
  const set = new Set([correct]);
  let t = 0;
  while (set.size < 4 && t++ < 60) {
    const d = rndInt(1, range);
    const v = Math.random() < 0.5 ? correct + d : correct - d;
    if (v >= 0 && v !== correct) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size);
  return shuffle([...set]);
}

function ph () { return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)' } }); }
