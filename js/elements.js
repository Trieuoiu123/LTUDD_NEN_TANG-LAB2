/* ============================================
   ELEMENT FACTORY - Create canvas elements
   ============================================ */

class ElementFactory {
  constructor(canvas, history) {
    this.canvas = canvas;
    this.history = history;
  }

  // ---- Text Elements ----
  addHeading(options = {}) {
    const text = new fabric.Textbox(options.text || 'Heading', {
      left: options.left || 100,
      top: options.top || 100,
      width: options.width || 400,
      fontSize: options.fontSize || 32,
      fontFamily: 'Outfit',
      fontWeight: '700',
      fill: options.fill || '#1a1a2e',
      _elementType: 'heading',
    });
    this._addToCanvas(text);
    return text;
  }

  addSubheading(options = {}) {
    const text = new fabric.Textbox(options.text || 'Subheading', {
      left: options.left || 100,
      top: options.top || 150,
      width: options.width || 350,
      fontSize: options.fontSize || 20,
      fontFamily: 'Outfit',
      fontWeight: '600',
      fill: options.fill || '#444444',
      _elementType: 'subheading',
    });
    this._addToCanvas(text);
    return text;
  }

  addBodyText(options = {}) {
    const text = new fabric.Textbox(options.text || 'Body text goes here. Click to edit.', {
      left: options.left || 100,
      top: options.top || 200,
      width: options.width || 400,
      fontSize: options.fontSize || 14,
      fontFamily: 'Inter',
      fontWeight: '400',
      fill: options.fill || '#555555',
      lineHeight: 1.6,
      _elementType: 'body',
    });
    this._addToCanvas(text);
    return text;
  }

  addCustomText(options = {}) {
    const text = new fabric.Textbox(options.text || 'Text', {
      left: options.left || 100,
      top: options.top || 100,
      width: options.width || 200,
      fontSize: options.fontSize || 16,
      fontFamily: options.fontFamily || 'Inter',
      fill: options.fill || '#333333',
      _elementType: 'custom-text',
    });
    this._addToCanvas(text);
    return text;
  }

  // ---- Shape Elements ----
  addRect(options = {}) {
    const rect = new fabric.Rect({
      left: options.left || 150,
      top: options.top || 150,
      width: options.width || 200,
      height: options.height || 120,
      fill: options.fill || '#6c5ce7',
      rx: options.rx || 8,
      ry: options.ry || 8,
      stroke: options.stroke || '',
      strokeWidth: options.strokeWidth || 0,
      _elementType: 'rect',
    });
    this._addToCanvas(rect);
    return rect;
  }

  addCircle(options = {}) {
    const circle = new fabric.Circle({
      left: options.left || 200,
      top: options.top || 200,
      radius: options.radius || 60,
      fill: options.fill || '#a29bfe',
      stroke: options.stroke || '',
      strokeWidth: options.strokeWidth || 0,
      _elementType: 'circle',
    });
    this._addToCanvas(circle);
    return circle;
  }

  addTriangle(options = {}) {
    const triangle = new fabric.Triangle({
      left: options.left || 200,
      top: options.top || 200,
      width: options.width || 100,
      height: options.height || 100,
      fill: options.fill || '#fd79a8',
      _elementType: 'triangle',
    });
    this._addToCanvas(triangle);
    return triangle;
  }

  addLine(options = {}) {
    const line = new fabric.Line(
      [options.x1 || 100, options.y1 || 200, options.x2 || 400, options.y2 || 200],
      {
        stroke: options.stroke || '#cccccc',
        strokeWidth: options.strokeWidth || 2,
        _elementType: 'line',
      }
    );
    this._addToCanvas(line);
    return line;
  }

  addStar(options = {}) {
    const points = this._createStarPoints(5, options.outerRadius || 50, options.innerRadius || 25);
    const star = new fabric.Polygon(points, {
      left: options.left || 200,
      top: options.top || 200,
      fill: options.fill || '#feca57',
      _elementType: 'star',
    });
    this._addToCanvas(star);
    return star;
  }

  // ---- Image Elements ----
  addImageFromURL(url, options = {}) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(url, (img) => {
        const maxSize = options.maxSize || 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        img.set({
          left: options.left || 100,
          top: options.top || 100,
          scaleX: scale,
          scaleY: scale,
          _elementType: 'image',
        });
        this._addToCanvas(img);
        resolve(img);
      }, { crossOrigin: 'anonymous' });
    });
  }

  addImageFromFile(file, options = {}) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          const maxSize = options.maxSize || 300;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          img.set({
            left: options.left || 100,
            top: options.top || 100,
            scaleX: scale,
            scaleY: scale,
            _elementType: 'image',
          });
          this._addToCanvas(img);
          resolve(img);
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // ---- Profile Components ----
  addAvatarPlaceholder(options = {}) {
    const group = new fabric.Group([
      new fabric.Circle({
        radius: options.radius || 65,
        fill: options.fill || '#6c5ce7',
        stroke: options.stroke || '#ffffff',
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
      }),
      new fabric.Text('📷', {
        fontSize: 30,
        originX: 'center',
        originY: 'center',
      })
    ], {
      left: options.left || 200,
      top: options.top || 100,
      _elementType: 'avatar',
      _componentType: 'avatar',
    });
    this._addToCanvas(group);
    return group;
  }

  addContactRow(options = {}) {
    const text = new fabric.Textbox(
      '✉ email@example.com   📱 +84 123 456 789   📍 Your City',
      {
        left: options.left || 60,
        top: options.top || 300,
        width: options.width || 500,
        fontSize: 11,
        fontFamily: 'Inter',
        fill: options.fill || '#666666',
        _elementType: 'contact-row',
        _componentType: 'contact',
      }
    );
    this._addToCanvas(text);
    return text;
  }

  addSectionHeader(options = {}) {
    const title = options.title || 'SECTION TITLE';
    const group = new fabric.Group([
      new fabric.Textbox(title, {
        width: options.width || 300,
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '700',
        fill: options.fill || '#1a1a2e',
        letterSpacing: 3,
        originX: 'left',
        top: 0,
        left: 0,
      }),
      new fabric.Rect({
        left: 0,
        top: 22,
        width: 40,
        height: 3,
        fill: options.accentColor || '#6c5ce7',
      })
    ], {
      left: options.left || 60,
      top: options.top || 400,
      _elementType: 'section-header',
      _componentType: 'section-header',
    });
    this._addToCanvas(group);
    return group;
  }

  addSkillBar(options = {}) {
    const skill = options.skill || 'Skill Name';
    const level = options.level || 80;
    const barWidth = options.barWidth || 200;
    const group = new fabric.Group([
      new fabric.Text(skill, {
        fontSize: 11,
        fontFamily: 'Inter',
        fill: '#444444',
        left: 0,
        top: 0,
      }),
      new fabric.Rect({
        left: 0,
        top: 20,
        width: barWidth,
        height: 6,
        fill: '#e8e8e8',
        rx: 3,
        ry: 3,
      }),
      new fabric.Rect({
        left: 0,
        top: 20,
        width: barWidth * (level / 100),
        height: 6,
        fill: options.color || '#6c5ce7',
        rx: 3,
        ry: 3,
      }),
      new fabric.Text(`${level}%`, {
        fontSize: 9,
        fontFamily: 'Inter',
        fill: '#999999',
        left: barWidth + 8,
        top: 17,
      })
    ], {
      left: options.left || 60,
      top: options.top || 500,
      _elementType: 'skill-bar',
      _componentType: 'skill-bar',
    });
    this._addToCanvas(group);
    return group;
  }

  addSocialLinks(options = {}) {
    const text = new fabric.Textbox(
      '🔗 linkedin.com/in/you   🐙 github.com/you   🌐 yoursite.com',
      {
        left: options.left || 60,
        top: options.top || 800,
        width: options.width || 500,
        fontSize: 11,
        fontFamily: 'Inter',
        fill: options.fill || '#6c5ce7',
        _elementType: 'social-links',
        _componentType: 'social',
      }
    );
    this._addToCanvas(text);
    return text;
  }

  // ---- SVG Icons ----
  addIcon(iconName, options = {}) {
    const iconPaths = {
      email: 'M2 4h20v16H2V4zm2 2v1l8 5 8-5V6H4zm0 3.5V18h16V9.5l-8 5-8-5z',
      phone: 'M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z',
      location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z',
      linkedin: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
      github: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z',
      globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    };

    const pathData = iconPaths[iconName];
    if (!pathData) return null;

    const path = new fabric.Path(pathData, {
      left: options.left || 100,
      top: options.top || 100,
      fill: options.fill || '#333333',
      scaleX: options.scale || 1.2,
      scaleY: options.scale || 1.2,
      _elementType: 'icon',
    });
    this._addToCanvas(path);
    return path;
  }

  // ---- Utility ----
  _addToCanvas(obj) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
    if (this.history) {
      this.history.saveState();
    }
  }

  _createStarPoints(spikes, outerRadius, innerRadius) {
    const points = [];
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    const cx = outerRadius;
    const cy = outerRadius;
    for (let i = 0; i < spikes; i++) {
      points.push({ x: cx + Math.cos(rot) * outerRadius, y: cy + Math.sin(rot) * outerRadius });
      rot += step;
      points.push({ x: cx + Math.cos(rot) * innerRadius, y: cy + Math.sin(rot) * innerRadius });
      rot += step;
    }
    return points;
  }
}
