/* =========================================================================
   LIZKIDS — HOME (cinematográfica)
   Versão blindada: nunca chama Router.navigate dentro de mount.
   ========================================================================= */

import { el }       from '../core/utils.js';
import { Router }   from '../core/router.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { Debug }    from '../core/error-overlay.js';
import { SkyStage, TopBar, XpBar } from '../components/ui.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

export const HomeScreen = {
  mount () {
    Debug.log('Home', 'mount() iniciado');
    const profile = Storage.getActiveProfile();

    // Guard: sem perfil ativo, deferir navegação e retornar placeholder.
    // NÃO chamar Router.navigate aqui sincronamente — anti-pattern.
    if (!profile) {
      Debug.warn('Home', 'Sem perfil ativo — agendando redirect para profile-select');
      setTimeout(() => Router.navigate('profile-select'), 0);
      return redirectPlaceholder('Redirecionando…');
    }

    Debug.log('Home', `Renderizando home para: ${profile.name} (${profile.avatarId})`);

    const wrap = el('div', { class: 'liz-home' });

    // Cada bloco em try/catch isolado pra não derrubar a tela inteira por um erro pontual
    safeAppend(wrap, () => SkyStage('day'), 'SkyStage');
    safeAppend(wrap, () => TopBar(),        'TopBar');

    const stage = el('div', { class: 'liz-home__stage' });

    stage.appendChild(el('div', { class: 'liz-home__welcome' }, ['Oi, ' + greeting() + '!']));
    stage.appendChild(el('div', { class: 'liz-home__name' }, [profile.name]));

    const charSvg = (CHARACTERS[profile.avatarId] || CHARACTERS.lumi)();
    const mascot = el('div', { class: 'liz-home__mascot', html: charSvg });
    mascot.addEventListener('click', () => {
      Audio.pop();
      mascot.classList.remove('anim-hop');
      void mascot.offsetWidth;
      mascot.classList.add('anim-hop');
    });
    stage.appendChild(mascot);

    const actions = el('div', { class: 'liz-home__actions' }, [
      el('button', {
        class: 'liz-btn liz-btn--yellow liz-btn--lg',
        onClick: () => { Audio.click(); Router.navigate('library'); },
      }, [el('span', { html: ICONS.play() }), 'Começar a jogar']),
      el('button', {
        class: 'liz-btn liz-btn--pink',
        onClick: () => { Audio.click(); Router.navigate('shop'); },
      }, [el('span', { html: ICONS.trophy() }), 'Loja de Prêmios']),
    ]);
    stage.appendChild(actions);

    wrap.appendChild(stage);

    // HUD inferior
    const hud = el('div', { class: 'liz-home__hud' }, [
      el('div', { class: 'liz-glass', style: { padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' } }, [
        el('span', { class: 't-eyebrow', style: { color: '#fff' } }, ['XP nv ' + profile.level]),
        XpBar(),
        el('span', { class: 't-caption', style: { color: '#fff', fontWeight: 800 } }, [profile.xp + ' / ' + (profile.level * 100)]),
      ]),
    ]);
    wrap.appendChild(hud);

    Debug.log('Home', 'mount() concluído com sucesso');
    return wrap;
  },
  unmount () {
    Debug.log('Home', 'unmount()');
  },
};

/* ----- Helpers ----- */
function safeAppend (parent, factory, label) {
  try {
    const node = factory();
    if (node) parent.appendChild(node);
  } catch (e) {
    Debug.error('Home', `Erro ao montar ${label}:`, e);
    // não interromper
  }
}

function redirectPlaceholder (msg) {
  return el('div', {
    style: {
      position: 'absolute', inset: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg,#4527A0,#6A1B9A)',
      color: '#fff', fontWeight: '800', fontSize: '18px',
      fontFamily: 'Fredoka, sans-serif',
    }
  }, [msg]);
}

function greeting () {
  const h = new Date().getHours();
  if (h < 12) return 'bom dia';
  if (h < 18) return 'boa tarde';
  return 'boa noite';
}
