/* =========================================================================
   LIZKIDS — SPLASH SCREEN
   ========================================================================= */

import { el }       from '../core/utils.js';
import { Router }   from '../core/router.js';
import { Storage }  from '../core/storage.js';
import { Particles } from '../core/particles.js';
import { CHARACTERS } from '../data/characters.js';
import { Debug }    from '../core/error-overlay.js';

export const SplashScreen = {
  _timer: null,
  mount () {
    Debug.log('Splash', 'mount()');
    const wrap = el('div', { class: 'liz-splash' });

    Particles.ambientSparkles(wrap, 24);

    const mark = el('div', { class: 'liz-splash__mark', html: CHARACTERS.lumi() });
    const name = el('div', { class: 'liz-splash__name' }, ['LizKids']);
    const tag  = el('div', { class: 'liz-splash__tagline' }, ['Aprender é uma aventura mágica']);
    const loader = el('div', { class: 'liz-splash__loader' }, [
      el('div', { class: 'liz-splash__loader-fill' }),
    ]);

    wrap.appendChild(mark);
    wrap.appendChild(name);
    wrap.appendChild(tag);
    wrap.appendChild(loader);

    // Transição automática (cancelável via unmount)
    this._timer = setTimeout(() => {
      const hasProfile = Storage.getActiveProfile();
      Debug.log('Splash', `Transição → ${hasProfile ? 'home' : 'profile-select'}`);
      Router.navigate(hasProfile ? 'home' : 'profile-select');
    }, 2600);

    return wrap;
  },
  unmount () {
    Debug.log('Splash', 'unmount()');
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  },
};
