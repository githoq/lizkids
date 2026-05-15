/* =========================================================================
   LIZKIDS — ESTADO GLOBAL + EVENT BUS
   Comunicação entre módulos sem acoplamento direto.
   ========================================================================= */

class EventBus {
  constructor () { this.listeners = new Map(); }
  on (event, cb)  {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(cb);
    return () => this.off(event, cb);
  }
  off (event, cb) { this.listeners.get(event)?.delete(cb); }
  emit (event, payload) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(payload); } catch (e) { console.error(e); }
    });
  }
}

export const Bus = new EventBus();

/* Estado central reativo (pequeno) */
class AppState {
  constructor () {
    this.currentScreen = 'splash';
    this.previousScreen = null;
    this.profile = null;
    this.sessionStartedAt = Date.now();
  }
  setProfile (p) {
    this.profile = p;
    Bus.emit('profile:change', p);
  }
}

export const State = new AppState();
