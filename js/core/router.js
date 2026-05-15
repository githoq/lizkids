/* =========================================================================
   LIZKIDS — ROUTER COM CROSSFADE CINEMATOGRÁFICO
   - Tela antiga fade-out + nova fade-in SIMULTÂNEOS (zero flash do body)
   - Fila contra navegações concorrentes
   - takeoverBootSplash() para integrar o splash inline do HTML
   ========================================================================= */

import { State, Bus } from './state.js';
import { Debug, showErrorOverlay } from './error-overlay.js';

const TRANSITION_MS = 320;

class ScreenRouter {
  constructor () {
    this.screens = new Map();
    this.host    = null;
    this.current = null;
    this.params  = {};
    this._navigating = false;
    this._queue = [];
    this._bootSplashActive = false;
  }

  init (hostEl) {
    this.host = hostEl;
    // Detectar splash inline pré-existente (do index.html)
    const bootSplash = document.getElementById('liz-boot-splash');
    if (bootSplash) {
      this._bootSplashActive = true;
      Debug.log('Router', 'Splash inline detectado — aguardando takeover');
    }
    Debug.log('Router', 'Inicializado');
  }

  register (id, screen) {
    if (!screen || typeof screen.mount !== 'function') {
      Debug.error('Router', `Tela "${id}" sem mount() — ignorada.`);
      return;
    }
    this.screens.set(id, screen);
  }

  /** Marca o splash inline como "tela atual" para que o crossfade
   *  funcione corretamente na primeira navegação. */
  takeoverBootSplash () {
    if (!this._bootSplashActive) return;
    const bootSplash = document.getElementById('liz-boot-splash');
    if (bootSplash) {
      bootSplash.classList.add('liz-screen', 'liz-screen--active');
    }
    this.current = '__boot__';
    this._bootSplashActive = false;
  }

  /** API pública: agenda navegação respeitando fila */
  navigate (id, params = {}) {
    if (!this.screens.has(id)) {
      const msg = `Tela "${id}" não registrada. Disponíveis: ${[...this.screens.keys()].join(', ')}`;
      Debug.error('Router', msg);
      showErrorOverlay({ kind: 'Tela inexistente', message: msg, stack: '' });
      return Promise.resolve();
    }
    if (this._navigating) {
      Debug.log('Router', `Em transição. Enfileirando: ${id}`);
      this._queue.push({ id, params });
      return Promise.resolve();
    }
    return this._run(id, params);
  }

  async _run (id, params) {
    this._navigating = true;
    const startedAt = performance.now();
    Debug.log('Router', `→ ${this.current || '(início)'} → ${id}`);

    try {
      await this._doNavigate(id, params);
      Debug.log('Router', `✓ ${id} em ${(performance.now() - startedAt).toFixed(0)}ms`);
    } catch (e) {
      Debug.error('Router', `Falha → ${id}:`, e);
      showErrorOverlay({
        kind: 'Erro ao montar tela',
        message: `Tela "${id}": ${e?.message || e}`,
        stack: e?.stack || '',
      });
    } finally {
      this._navigating = false;
      if (this._queue.length) {
        const next = this._queue.shift();
        // Próximo tick para ceder pintura
        requestAnimationFrame(() => this._run(next.id, next.params));
      }
    }
  }

  async _doNavigate (id, params) {
    if (!this.host) throw new Error('Router.host não inicializado.');

    const oldId = this.current;
    const oldNodes = [...this.host.children];
    const oldScreen = oldId && this.screens.has(oldId) ? this.screens.get(oldId) : null;

    // Atualizar estado
    State.previousScreen = oldId;
    this.current = id;
    this.params = params;
    State.currentScreen = id;

    // Limpar overlays e partículas de confete órfãos
    document.querySelectorAll('.liz-modal, .liz-toast, .liz-result').forEach(n => n.remove());
    const confHost = document.querySelector('.liz-confetti-host');
    if (confHost) confHost.innerHTML = '';

    // ----- Montar nova tela (off-stage: sem --active, opacity 0) -----
    const screen = this.screens.get(id);
    let node;
    try {
      node = await screen.mount(params);
    } catch (e) {
      throw new Error(`mount() de "${id}": ${e?.message || e}`);
    }

    if (!node) {
      Debug.warn('Router', `mount() de "${id}" retornou ${node}.`);
      node = makePlaceholder(`Carregando ${id}…`);
    }
    if (!(node instanceof Node)) {
      throw new Error(`mount() de "${id}" não retornou um Node DOM`);
    }

    node.classList.add('liz-screen');
    this.host.appendChild(node);

    // Forçar layout antes de ativar a transição
    void node.offsetWidth;

    // ----- CROSSFADE -----
    // Antiga perde --active (fade out) + nova ganha --active (fade in)
    // ambos no MESMO frame para sincronia perfeita
    requestAnimationFrame(() => {
      node.classList.add('liz-screen--active');
      oldNodes.forEach(n => n.classList.remove('liz-screen--active'));
    });

    // Aguardar a transição completar antes de remover/unmount
    await sleep(TRANSITION_MS + 30);

    oldNodes.forEach(n => n.remove());

    // Unmount lógico da tela antiga (timers, listeners)
    if (oldScreen) {
      try { oldScreen.unmount?.(); }
      catch (e) { Debug.warn('Router', `Erro no unmount de ${oldId}:`, e); }
    }

    Bus.emit('route:change', { from: oldId, to: id, params });
  }

  back () {
    if (State.previousScreen) {
      this.navigate(State.previousScreen);
    } else {
      Debug.warn('Router', 'Sem tela anterior.');
    }
  }

  getCurrent () { return this.current; }
}

function sleep (ms) { return new Promise(r => setTimeout(r, ms)); }

function makePlaceholder (msg) {
  const div = document.createElement('div');
  div.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#4527A0,#6A1B9A);color:#fff;font-weight:800;font-family:Fredoka,sans-serif;';
  div.textContent = msg;
  return div;
}

export const Router = new ScreenRouter();
