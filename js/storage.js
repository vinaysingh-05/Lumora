/**
 * Storage Subsystem
 * Uses chrome.storage.local for JSON states and IndexedDB for large binary wallpapers.
 */

const DB_NAME = 'GlassWorkspaceDB';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const Storage = {
  // Save application meta and layout states
  async get(keys) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(keys, (res) => resolve(res));
      } else {
        const res = {};
        const list = Array.isArray(keys) ? keys : [keys];
        for (const k of list) {
          const val = localStorage.getItem(k);
          if (val !== null) {
            try { res[k] = JSON.parse(val); } catch { res[k] = val; }
          }
        }
        resolve(res);
      }
    });
  },

  async set(items) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set(items, () => resolve());
      } else {
        for (const [k, v] of Object.entries(items)) {
          localStorage.setItem(k, JSON.stringify(v));
        }
        resolve();
      }
    });
  },

  // Binary/Large String Blob store via IndexedDB
  async saveWallpaperBlob(key, blobData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blobData, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async getWallpaperBlob(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async deleteWallpaperBlob(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
};