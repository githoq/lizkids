/* =========================================================================
   LIZKIDS — PERFORMANCE MONITOR
   Ativo com ?debug=1 na URL.
   Mostra: FPS, tempo de boot, tempo de navegação entre telas.
   ========================================================================= */

import { Debug } from './error-overlay.js';

let rafId = null;
let fpsEl = null;
let frames = 0;
let lastTime = performance.now();
let fps = 60;

function tick (now) {
  frames++;
  if (now - lastTime >= 1000) {
    fps = frames;
    frames = 0;
    lastTime = now;
    if (fpsEl) {
      fpsEl.textContent = `${fps} fps`;
      fpsEl.style.color = fps >= 50 ? '#5BE0A3' : fps >= 30 ? '#FFD23F' : '#FF8A65';
    }
  }
  rafId = requestAnimationFrame(tick);
}

export function startPerfMonitor () {
  if (fpsEl) return;

  fpsEl = document.createElement('div');
  fpsEl.className = 'liz-fps';
  fpsEl.title = 'FPS (modo debug)';
  document.body.appendChild(fpsEl);

  rafId = requestAnimationFrame(tick);
  Debug.log('Perf', 'FPS monitor ativo.');

  // Painel expandido: clique para ver métricas de navegação
  fpsEl.addEventListener('click', () => {
    const logs = Debug.getLogs().filter(l => l.includes('Router') || l.includes('Boot') || l.includes('Perf'));
    fpsEl.title = logs.slice(-5).join('\n');
  });
}

export function stopPerfMonitor () {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  fpsEl?.remove();
  fpsEl = null;
}

/** Mede e loga o tempo de um bloco async */
export async function measure (label, fn) {
  const t = performance.now();
  const result = await fn();
  Debug.log('Perf', `${label}: ${(performance.now() - t).toFixed(1)}ms`);
  return result;
}
