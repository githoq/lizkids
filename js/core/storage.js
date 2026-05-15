/* =========================================================================
   LIZKIDS — SISTEMA DE ARMAZENAMENTO
   Persistência local protegida com versionamento e debounced autosave.
   Por aluno e configurações globais.
   ========================================================================= */

const STORAGE_KEY = 'lizkids_v1';
const SAVE_DEBOUNCE = 400;

const DEFAULT_DATA = {
  version: 1,
  profiles: [],
  activeProfileId: null,
  settings: {
    sound: true,
    music: true,
    locale: 'pt-BR',
  },
  achievements: [],
};

class StorageManager {
  constructor () {
    this._saveTimer = null;
    this.data = this._load();
  }

  _load () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_DATA);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_DATA), ...parsed };
    } catch (e) {
      console.warn('[LizKids] Save corrompido, restaurando default.', e);
      return structuredClone(DEFAULT_DATA);
    }
  }

  /** Salva imediatamente sem esperar debounce */
  flush () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[LizKids] Falha ao salvar.', e);
    }
  }

  /** Salva com debounce (autosave seguro contra perda de progresso) */
  save () {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.flush(), SAVE_DEBOUNCE);
  }

  /* ----- PERFIS ----- */
  createProfile ({ name, avatarId, age = 6 }) {
    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const profile = {
      id, name, avatarId, age,
      createdAt: Date.now(),
      level: 1,
      xp: 0,
      stars: 0,
      coins: 50,        // bônus inicial
      gems: 0,
      medals: [],
      certificates: [],
      unlockedCharacters: ['lumi'],
      ownedShopItems: [],
      gameProgress: {}, // { [gameId]: { stars, score, attempts, level, completedAt, bestTime } }
      activityLog: [],
      timeSpentSec: 0,
      lastSeenAt: Date.now(),
    };
    this.data.profiles.push(profile);
    this.data.activeProfileId = id;
    this.save();
    return profile;
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

  getActiveProfile () {
    return this.data.profiles.find(p => p.id === this.data.activeProfileId) || null;
  }

  getProfile (id) {
    return this.data.profiles.find(p => p.id === id) || null;
  }

  updateProfile (id, patch) {
    const p = this.getProfile(id);
    if (!p) return;
    Object.assign(p, patch);
    this.save();
  }

  /* ----- PROGRESSO POR JOGO ----- */
  saveGameRound (profileId, gameId, result) {
    const p = this.getProfile(profileId);
    if (!p) return;

    const prev = p.gameProgress[gameId] || { stars: 0, bestScore: 0, attempts: 0, plays: 0, bestTime: Infinity };
    p.gameProgress[gameId] = {
      stars:     Math.max(prev.stars, result.stars || 0),
      bestScore: Math.max(prev.bestScore, result.score || 0),
      bestTime:  result.timeMs ? Math.min(prev.bestTime, result.timeMs) : prev.bestTime,
      attempts:  (prev.attempts || 0) + 1,
      plays:     (prev.plays || 0) + 1,
      level:     Math.max(prev.level || 1, result.level || 1),
      completedAt: Date.now(),
    };

    // XP / moedas / estrelas globais
    p.xp    += result.xp    || 0;
    p.coins += result.coins || 0;
    p.stars += result.stars || 0;
    p.gems  += result.gems  || 0;

    // Subir de nível: 100 XP por nível
    while (p.xp >= p.level * 100) {
      p.xp -= p.level * 100;
      p.level += 1;
      p.coins += 25; // recompensa de level up
    }

    // Log da atividade
    p.activityLog.unshift({
      gameId, score: result.score, stars: result.stars, at: Date.now(),
    });
    if (p.activityLog.length > 30) p.activityLog.length = 30;

    this.save();
  }

  trackTime (profileId, seconds) {
    const p = this.getProfile(profileId);
    if (!p) return;
    p.timeSpentSec = (p.timeSpentSec || 0) + seconds;
    this.save();
  }

  /* ----- COMPRAS DA LOJA ----- */
  purchaseShopItem (profileId, item) {
    const p = this.getProfile(profileId);
    if (!p) return { ok: false, reason: 'no_profile' };
    if (p.ownedShopItems.includes(item.id)) return { ok: false, reason: 'owned' };
    if (p.coins < item.price) return { ok: false, reason: 'no_coins' };
    p.coins -= item.price;
    p.ownedShopItems.push(item.id);
    if (item.unlockCharacter) p.unlockedCharacters.push(item.unlockCharacter);
    this.save();
    return { ok: true };
  }

  /* ----- SETTINGS GLOBAIS ----- */
  setSetting (key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  reset () {
    this.data = structuredClone(DEFAULT_DATA);
    this.flush();
  }
}

export const Storage = new StorageManager();
window.addEventListener('beforeunload', () => Storage.flush());
