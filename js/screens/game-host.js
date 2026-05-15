/* =========================================================================
   LIZKIDS — TELA HOST DE JOGOS (blindada)
   Despacha para o jogo correto com try/catch e fallback.
   ========================================================================= */

import { el }     from '../core/utils.js';
import { Router } from '../core/router.js';
import { Storage } from '../core/storage.js';
import { Debug }  from '../core/error-overlay.js';
import { GAMES }  from '../data/games-catalog.js';
import { ICONS } from '../data/characters.js';

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

// Sanity check em tempo de carregamento — TODOS os jogos do REGISTRY
// devem exportar mount() e unmount().
for (const [id, impl] of Object.entries(REGISTRY)) {
  if (!impl || typeof impl.mount !== 'function') {
    Debug.error('GameHost', `Jogo "${id}" não exporta mount() — REGISTRY inválido.`);
  }
  if (impl && typeof impl.unmount !== 'function') {
    Debug.warn('GameHost', `Jogo "${id}" sem unmount() — pode vazar recursos.`);
  }
}

export const GameHostScreen = {
  currentGame: null,
  currentGameId: null,

  mount (params) {
    Debug.log('GameHost', `mount() solicitado para "${params?.gameId}"`);

    // Guard: perfil necessário
    const profile = Storage.getActiveProfile();
    if (!profile) {
      Debug.warn('GameHost', 'Sem perfil — redirecionando');
      setTimeout(() => Router.navigate('profile-select'), 0);
      return placeholder('Redirecionando…');
    }

    const gameDef = GAMES.find(g => g.id === params?.gameId);
    if (!gameDef) {
      Debug.error('GameHost', `Jogo "${params?.gameId}" não encontrado no catálogo.`);
      setTimeout(() => Router.navigate('library'), 0);
      return placeholder('Voltando à biblioteca…');
    }

    const impl = REGISTRY[gameDef.id];

    // Fallback "em breve" para jogos não codificados
    if (!impl) {
      Debug.log('GameHost', `Jogo "${gameDef.id}" sem implementação. Tela "em breve".`);
      return comingSoonScreen(gameDef);
    }

    // Montar o jogo de verdade — protegido contra exceções
    try {
      this.currentGame = impl;
      this.currentGameId = gameDef.id;
      const node = impl.mount(gameDef);
      if (!node) throw new Error(`mount() de "${gameDef.id}" retornou null/undefined`);
      Debug.log('GameHost', `✓ Jogo "${gameDef.id}" montado`);
      return node;
    } catch (e) {
      Debug.error('GameHost', `Falha ao montar "${gameDef.id}":`, e);
      // Re-lançar pro router exibir o overlay
      throw e;
    }
  },

  unmount () {
    if (this.currentGame) {
      try {
        this.currentGame.unmount?.();
        Debug.log('GameHost', `Unmount: ${this.currentGameId}`);
      } catch (e) {
        Debug.warn('GameHost', `Erro no unmount de ${this.currentGameId}:`, e);
      }
    }
    this.currentGame = null;
    this.currentGameId = null;
  },
};

function comingSoonScreen (gameDef) {
  return el('div', {
    style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gameDef.grad, padding: '20px' }
  }, [
    el('div', { class: 'liz-card', style: { textAlign: 'center', maxWidth: '460px' } }, [
      el('h2', { class: 't-display-md', style: { marginBottom: '12px' } }, ['Em breve!']),
      el('p', { style: { marginBottom: '20px', color: 'var(--ink-soft)' } }, [
        `O jogo "${gameDef.title}" está sendo preparado pela equipe LizKids.`,
      ]),
      el('button', {
        class: 'liz-btn liz-btn--lilac liz-btn--sm',
        onClick: () => Router.navigate('library'),
      }, [el('span', { html: ICONS.back() }), 'Voltar à Biblioteca']),
    ]),
  ]);
}

function placeholder (msg) {
  return el('div', {
    style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#4527A0,#6A1B9A)', color: '#fff', fontWeight: '800', fontFamily: 'Fredoka, sans-serif' }
  }, [msg]);
}
