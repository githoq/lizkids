/* =========================================================================
   LIZKIDS — LOJA DE RECOMPENSAS (blindada)
   ========================================================================= */

import { el, showToast } from '../core/utils.js';
import { Router }    from '../core/router.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Debug }     from '../core/error-overlay.js';
import { SkyStage, TopBar } from '../components/ui.js';
import { SHOP_ITEMS } from '../data/games-catalog.js';
import { CHARACTERS, ICONS } from '../data/characters.js';
import { Particles } from '../core/particles.js';

export const ShopScreen = {
  mount () {
    Debug.log('Shop', 'mount()');
    const profile = Storage.getActiveProfile();

    if (!profile) {
      Debug.warn('Shop', 'Sem perfil — redirecionando');
      setTimeout(() => Router.navigate('profile-select'), 0);
      return placeholder('Redirecionando…');
    }

    const wrap = el('div');
    wrap.appendChild(SkyStage('night'));
    wrap.appendChild(TopBar({ showBack: true, onBack: () => Router.navigate('home') }));

    const root = el('div', { class: 'liz-shop' });

    root.appendChild(el('h1', { class: 'liz-shop__title' }, ['Loja de Prêmios']));
    root.appendChild(el('div', { class: 'liz-shop__balance' }, [
      el('div', { class: 'liz-pill liz-pill--coins' }, [el('span', { html: ICONS.coin() }), String(profile.coins) + ' moedas']),
      el('div', { class: 'liz-pill liz-pill--gems' },  [el('span', { html: ICONS.gem()  }), String(profile.gems)  + ' gemas']),
    ]));

    const grid = el('div', { class: 'liz-shop__grid' });

    SHOP_ITEMS.forEach((item, i) => {
      const owned = profile.ownedShopItems.includes(item.id);

      const artBg = {
        character: 'linear-gradient(135deg, #FFE894, #FF7BB5)',
        badge:     'linear-gradient(135deg, #DCC2FF, #B57BFF)',
        theme:     'linear-gradient(135deg, #A3BFFF, #4F7CFF)',
      }[item.type] || 'linear-gradient(135deg,#FFE894,#FF7BB5)';

      let artHtml = '';
      if (item.type === 'character' && CHARACTERS[item.art]) {
        artHtml = CHARACTERS[item.art]();
      } else if (ICONS[item.art]) {
        artHtml = `<div style="color:#fff;width:60%;height:60%;display:flex;align-items:center;justify-content:center;">${ICONS[item.art]()}</div>`;
      }

      const card = el('div', {
        class: 'liz-shop-item',
        style: { animationDelay: (i * 60) + 'ms' },
      }, [
        owned ? el('span', { class: 'liz-shop-item__owned' }, ['ADQUIRIDO']) : null,
        el('div', { class: 'liz-shop-item__art', style: { background: artBg }, html: artHtml }),
        el('div', { class: 'liz-shop-item__name' }, [item.name]),
        el('div', { class: 'liz-shop-item__price' }, [
          el('span', { html: ICONS.coin() }), String(item.price),
        ]),
      ]);

      if (!owned) {
        card.addEventListener('click', () => {
          const result = Storage.purchaseShopItem(profile.id, item);
          if (result.ok) {
            Audio.coin();
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 24);
            showToast(`${item.name} desbloqueado!`);
            Router.navigate('shop'); // re-render
          } else if (result.reason === 'no_coins') {
            Audio.wrong();
            showToast('Você precisa de mais moedas. Jogue mais!');
          } else if (result.reason === 'owned') {
            Audio.click();
          }
        });
      }

      grid.appendChild(card);
    });

    root.appendChild(grid);
    wrap.appendChild(root);
    Debug.log('Shop', 'mount() concluído');
    return wrap;
  },
  unmount () { Debug.log('Shop', 'unmount()'); },
};

function placeholder (msg) {
  return el('div', {
    style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#4527A0,#6A1B9A)', color: '#fff', fontWeight: '800', fontFamily: 'Fredoka, sans-serif' }
  }, [msg]);
}
