/* =========================================================================
   LIZKIDS — SISTEMA DE PARTÍCULAS (versão performance)
   Contagens ajustadas para tablets Android médios (60fps target).
   ========================================================================= */

const CONFETTI_COLORS = [
  '#FFD23F','#FF7BB5','#5BE0A3','#4F7CFF','#B57BFF','#FF8A65','#7EE8D4','#FFC2DD',
];

let host = null;

function ensureHost () {
  if (host && document.body.contains(host)) return host;
  host = document.createElement('div');
  host.className = 'liz-confetti-host';
  document.body.appendChild(host);
  return host;
}

export const Particles = {
  /**
   * Confete celebratório.
   * count reduzido para 36 (era 60–80): mantém impacto visual sem engasgar tablets.
   */
  confetti (count = 36) {
    const h = ensureHost();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'liz-confetti';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      p.style.setProperty('--confetti-x', (Math.random() * 180 - 90) + 'px');
      const dur = 2.2 + Math.random() * 1.8;
      p.style.animationDuration = dur + 's';
      p.style.animationDelay    = (Math.random() * 0.3) + 's';
      if (Math.random() > 0.6) p.style.borderRadius = '50%';
      p.style.height = (10 + Math.random() * 14) + 'px';
      frag.appendChild(p);
      setTimeout(() => p.remove(), (dur + 0.6) * 1000);
    }

    h.appendChild(frag);
  },

  /**
   * Sparkles ambientais (estrelinhas subindo).
   * count padrão 8 (era 14–24): GPU-friendly em dispositivos fracos.
   * Cria num DocumentFragment para minimizar reflows.
   */
  ambientSparkles (containerEl, count = 8) {
    const layer = document.createElement('div');
    layer.className = 'liz-sparkles';

    const frag = document.createDocumentFragment();
    const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`;

    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      sp.className = 'liz-sparkle';
      sp.innerHTML = starSvg;
      sp.style.cssText = [
        `left:${(Math.random() * 100).toFixed(1)}%`,
        `animation-duration:${(10 + Math.random() * 12).toFixed(1)}s`,
        `animation-delay:${(Math.random() * 10).toFixed(1)}s`,
        `opacity:${(0.5 + Math.random() * 0.5).toFixed(2)}`,
        `transform:scale(${(0.5 + Math.random() * 0.7).toFixed(2)})`,
      ].join(';');
      frag.appendChild(sp);
    }

    layer.appendChild(frag);
    containerEl.appendChild(layer);
    return layer;
  },

  /**
   * Burst radial num ponto específico (ex.: ao comprar item na loja).
   * count padrão 12 (era 14).
   */
  burst (x, y, count = 12) {
    const h = ensureHost();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'liz-confetti';
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.position = 'fixed';
      p.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const ang  = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 60 + Math.random() * 110;
      p.style.setProperty('--confetti-x', (Math.cos(ang) * dist) + 'px');
      p.style.animationDuration = (1.0 + Math.random() * 0.8) + 's';
      frag.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }

    h.appendChild(frag);
  },

  /** Remove todas as partículas vivas (útil ao trocar de tela) */
  clear () {
    if (host) host.innerHTML = '';
  },
};
