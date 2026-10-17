/**
 * Workspace Settings Modal & Live CSS Variable Synchronizer
 */
import { Storage } from './storage.js';

export const DEFAULT_CONFIG = {
  wallpaper: { blur: 0, brightness: 100, dim: 10 },
  appearance: {
    opacity: 22,
    blur: 24,
    border: 28,
    radius: 18,
    shadow: 30
  },
  layout: {
    mode: 'free'
  }
};

export class SettingsManager {
  constructor(wallpaperManager, widgetManager) {
    this.wallpaperManager = wallpaperManager;
    this.widgetManager = widgetManager;
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.modal = document.getElementById('settings-modal');
  }

  async init() {
    const data = await Storage.get('workspace_settings');
    if (data.workspace_settings) {
      this.config = Object.assign(this.config, data.workspace_settings);
    }
    this.applyAllStyles();
    this.bindUI();
    await this.wallpaperManager.init(this.config.wallpaper);
  }

  applyAllStyles() {
    const { appearance, wallpaper, layout } = this.config;
    const root = document.documentElement;

    root.style.setProperty('--glass-opacity', (appearance.opacity / 100).toFixed(2));
    root.style.setProperty('--glass-blur', `${appearance.blur}px`);
    root.style.setProperty('--glass-border-opacity', (appearance.border / 100).toFixed(2));
    root.style.setProperty('--glass-radius', `${appearance.radius}px`);
    root.style.setProperty('--glass-shadow-strength', (appearance.shadow / 100).toFixed(2));

    this.wallpaperManager.applyFilters(wallpaper);
    this.widgetManager.setGridSnap(layout.mode === 'grid');
  }

  async save() {
    await Storage.set({ workspace_settings: this.config });
  }

  bindUI() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`pane-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // Appearance inputs
    this.bindRange('glass-opacity', 'appearance', 'opacity', '%');
    this.bindRange('glass-blur', 'appearance', 'blur', 'px');
    this.bindRange('glass-border-opacity', 'appearance', 'border', '%');
    this.bindRange('glass-radius', 'appearance', 'radius', 'px');
    this.bindRange('glass-shadow', 'appearance', 'shadow', '%');

    // Wallpaper filters
    this.bindRange('wallpaper-blur', 'wallpaper', 'blur', 'px', () => this.applyAllStyles());
    this.bindRange('wallpaper-brightness', 'wallpaper', 'brightness', '%', () => this.applyAllStyles());
    this.bindRange('wallpaper-dim', 'wallpaper', 'dim', '%', () => this.applyAllStyles());

    // Wallpaper Upload & Reset
    const fileInput = document.getElementById('wallpaper-file-input');
    document.getElementById('btn-trigger-upload').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await this.wallpaperManager.uploadFile(file);
        } catch (err) {
          alert('Failed to load image: ' + err.message);
        }
      }
    });

    document.getElementById('btn-reset-wallpaper').addEventListener('click', async () => {
      await this.wallpaperManager.resetDefault();
    });

    // Layout Mode
    const layoutSelect = document.getElementById('layout-mode');
    layoutSelect.value = this.config.layout.mode;
    layoutSelect.addEventListener('change', () => {
      this.config.layout.mode = layoutSelect.value;
      this.widgetManager.setGridSnap(this.config.layout.mode === 'grid');
      this.save();
    });

    // Modal controls
    document.getElementById('btn-settings').addEventListener('click', () => this.open());
    document.getElementById('btn-close-settings-modal').addEventListener('click', () => this.close());
    this.modal.addEventListener('pointerdown', (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  bindRange(elementId, section, key, unit, callback) {
    const el = document.getElementById(elementId);
    const label = document.getElementById(`val-${elementId}`);
    if (!el) return;

    el.value = this.config[section][key];
    if (label) label.textContent = `${el.value}${unit}`;

    el.addEventListener('input', () => {
      this.config[section][key] = Number(el.value);
      if (label) label.textContent = `${el.value}${unit}`;
      this.applyAllStyles();
      if (callback) callback();
      this.save();
    });
  }

  open() { this.modal.classList.remove('hidden'); }
  close() { this.modal.classList.add('hidden'); }
}