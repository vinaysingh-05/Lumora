/**
 * 8-Point Multi-Handle Resize Engine
 */

export class ResizeManager {
  constructor(canvasEl, options = {}) {
    this.canvas = canvasEl;
    this.onResizeEnd = options.onResizeEnd || (() => {});
  }

  attachHandles(widgetEl, widgetData, onUpdateBounds) {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    handles.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle handle-${dir}`;
      widgetEl.appendChild(handle);

      handle.addEventListener('pointerdown', (e) => {
        if (widgetData.isLocked || !document.body.classList.contains('mode-edit')) return;
        e.preventDefault();
        e.stopPropagation();

        handle.setPointerCapture(e.pointerId);

        const canvasRect = this.canvas.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = widgetData.w;
        const startH = widgetData.h;
        const startL = widgetData.x;
        const startT = widgetData.y;
        const minW = widgetData.minW || 140;
        const minH = widgetData.minH || 100;

        const onPointerMove = (evt) => {
          const deltaX = evt.clientX - startX;
          const deltaY = evt.clientY - startY;

          let newW = startW;
          let newH = startH;
          let newL = startL;
          let newT = startT;

          if (dir.includes('e')) newW = Math.max(minW, startW + deltaX);
          if (dir.includes('s')) newH = Math.max(minH, startH + deltaY);
          if (dir.includes('w')) {
            const potentialW = startW - deltaX;
            if (potentialW >= minW) {
              newW = potentialW;
              newL = startL + deltaX;
            }
          }
          if (dir.includes('n')) {
            const potentialH = startH - deltaY;
            if (potentialH >= minH) {
              newH = potentialH;
              newT = startT + deltaY;
            }
          }

          // Viewport constraint clamping
          newL = Math.max(0, newL);
          newT = Math.max(0, newT);
          if (newL + newW > canvasRect.width) newW = canvasRect.width - newL;
          if (newT + newH > canvasRect.height) newH = canvasRect.height - newT;

          widgetEl.style.transform = `translate3d(${newL}px, ${newT}px, 0)`;
          widgetEl.style.width = `${newW}px`;
          widgetEl.style.height = `${newH}px`;

          widgetData.x = newL;
          widgetData.y = newT;
          widgetData.w = newW;
          widgetData.h = newH;
        };

        const onPointerUp = (evt) => {
          handle.releasePointerCapture(evt.pointerId);
          handle.removeEventListener('pointermove', onPointerMove);
          handle.removeEventListener('pointerup', onPointerUp);
          handle.removeEventListener('pointercancel', onPointerUp);

          onUpdateBounds(widgetData);
          this.onResizeEnd(widgetData);
        };

        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
      });
    });
  }
}