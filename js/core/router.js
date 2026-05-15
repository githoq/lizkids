/* =========================================================================
   LIZKIDS — ROUTER DE TELAS (blindado)
   - Fila contra navegações concorrentes
   - try/catch em mount com fallback visual
   - Logs verbosos de cada transição
   ========================================================================= */

import { State, Bus } from './state.js';
import { Audio } from './audio.js';
import { Debug, showErrorOverlay } from './error-overlay.js';

class ScreenRouter {
  constructor () {
    this.screens = new Map();
    this.host    = null;
    this.current = null;
    this.params  = {};
    this._navigating = false;
    this._queue = [];
  }

  init (hostEl) {
    this.host = hostEl;
    Debug.log('Router', 'Inicializado em', hostEl?.id || '(elemento)');
  }

  register (id, screen) {
    if (!screen || typeof screen.mount !== 'function') {
      Debug.error('Router', `Tela "${id}" não possui método mount() — não será registrada.`);
      return;
    }
    if (typeof screen.unmount !== 'function') {
      Debug.warn('Router', `Tela "${id}" não possui unmount() — será tolerado.`);
    }
    this.screens.set(id, screen);
    Debug.log('Router', `Tela registrada: ${id}`);
  }

  /** Navegar para uma tela. Se já há navegação em andamento, entra na fila. */
  navigate (id, params = {}) {
    if (!this.screens.has(id)) {
      const msg = `Tela "${id}" não está registrada. Telas: ${[...this.screens.keys()].join(', ')}`;
      Debug.error('Router', msg);
      showErrorOverlay({
        kind: 'Tela inexistente',
        message: msg,
        stack: '(nenhuma)',
      });
      return Promise.resolve();
    }

    if (this._navigating) {
      Debug.warn('Router', `Já navegando para "${this.current}". Enfileirando "${id}".`);
      this._queue.push({ id, params });
      return Promise.resolve();
    }

    return this._run(id, params);
  }

  async _run (id, params) {
    this._navigating = true;
    Debug.log('Router', `→ Iniciando ${this.current || '(início)'} → ${id}`);

    try {
      await this._doNavigate(id, params);
    } catch (e) {
      Debug.error('Router', `Falha na transição → ${id}:`, e);
      showErrorOverlay({
        kind: 'Erro ao montar tela',
        message: `Tela "${id}" não pôde ser carregada: ${e?.message || e}`,
        stack: e?.stack || '',
      });
    } finally {
      this._navigating = false;
      // Processar fila no próximo tick
      if (this._queue.length) {
        const next = this._queue.shift();
        Debug.log('Router', `Processando fila: → ${next.id}`);
        setTimeout(() => this._run(next.id, next.params), 0);
      }
    }
  }

  async _doNavigate (id, params) {
    if (!this.host) throw new Error('Router.host não inicializado. Chame Router.init(hostEl) primeiro.');

    // ---------- 1. Unmount da tela anterior ----------
    if (this.current && this.screens.has(this.current)) {
      const prev = this.screens.get(this.current);
      try {
        prev.unmount?.();
        Debug.log('Router', `Unmount OK: ${this.current}`);
      } catch (e) {
        Debug.warn('Router', `Erro no unmount de ${this.current}:`, e);
      }
    }

    // ---------- 2. Limpar DOM e overlays órfãos ----------
    this.host.innerHTML = '';
    document.querySelectorAll('.liz-modal, .liz-toast, .liz-result').forEach(n => n.remove());

    // ---------- 3. Atualizar estado ----------
    State.previousScreen = this.current;
    this.current = id;
    this.params = params;
    State.currentScreen = id;

    Audio.pop();

    // ---------- 4. Montar nova tela ----------
    const screen = this.screens.get(id);
    let node;
    try {
      node = await screen.mount(params);
    } catch (e) {
      throw new Error(`mount() de "${id}" lançou: ${e?.message || e}`);
    }

    if (!node) {
      Debug.warn('Router', `mount() de "${id}" retornou ${node}. Inserindo placeholder.`);
      node = makePlaceholder(`Carregando ${id}…`);
    }

    if (!(node instanceof Node)) {
      throw new Error(`mount() de "${id}" deve retornar um Node DOM. Recebido: ${typeof node}`);
    }

    node.classList.add('liz-screen', 'liz-screen--active');
    this.host.appendChild(node);

    Debug.log('Router', `✓ Montado: ${id}`);
    Bus.emit('route:change', { from: State.previousScreen, to: id, params });
  }

  back () {
    if (State.previousScreen) {
      Debug.log('Router', `← Voltar: ${this.current} → ${State.previousScreen}`);
      this.navigate(State.previousScreen);
    } else {
      Debug.warn('Router', 'Sem tela anterior.');
    }
  }

  getCurrent () { return this.current; }
}

function makePlaceholder (msg) {
  const div = document.createElement('div');
  div.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-deep-1);color:#fff;font-weight:800;font-family:Fredoka,sans-serif;text-align:center;padding:24px;';
  div.textContent = msg;
  return div;
}

export const Router = new ScreenRouter();
