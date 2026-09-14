/* ============================================
   HISTORY SYSTEM - Undo/Redo
   ============================================ */

class HistoryManager {
  constructor(canvas, maxStates = 50) {
    this.canvas = canvas;
    this.maxStates = maxStates;
    this.undoStack = [];
    this.redoStack = [];
    this.locked = false;
  }

  saveState() {
    if (this.locked) return;
    const json = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
    this.undoStack.push(JSON.stringify(json));
    if (this.undoStack.length > this.maxStates) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this._updateUI();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.locked = true;
    const currentState = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
    this.redoStack.push(JSON.stringify(currentState));
    const previousState = this.undoStack.pop();
    this.canvas.loadFromJSON(JSON.parse(previousState), () => {
      this.canvas.renderAll();
      this.locked = false;
      this._updateUI();
    });
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.locked = true;
    const currentState = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
    this.undoStack.push(JSON.stringify(currentState));
    const nextState = this.redoStack.pop();
    this.canvas.loadFromJSON(JSON.parse(nextState), () => {
      this.canvas.renderAll();
      this.locked = false;
      this._updateUI();
    });
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  _updateUI() {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');
    if (undoBtn) undoBtn.style.opacity = this.canUndo() ? '1' : '0.3';
    if (redoBtn) redoBtn.style.opacity = this.canRedo() ? '1' : '0.3';
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this._updateUI();
  }
}
