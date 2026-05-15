/* =========================================================================
   LIZKIDS — SISTEMA DE PARTÍCULAS
   Confete celebratório + sparkles ambientais leves (CSS-driven).
   ========================================================================= */

const CONFETTI_COLORS = ['#FFD23F','#FF7BB5','#5BE0A3','#4F7CFF','#B57BFF','#FF8A65','#7EE8D4'];

let host = null;

function ensureHost () {
  if (host && document.body.contains(host)) return host;
  host = document.createElement('div');
  host.className = 'liz-confetti-host';
  document.body.appendChild(host);
  return host;
}

export const Particles = {
  /** Dispara N peças de confete a partir do centro/topo */
  confetti (count = 60) {
    const h = ensureHost();
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'liz-confetti';
      piece.style.left = (Math.random() * 100) + 'vw';
      piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.setProperty('--confetti-x', (Math.random() * 200 - 100) + 'px');
      const dur = 2.4 + Math.random() * 2.2;
      piece.style.animationDuration = dur + 's';
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      // Algumas peças são circulares para variar
      if (Math.random() > 0.6) piece.style.borderRadius = '50%';
      // Algumas com aspect-ratio diferente
      piece.style.height = (10 + Math.random() * 16) + 'px';
      h.appendChild(piece);
      setTimeout(() => piece.remove(), (dur + 0.5) * 1000);
    }
  },

  /** Camada ambiente de estrelinhas subindo (chamar 1x ao montar uma tela) */
  ambientSparkles (containerEl, count = 14) {
    const layer = document.createElement('div');
    layer.className = 'liz-sparkles';
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      sp.className = 'liz-sparkle';
      sp.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`;
      sp.style.left = (Math.random() * 100) + '%';
      sp.style.animationDuration = (8 + Math.random() * 10) + 's';
      sp.style.animationDelay   = (Math.random() * 8) + 's';
      sp.style.opacity = 0.6 + Math.random() * 0.4;
      sp.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
      layer.appendChild(sp);
    }
    containerEl.appendChild(layer);
    return layer;
  },

  burst (x, y, count = 14) {
    const h = ensureHost();
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'liz-confetti';
      piece.style.left = x + 'px';
      piece.style.top  = y + 'px';
      piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 80 + Math.random() * 140;
      piece.style.setProperty('--confetti-x', (Math.cos(ang) * dist) + 'px');
      piece.style.animationDuration = (1.2 + Math.random()) + 's';
      h.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  },
};
