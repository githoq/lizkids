/* =========================================================================
   LIZKIDS — UTILITÁRIOS COMPARTILHADOS
   ========================================================================= */

import { Storage } from './storage.js';
import { State }   from './state.js';

/** Cria um elemento com tag/atributos/filhos */
export function el (tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class')      node.className = v;
    else if (k === 'html')  node.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'data' && typeof v === 'object') for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    else node.setAttribute(k, v);
  }
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
  }
  return node;
}

export function fragment (...nodes) {
  const f = document.createDocumentFragment();
  nodes.forEach(n => n && f.appendChild(n));
  return f;
}

export const sleep = ms => new Promise(res => setTimeout(res, ms));

export const rnd      = (min, max) => Math.random() * (max - min) + min;
export const rndInt   = (min, max) => Math.floor(rnd(min, max + 1));
export const pick     = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle  = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function formatTime (sec) {
  if (!isFinite(sec)) return '--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ----- Toast simples ----- */
export function showToast (msg, opts = {}) {
  const t = el('div', { class: 'liz-toast' }, [msg]);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

/* ----- Rastreador de tempo de uso ----- */
let tickerId = null;
let lastTick = Date.now();
export function startTimeTracker () {
  if (tickerId) return;
  lastTick = Date.now();
  tickerId = setInterval(() => {
    if (document.hidden) { lastTick = Date.now(); return; }
    const now = Date.now();
    const delta = (now - lastTick) / 1000;
    lastTick = now;
    const p = Storage.getActiveProfile();
    if (p) Storage.trackTime(p.id, Math.min(delta, 5));
  }, 5000);
}
export function stopTimeTracker () {
  clearInterval(tickerId);
  tickerId = null;
}
