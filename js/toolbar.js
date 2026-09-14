/* ============================================
   TOOLBAR - UI interactions & Property Panel
   ============================================ */

class ToolbarManager {
  constructor(canvas, history, elements, exportMgr, storage) {
    this.canvas = canvas;
    this.history = history;
    this.elements = elements;
    this.exportMgr = exportMgr;
    this.storage = storage;
    this.clipboard = null;
    this.selectedFormat = 'png';
    this._suppressPropUpdate = false;

    this.initSidebarTabs();
    this.initSidebarActions();
    this.initPropertyPanel();
    this.initToolbarButtons();
    this.initFileMenu();
    this.initExportModal();
    this.initSaveModal();
    this.initLoadModal();
    this.initZoom();
    this.initContextMenu();
    this.initKeyboardShortcuts();
    this.initTemplateSwitch();
    this.initImageUpload();
  }

  // ==========================================
  // SIDEBAR TABS
  // ==========================================
  initSidebarTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.sidebar-panel').forEach(p => p.style.display = 'none');
        const panelId = `panel-${tab.dataset.panel}`;
        const panel = document.getElementById(panelId);
        if (panel) panel.style.display = 'block';
      });
    });
  }

  // ==========================================
  // SIDEBAR ELEMENT ACTIONS
  // ==========================================
  initSidebarActions() {
    // Text items
    document.querySelectorAll('[data-add]').forEach(el => {
      el.addEventListener('click', () => {
        const type = el.dataset.add;
        const center = this._getCanvasCenter();
        switch (type) {
          case 'heading': this.elements.addHeading({ left: center.x - 150, top: center.y - 50 }); break;
          case 'subheading': this.elements.addSubheading({ left: center.x - 125, top: center.y - 30 }); break;
          case 'body': this.elements.addBodyText({ left: center.x - 200, top: center.y - 30 }); break;
          case 'custom': this.elements.addCustomText({ left: center.x - 50, top: center.y - 20 }); break;
          case 'rect': this.elements.addRect({ left: center.x - 100, top: center.y - 60 }); break;
          case 'circle': this.elements.addCircle({ left: center.x - 60, top: center.y - 60 }); break;
          case 'triangle': this.elements.addTriangle({ left: center.x - 50, top: center.y - 50 }); break;
          case 'line': this.elements.addLine({ x1: center.x - 150, y1: center.y, x2: center.x + 150, y2: center.y }); break;
          case 'star': this.elements.addStar({ left: center.x - 50, top: center.y - 50 }); break;
          case 'divider-line': this.elements.addLine({ x1: center.x - 200, y1: center.y, x2: center.x + 200, y2: center.y, stroke: '#cccccc', strokeWidth: 1 }); break;
        }
      });
    });

    // Icon items
    document.querySelectorAll('[data-icon]').forEach(el => {
      el.addEventListener('click', () => {
        const center = this._getCanvasCenter();
        this.elements.addIcon(el.dataset.icon, { left: center.x - 15, top: center.y - 15, fill: '#333333' });
      });
    });

    // Component items
    document.querySelectorAll('[data-component]').forEach(el => {
      el.addEventListener('click', () => {
        const center = this._getCanvasCenter();
        switch (el.dataset.component) {
          case 'avatar': this.elements.addAvatarPlaceholder({ left: center.x - 65, top: center.y - 65 }); break;
          case 'contact-row': this.elements.addContactRow({ left: 60, top: center.y }); break;
          case 'section-header': this.elements.addSectionHeader({ left: 60, top: center.y }); break;
          case 'skill-bar': this.elements.addSkillBar({ left: 60, top: center.y }); break;
          case 'social-links': this.elements.addSocialLinks({ left: 60, top: center.y }); break;
        }
      });
    });
  }

  // ==========================================
  // PROPERTY PANEL
  // ==========================================
  initPropertyPanel() {
    const self = this;

    // Listen for canvas selection changes
    this.canvas.on('selection:created', (e) => this.updatePropertyPanel(e.selected[0]));
    this.canvas.on('selection:updated', (e) => this.updatePropertyPanel(e.selected[0]));
    this.canvas.on('selection:cleared', () => this.clearPropertyPanel());
    this.canvas.on('object:modified', (e) => this.updatePropertyPanel(e.target));
    this.canvas.on('object:scaling', (e) => this.updatePropertyPanel(e.target));
    this.canvas.on('object:moving', (e) => this.updatePropertyPanel(e.target));
    this.canvas.on('object:rotating', (e) => this.updatePropertyPanel(e.target));

    // Position inputs
    ['prop-x', 'prop-y', 'prop-w', 'prop-h', 'prop-angle'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('change', () => {
        const obj = this.canvas.getActiveObject();
        if (!obj) return;
        this._suppressPropUpdate = true;
        if (id === 'prop-x') obj.set('left', parseFloat(input.value));
        if (id === 'prop-y') obj.set('top', parseFloat(input.value));
        if (id === 'prop-w') obj.set('width', parseFloat(input.value) / (obj.scaleX || 1));
        if (id === 'prop-h') obj.set('height', parseFloat(input.value) / (obj.scaleY || 1));
        if (id === 'prop-angle') obj.set('angle', parseFloat(input.value));
        obj.setCoords();
        this.canvas.renderAll();
        this.history.saveState();
        this._suppressPropUpdate = false;
      });
    });

    // Fill color
    const fillColor = document.getElementById('prop-fill');
    const fillHex = document.getElementById('prop-fill-hex');
    fillColor?.addEventListener('input', () => { this._setFill(fillColor.value); fillHex.value = fillColor.value; });
    fillHex?.addEventListener('change', () => { this._setFill(fillHex.value); fillColor.value = fillHex.value; });

    // Stroke color
    const strokeColor = document.getElementById('prop-stroke');
    const strokeHex = document.getElementById('prop-stroke-hex');
    strokeColor?.addEventListener('input', () => { this._setStroke(strokeColor.value); strokeHex.value = strokeColor.value; });
    strokeHex?.addEventListener('change', () => { this._setStroke(strokeHex.value); strokeColor.value = strokeHex.value; });

    // Stroke width
    const strokeW = document.getElementById('prop-stroke-width');
    strokeW?.addEventListener('input', () => {
      const obj = this.canvas.getActiveObject();
      if (obj) { obj.set('strokeWidth', parseInt(strokeW.value)); this.canvas.renderAll(); }
      document.getElementById('prop-stroke-width-val').textContent = strokeW.value;
    });
    strokeW?.addEventListener('change', () => this.history.saveState());

    // Opacity
    const opacity = document.getElementById('prop-opacity');
    opacity?.addEventListener('input', () => {
      const obj = this.canvas.getActiveObject();
      if (obj) { obj.set('opacity', parseInt(opacity.value) / 100); this.canvas.renderAll(); }
      document.getElementById('prop-opacity-val').textContent = opacity.value + '%';
    });
    opacity?.addEventListener('change', () => this.history.saveState());

    // Border radius
    const radius = document.getElementById('prop-radius');
    radius?.addEventListener('input', () => {
      const obj = this.canvas.getActiveObject();
      if (obj && obj.type === 'rect') {
        obj.set({ rx: parseInt(radius.value), ry: parseInt(radius.value) });
        this.canvas.renderAll();
      }
      document.getElementById('prop-radius-val').textContent = radius.value;
    });
    radius?.addEventListener('change', () => this.history.saveState());

    // Font family
    document.getElementById('prop-font-family')?.addEventListener('change', function() {
      const obj = self.canvas.getActiveObject();
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        obj.set('fontFamily', this.value);
        self.canvas.renderAll();
        self.history.saveState();
      }
    });

    // Font size
    document.getElementById('prop-font-size')?.addEventListener('change', function() {
      const obj = self.canvas.getActiveObject();
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        obj.set('fontSize', parseInt(this.value));
        self.canvas.renderAll();
        self.history.saveState();
      }
    });

    // Line height
    document.getElementById('prop-line-height')?.addEventListener('change', function() {
      const obj = self.canvas.getActiveObject();
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        obj.set('lineHeight', parseFloat(this.value));
        self.canvas.renderAll();
        self.history.saveState();
      }
    });

    // Bold / Italic / Underline / Strikethrough
    document.getElementById('prop-bold')?.addEventListener('click', () => this._toggleTextStyle('fontWeight', '700', '400'));
    document.getElementById('prop-italic')?.addEventListener('click', () => this._toggleTextStyle('fontStyle', 'italic', 'normal'));
    document.getElementById('prop-underline')?.addEventListener('click', () => this._toggleTextProp('underline'));
    document.getElementById('prop-strikethrough')?.addEventListener('click', () => this._toggleTextProp('linethrough'));

    // Text alignment
    document.querySelectorAll('[data-align]').forEach(btn => {
      btn.addEventListener('click', () => {
        const obj = this.canvas.getActiveObject();
        if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
          obj.set('textAlign', btn.dataset.align);
          this.canvas.renderAll();
          this.history.saveState();
          this._updateAlignmentButtons(btn.dataset.align);
        }
      });
    });

    // Layer controls
    document.getElementById('btn-bring-front')?.addEventListener('click', () => this._layerAction('bringForward'));
    document.getElementById('btn-send-back')?.addEventListener('click', () => this._layerAction('sendBackwards'));
    document.getElementById('btn-bring-top')?.addEventListener('click', () => this._layerAction('bringToFront'));
    document.getElementById('btn-send-bottom')?.addEventListener('click', () => this._layerAction('sendToBack'));

    // Canvas alignment
    document.querySelectorAll('[data-canvas-align]').forEach(btn => {
      btn.addEventListener('click', () => {
        const obj = this.canvas.getActiveObject();
        if (!obj) return;
        const cw = this.canvas.getWidth();
        const ch = this.canvas.getHeight();
        const ow = obj.getScaledWidth();
        const oh = obj.getScaledHeight();
        switch(btn.dataset.canvasAlign) {
          case 'h-left': obj.set('left', 0); break;
          case 'h-center': obj.set('left', (cw - ow) / 2); break;
          case 'h-right': obj.set('left', cw - ow); break;
          case 'v-center': obj.set('top', (ch - oh) / 2); break;
        }
        obj.setCoords();
        this.canvas.renderAll();
        this.history.saveState();
        this.updatePropertyPanel(obj);
      });
    });
  }

  updatePropertyPanel(obj) {
    if (this._suppressPropUpdate) return;
    if (!obj) return this.clearPropertyPanel();

    document.getElementById('no-selection').style.display = 'none';
    document.getElementById('properties-form').style.display = 'block';

    // Position & Size
    document.getElementById('prop-x').value = Math.round(obj.left || 0);
    document.getElementById('prop-y').value = Math.round(obj.top || 0);
    document.getElementById('prop-w').value = Math.round(obj.getScaledWidth());
    document.getElementById('prop-h').value = Math.round(obj.getScaledHeight());
    document.getElementById('prop-angle').value = Math.round(obj.angle || 0);

    // Appearance
    const fill = obj.fill || '#000000';
    const fillHex = typeof fill === 'string' ? fill : '#000000';
    try { document.getElementById('prop-fill').value = fillHex; } catch(e) {}
    document.getElementById('prop-fill-hex').value = fillHex;

    const stroke = obj.stroke || '#000000';
    try { document.getElementById('prop-stroke').value = stroke; } catch(e) {}
    document.getElementById('prop-stroke-hex').value = stroke || '';

    document.getElementById('prop-stroke-width').value = obj.strokeWidth || 0;
    document.getElementById('prop-stroke-width-val').textContent = obj.strokeWidth || 0;

    document.getElementById('prop-opacity').value = Math.round((obj.opacity || 1) * 100);
    document.getElementById('prop-opacity-val').textContent = Math.round((obj.opacity || 1) * 100) + '%';

    // Border radius (only for rect)
    const radiusSection = document.getElementById('prop-radius');
    if (obj.type === 'rect') {
      radiusSection.parentElement.style.display = 'flex';
      radiusSection.value = obj.rx || 0;
      document.getElementById('prop-radius-val').textContent = obj.rx || 0;
    } else {
      radiusSection.parentElement.style.display = 'none';
    }

    // Text properties
    const isText = obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text';
    document.getElementById('section-text').style.display = isText ? 'block' : 'none';

    if (isText) {
      document.getElementById('prop-font-family').value = obj.fontFamily || 'Inter';
      document.getElementById('prop-font-size').value = obj.fontSize || 14;
      document.getElementById('prop-line-height').value = obj.lineHeight || 1.4;

      // Toggle states
      this._updateToggle('prop-bold', obj.fontWeight === '700' || obj.fontWeight === 'bold');
      this._updateToggle('prop-italic', obj.fontStyle === 'italic');
      this._updateToggle('prop-underline', obj.underline);
      this._updateToggle('prop-strikethrough', obj.linethrough);
      this._updateAlignmentButtons(obj.textAlign || 'left');

      document.getElementById('prop-panel-title').textContent = 'Text Properties';
    } else {
      document.getElementById('prop-panel-title').textContent = 
        obj.type === 'image' ? 'Image Properties' : 
        obj.type === 'group' ? 'Group Properties' : 'Shape Properties';
    }
  }

  clearPropertyPanel() {
    document.getElementById('no-selection').style.display = 'flex';
    document.getElementById('properties-form').style.display = 'none';
    document.getElementById('prop-panel-title').textContent = 'Properties';
  }

  _setFill(color) {
    const obj = this.canvas.getActiveObject();
    if (obj) { obj.set('fill', color); this.canvas.renderAll(); this.history.saveState(); }
  }

  _setStroke(color) {
    const obj = this.canvas.getActiveObject();
    if (obj) { obj.set('stroke', color); this.canvas.renderAll(); this.history.saveState(); }
  }

  _toggleTextStyle(prop, onValue, offValue) {
    const obj = this.canvas.getActiveObject();
    if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) return;
    const current = obj.get(prop);
    obj.set(prop, current === onValue ? offValue : onValue);
    this.canvas.renderAll();
    this.history.saveState();
    this.updatePropertyPanel(obj);
  }

  _toggleTextProp(prop) {
    const obj = this.canvas.getActiveObject();
    if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) return;
    obj.set(prop, !obj[prop]);
    this.canvas.renderAll();
    this.history.saveState();
    this.updatePropertyPanel(obj);
  }

  _updateToggle(id, isActive) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', isActive);
  }

  _updateAlignmentButtons(align) {
    document.querySelectorAll('[data-align]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.align === align);
    });
  }

  _layerAction(action) {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    this.canvas[action](obj);
    this.canvas.renderAll();
    this.history.saveState();
  }

  // ==========================================
  // TOOLBAR BUTTONS
  // ==========================================
  initToolbarButtons() {
    document.getElementById('btn-undo')?.addEventListener('click', () => this.history.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.history.redo());
    document.getElementById('btn-copy')?.addEventListener('click', () => this.copyObject());
    document.getElementById('btn-paste')?.addEventListener('click', () => this.pasteObject());
    document.getElementById('btn-delete')?.addEventListener('click', () => this.deleteObject());
  }

  // ==========================================
  // FILE MENU
  // ==========================================
  initFileMenu() {
    const btn = document.getElementById('file-menu-btn');
    const dropdown = document.getElementById('file-menu-dropdown');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => dropdown?.classList.remove('active'));

    dropdown?.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item) return;
      dropdown.classList.remove('active');
      
      switch(item.dataset.action) {
        case 'new': this.newProject(); break;
        case 'save': this.quickSave(); break;
        case 'save-as': this.showSaveModal(); break;
        case 'export-json': this.exportJSON(); break;
        case 'import': this.importJSON(); break;
        case 'load': this.showLoadModal(); break;
      }
    });
  }

  // ==========================================
  // EXPORT MODAL
  // ==========================================
  initExportModal() {
    const modal = document.getElementById('export-modal');
    const self = this;

    document.getElementById('btn-export')?.addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('export-modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-export-cancel')?.addEventListener('click', () => modal.classList.remove('active'));

    // Format selection
    document.querySelectorAll('.export-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.export-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        self.selectedFormat = opt.dataset.format;
        // Hide quality for SVG
        document.getElementById('export-quality-section').style.display = 
          opt.dataset.format === 'svg' ? 'none' : 'block';
      });
    });

    // Quality label
    const qualitySlider = document.getElementById('export-quality');
    const qualityLabel = document.getElementById('quality-label');
    const qualityLabels = { 1: '1x (Thấp)', 2: '2x (Cao)', 3: '3x (Rất cao)', 4: '4x (Max)' };
    qualitySlider?.addEventListener('input', () => {
      qualityLabel.textContent = qualityLabels[qualitySlider.value];
    });

    // Confirm export
    document.getElementById('btn-export-confirm')?.addEventListener('click', () => {
      const multiplier = parseInt(qualitySlider.value);
      this.exportMgr.export(this.selectedFormat, { multiplier, quality: 0.92 });
      modal.classList.remove('active');
      this.showToast('Đang tải xuống...', 'success');
    });
  }

  // ==========================================
  // SAVE / LOAD MODALS
  // ==========================================
  initSaveModal() {
    const modal = document.getElementById('save-modal');
    document.getElementById('save-modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-save-cancel')?.addEventListener('click', () => modal.classList.remove('active'));

    document.getElementById('btn-save-confirm')?.addEventListener('click', () => {
      const name = document.getElementById('save-project-name').value.trim();
      if (!name) return;
      const json = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
      const success = this.storage.saveProject(name, json);
      if (success) {
        document.getElementById('project-name').value = name;
        this.showToast('Project đã được lưu!', 'success');
      } else {
        this.showToast('Lỗi: Không thể lưu project', 'error');
      }
      modal.classList.remove('active');
    });
  }

  initLoadModal() {
    const modal = document.getElementById('load-modal');
    document.getElementById('load-modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-load-cancel')?.addEventListener('click', () => modal.classList.remove('active'));
  }

  showSaveModal() {
    const modal = document.getElementById('save-modal');
    document.getElementById('save-project-name').value = document.getElementById('project-name').value;
    modal.classList.add('active');
  }

  showLoadModal() {
    const modal = document.getElementById('load-modal');
    const list = document.getElementById('load-project-list');
    const projects = this.storage.getProjects();

    if (projects.length === 0) {
      list.innerHTML = '<div class="no-selection" style="padding:2rem"><span class="material-icons-round" style="font-size:32px;color:var(--text-tertiary)">folder_off</span><p style="margin-top:8px">Chưa có project nào được lưu</p></div>';
    } else {
      list.innerHTML = projects.map(p => `
        <div class="component-item" style="margin-bottom:8px;cursor:pointer" data-project-id="${p.id}">
          <span class="material-icons-round">description</span>
          <div style="flex:1">
            <div class="component-item-name">${p.name}</div>
            <div class="component-item-desc">${new Date(p.updatedAt).toLocaleString('vi-VN')}</div>
          </div>
          <button class="btn-icon" data-delete-project="${p.id}" style="color:#ef4444" data-tooltip="Xoá">
            <span class="material-icons-round" style="font-size:16px">delete</span>
          </button>
        </div>
      `).join('');

      // Load project
      list.querySelectorAll('[data-project-id]').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.closest('[data-delete-project]')) return;
          const project = this.storage.loadProject(el.dataset.projectId);
          if (project) {
            this.canvas.loadFromJSON(project.data, () => {
              this.canvas.renderAll();
              document.getElementById('project-name').value = project.name;
              this.history.clear();
              this.history.saveState();
              modal.classList.remove('active');
              this.showToast(`Đã mở: ${project.name}`, 'info');
            });
          }
        });
      });

      // Delete project
      list.querySelectorAll('[data-delete-project]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.storage.deleteProject(btn.dataset.deleteProject);
          this.showLoadModal(); // Refresh list
        });
      });
    }

    modal.classList.add('active');
  }

  // ==========================================
  // ZOOM
  // ==========================================
  initZoom() {
    this.zoomLevel = 1;

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.setZoom(this.zoomLevel + 0.1));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.setZoom(this.zoomLevel - 0.1));
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => this.zoomToFit());

    const slider = document.getElementById('zoom-slider');
    slider?.addEventListener('input', () => this.setZoom(parseInt(slider.value) / 100));

    // Mouse wheel zoom
    const canvasArea = document.getElementById('canvas-area');
    canvasArea?.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        this.setZoom(this.zoomLevel + delta);
      }
    }, { passive: false });
  }

  setZoom(level) {
    this.zoomLevel = Math.max(0.25, Math.min(2, level));
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      wrapper.style.transform = `scale(${this.zoomLevel})`;
      wrapper.style.transformOrigin = 'center center';
    }
    const pct = Math.round(this.zoomLevel * 100);
    document.getElementById('zoom-value').textContent = pct + '%';
    document.getElementById('zoom-slider').value = pct;
    document.getElementById('zoom-slider-value').textContent = pct + '%';
  }

  zoomToFit() {
    const canvasArea = document.getElementById('canvas-area');
    if (!canvasArea) return;
    const areaW = canvasArea.clientWidth - 80;
    const areaH = canvasArea.clientHeight - 80;
    const canvasW = this.canvas.getWidth();
    const canvasH = this.canvas.getHeight();
    const zoom = Math.min(areaW / canvasW, areaH / canvasH, 1);
    this.setZoom(zoom);
  }

  // ==========================================
  // CONTEXT MENU
  // ==========================================
  initContextMenu() {
    const menu = document.getElementById('context-menu');

    this.canvas.on('mouse:down', (e) => {
      if (e.e.button === 2) { // right click
        e.e.preventDefault();
        e.e.stopPropagation();
        
        if (e.target) {
          this.canvas.setActiveObject(e.target);
        }

        const canvasArea = document.getElementById('canvas-area');
        const rect = canvasArea.getBoundingClientRect();
        menu.style.left = e.e.clientX + 'px';
        menu.style.top = e.e.clientY + 'px';
        menu.classList.add('active');
      }
    });

    // Prevent default context menu on canvas
    document.getElementById('canvas-area')?.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('click', () => menu?.classList.remove('active'));

    menu?.addEventListener('click', (e) => {
      const item = e.target.closest('.context-menu-item');
      if (!item) return;
      menu.classList.remove('active');
      switch(item.dataset.action) {
        case 'copy': this.copyObject(); break;
        case 'paste': this.pasteObject(); break;
        case 'duplicate': this.duplicateObject(); break;
        case 'delete': this.deleteObject(); break;
        case 'bring-front': this._layerAction('bringForward'); break;
        case 'send-back': this._layerAction('sendBackwards'); break;
      }
    });
  }

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't capture when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.target.id === 'project-name' || e.target.closest('.modal-content')) return;
        // Allow text editing inside canvas
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.history.undo();
      } else if (ctrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.history.redo();
      } else if (ctrl && e.key === 'y') {
        e.preventDefault();
        this.history.redo();
      } else if (ctrl && e.key === 'c') {
        if (this.canvas.getActiveObject()) {
          e.preventDefault();
          this.copyObject();
        }
      } else if (ctrl && e.key === 'v') {
        if (this.clipboard) {
          e.preventDefault();
          this.pasteObject();
        }
      } else if (ctrl && e.key === 'd') {
        e.preventDefault();
        this.duplicateObject();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        this.quickSave();
      } else if (ctrl && e.key === 'n') {
        e.preventDefault();
        this.newProject();
      } else if (ctrl && e.key === 'a') {
        e.preventDefault();
        this.canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(
          this.canvas.getObjects().filter(o => !o._isBackground),
          { canvas: this.canvas }
        );
        this.canvas.setActiveObject(sel);
        this.canvas.renderAll();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const obj = this.canvas.getActiveObject();
        if (obj && !obj.isEditing) {
          e.preventDefault();
          this.deleteObject();
        }
      }
    });
  }

  // ==========================================
  // TEMPLATE SWITCH
  // ==========================================
  initTemplateSwitch() {
    const list = document.getElementById('template-switch-list');
    if (!list) return;

    TEMPLATES.forEach(t => {
      const item = document.createElement('div');
      item.className = 'component-item';
      item.innerHTML = `
        <span class="material-icons-round">dashboard</span>
        <div>
          <div class="component-item-name">${t.name}</div>
          <div class="component-item-desc">${t.category}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        if (confirm(`Chuyển sang template "${t.name}"? Nội dung hiện tại sẽ bị thay thế.`)) {
          window.editorApp?.loadTemplate(t.id);
        }
      });
      list.appendChild(item);
    });
  }

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================
  initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');

    uploadArea?.addEventListener('click', () => fileInput?.click());

    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent-primary)';
      uploadArea.style.background = 'rgba(124, 92, 252, 0.08)';
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
      const files = e.dataTransfer.files;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          this._handleImageUpload(file);
        }
      }
    });

    fileInput?.addEventListener('change', (e) => {
      for (const file of e.target.files) {
        this._handleImageUpload(file);
      }
      fileInput.value = '';
    });

    // Load existing uploads
    this._renderUploads();
  }

  _handleImageUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File quá lớn! Giới hạn 5MB.', 'error');
      return;
    }

    this.elements.addImageFromFile(file, { maxSize: 250 }).then(() => {
      // Save to uploads list
      const reader = new FileReader();
      reader.onload = (e) => {
        this.storage.saveUpload(e.target.result, file.name);
        this._renderUploads();
      };
      reader.readAsDataURL(file);
      this.showToast('Ảnh đã được thêm!', 'success');
    });
  }

  _renderUploads() {
    const grid = document.getElementById('uploaded-grid');
    if (!grid) return;
    const uploads = this.storage.getUploads();

    grid.innerHTML = uploads.map(u => `
      <div class="uploaded-thumb" data-upload-url="${u.dataURL}">
        <img src="${u.dataURL}" alt="${u.name}">
      </div>
    `).join('');

    grid.querySelectorAll('.uploaded-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const center = this._getCanvasCenter();
        this.elements.addImageFromURL(thumb.dataset.uploadUrl, { left: center.x - 100, top: center.y - 100 });
      });
    });
  }

  // ==========================================
  // OBJECT OPERATIONS
  // ==========================================
  copyObject() {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      this.clipboard = cloned;
      this.showToast('Đã sao chép', 'info');
    });
  }

  pasteObject() {
    if (!this.clipboard) return;
    this.clipboard.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = this.canvas;
        cloned.forEachObject((obj) => this.canvas.add(obj));
        cloned.setCoords();
      } else {
        this.canvas.add(cloned);
      }
      this.canvas.setActiveObject(cloned);
      this.canvas.renderAll();
      this.history.saveState();
    });
  }

  duplicateObject() {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.renderAll();
      this.history.saveState();
    });
  }

  deleteObject() {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    if (obj._isBackground) return; // Don't delete background

    if (obj.type === 'activeSelection') {
      obj.forEachObject((o) => {
        if (!o._isBackground) this.canvas.remove(o);
      });
      this.canvas.discardActiveObject();
    } else {
      this.canvas.remove(obj);
    }
    this.canvas.renderAll();
    this.history.saveState();
  }

  // ==========================================
  // UTILITY
  // ==========================================
  newProject() {
    if (confirm('Tạo project mới? Nội dung chưa lưu sẽ mất.')) {
      window.location.href = 'editor.html?template=blank';
    }
  }

  quickSave() {
    const name = document.getElementById('project-name').value.trim() || 'Untitled Profile';
    const json = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType', 'selectable', 'evented']);
    this.storage.saveProject(name, json);
    this.showToast('Đã lưu!', 'success');
  }

  exportJSON() {
    const json = this.canvas.toJSON(['_isBackground', '_elementType', '_componentType']);
    const name = document.getElementById('project-name').value.trim() || 'profile';
    this.storage.exportJSON(json, name);
  }

  importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await this.storage.importJSON(file);
        this.canvas.loadFromJSON(data, () => {
          this.canvas.renderAll();
          this.history.clear();
          this.history.saveState();
          this.showToast('Project đã được import!', 'success');
        });
      } catch (err) {
        this.showToast('Lỗi: File JSON không hợp lệ', 'error');
      }
    };
    input.click();
  }

  _getCanvasCenter() {
    return {
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2
    };
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    toast.innerHTML = `<span class="material-icons-round" style="font-size:16px">${icons[type] || 'info'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}
