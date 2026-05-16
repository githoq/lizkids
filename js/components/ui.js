/* =========================================================================
   LIZKIDS — COMPONENTES UI PREMIUM
   ========================================================================= */

import { el }       from '../core/utils.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Router }   from '../core/router.js';
import { Particles } from '../core/particles.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

/* ----- LOGO ----- */
export function Logo (dark = false) {
  return el('div', { class: 'liz-logo' }, [
    el('div', { class: 'liz-logo__mark', html: CHARACTERS.lumi() }),
    el('div', { class: 'liz-logo__text' + (dark ? ' liz-logo__text--dark' : '') }, ['LizKids']),
  ]);
}

/* ----- CENÁRIO MÁGICO (SkyStage) ----- */
export function SkyStage (variant = 'day') {
  const sky = el('div', { class: 'liz-sky' + (variant === 'night' ? ' liz-sky--night' : '') });
  const sun = variant === 'day' ? el('div', { class: 'liz-sun' }) : null;
  const clouds = el('div', { class: 'liz-clouds' }, [
    el('div', { class: 'liz-cloud liz-cloud--1' }),
    el('div', { class: 'liz-cloud liz-cloud--2' }),
  ]);
  const hills = el('div', { class: 'liz-hills' }, [
    el('div', { class: 'liz-hill liz-hill--back' }),
    el('div', { class: 'liz-hill liz-hill--mid' }),
    el('div', { class: 'liz-hill liz-hill--front' }),
  ]);
  const wrap = el('div', { style: { position: 'absolute', inset: '0', zIndex: '0' } });
  wrap.appendChild(sky);
  if (sun) wrap.appendChild(sun);
  wrap.appendChild(clouds);
  wrap.appendChild(hills);

  // Lazy import para não bloquear se particles não estiver disponível
  import('./particles.js').then(({ Particles }) => {
    Particles.ambientSparkles(wrap, 8);
  }).catch(() => {});

  return wrap;
}

/* ----- TOPBAR PREMIUM ----- */
export function TopBar ({ showBack = false, onBack = null } = {}) {
  const profile = Storage.getActiveProfile();

  const left = el('div', { class: 'liz-topbar__left' });
  if (showBack) {
    left.appendChild(el('button', {
      class: 'liz-back',
      onClick: () => { Audio.click(); (onBack || (() => Router.back()))(); },
    }, [el('span', { html: ICONS.back() }), 'Voltar']));
  } else {
    left.appendChild(Logo());
  }

  const right = el('div', { class: 'liz-topbar__right' });

  // ─── Botão de Mute/Unmute (global) ───
  const muteIcon = () => Audio.isMuted() ? ICONS.musicOff() : ICONS.music();
  const muteBtn  = el('button', {
    class: 'liz-mute-btn' + (Audio.isMuted() ? ' liz-mute-btn--off' : ''),
    html:  muteIcon(),
    title: Audio.isMuted() ? 'Ligar som' : 'Desligar som',
  });
  muteBtn.addEventListener('click', () => {
    const on = Audio.toggleAll();
    muteBtn.className = 'liz-mute-btn' + (on ? '' : ' liz-mute-btn--off');
    muteBtn.innerHTML = on ? ICONS.music() : ICONS.musicOff();
    muteBtn.title     = on ? 'Desligar som' : 'Ligar som';
    // Animação de feedback
    muteBtn.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.35)' },
      { transform: 'scale(1)' },
    ], { duration: 280, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
  });
  right.appendChild(muteBtn);

  if (profile) {
    right.appendChild(el('div', { class: 'liz-pill liz-pill--coins' }, [
      el('span', { html: ICONS.coin() }),
      el('span', {}, [String(profile.coins)]),
    ]));
    right.appendChild(el('div', { class: 'liz-pill liz-pill--stars' }, [
      el('span', { html: ICONS.star() }),
      el('span', {}, [String(profile.stars)]),
    ]));
    right.appendChild(el('div', { class: 'liz-pill liz-pill--xp' }, [
      el('span', { html: ICONS.flame() }),
      el('span', {}, ['Nv ' + profile.level]),
    ]));

    const profCard = el('button', {
      class: 'liz-topbar__profile',
      onClick: () => { Audio.click(); Router.navigate('profile-select'); },
    }, [
      el('div', {
        class: 'liz-topbar__profile-avatar',
        html: (CHARACTERS[profile.avatarId] || CHARACTERS.lumi)(),
      }),
      el('div', {}, [
        el('div', { class: 'liz-topbar__profile-name' }, [profile.name]),
        el('div', { class: 'liz-topbar__profile-level' }, ['Nível ' + profile.level]),
      ]),
    ]);
    right.appendChild(profCard);
  }

  return el('header', { class: 'liz-topbar' }, [left, right]);
}

/* ----- BARRA DE XP ----- */
export function XpBar () {
  const p = Storage.getActiveProfile();
  if (!p) return el('div');
  const pct = Math.min(100, (p.xp / (p.level * 100)) * 100);
  return el('div', { class: 'liz-progress', style: { minWidth: '180px' } }, [
    el('div', { class: 'liz-progress__fill', style: { width: pct + '%' } }),
  ]);
}

/* ----- ESTRELAS ----- */
export function StarsRow (active = 0, total = 3) {
  const wrap = el('div', { class: 'liz-stars' });
  for (let i = 0; i < total; i++) {
    wrap.appendChild(el('span', {
      class: 'liz-stars__item' + (i < active ? ' liz-stars__item--on' : ''),
      html: ICONS.star(),
      style: { animationDelay: (i * 140) + 'ms', width: '24px', height: '24px' },
    }));
  }
  return wrap;
}

/* ----- MODAL DE RESULTADO (cinematográfico) ----- */
export function ResultModal ({ stars, coins, xp, gems = 0, onPlayAgain, onExit, title, message, nextLevel, gameId, level }) {
  const profile = Storage.getActiveProfile();

  setTimeout(() => Particles.confetti(stars >= 3 ? 60 : 36), 50);
  setTimeout(() => Audio.victory(), 80);

  const starsEl = el('div', { class: 'liz-result__stars' });
  for (let i = 0; i < 3; i++) {
    starsEl.appendChild(el('span', {
      class: 'liz-stars__item' + (i < stars ? ' liz-stars__item--on' : ''),
      html: ICONS.star(),
      style: { width: '48px', height: '48px', animationDelay: (i * 200 + 400) + 'ms' },
    }));
  }

  const mascotHtml = (CHARACTERS[profile?.avatarId] || CHARACTERS.lumi)();

  /* Botão próximo nível */
  const actions = el('div', { class: 'liz-result__actions' });
  if (nextLevel && gameId && stars >= 1) {
    actions.appendChild(el('button', {
      class: 'liz-next-level-btn',
      onClick: () => { Audio.click(); host.remove(); Router.navigate('game', { gameId, level: nextLevel }); },
    }, [el('span', { html: ICONS.bolt() }), `Nível ${nextLevel}!`]));
  }
  actions.appendChild(el('button', {
    class: 'liz-btn liz-btn--green',
    onClick: () => { Audio.click(); host.remove(); onPlayAgain?.(); },
  }, ['Repetir']));
  actions.appendChild(el('button', {
    class: 'liz-btn liz-btn--lilac',
    onClick: () => { Audio.click(); host.remove(); onExit?.(); },
  }, ['Níveis']));

  const panel = el('div', { class: 'liz-result__panel' }, [
    el('div', { class: 'liz-result__mascot', html: mascotHtml }),
    el('div', { class: 'liz-result__title' }, [title || (stars >= 3 ? 'Incrível!' : 'Muito bem!')]),
    el('div', { class: 'liz-result__msg' }, [message || '']),
    starsEl,
    el('div', { class: 'liz-result__rewards' }, [
      el('div', { class: 'liz-pill liz-pill--coins' }, [el('span', { html: ICONS.coin() }), '+' + (coins || 0)]),
      el('div', { class: 'liz-pill liz-pill--xp'   }, [el('span', { html: ICONS.flame() }), '+' + (xp || 0) + ' XP']),
      ...(gems > 0 ? [el('div', { class: 'liz-pill liz-pill--gems' }, [el('span', { html: ICONS.gem() }), '+' + gems])] : []),
    ]),
    actions,
  ]);

  const host = el('div', { class: 'liz-result' }, [panel]);
  document.body.appendChild(host);
  return host;
}
