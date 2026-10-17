/**
 * Wallpaper Manager with IndexedDB persistence and real-time CSS filters
 */
import { Storage } from './storage.js';

const WALLPAPER_KEY = 'custom_wallpaper_blob';
const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=80';

export class WallpaperManager {
  constructor(layerEl, tintEl) {
    this.layer = layerEl;
    this.tint = tintEl;
    this.currentBlobUrl = null;
  }

  async init(settings) {
    this.applyFilters(settings);
    try {
      const storedBlob = await Storage.getWallpaperBlob(WALLPAPER_KEY);
      if (storedBlob) {
        this.renderBlob(storedBlob);
      } else {
        this.renderUrl(DEFAULT_WALLPAPER);
      }
    } catch {
      this.renderUrl(DEFAULT_WALLPAPER);
    }
  }

  renderUrl(url) {
    this.cleanupBlob();
    this.layer.style.backgroundImage = `url("${url}")`;
  }

  renderBlob(blob) {
    this.cleanupBlob();
    this.currentBlobUrl = URL.createObjectURL(blob);
    this.layer.style.backgroundImage = `url("${this.currentBlobUrl}")`;
  }

  cleanupBlob() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  async uploadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Unsupported image format');
    }
    await Storage.saveWallpaperBlob(WALLPAPER_KEY, file);
    this.renderBlob(file);
  }

  async resetDefault() {
    await Storage.deleteWallpaperBlob(WALLPAPER_KEY);
    this.renderUrl(DEFAULT_WALLPAPER);
  }

  applyFilters({ blur = 0, brightness = 100, dim = 10 }) {
    this.layer.style.filter = `blur(${blur}px) brightness(${brightness}%)`;
    this.tint.style.backgroundColor = `rgba(0, 0, 0, ${dim / 100})`;
  }
}