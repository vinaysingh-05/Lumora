/**
 * Application Entry Orchestrator
 */
import { Storage } from './storage.js';
import { UndoRedoManager } from './undo-redo.js';
import { WidgetRegistry } from './widget-registry.js';
import { WidgetManager } from './widget-manager.js';
import { WallpaperManager } from './wallpaper.js';
import { SettingsManager } from './settings.js';
import { initSearch } from './search.js';

const DEFAULT_WORKSPACE_LAYOUT = [
  { type: 'clock', x: 40, y: 120, w: 260, h: 140, zIndex: 10 },
  { type: 'date', x: 40, y: 280, w: 260, h: 140, zIndex: 10 },
  { type: 'shortcuts', x: 320, y: 120, w: 320, h: 200, zIndex: 10 },
  { type: 'notes', x: 660, y: 120, w: 300, h: 300, zIndex: 10 }
];

document.addEventListener('DOMContentLoaded', async () => {
  const canvasEl = document.getElementById('widget-canvas');
  const wallpaperLayer = document.getElementById('wallpaper-layer');
  const wallpaperTint = document.getElementById('wallpaper-tint');

  const history = new UndoRedoManager();
  const wallpaperMgr = new WallpaperManager(wallpaperLayer, wallpaperTint);

  // Widget Manager with historical recording on changes
  const widgetMgr = new WidgetManager(canvasEl, {
    onStateChange: () => {
      const currentState = widgetMgr.getState();
      history.recordState(currentState);
      Storage.set({ workspace_widgets: currentState });
    }
  });

  // Settings and Look & Feel synchronizer
  const settingsMgr = new SettingsManager(wallpaperMgr, widgetMgr);
  await settingsMgr.init();

  // Load Saved Widgets
  const stored = await Storage.get('workspace_widgets');
  const initialLayout = stored.workspace_widgets && stored.workspace_widgets.length > 0 
    ? stored.workspace_widgets 
    : DEFAULT_WORKSPACE_LAYOUT;

  widgetMgr.loadState(initialLayout);

  // Search Engine Wire-up
  initSearch();

  // Mode Switch (Edit vs View)
  const btnToggleEdit = document.getElementById('btn-toggle-edit');
  const dockLabel = btnToggleEdit.querySelector('.dock-label');

  function setEditMode(isEdit) {
    document.body.classList.toggle('mode-edit', isEdit);
    document.body.classList.toggle('mode-view', !isEdit);
    dockLabel.textContent = isEdit ? 'Done' : 'Edit';
    if (!isEdit) {
      widgetMgr.deselectAll();
    }
  }

  btnToggleEdit.addEventListener('click', () => {
    const isEdit = document.body.classList.contains('mode-edit');
    setEditMode(!isEdit);
  });

  // History Undo / Redo buttons
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');

  history.onChange(({ canUndo, canRedo }) => {
    btnUndo.disabled = !canUndo;
    btnRedo.disabled = !canRedo;
  });

  btnUndo.addEventListener('click', () => {
    const prev = history.undo(widgetMgr.getState());
    if (prev) {
      widgetMgr.loadState(prev);
      Storage.set({ workspace_widgets: prev });
    }
  });

  btnRedo.addEventListener('click', () => {
    const next = history.redo(widgetMgr.getState());
    if (next) {
      widgetMgr.loadState(next);
      Storage.set({ workspace_widgets: next });
    }
  });

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), 'E' (Toggle Edit)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      btnUndo.click();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      btnRedo.click();
    } else if (e.key.toLowerCase() === 'e') {
      e.preventDefault();
      btnToggleEdit.click();
    }
  });

  // Add Widget Modal & Catalog
  const addModal = document.getElementById('add-widget-modal');
  const widgetLibraryList = document.getElementById('widget-library-list');
  const widgetSearchInput = document.getElementById('widget-search-input');

  function populateLibrary(filter = '') {
    widgetLibraryList.innerHTML = '';
    const query = filter.toLowerCase();

    Object.entries(WidgetRegistry.definitions).forEach(([typeKey, def]) => {
      if (def.title.toLowerCase().includes(query) || typeKey.toLowerCase().includes(query)) {
        const item = document.createElement('div');
        item.className = 'library-item-card';
        item.innerHTML = `
          <h4>${def.title}</h4>
          <p>Click to add to workspace</p>
        `;
        item.addEventListener('click', () => {
          widgetMgr.addWidget({ type: typeKey }, true);
          addModal.classList.add('hidden');
        });
        widgetLibraryList.appendChild(item);
      }
    });
  }

  document.getElementById('btn-add-widget').addEventListener('click', () => {
    populateLibrary();
    addModal.classList.remove('hidden');
    widgetSearchInput.value = '';
    widgetSearchInput.focus();
  });

  document.getElementById('btn-close-widget-modal').addEventListener('click', () => {
    addModal.classList.add('hidden');
  });

  addModal.addEventListener('pointerdown', (e) => {
    if (e.target === addModal) addModal.classList.add('hidden');
  });

  widgetSearchInput.addEventListener('input', (e) => {
    populateLibrary(e.target.value);
  });

  // Layout Export / Import Tools
  document.getElementById('btn-export-layout').addEventListener('click', () => {
    const layoutData = JSON.stringify(widgetMgr.getState(), null, 2);
    const blob = new Blob([layoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glass-workspace-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('layout-import-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          widgetMgr.loadState(imported);
          Storage.set({ workspace_widgets: imported });
          alert('Layout successfully imported!');
        }
      } catch {
        alert('Invalid layout JSON file.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-reset-layout').addEventListener('click', () => {
    if (confirm('Are you sure you want to restore the default workspace layout?')) {
      widgetMgr.loadState(DEFAULT_WORKSPACE_LAYOUT);
      Storage.set({ workspace_widgets: DEFAULT_WORKSPACE_LAYOUT });
    }
  });
});