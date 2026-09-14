/* ============================================
   EDITOR - Core Application (Entry Point)
   ============================================ */

class ProfileEditor {
  constructor() {
    this.canvas = null;
    this.history = null;
    this.storage = new StorageManager();
    this.elements = null;
    this.exportMgr = null;
    this.toolbar = null;
    this.autoSaveInterval = null;

    this.init();
  }

  async init() {
    // Initialize Fabric.js canvas
    this.canvas = new fabric.Canvas('fabric-canvas', {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      controlsAboveOverlay: true,
    });

    // Configure canvas controls styling
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = '#7c5cfc';
    fabric.Object.prototype.cornerStrokeColor = '#7c5cfc';
    fabric.Object.prototype.borderColor = '#7c5cfc';
    fabric.Object.prototype.cornerSize = 8;
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.borderDashArray = [4, 4];
    fabric.Object.prototype.padding = 4;

    // Initialize modules
    this.history = new HistoryManager(this.canvas);
    this.elements = new ElementFactory(this.canvas, this.history);
    this.exportMgr = new ExportManager(this.canvas);
    this.toolbar = new ToolbarManager(this.canvas, this.history, this.elements, this.exportMgr, this.storage);

    // Track changes for history
    this.canvas.on('object:modified', () => this.history.saveState());
    this.canvas.on('object:added', () => {});  // handled in ElementFactory
    this.canvas.on('text:changed', () => this.history.saveState());

    // Load template or autosave
    await this.loadInitialContent();

    // Save initial state
    this.history.saveState();

    // Start auto-save
    this.startAutoSave();

    // Zoom to fit
    setTimeout(() => {
      this.toolbar.zoomToFit();
    }, 200);

    // Hide loading screen
    const loading = document.getElementById('editor-loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 500);
    }

    // Update canvas size info
    document.getElementById('canvas-size-info').textContent = 
      `${CANVAS_WIDTH} × ${CANVAS_HEIGHT} px (A4)`;
  }

  async loadInitialContent() {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');

    if (templateId && templateId !== 'blank') {
      await this.loadTemplate(templateId);
    } else if (templateId === 'blank') {
      // Just white background
      this._addBackground('#ffffff');
    } else {
      // Try to load autosave
      const autosave = this.storage.loadAutoSave();
      if (autosave && autosave.data) {
        await new Promise(resolve => {
          this.canvas.loadFromJSON(autosave.data, () => {
            this.canvas.renderAll();
            resolve();
          });
        });
      } else {
        // Load default template
        await this.loadTemplate('modern-minimal');
      }
    }
  }

  async loadTemplate(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      this.toolbar?.showToast('Template không tìm thấy!', 'error');
      this._addBackground('#ffffff');
      return;
    }

    // Clear canvas
    this.canvas.clear();

    // Build template objects
    const objects = template.build(CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const objDef of objects) {
      await this._createFabricObject(objDef);
    }

    this.canvas.renderAll();

    // Update project name
    const nameInput = document.getElementById('project-name');
    if (nameInput) nameInput.value = template.name + ' Profile';

    this.toolbar?.showToast(`Template "${template.name}" loaded!`, 'success');
  }

  _createFabricObject(def) {
    return new Promise((resolve) => {
      let obj;
      const commonProps = {
        left: def.left || 0,
        top: def.top || 0,
      };

      switch (def.type) {
        case 'rect':
          obj = new fabric.Rect({
            ...commonProps,
            width: def.width,
            height: def.height,
            fill: def.fill || '#ffffff',
            rx: def.rx || 0,
            ry: def.ry || 0,
            stroke: def.stroke || '',
            strokeWidth: def.strokeWidth || 0,
            angle: def.angle || 0,
            scaleX: def.scaleX || 1,
            scaleY: def.scaleY || 1,
            selectable: def.selectable !== false,
            evented: def.evented !== false,
            _isBackground: def._isBackground || false,
          });
          if (def.shadow) obj.set('shadow', def.shadow);
          this.canvas.add(obj);
          resolve(obj);
          break;

        case 'circle':
          obj = new fabric.Circle({
            ...commonProps,
            radius: def.radius || 50,
            fill: def.fill || '#cccccc',
            stroke: def.stroke || '',
            strokeWidth: def.strokeWidth || 0,
            selectable: def.selectable !== false,
            evented: def.evented !== false,
          });
          this.canvas.add(obj);
          resolve(obj);
          break;

        case 'line':
          obj = new fabric.Line([def.x1, def.y1, def.x2, def.y2], {
            stroke: def.stroke || '#000000',
            strokeWidth: def.strokeWidth || 1,
            selectable: def.selectable !== false,
          });
          this.canvas.add(obj);
          resolve(obj);
          break;

        case 'textbox':
          obj = new fabric.Textbox(def.text || def.content || '', {
            ...commonProps,
            width: def.width || 200,
            fontSize: def.fontSize || 14,
            fontFamily: def.fontFamily || 'Inter',
            fontWeight: def.fontWeight || '400',
            fontStyle: def.fontStyle || 'normal',
            fill: def.fill || '#000000',
            textAlign: def.textAlign || 'left',
            lineHeight: def.lineHeight || 1.4,
            letterSpacing: def.letterSpacing || 0,
            selectable: def.selectable !== false,
            evented: def.evented !== false,
          });
          this.canvas.add(obj);
          resolve(obj);
          break;

        case 'text':
          obj = new fabric.Text(def.text || def.content || '', {
            ...commonProps,
            fontSize: def.fontSize || 14,
            fontFamily: def.fontFamily || 'Inter',
            fontWeight: def.fontWeight || '400',
            fill: def.fill || '#000000',
            textAlign: def.textAlign || 'left',
          });
          this.canvas.add(obj);
          resolve(obj);
          break;

        default:
          resolve(null);
      }
    });
  }

  _addBackground(color) {
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      fill: color,
      selectable: false,
      evented: false,
      _isBackground: true,
    });
    this.canvas.add(bg);
    this.canvas.sendToBack(bg);
  }

  // ---- Auto-save ----
  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this._performAutoSave();
    }, 30000); // Every 30 seconds

    // Also save on page unload
    window.addEventListener('beforeunload', () => {
      this._performAutoSave();
    });
  }

  _performAutoSave() {
    const dot = document.getElementById('autosave-dot');
    const text = document.getElementById('autosave-text');

    if (dot) dot.classList.add('saving');
    if (text) text.textContent = 'Saving...';

    const json = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
    this.storage.autoSave(json);

    setTimeout(() => {
      if (dot) dot.classList.remove('saving');
      if (text) text.textContent = 'Saved';
    }, 1000);
  }
}

// ---- Initialize app ----
document.addEventListener('DOMContentLoaded', () => {
  window.editorApp = new ProfileEditor();
});
