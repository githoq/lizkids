/* =========================================================================
   LIZKIDS — GAME HOST com Level Select integrado
   ========================================================================= */

import { el }     from '../core/utils.js';
import { Router } from '../core/router.js';
import { Storage } from '../core/storage.js';
import { Debug }  from '../core/error-overlay.js';
import { GAMES }  from '../data/games-catalog.js';
import { ICONS }  from '../data/characters.js';
import { buildLevelSelect } from '../core/game-engine.js';

import { MemoryGame }   from '../games/memory.js';
import { MathGame }     from '../games/math.js';
import { SequenceGame } from '../games/sequence.js';
import { CountGame }    from '../games/count.js';
import { CompareGame }  from '../games/compare.js';
import { ShapesGame }   from '../games/shapes.js';

const REGISTRY = {
  'memory-match':    MemoryGame,
  'math-adventure':  MathGame,
  'sequence-logic':  SequenceGame,
  'count-objects':   CountGame,
  'compare-numbers': CompareGame,
  'shapes-colors':   ShapesGame,
};

export const GameHostScreen = {
  currentGame: null,

  mount (params) {
    const profile = Storage.getActiveProfile();
    if (!profile) { setTimeout(() => Router.navigate('profile-select'), 0); return placeholder(); }

    const gameDef = GAMES.find(g => g.id === params?.gameId);
    if (!gameDef) { setTimeout(() => Router.navigate('library'), 0); return placeholder(); }

    const impl = REGISTRY[gameDef.id];

    /* Sem nível → mostrar level select */
    if (!params?.level) {
      if (!impl) return comingSoon(gameDef);

      return buildLevelSelect({
        gameDef, profile,
        onSelect: (level) => Router.navigate('game', { gameId: gameDef.id, level }),
      });
    }

    /* Com nível → montar o jogo */
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

/* Helpers */
function placeholder () {
  return el('div', { style: { position: 'absolute', inset: '0', background: 'var(--bg-deep-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Fredoka, sans-serif', fontWeight: '800' } }, ['Carregando…']);
}

function comingSoon (gameDef) {
  return el('div', { style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gameDef.grad, padding: '20px' } }, [
    el('div', { class: 'liz-card', style: { textAlign: 'center', maxWidth: '460px' } }, [
      el('h2', { class: 't-display-md', style: { marginBottom: '12px' } }, ['Em breve!']),
      el('p', { style: { marginBottom: '20px', color: 'var(--ink-soft)' } }, [`"${gameDef.title}" está sendo preparado.`]),
      el('button', { class: 'liz-btn liz-btn--lilac liz-btn--sm', onClick: () => Router.navigate('library') },
        [el('span', { html: ICONS.back() }), 'Voltar']),
    ]),
  ]);
}
