/* =========================================================================
   LIZKIDS — COMPONENTES UI REUTILIZÁVEIS
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
    el('div', { class: 'liz-logo__text' + (dark ? ' liz-logo__text--dark' : ''), html: 'LizKids' }),
  ]);
}

/* ----- CENÁRIO MÁGICO ----- */
export function SkyStage (variant = 'day') {
  const sky = el('div', { class: 'liz-sky' + (variant === 'night' ? ' liz-sky--night' : '') });
  const sun = variant === 'day' ? el('div', { class: 'liz-sun' }) : null;

  // 2 nuvens apenas (performance)
  const clouds = el('div', { class: 'liz-clouds' }, [
    el('div', { class: 'liz-cloud liz-cloud--1' }),
    el('div', { class: 'liz-cloud liz-cloud--2' }),
  ]);
  const hills = el('div', { class: 'liz-hills' }, [
    el('div', { class: 'liz-hill liz-hill--back' }),
    el('div', { class: 'liz-hill liz-hill--mid' }),
    el('div', { class: 'liz-hill liz-hill--front' }),
  ]);
  const wrap = el('div', { class: 'liz-stage-bg', style: { position: 'absolute', inset: '0', zIndex: '0' } });
  wrap.appendChild(sky);
  if (sun) wrap.appendChild(sun);
  wrap.appendChild(clouds);
  wrap.appendChild(hills);
  // 8 sparkles (era 14–24)
  Particles.ambientSparkles(wrap, 8);
  return wrap;
}

/* ----- TOPBAR com perfil + moedas/estrelas ----- */
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

  if (profile) {
    // Pills de stats
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

    // Card do perfil
    const profCard = el('button', {
      class: 'liz-topbar__profile',
      onClick: () => { Audio.click(); Router.navigate('profile-select'); },
    }, [
      el('div', { class: 'liz-topbar__profile-avatar', html: CHARACTERS[profile.avatarId]?.() || CHARACTERS.lumi() }),
      el('div', {}, [
        el('div', { class: 'liz-topbar__profile-name' }, [profile.name]),
        el('div', { class: 'liz-topbar__profile-level' }, ['Nível ' + profile.level]),
      ]),
    ]);
    right.appendChild(profCard);
  }

  return el('header', { class: 'liz-topbar' }, [left, right]);
}

/* ----- BARRA DE PROGRESSO XP DO ALUNO ----- */
export function XpBar () {
  const p = Storage.getActiveProfile();
  if (!p) return el('div');
  const pct = Math.min(100, (p.xp / (p.level * 100)) * 100);
  return el('div', { class: 'liz-progress', style: { minWidth: '180px' } }, [
    el('div', { class: 'liz-progress__fill', style: { width: pct + '%' } }),
  ]);
}

/* ----- ESTRELAS (1 a 3) ----- */
export function StarsRow (active = 0, total = 3) {
  const wrap = el('div', { class: 'liz-stars' });
  for (let i = 0; i < total; i++) {
    wrap.appendChild(el('span', {
      class: 'liz-stars__item' + (i < active ? ' liz-stars__item--on' : ''),
      html: ICONS.star(),
      style: { animationDelay: (i * 200) + 'ms' },
    }));
  }
  return wrap;
}

/* ----- MODAL DE RESULTADO DE JOGO ----- */
export function ResultModal ({ stars, coins, xp, gems = 0, onPlayAgain, onExit, title, message }) {
  const profile = Storage.getActiveProfile();

  Particles.confetti(80);
  Audio.victory();

  const panel = el('div', { class: 'liz-result__panel' }, [
    el('div', { class: 'liz-result__mascot', html: CHARACTERS[profile?.avatarId] ? CHARACTERS[profile.avatarId]() : CHARACTERS.lumi() }),
    el('div', { class: 'liz-result__title' }, [title || 'Parabéns!']),
    el('div', { class: 'liz-result__msg' }, [message || 'Você mandou muito bem!']),
    el('div', { class: 'liz-result__stars' }, [StarsRow(stars, 3)]),
    el('div', { class: 'liz-result__rewards' }, [
      el('div', { class: 'liz-pill liz-pill--coins' }, [el('span', { html: ICONS.coin() }), '+' + (coins || 0)]),
      el('div', { class: 'liz-pill liz-pill--xp' }, [el('span', { html: ICONS.flame() }), '+' + (xp || 0) + ' XP']),
      ...(gems ? [el('div', { class: 'liz-pill liz-pill--gems' }, [el('span', { html: ICONS.gem() }), '+' + gems])] : []),
    ]),
    el('div', { class: 'liz-result__actions' }, [
      el('button', {
        class: 'liz-btn liz-btn--green',
        onClick: () => { Audio.click(); host.remove(); onPlayAgain?.(); },
      }, ['Jogar de Novo']),
      el('button', {
        class: 'liz-btn liz-btn--lilac',
        onClick: () => { Audio.click(); host.remove(); onExit?.(); },
      }, ['Voltar']),
    ]),
  ]);

  const host = el('div', { class: 'liz-result' }, [panel]);
  document.body.appendChild(host);

  return host;
}
