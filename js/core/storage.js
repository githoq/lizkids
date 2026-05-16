/* =========================================================================
   LIZKIDS — STORAGE (com estrelas por nível)
   ========================================================================= */

const KEY = 'lizkids_v1';
const DEBOUNCE = 400;

const DEFAULT = {
  version: 1, profiles: [], activeProfileId: null,
  settings: { sound: true, music: true },
};

class StorageManager {
  constructor () {
    this._t = null;
    this.data = this._load();
  }
  _load () {
    try {
      const r = localStorage.getItem(KEY);
      return r ? { ...structuredClone(DEFAULT), ...JSON.parse(r) } : structuredClone(DEFAULT);
    } catch { return structuredClone(DEFAULT); }
  }
  flush () { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch {} }
  save  () { clearTimeout(this._t); this._t = setTimeout(() => this.flush(), DEBOUNCE); }

  /* Perfis */
  createProfile ({ name, avatarId, age = 6 }) {
    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const p = {
      id, name, avatarId, age,
      createdAt: Date.now(), level: 1, xp: 0, stars: 0, coins: 50, gems: 0,
      medals: [], certificates: [], unlockedCharacters: ['lumi'], ownedShopItems: [],
      gameProgress: {}, activityLog: [], timeSpentSec: 0, lastSeenAt: Date.now(),
    };
    this.data.profiles.push(p);
    this.data.activeProfileId = id;
    this.save();
    return p;
  }
  deleteProfile (id) {
    this.data.profiles = this.data.profiles.filter(p => p.id !== id);
    if (this.data.activeProfileId === id) this.data.activeProfileId = null;
    this.save();
  }
  setActiveProfile (id) {
    this.data.activeProfileId = id;
    const p = this.getActiveProfile();
    if (p) p.lastSeenAt = Date.now();
    this.save();
  }
  getActiveProfile () { return this.data.profiles.find(p => p.id === this.data.activeProfileId) || null; }
  getProfile       (id) { return this.data.profiles.find(p => p.id === id) || null; }
  updateProfile    (id, patch) { const p = this.getProfile(id); if (p) { Object.assign(p, patch); this.save(); } }

  /* Progresso de jogo — inclui estrelas por nível */
  saveGameRound (profileId, gameId, result) {
    const p = this.getProfile(profileId);
    if (!p) return;
    const prev = p.gameProgress[gameId] || {};
    const lvKey = `level_${result.level || 1}_stars`;

    p.gameProgress[gameId] = {
      ...prev,
      stars:     Math.max(prev.stars     || 0, result.stars || 0),
      bestScore: Math.max(prev.bestScore || 0, result.score || 0),
      level:     Math.max(prev.level     || 1, result.level || 1),
      plays:     (prev.plays || 0) + 1,
      [lvKey]:   Math.max(prev[lvKey] || 0, result.stars || 0),
      completedAt: Date.now(),
    };

    p.xp    += result.xp    || 0;
    p.coins += result.coins || 0;
    p.stars += result.stars || 0;
    p.gems  += result.gems  || 0;

    /* Level-up */
    while (p.xp >= p.level * 100) {
      p.xp   -= p.level * 100;
      p.level += 1;
      p.coins += 25;
      import('./state.js')
        .then(({ Bus }) => Bus.emit('profile:levelup', { level: p.level, profileId }))
        .catch(() => {});
    }

    p.activityLog.unshift({ gameId, score: result.score, stars: result.stars, at: Date.now() });
    if (p.activityLog.length > 30) p.activityLog.length = 30;
    this.save();
  }

  trackTime (id, sec) {
    const p = this.getProfile(id);
    if (p) { p.timeSpentSec = (p.timeSpentSec || 0) + sec; this.save(); }
  }
  purchaseShopItem (profileId, item) {
    const p = this.getProfile(profileId);
    if (!p) return { ok: false, reason: 'no_profile' };
    if (p.ownedShopItems.includes(item.id)) return { ok: false, reason: 'owned' };
    if (p.coins < item.price)  return { ok: false, reason: 'no_coins' };
    p.coins -= item.price;
    p.ownedShopItems.push(item.id);
    if (item.unlockCharacter) p.unlockedCharacters.push(item.unlockCharacter);
    this.save();
    return { ok: true };
  }
  setSetting (k, v) { this.data.settings[k] = v; this.save(); }
  reset () { this.data = structuredClone(DEFAULT); this.flush(); }
}

export const Storage = new StorageManager();
window.addEventListener('beforeunload', () => Storage.flush());
