/* =========================================================================
   LIZKIDS — ERROR OVERLAY + DEBUG LOGGER
   Captura window.onerror e unhandledrejection e exibe overlay visual.
   Nada de erro silencioso: tudo aparece no console + no overlay.
   ========================================================================= */

const MAX_LOGS = 240;
const logs = [];
let overlayActive = false;

function ts () {
  return new Date().toISOString().split('T')[1].slice(0, -1);
}

function pushLog (level, scope, args) {
  const stringified = args.map(a => {
    if (a instanceof Error) return a.message;
    if (typeof a === 'string') return a;
    try { return JSON.stringify(a); } catch { return String(a); }
  }).join(' ');
  const line = `[${ts()}][${level}][${scope}] ${stringified}`;
  logs.push(line);
  if (logs.length > MAX_LOGS) logs.shift();
  return line;
}

export const Debug = {
  log (scope, ...args) {
    pushLog('LOG', scope, args);
    console.log(`%c[${scope}]`, 'color:#7E47D4;font-weight:700;', ...args);
  },
  warn (scope, ...args) {
    pushLog('WARN', scope, args);
    console.warn(`%c[${scope}]`, 'color:#F4A300;font-weight:700;', ...args);
  },
  error (scope, ...args) {
    pushLog('ERROR', scope, args);
    console.error(`%c[${scope}]`, 'color:#D94B8C;font-weight:700;', ...args);
  },
  getLogs () { return logs.slice(); },
};

/* ---------- Escapar HTML do conteúdo de erro ---------- */
function esc (s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- Overlay visual ---------- */
export function showErrorOverlay ({ kind, message, stack = '', source = '', line = '', col = '' }) {
  if (overlayActive) {
    // Ainda assim, adicione a falha ao log para inspeção
    Debug.error('ErrorOverlay', 'Erro adicional enquanto overlay ativo:', message);
    return;
  }
  overlayActive = true;

  const overlay = document.createElement('div');
  overlay.id = 'liz-error-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: radial-gradient(circle at center, rgba(40,20,80,0.92), rgba(20,10,40,0.97));
    backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; overflow: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color: #fff;
    animation: lizFadeIn 0.3s ease-out;
  `;

  const logText = logs.slice(-40).join('\n');

  overlay.innerHTML = `
    <div style="background:#2E1A6B;border:2px solid #FF7BB5;border-radius:24px;padding:28px;max-width:720px;width:100%;box-shadow:0 30px 70px rgba(0,0,0,0.6);">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:18px;">
        <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#FFD23F,#FF7BB5,#B57BFF);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 8px 22px rgba(255,123,181,0.4);">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" stroke="#2E2257" stroke-width="1.5">
            <path d="M12 2 L22 20 L2 20 Z" stroke-linejoin="round"/>
            <rect x="11" y="9" width="2" height="6" fill="#2E2257" stroke="none"/>
            <circle cx="12" cy="17.5" r="1.2" fill="#2E2257" stroke="none"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:20px;letter-spacing:-0.01em;">Ops! Algo deu errado.</div>
          <div style="font-size:12px;opacity:0.65;margin-top:2px;letter-spacing:0.08em;text-transform:uppercase;">${esc(kind)}</div>
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.35);border-radius:12px;padding:14px 18px;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.5;margin-bottom:14px;word-break:break-word;">
        <div style="color:#FF8A65;font-weight:700;margin-bottom:6px;">${esc(message)}</div>
        ${source ? `<div style="color:#A89EC4;font-size:11px;">em ${esc(source)}:${esc(line)}:${esc(col)}</div>` : ''}
      </div>

      <details style="margin-bottom:12px;">
        <summary style="cursor:pointer;font-weight:700;font-size:13px;color:#DCC2FF;padding:6px 0;">Stack trace técnica</summary>
        <pre style="background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;font-size:11px;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-all;margin-top:8px;color:#FFE894;">${esc(stack || '(stack indisponível)')}</pre>
      </details>

      <details style="margin-bottom:18px;">
        <summary style="cursor:pointer;font-weight:700;font-size:13px;color:#DCC2FF;padding:6px 0;">Log de eventos (últimos ${Math.min(40, logs.length)})</summary>
        <pre style="background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;font-size:11px;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-all;margin-top:8px;color:#B7F2D7;">${esc(logText || '(sem logs)')}</pre>
      </details>

      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button id="liz-err-reload" style="flex:1;min-width:140px;padding:14px 18px;background:#4F7CFF;color:#fff;border:0;border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(0,0,0,0.2);">Recarregar página</button>
        <button id="liz-err-reset" style="flex:1;min-width:140px;padding:14px 18px;background:#FF7BB5;color:#fff;border:0;border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(0,0,0,0.2);">Limpar dados e reiniciar</button>
        <button id="liz-err-close" style="flex:1;min-width:140px;padding:14px 18px;background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.3);border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;">Tentar continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#liz-err-reload').addEventListener('click', () => location.reload());
  overlay.querySelector('#liz-err-reset').addEventListener('click', () => {
    try { localStorage.removeItem('lizkids_v1'); } catch {}
    location.reload();
  });
  overlay.querySelector('#liz-err-close').addEventListener('click', () => {
    overlay.remove();
    overlayActive = false;
  });
}

/* ---------- Registrar listeners globais ---------- */
export function initErrorOverlay () {
  window.addEventListener('error', (e) => {
    Debug.error('window.onerror', e.message, 'em', e.filename, ':', e.lineno);
    showErrorOverlay({
      kind: 'Erro de execução',
      message: e.message || 'Erro desconhecido',
      stack: e.error?.stack || '(sem stack disponível)',
      source: e.filename,
      line: e.lineno,
      col: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    Debug.error('unhandledrejection', r);
    showErrorOverlay({
      kind: 'Promise rejeitada (sem catch)',
      message: r?.message || String(r) || 'Promise rejeitada',
      stack: r?.stack || '(sem stack)',
    });
  });

  Debug.log('System', 'Error overlay armado.');
}
