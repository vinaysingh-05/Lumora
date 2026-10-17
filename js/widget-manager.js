/**
 * Widget Lifecycle and Canvas Manager
 */
import { WidgetRegistry } from './widget-registry.js';
import { DragManager } from './drag-manager.js';
import { ResizeManager } from './resize-manager.js';

export class WidgetManager {
  constructor(canvasEl, options = {}) {
    this.canvas = canvasEl;
    this.options = options;
    this.widgets = [];
    this.activeWidgetId = null;
    this.gridSnap = false;

    this.dragManager = new DragManager(this.canvas, {
      getGridSnap: () => this.gridSnap,
      onDragStart: (w) => this.selectWidget(w.id),
      onDragEnd: () => this.options.onStateChange && this.options.onStateChange()
    });

    this.resizeManager = new ResizeManager(this.canvas, {
      onResizeEnd: () => this.options.onStateChange && this.options.onStateChange()
    });

    // Deselect active widget when clicking canvas background
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.target === this.canvas) {
        this.deselectAll();
      }
    });

    window.addEventListener('resize', () => this.recalculateResponsivePositions());
  }

  setGridSnap(val) {
    this.gridSnap = !!val;
  }

  loadState(widgetList) {
    this.canvas.innerHTML = '';
    this.widgets = [];
    widgetList.forEach((cfg) => this.addWidget(cfg, false));
  }

  getState() {
    return JSON.parse(JSON.stringify(this.widgets));
  }

  addWidget(config, isNew = true) {
    const def = WidgetRegistry.definitions[config.type];
    if (!def) return null;

    const canvasW = this.canvas.clientWidth || window.innerWidth;
    const canvasH = this.canvas.clientHeight || window.innerHeight;

    const widget = {
      id: config.id || 'w_' + Math.random().toString(36).substring(2, 9),
      type: config.type,
      title: config.title || def.title,
      x: config.x !== undefined ? config.x : Math.max(20, (canvasW - def.defaultWidth) / 2),
      y: config.y !== undefined ? config.y : Math.max(20, (canvasH - def.defaultHeight) / 2),
      w: config.w || def.defaultWidth,
      h: config.h || def.defaultHeight,
      minW: def.minWidth,
      minH: def.minHeight,
      zIndex: config.zIndex || 10,
      isLocked: !!config.isLocked,
      config: config.config || {}
    };

    this.widgets.push(widget);
    this.renderWidgetDOM(widget);

    if (isNew) {
      this.selectWidget(widget.id);
      if (this.options.onStateChange) this.options.onStateChange();
    }
    return widget;
  }

  renderWidgetDOM(widget) {
    const el = document.createElement('div');
    el.id = widget.id;
    el.className = `widget glass-panel ${widget.isLocked ? 'locked' : ''}`;
    el.style.width = `${widget.w}px`;
    el.style.height = `${widget.h}px`;
    el.style.transform = `translate3d(${widget.x}px, ${widget.y}px, 0)`;
    el.style.zIndex = widget.zIndex;

    // Header bar
    const header = document.createElement('div');
    header.className = 'widget-header';
    header.innerHTML = `<span class="widget-title">${widget.title}</span>`;
    el.appendChild(header);

    // Body container
    const body = document.createElement('div');
    body.className = 'widget-body';
    el.appendChild(body);

    // Render Widget Component Body
    const def = WidgetRegistry.definitions[widget.type];
    if (def && def.render) {
      def.render(body, widget.config, () => {
        if (this.options.onStateChange) this.options.onStateChange();
      });
    }

    // Interactive Action Ribbon (displayed on selected widgets in Edit Mode)
    const ribbon = document.createElement('div');
    ribbon.className = 'widget-action-ribbon hidden';
    ribbon.innerHTML = `
      <button class="ribbon-btn btn-lock" title="${widget.isLocked ? 'Unlock' : 'Lock'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </button>
      <button class="ribbon-btn btn-dup" title="Duplicate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="ribbon-btn btn-zup" title="Bring to Front">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
      </button>
      <button class="ribbon-btn btn-zdown" title="Send to Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <button class="ribbon-btn delete btn-del" title="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    ribbon.querySelector('.btn-lock').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLock(widget.id);
    });
    ribbon.querySelector('.btn-dup').addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateWidget(widget.id);
    });
    ribbon.querySelector('.btn-zup').addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeZ(widget.id, 5);
    });
    ribbon.querySelector('.btn-zdown').addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeZ(widget.id, -5);
    });
    ribbon.querySelector('.btn-del').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteWidget(widget.id);
    });
    el.appendChild(ribbon);

    // Attach drag & resize controllers
    this.dragManager.attach(el, () => widget, (x, y) => {
      widget.x = x;
      widget.y = y;
    });

    this.resizeManager.attachHandles(el, widget, (wData) => {
      widget.x = wData.x;
      widget.y = wData.y;
      widget.w = wData.w;
      widget.h = wData.h;
    });

    el.addEventListener('pointerdown', () => this.selectWidget(widget.id));
    this.canvas.appendChild(el);
  }

  selectWidget(id) {
    if (this.activeWidgetId === id) return;
    this.deselectAll();
    this.activeWidgetId = id;
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('selected');
      const ribbon = el.querySelector('.widget-action-ribbon');
      if (ribbon && document.body.classList.contains('mode-edit')) {
        ribbon.classList.remove('hidden');
      }
    }
  }

  deselectAll() {
    this.activeWidgetId = null;
    this.canvas.querySelectorAll('.widget').forEach(w => {
      w.classList.remove('selected');
      const rib = w.querySelector('.widget-action-ribbon');
      if (rib) rib.classList.add('hidden');
    });
  }

  toggleLock(id) {
    const w = this.widgets.find(x => x.id === id);
    if (!w) return;
    w.isLocked = !w.isLocked;
    const el = document.getElementById(id);
    if (el) el.classList.toggle('locked', w.isLocked);
    if (this.options.onStateChange) this.options.onStateChange();
  }

  duplicateWidget(id) {
    const source = this.widgets.find(x => x.id === id);
    if (!source) return;
    const cloned = JSON.parse(JSON.stringify(source));
    delete cloned.id;
    cloned.x += 30;
    cloned.y += 30;
    this.addWidget(cloned, true);
  }

  deleteWidget(id) {
    this.widgets = this.widgets.filter(w => w.id !== id);
    const el = document.getElementById(id);
    if (el) el.remove();
    this.activeWidgetId = null;
    if (this.options.onStateChange) this.options.onStateChange();
  }

  changeZ(id, delta) {
    const w = this.widgets.find(x => x.id === id);
    if (!w) return;
    w.zIndex = Math.max(1, (w.zIndex || 10) + delta);
    const el = document.getElementById(id);
    if (el) el.style.zIndex = w.zIndex;
    if (this.options.onStateChange) this.options.onStateChange();
  }

  recalculateResponsivePositions() {
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    this.widgets.forEach(w => {
      if (w.x + w.w > cw) w.x = Math.max(0, cw - w.w);
      if (w.y + w.h > ch) w.y = Math.max(0, ch - w.h);
      const el = document.getElementById(w.id);
      if (el) {
        el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;
      }
    });
  }
}