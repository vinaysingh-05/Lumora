/**
 * History Manager for Widget State Changes
 */
export class UndoRedoManager {
  constructor(limit = 30) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = [];
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  notify() {
    const canUndo = this.undoStack.length > 0;
    const canRedo = this.redoStack.length > 0;
    this.listeners.forEach((fn) => fn({ canUndo, canRedo }));
  }

  recordState(state) {
    const cloned = JSON.parse(JSON.stringify(state));
    this.undoStack.push(cloned);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Cleared on state fork
    this.notify();
  }

  undo(currentState) {
    if (this.undoStack.length === 0) return null;
    this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
    const previous = this.undoStack.pop();
    this.notify();
    return previous;
  }

  redo(currentState) {
    if (this.redoStack.length === 0) return null;
    this.undoStack.push(JSON.parse(JSON.stringify(currentState)));
    const next = this.redoStack.pop();
    this.notify();
    return next;
  }
}