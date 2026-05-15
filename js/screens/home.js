/* =========================================================================
   LIZKIDS — HOME PREMIUM
   Layout: hero cinematográfico + carrosséis horizontais + goals diários.
   Inspirado em Netflix Kids + Lingokids + Disney+.
   ========================================================================= */

import { el }       from '../core/utils.js';
import { Router }   from '../core/router.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Debug }    from '../core/error-overlay.js';
import { SkyStage, TopBar, XpBar, StarsRow } from '../components/ui.js';
import { CHARACTERS, ICONS } from '../data/characters.js';
import { GAMES, CATEGORIES } from '../data/games-catalog.js';

const DAILY_MESSAGES = [
  'Pronto para uma aventura mágica?',
  'Vamos aprender coisas incríveis!',
  'Cada jogo te faz mais inteligente!',
  'Hoje vai ser um dia especial!',
  'Qual aventura você quer hoje?',
];

export const HomeScreen = {
  mount () {
    Debug.log('Home', 'mount()');
    const profile = Storage.getActiveProfile();
    if (!profile) {
      setTimeout(() => Router.navigate('profile-select'), 0);
      return placeholder('Redirecionando…');
    }
    Debug.log('Home', `Perfil: ${profile.name} lv${profile.level}`);

    const wrap = el('div', { class: 'liz-home' });

    // Camada fixa de cenário (atrás de tudo)
    try { wrap.appendChild(SkyStage('day')); } catch {}

    // TopBar flutuante
    try { wrap.appendChild(TopBar()); } catch {}

    // Área de scroll principal
    const scroll = el('div', { class: 'liz-home__scroll' });

    // 1. Hero section
    scroll.appendChild(buildHero(profile));

    // 2. Faixa de progresso
    scroll.appendChild(buildProgressStrip(profile));

    // 3. "Continue jogando" (jogos já iniciados)
    const inProgress = getInProgressGames(profile);
    if (inProgress.length > 0) {
      scroll.appendChild(buildCarousel('Continue de onde parou', inProgress, profile, 0.1));
    }

    // 4. "Recomendados para você"
    const recommended = getRecommended(profile);
    scroll.appendChild(buildCarousel('Feito para você', recommended, profile, 0.2));

    // 5. Missões do dia
    scroll.appendChild(buildDailyGoals(profile));

    // Espaço inferior
    scroll.appendChild(el('div', { style: { height: '60px' } }));

    wrap.appendChild(scroll);
    Debug.log('Home', 'mount() OK');
    return wrap;
  },
  unmount () { Debug.log('Home', 'unmount()'); },
};

/* ─── HERO ─────────────────────────────────────────────────────────────── */

function buildHero (profile) {
  const charSvg = (CHARACTERS[profile.avatarId] || CHARACTERS.lumi)();
  const message = DAILY_MESSAGES[new Date().getDay() % DAILY_MESSAGES.length];

  const mascot = el('div', { class: 'liz-hero__mascot', html: charSvg });
  mascot.addEventListener('click', () => {
    Audio.pop();
    mascot.classList.remove('anim-hop');
    void mascot.offsetWidth;
    mascot.classList.add('anim-hop');
  });

  return el('section', { class: 'liz-hero' }, [
    // Badge de horário
    el('div', { class: 'liz-hero__time-badge' }, [
      el('span', { html: ICONS.bolt() }),
      greetingText(),
    ]),

    // Nome em destaque
    el('h1', { class: 'liz-hero__name' }, [profile.name + '!']),

    // Tagline
    el('p', { class: 'liz-hero__tagline' }, [message]),

    // Mascote
    mascot,

    // CTAs
    el('div', { class: 'liz-hero__actions' }, [
      el('button', {
        class: 'liz-btn liz-btn--yellow liz-btn--lg liz-btn--glow',
        onClick: () => { Audio.click(); Router.navigate('library'); },
      }, [el('span', { html: ICONS.play() }), 'Jogar Agora']),
      el('button', {
        class: 'liz-btn liz-btn--ghost',
        onClick: () => { Audio.click(); Router.navigate('shop'); },
      }, [el('span', { html: ICONS.trophy() }), 'Prêmios']),
    ]),
  ]);
}

/* ─── FAIXA DE PROGRESSO ───────────────────────────────────────────────── */

function buildProgressStrip (profile) {
  const pct = Math.min(100, (profile.xp / (profile.level * 100)) * 100);

  return el('div', { class: 'liz-progress-strip' }, [
    el('div', { class: 'liz-progress-strip__level' }, ['Nv ' + profile.level]),
    el('div', { class: 'liz-progress-strip__bar' }, [
      el('div', { class: 'liz-progress-strip__label' }, [
        el('span', { style: { color: '#fff', fontWeight: 900 } }, ['Nível ' + profile.level]),
        el('span', { class: 'liz-progress-strip__sub' }, [profile.xp + ' / ' + (profile.level * 100) + ' XP']),
      ]),
      el('div', { class: 'liz-progress', style: { height: '10px' } }, [
        el('div', { class: 'liz-progress__fill', style: { width: pct + '%' } }),
      ]),
    ]),
    el('div', { class: 'liz-progress-strip__stats' }, [
      el('div', { class: 'liz-pill liz-pill--coins', style: { fontSize: '12px', padding: '6px 12px' } }, [
        el('span', { html: ICONS.coin() }), String(profile.coins),
      ]),
      el('div', { class: 'liz-pill liz-pill--stars', style: { fontSize: '12px', padding: '6px 12px' } }, [
        el('span', { html: ICONS.star() }), String(profile.stars),
      ]),
    ]),
  ]);
}

/* ─── CARROSSEL ─────────────────────────────────────────────────────────── */

function buildCarousel (title, games, profile, delayBase = 0) {
  const section = el('div', {
    class: 'liz-section',
    style: { animationDelay: delayBase + 's' },
  });

  section.appendChild(el('div', { class: 'liz-section__header' }, [
    el('h2', { class: 'liz-section__title' }, [title]),
    el('button', {
      class: 'liz-section__more',
      onClick: () => { Audio.click(); Router.navigate('library'); },
    }, ['Ver tudo →']),
  ]));

  const track = el('div', { class: 'liz-carousel__track' });
  games.forEach(g => track.appendChild(buildMiniCard(g, profile)));

  // Drag-to-scroll
  enableDragScroll(track);

  section.appendChild(track);
  return section;
}

function buildMiniCard (game, profile) {
  const progress = profile.gameProgress[game.id] || {};
  const stars   = progress.stars || 0;
  const played  = (progress.plays || 0) > 0;
  const locked  = profile.level < game.minLevel;
  const charSvg = (CHARACTERS[game.character] || CHARACTERS.lumi)();

  const card = el('div', { class: 'liz-mini-card' });

  card.appendChild(el('div', {
    class: 'liz-mini-card__art',
    style: { background: game.grad },
    html: charSvg,
  }));

  card.appendChild(el('div', { class: 'liz-mini-card__body' }, [
    el('div', { class: 'liz-mini-card__title' }, [game.title]),
    el('div', { class: 'liz-mini-card__meta' }, [
      el('div', { class: 'liz-mini-card__stars' }, [
        StarsRow(stars, 3),
      ]),
      el('button', {
        class: 'liz-mini-card__play liz-btn liz-btn--sm' + (locked ? '' : ' liz-btn--yellow'),
        onClick: (e) => {
          e.stopPropagation();
          if (locked) { Audio.wrong(); return; }
          Audio.click();
          Router.navigate('game', { gameId: game.id });
        },
      }, [locked ? el('span', { html: ICONS.lock() }) : (played ? 'Continuar' : 'Jogar')]),
    ]),
  ]));

  card.addEventListener('click', () => {
    if (locked) { Audio.wrong(); return; }
    Audio.click();
    Router.navigate('game', { gameId: game.id });
  });

  return card;
}

/* ─── MISSÕES DO DIA ────────────────────────────────────────────────────── */

function buildDailyGoals (profile) {
  const today = new Date().toDateString();
  const todayActs = (profile.activityLog || [])
    .filter(a => new Date(a.at).toDateString() === today);

  const gamesPlayed = todayActs.length;
  const starsToday  = todayActs.reduce((s, a) => s + (a.stars || 0), 0);
  // Coins from today approximate (not tracked separately, so use stars×10 heuristic)
  const coinsToday  = Math.min(starsToday * 12, 60);

  const goals = [
    {
      label: 'Complete 1 jogo hoje',
      icon: ICONS.play(), color: '#4F7CFF',
      current: gamesPlayed, target: 1,
    },
    {
      label: 'Ganhe 5 estrelas',
      icon: ICONS.star(), color: '#FFD23F',
      current: starsToday, target: 5,
    },
    {
      label: 'Ganhe 30 moedas',
      icon: ICONS.coin(), color: '#FF8A65',
      current: coinsToday, target: 30,
    },
  ];

  const allDone = goals.every(g => g.current >= g.target);
  const doneCount = goals.filter(g => g.current >= g.target).length;

  const card = el('div', { class: 'liz-goals-card' });

  card.appendChild(el('h2', { class: 'liz-goals-card__title' }, [
    el('span', { html: ICONS.target() }),
    'Missões do Dia',
    doneCount > 0 ? el('span', {
      style: { marginLeft: 'auto', fontSize: 'var(--fs-sm)', color: 'var(--liz-green-deep)', fontWeight: 900 }
    }, [doneCount + '/' + goals.length + ' concluídas']) : null,
  ]));

  goals.forEach(g => {
    const done = g.current >= g.target;
    const pct  = Math.min(100, (g.current / g.target) * 100);

    card.appendChild(el('div', { class: 'liz-goal-item' + (done ? ' liz-goal-item--done' : '') }, [
      el('div', { class: 'liz-goal-item__icon', style: { background: g.color + '22' }, html: `<svg viewBox="0 0 24 24" fill="${g.color}" width="22" height="22">${g.icon.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1] || ''}</svg>` }),
      el('div', { class: 'liz-goal-item__text' }, [
        el('div', { class: 'liz-goal-item__label' }, [g.label]),
        el('div', { class: 'liz-progress liz-goal-item__bar', style: { height: '6px' } }, [
          el('div', { class: 'liz-progress__fill', style: { width: pct + '%' } }),
        ]),
      ]),
      done
        ? el('div', { class: 'liz-goal-check' }, [el('span', { html: ICONS.check() })])
        : el('div', { class: 'liz-goal-item__count' }, [g.current + '/' + g.target]),
    ]));
  });

  if (allDone) {
    card.appendChild(el('div', {
      style: { textAlign: 'center', padding: 'var(--sp-4) 0 0', color: 'var(--liz-green-deep)', fontWeight: 900 }
    }, ['Todas as missões completas! Incrível!']));
  }

  return card;
}

/* ─── HELPERS ────────────────────────────────────────────────────────────── */

function getInProgressGames (profile) {
  return GAMES.filter(g => {
    const p = profile.gameProgress[g.id];
    return p && p.plays > 0 && p.stars < 3;
  }).slice(0, 6);
}

function getRecommended (profile) {
  const unlocked = GAMES.filter(g => profile.level >= g.minLevel);
  const notPlayed = unlocked.filter(g => !(profile.gameProgress[g.id]?.plays > 0));
  const toImprove = unlocked.filter(g => {
    const p = profile.gameProgress[g.id];
    return p && p.plays > 0 && p.stars < 3;
  });
  const combined = [...notPlayed.slice(0, 4), ...toImprove.slice(0, 2)];
  return combined.length > 0 ? combined : unlocked.slice(0, 6);
}

function enableDragScroll (el) {
  let isDown = false, startX = 0, scrollLeft = 0;
  el.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });
  el.addEventListener('mouseleave', () => { isDown = false; });
  el.addEventListener('mouseup',    () => { isDown = false; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
  });
}

function greetingText () {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function placeholder (msg) {
  return el('div', {
    style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#4527A0,#6A1B9A)', color: '#fff', fontWeight: '800', fontFamily: 'Fredoka, sans-serif' }
  }, [msg]);
}
