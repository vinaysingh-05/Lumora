/**
 * Pointer Drag Engine
 * Coordinates widget dragging with boundary clamping, stacking elevation,
 * and snap-to-grid capabilities.
 */

export class DragManager {
  constructor(canvasEl, options = {}) {
    this.canvas = canvasEl;
    this.options = options;
    this.activeDrag = null;
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onDrag = options.onDrag || (() => {});
  }

  attach(widgetEl, getWidgetData, setWidgetPosition) {
    const header = widgetEl.querySelector('.widget-header') || widgetEl;

    header.addEventListener('pointerdown', (e) => {
      // Disallow drag if not in edit mode or if widget is locked
      if (!document.body.classList.contains('mode-edit')) return;
      if (e.target.closest('.widget-action-ribbon') || e.target.closest('button')) return;

      const widget = getWidgetData();
      if (widget.isLocked) return;

      e.preventDefault();
      header.setPointerCapture(e.pointerId);

      const canvasRect = this.canvas.getBoundingClientRect();
      const widgetRect = widgetEl.getBoundingClientRect();

      this.activeDrag = {
        pointerId: e.pointerId,
        widgetEl,
        startX: e.clientX,
        startY: e.clientY,
        initialLeft: widgetRect.left - canvasRect.left,
        initialTop: widgetRect.top - canvasRect.top,
        canvasRect,
        widgetRect,
        widgetData: widget,
        setPos: setWidgetPosition
      };

      this.onDragStart(widget);
      
      const onPointerMove = (evt) => {
        if (!this.activeDrag || evt.pointerId !== this.activeDrag.pointerId) return;

        const deltaX = evt.clientX - this.activeDrag.startX;
        const deltaY = evt.clientY - this.activeDrag.startY;

        let newX = this.activeDrag.initialLeft + deltaX;
        let newY = this.activeDrag.initialTop + deltaY;

        // Snapping logic if enabled
        if (this.options.getGridSnap && this.options.getGridSnap()) {
          const gridSize = 20;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        // Boundary clamping inside viewport
        const maxW = this.activeDrag.canvasRect.width - this.activeDrag.widgetRect.width;
        const maxH = this.activeDrag.canvasRect.height - this.activeDrag.widgetRect.height;
        newX = Math.max(0, Math.min(newX, maxW));
        newY = Math.max(0, Math.min(newY, maxH));

        widgetEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        this.activeDrag.currentX = newX;
        this.activeDrag.currentY = newY;
        this.onDrag(widget, newX, newY);
      };

      const onPointerUp = (evt) => {
        if (!this.activeDrag || evt.pointerId !== this.activeDrag.pointerId) return;
        header.releasePointerCapture(evt.pointerId);

        header.removeEventListener('pointermove', onPointerMove);
        header.removeEventListener('pointerup', onPointerUp);
        header.removeEventListener('pointercancel', onPointerUp);

        if (this.activeDrag.currentX !== undefined && this.activeDrag.currentY !== undefined) {
          this.activeDrag.setPos(this.activeDrag.currentX, this.activeDrag.currentY);
        }
        this.onDragEnd(this.activeDrag.widgetData);
        this.activeDrag = null;
      };

      header.addEventListener('pointermove', onPointerMove);
      header.addEventListener('pointerup', onPointerUp);
      header.addEventListener('pointercancel', onPointerUp);
    });
  }
}