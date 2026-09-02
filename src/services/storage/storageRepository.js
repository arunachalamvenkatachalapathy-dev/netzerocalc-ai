/**
 * Canonical Storage Repository & Adapters
 * Reference: NetZeroCalc Phase 2 Persistence Architecture
 * 
 * Provides an abstract repository layer decoupling domain state from underlying storage engines.
 * Phase 2 implements LocalStorageAdapter as the active zero-latency, offline-first client engine.
 */

const STORAGE_KEY_V4 = 'netzerocalc_v4_projects';
const STORAGE_KEY_V3 = 'netzerocalc_v3_projects';
const STORAGE_KEY_CUSTOM_FACTORS = 'netzerocalc_custom_factors_v4';

/**
 * Base Adapter Interface
 */
export class BaseStorageAdapter {
  async loadProjects() {
    throw new Error('loadProjects() must be implemented by adapter.');
  }
  async saveProjects(projects) {
    throw new Error('saveProjects() must be implemented by adapter.');
  }
  async loadCustomFactors() {
    throw new Error('loadCustomFactors() must be implemented by adapter.');
  }
  async saveCustomFactors(factors) {
    throw new Error('saveCustomFactors() must be implemented by adapter.');
  }
}

/**
 * LocalStorage Adapter (Active Phase 2 Implementation)
 * Zero-latency client persistence with dual v4/v3 backward-compatibility
 */
export class LocalStorageAdapter extends BaseStorageAdapter {
  async loadProjects() {
    try {
      const v4Raw = localStorage.getItem(STORAGE_KEY_V4);
      if (v4Raw) {
        return JSON.parse(v4Raw);
      }
      const v3Raw = localStorage.getItem(STORAGE_KEY_V3);
      if (v3Raw) {
        return JSON.parse(v3Raw);
      }
      return null;
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to load projects:', err);
      return null;
    }
  }

  async saveProjects(projects) {
    try {
      const serialized = JSON.stringify(projects);
      localStorage.setItem(STORAGE_KEY_V4, serialized);
      localStorage.setItem(STORAGE_KEY_V3, serialized); // Backward compatibility mirror
      return true;
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to save projects:', err);
      return false;
    }
  }

  async loadCustomFactors() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_FACTORS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to load custom factors:', err);
      return [];
    }
  }

  async saveCustomFactors(factors) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FACTORS, JSON.stringify(factors || []));
      return true;
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to save custom factors:', err);
      return false;
    }
  }
}

/**
 * Future Supabase Cloud Adapter Interface (Architectural Reference)
 * Documented for future enterprise cloud sync without introducing premature runtime complexity.
 * 
 * export class SupabaseCloudAdapter extends BaseStorageAdapter {
 *   constructor(supabaseClient) { super(); this.client = supabaseClient; }
 *   async loadProjects() { ... }
 *   async saveProjects(projects) { ... }
 *   async loadCustomFactors() { ... }
 *   async saveCustomFactors(factors) { ... }
 * }
 */

/**
 * Storage Repository Singleton
 */
export class StorageRepository {
  constructor(adapter = new LocalStorageAdapter()) {
    this.adapter = adapter;
  }

  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  async getProjects() {
    return this.adapter.loadProjects();
  }

  async setProjects(projects) {
    return this.adapter.saveProjects(projects);
  }

  async getCustomFactors() {
    return this.adapter.loadCustomFactors();
  }

  async setCustomFactors(factors) {
    return this.adapter.saveCustomFactors(factors);
  }
}

export const storageRepository = new StorageRepository();
