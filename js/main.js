/* =========================================================================
   LIZKIDS — BOOTSTRAP
   ORDEM CRÍTICA: error-overlay PRIMEIRO. Tudo o mais depois.
   ========================================================================= */

import { initErrorOverlay, Debug, showErrorOverlay } from './core/error-overlay.js';

// ----- 1. Armar captura de erros ANTES de qualquer outro import com efeitos colaterais
initErrorOverlay();

// ----- 2. Importar o resto com tratamento defensivo
try {
  await bootstrap();
} catch (e) {
  Debug.error('Boot', 'Falha no bootstrap:', e);
  showErrorOverlay({
    kind: 'Erro no carregamento do app',
    message: e?.message || String(e),
    stack: e?.stack || '',
  });
}

async function bootstrap () {
  Debug.log('Boot', 'Iniciando carregamento dos módulos…');

  // ----- Core + splash em paralelo (caminho crítico)
  const [
    { Router },
    { Storage },
    { State, Bus },
    { startTimeTracker },
    { SplashScreen },
  ] = await Promise.all([
    import('./core/router.js'),
    import('./core/storage.js'),
    import('./core/state.js'),
    import('./core/utils.js'),
    import('./screens/splash.js'),
  ]);

  Debug.log('Boot', 'Caminho crítico carregado.');

  // ----- 3. Inicializar router
  const host = document.getElementById('liz-app');
  if (!host) throw new Error('Elemento #liz-app não encontrado no DOM.');
  Router.init(host);

  // ----- 4. Registrar tela crítica imediatamente
  Router.register('splash', SplashScreen);

  // Carregar e registrar telas antes da primeira navegação
  const [
    { ProfileSelectScreen },
    { HomeScreen },
    { LibraryScreen },
    { TeacherScreen },
    { ShopScreen },
    { GameHostScreen },
  ] = await Promise.all([
    import('./screens/profile-select.js'),
    import('./screens/home.js'),
    import('./screens/games-library.js'),
    import('./screens/teacher-dashboard.js'),
    import('./screens/rewards-shop.js'),
    import('./screens/game-host.js'),
  ]);

  Router.register('profile-select', ProfileSelectScreen);
  Router.register('home',           HomeScreen);
  Router.register('library',        LibraryScreen);
  Router.register('teacher',        TeacherScreen);
  Router.register('shop',           ShopScreen);
  Router.register('game',           GameHostScreen);
  Debug.log('Boot', 'Telas secundárias registradas.');

  // ----- 5. Sincronizar perfil ativo
  const active = Storage.getActiveProfile();
  if (active) {
    State.setProfile(active);
    Debug.log('Boot', `Perfil ativo restaurado: ${active.name} (${active.id})`);
  } else {
    Debug.log('Boot', 'Nenhum perfil ativo.');
  }

  // ----- 6. Tracker de tempo
  startTimeTracker();

  // ----- 7. Eventos globais
  Bus.on('route:change', ({ from, to }) => {
    Debug.log('Boot', `Rota mudou: ${from || '(início)'} → ${to}`);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') Router.back();
  });

  // ----- 8. Service worker (PWA) — tolerante a falhas
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // service worker disabled temporarily
        .then(() => Debug.log('Boot', 'Service worker registrado.'))
        .catch(err => Debug.warn('Boot', 'SW falhou (sem efeito em dev):', err.message));
    });
  }

  // ----- 9. Boot do app
  Debug.log('Boot', 'Navegando para splash…');
  Router.navigate('profile-select');

  // Sinaliza que a primeira tela está pronta → preloader pode sumir
  document.dispatchEvent(new CustomEvent('liz:ready'));

  // Banner amigável no console
  console.log(
    '%c LizKids ',
    'background:#FFD23F;color:#2E2257;font-weight:700;padding:4px 12px;border-radius:6px;',
    'Plataforma carregada. Logs: [Router], [Home], [GameHost] etc.'
  );

  // Expor utilitários de debug em desenvolvimento
  window.LizKids = { Router, Storage, State, Debug };
}
