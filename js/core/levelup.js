/* =========================================================================
   LIZKIDS — LEVEL UP OVERLAY (épico)
   ========================================================================= */

import { el }       from './utils.js';
import { Audio }    from './audio.js';
import { Particles } from './particles.js';
import { CHARACTERS, ICONS } from '../data/characters.js';
import { Storage }  from './storage.js';

let active = false;

/** Exibe o overlay épico de Level Up.
 *  @param {number} newLevel — nível alcançado
 */
export function showLevelUp (newLevel) {
  if (active) return;
  active = true;

  const profile = Storage.getActiveProfile();
  const mascotHtml = (CHARACTERS[profile?.avatarId] || CHARACTERS.lumi)();

  // Rayos de luz atrás do mascote
  const burst = el('div', { class: 'liz-levelup__burst' });
  const RAY_COUNT = 14;
  for (let i = 0; i < RAY_COUNT; i++) {
    const ray = el('div', { class: 'liz-levelup__ray' });
    const angle = (360 / RAY_COUNT) * i;
    const height = 80 + Math.random() * 120;
    ray.style.cssText = `
      height: ${height}px;
      transform: translateX(-50%) rotate(${angle}deg) translateY(-${height}px);
      opacity: 0;
      animation: lizLevelRay 1.8s ease-in-out ${i * 60}ms forwards;
    `;
    burst.appendChild(ray);
  }

  const overlay = el('div', { class: 'liz-levelup' }, [
    burst,
    el('div', { class: 'liz-levelup__mascot', html: mascotHtml }),
    el('div', { class: 'liz-levelup__title' }, ['Subiu de Nível!']),
    el('div', { class: 'liz-levelup__level' }, [String(newLevel)]),
    el('div', { class: 'liz-levelup__sub' }, [
      'Parabéns! Você ficou mais inteligente!',
    ]),
    el('button', {
      class: 'liz-btn liz-btn--yellow liz-btn--lg liz-levelup__close',
      onClick: close,
    }, [el('span', { html: ICONS.star() }), 'Continuar']),
  ]);

  // CSS do raio via <style> inserida uma vez
  ensureLevelUpCSS();

  document.body.appendChild(overlay);

  // Efeitos
  setTimeout(() => { Particles.confetti(60); Audio.levelUp(); }, 80);

  // Auto-fechar em 5s
  const autoClose = setTimeout(close, 5000);

  function close () {
    clearTimeout(autoClose);
    overlay.style.transition = 'opacity 400ms ease';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.remove(); active = false; }, 420);
  }
}

function ensureLevelUpCSS () {
  if (document.getElementById('liz-levelup-css')) return;
  const style = document.createElement('style');
  style.id = 'liz-levelup-css';
  style.textContent = `
    @keyframes lizLevelRay {
      0%   { opacity: 0; transform: translateX(-50%) rotate(var(--r, 0deg)) translateY(0); }
      30%  { opacity: 0.8; }
      70%  { opacity: 0.6; }
      100% { opacity: 0; transform: translateX(-50%) rotate(var(--r, 0deg)) translateY(-160px); }
    }
    .liz-levelup__ray {
      position: absolute; top: 50%; left: 50%;
      width: 4px; background: linear-gradient(to top, rgba(255,210,63,0.95), transparent);
      border-radius: 2px; transform-origin: 50% 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/** Integração com Bus de eventos.
 *  Chamar uma vez no bootstrap para reagir a level-ups.
 */
export function initLevelUpListener () {
  import('./state.js').then(({ Bus }) => {
    Bus.on('profile:levelup', ({ level }) => showLevelUp(level));
  });
}
