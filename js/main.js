/* =========================================================================
   LIZKIDS — BOOTSTRAP DEFINITIVO
   - Static imports (fetch paralelo automático)
   - Takeover do splash inline em ~50ms
   - Boot time medido + FPS monitor com ?debug=1
   ========================================================================= */

const BOOT_START = performance.now();
const MIN_SPLASH_MS = 650;  // splash mínimo perceptível antes da transição

import { initErrorOverlay, Debug, showErrorOverlay } from './core/error-overlay.js';
initErrorOverlay();

import { Router }  from './core/router.js';
import { Storage } from './core/storage.js';
import { State, Bus } from './core/state.js';
import { startTimeTracker } from './core/utils.js';
import { startPerfMonitor } from './core/perf.js';

import { SplashScreen }         from './screens/splash.js';
import { ProfileSelectScreen }  from './screens/profile-select.js';
import { HomeScreen }           from './screens/home.js';
import { LibraryScreen }        from './screens/games-library.js';
import { TeacherScreen }        from './screens/teacher-dashboard.js';
import { ShopScreen }           from './screens/rewards-shop.js';
import { GameHostScreen }       from './screens/game-host.js';

try {
  bootstrap();
} catch (e) {
  Debug.error('Boot', 'Falha catastrófica:', e);
  showErrorOverlay({
    kind: 'Erro no carregamento',
    message: e?.message || String(e),
    stack: e?.stack || '',
  });
}

function bootstrap () {
  Debug.log('Boot', 'Iniciando…');

  const host = document.getElementById('liz-app');
  if (!host) throw new Error('#liz-app não encontrado');
  Router.init(host);

  // Registrar telas
  Router.register('splash',         SplashScreen);
  Router.register('profile-select', ProfileSelectScreen);
  Router.register('home',           HomeScreen);
  Router.register('library',        LibraryScreen);
  Router.register('teacher',        TeacherScreen);
  Router.register('shop',           ShopScreen);
  Router.register('game',           GameHostScreen);

  // Restaurar perfil ativo
  const active = Storage.getActiveProfile();
  if (active) {
    State.setProfile(active);
    Debug.log('Boot', `Perfil restaurado: ${active.name}`);
  }

  startTimeTracker();

  // Listener de rotas
  Bus.on('route:change', ({ from, to }) => {
    Debug.log('Boot', `Rota: ${from || '(início)'} → ${to}`);
  });

  // Atalhos
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') Router.back();
  });

  // Service worker (offline) — não-bloqueante
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(() => Debug.log('Boot', 'Service worker pronto.'))
        .catch(err => Debug.warn('Boot', 'SW falhou:', err.message));
    });
  }

  // FPS monitor opcional
  if (location.search.includes('debug=1')) {
    startPerfMonitor();
  }

  // Listener de level-up
  import('./core/levelup.js').then(({ initLevelUpListener }) => initLevelUpListener());

  // Medir tempo até pronto
  const bootElapsed = performance.now() - BOOT_START;
  Debug.log('Boot', `Módulos prontos em ${bootElapsed.toFixed(0)}ms`);

  // ----- TAKEOVER DO SPLASH INLINE -----
  // Aguardar tempo mínimo para a animação do splash ser apreciada,
  // depois transicionar direto para a primeira tela real.
  const waitMore = Math.max(0, MIN_SPLASH_MS - bootElapsed);
  setTimeout(() => {
    const firstScreen = Storage.getActiveProfile() ? 'home' : 'profile-select';
    Debug.log('Boot', `Takeover do splash → ${firstScreen} (espera adicional: ${waitMore.toFixed(0)}ms)`);
    Router.takeoverBootSplash();
    Router.navigate(firstScreen);
  }, waitMore);

  // API de debug pública
  window.LizKids = { Router, Storage, State, Debug, version: 'v3' };

  console.log(
    '%c LizKids ',
    'background:#FFD23F;color:#2E2257;font-weight:700;padding:4px 12px;border-radius:6px;',
    `boot ${bootElapsed.toFixed(0)}ms · ?debug=1 para FPS monitor`
  );
}
