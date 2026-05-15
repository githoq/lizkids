/* =========================================================================
   LIZKIDS — BIBLIOTECA DE JOGOS (blindada)
   ========================================================================= */

import { el }        from '../core/utils.js';
import { Router }    from '../core/router.js';
import { Storage }   from '../core/storage.js';
import { Audio }     from '../core/audio.js';
import { Debug }     from '../core/error-overlay.js';
import { SkyStage, TopBar } from '../components/ui.js';
import { GAMES, CATEGORIES } from '../data/games-catalog.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

export const LibraryScreen = {
  mount () {
    Debug.log('Library', 'mount()');
    const profile = Storage.getActiveProfile();

    if (!profile) {
      Debug.warn('Library', 'Sem perfil — redirecionando');
      setTimeout(() => Router.navigate('profile-select'), 0);
      return placeholder('Redirecionando…');
    }

    const wrap = el('div');
    wrap.appendChild(SkyStage('day'));
    wrap.appendChild(TopBar({ showBack: true, onBack: () => Router.navigate('home') }));

    const root = el('div', { class: 'liz-library' });
    root.appendChild(el('div', { class: 'liz-library__header' }, [
      el('h1', { class: 'liz-library__title' }, ['Aventuras LizKids']),
      el('p',  { class: 'liz-library__subtitle' }, ['Escolha um jogo para começar — cada vitória te dá moedas!']),
    ]));

    let activeCat = 'all';
    const catsBar = el('div', { class: 'liz-library__categories' });
    CATEGORIES.forEach(cat => {
      const pill = el('button', {
        class: 'liz-cat-pill' + (cat.id === activeCat ? ' liz-cat-pill--active' : ''),
        onClick: () => {
          Audio.hover();
          activeCat = cat.id;
          catsBar.querySelectorAll('.liz-cat-pill').forEach(b => b.classList.remove('liz-cat-pill--active'));
          pill.classList.add('liz-cat-pill--active');
          renderGames();
        },
      }, [cat.label]);
      catsBar.appendChild(pill);
    });
    root.appendChild(catsBar);

    const grid = el('div', { class: 'liz-games-grid' });
    root.appendChild(grid);

    function renderGames () {
      grid.innerHTML = '';
      const list = GAMES.filter(g => activeCat === 'all' || g.category === activeCat);

      list.forEach((g, i) => {
        const locked = profile.level < g.minLevel;
        const stars  = profile.gameProgress[g.id]?.stars || 0;
        const charSvg = (CHARACTERS[g.character] || CHARACTERS.lumi)();

        const card = el('div', {
          class: 'liz-game-card',
          style: { animationDelay: (i * 50) + 'ms' },
          onClick: () => {
            if (locked) {
              Audio.wrong();
              card.animate(
                [{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
                { duration: 250 },
              );
              return;
            }
            Audio.click();
            Router.navigate('game', { gameId: g.id });
          },
        });

        card.appendChild(el('div', {
          class: 'liz-game-card__art',
          style: { background: g.grad },
          html: charSvg,
        }));
        card.appendChild(el('div', { class: 'liz-game-card__title' }, [g.title]));
        card.appendChild(el('div', { class: 't-caption', style: { color: 'var(--ink-soft)' } }, [g.desc]));

        const meta = el('div', { class: 'liz-game-card__meta' }, [
          el('span', {
            class: 'liz-game-card__badge',
            style: { background: g.color + '22', color: g.color },
          }, [(CATEGORIES.find(c => c.id === g.category)?.label || '').toUpperCase()]),
          el('div', { class: 'liz-stars' }, Array.from({ length: 3 }, (_, idx) =>
            el('span', {
              class: 'liz-stars__item' + (idx < stars ? ' liz-stars__item--on' : ''),
              html: ICONS.star(),
              style: { width: '20px', height: '20px' },
            })
          )),
        ]);
        card.appendChild(meta);

        if (locked) {
          card.appendChild(el('div', { class: 'liz-game-card__lock' }, [
            el('span', { html: ICONS.lock() }),
            el('div', { class: 't-eyebrow', style: { color: '#fff' } }, ['Nível ' + g.minLevel]),
          ]));
        }

        grid.appendChild(card);
      });
    }

    renderGames();
    wrap.appendChild(root);
    Debug.log('Library', 'mount() concluído');
    return wrap;
  },
  unmount () { Debug.log('Library', 'unmount()'); },
};

function placeholder (msg) {
  return el('div', {
    style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#4527A0,#6A1B9A)', color: '#fff', fontWeight: '800', fontFamily: 'Fredoka, sans-serif' }
  }, [msg]);
}
