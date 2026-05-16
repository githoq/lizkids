/* =========================================================================
   LIZKIDS — GAME HOST (5 jogos premium)
   ========================================================================= */
import { el }      from '../core/utils.js';
import { Router }  from '../core/router.js';
import { Storage } from '../core/storage.js';
import { Debug }   from '../core/error-overlay.js';
import { GAMES }   from '../data/games-catalog.js';
import { ICONS }   from '../data/characters.js';
import { buildLevelSelect } from '../core/game-engine.js';

import { MathAdventureGame } from '../games/math.js';
import { MagicWordsGame    } from '../games/words.js';
import { MemoryMagicGame   } from '../games/memory.js';
import { LogicSequenceGame } from '../games/sequence.js';
import { ShapesSortGame    } from '../games/shapes.js';

const REGISTRY = {
  'math-adventure': MathAdventureGame,
  'magic-words':    MagicWordsGame,
  'memory-magic':   MemoryMagicGame,
  'logic-sequence': LogicSequenceGame,
  'shapes-sort':    ShapesSortGame,
};

/* Validação em carga */
for (const [id, impl] of Object.entries(REGISTRY)) {
  if (!impl?.mount) Debug.error('GameHost', `"${id}" sem mount()`);
}

export const GameHostScreen = {
  currentGame: null,
  mount (params) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return ph(); }

    const gameDef = GAMES.find(g => g.id === params?.gameId);
    if (!gameDef) { setTimeout(() => Router.navigate('library'), 0); return ph(); }

    const impl = REGISTRY[gameDef.id];

    /* Sem nível → level select */
    if (!params?.level) {
      if (!impl) return comingSoon(gameDef);
      return buildLevelSelect({
        gameDef, profile,
        onSelect: (level) => Router.navigate('game', { gameId: gameDef.id, level }),
      });
    }

    if (!impl) return comingSoon(gameDef);

    try {
      this.currentGame = impl;
      const node = impl.mount({ ...gameDef, level: Number(params.level) });
      if (!node) throw new Error('mount retornou null');
      Debug.log('GameHost', `✓ ${gameDef.id} nível ${params.level}`);
      return node;
    } catch (e) {
      Debug.error('GameHost', e);
      throw e;
    }
  },
  unmount () {
    try { this.currentGame?.unmount?.(); } catch {}
    this.currentGame = null;
  },
};

function comingSoon (gameDef) {
  return el('div', { style: { position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',background:gameDef.grad,padding:'20px' } }, [
    el('div', { class: 'liz-card', style: { textAlign:'center', maxWidth:'460px' } }, [
      el('h2', { class: 't-display-md', style: { marginBottom:'12px' } }, ['Em breve!']),
      el('button', { class: 'liz-btn liz-btn--lilac liz-btn--sm', onClick: () => Router.navigate('library') },
        [el('span', { html: ICONS.back() }), 'Voltar']),
    ]),
  ]);
}
function ph () { return el('div', { style: { position:'absolute',inset:'0',background:'var(--bg-deep-1)' } }); }
