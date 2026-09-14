/* ============================================
   TEMPLATES DATA - 6 Professional Profile Templates
   ============================================ */

const TEMPLATES = [
  // ---- 1. Modern Minimal ----
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'Developer / Designer',
    description: 'Clean and elegant with focus on typography',
    colors: { primary: '#1a1a2e', secondary: '#6c5ce7', accent: '#a29bfe', bg: '#ffffff' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#ffffff', selectable: false, evented: false, _isBackground: true },
        { type: 'rect', left: 0, top: 0, width: w, height: 200, fill: '#1a1a2e' },
        { type: 'circle', left: w/2 - 65, top: 135, radius: 65, fill: '#6c5ce7', stroke: '#ffffff', strokeWidth: 4 },
        { type: 'textbox', left: w/2 - 150, top: 280, width: 300, text: 'Your Name', fontSize: 36, fontFamily: 'Outfit', fontWeight: '700', fill: '#1a1a2e', textAlign: 'center' },
        { type: 'textbox', left: w/2 - 150, top: 325, width: 300, text: 'Software Developer', fontSize: 16, fontFamily: 'Inter', fill: '#6c5ce7', textAlign: 'center', fontWeight: '500' },
        { type: 'line', x1: w/2 - 60, y1: 360, x2: w/2 + 60, y2: 360, stroke: '#e0e0e0', strokeWidth: 2 },
        { type: 'textbox', left: 60, top: 390, width: w - 120, text: 'A passionate developer with 5+ years of experience building modern web applications. Focused on clean code and great user experiences.', fontSize: 13, fontFamily: 'Inter', fill: '#555555', textAlign: 'center', lineHeight: 1.6 },
        { type: 'textbox', left: 60, top: 490, width: w - 120, text: 'EXPERIENCE', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#1a1a2e', letterSpacing: 3 },
        { type: 'rect', left: 60, top: 512, width: 40, height: 3, fill: '#6c5ce7' },
        { type: 'textbox', left: 60, top: 530, width: w - 120, text: 'Senior Developer — Google\n2020 - Present\nLed development of core features for Google Maps platform.', fontSize: 12, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.7 },
        { type: 'textbox', left: 60, top: 610, width: w - 120, text: 'Frontend Developer — Meta\n2018 - 2020\nBuilt reusable component libraries used across products.', fontSize: 12, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.7 },
        { type: 'textbox', left: 60, top: 710, width: w - 120, text: 'SKILLS', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#1a1a2e', letterSpacing: 3 },
        { type: 'rect', left: 60, top: 732, width: 40, height: 3, fill: '#6c5ce7' },
        { type: 'textbox', left: 60, top: 750, width: w - 120, text: 'JavaScript  •  TypeScript  •  React  •  Node.js  •  Python  •  AWS', fontSize: 12, fontFamily: 'Inter', fill: '#555555', lineHeight: 1.8 },
        { type: 'textbox', left: 60, top: 820, width: w - 120, text: 'CONTACT', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#1a1a2e', letterSpacing: 3 },
        { type: 'rect', left: 60, top: 842, width: 40, height: 3, fill: '#6c5ce7' },
        { type: 'textbox', left: 60, top: 860, width: w - 120, text: '✉  hello@example.com    📱  +84 123 456 789    🔗  linkedin.com/in/yourname', fontSize: 11, fontFamily: 'Inter', fill: '#666666', lineHeight: 1.8 },
      ];
    }
  },

  // ---- 2. Creative Bold ----
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    category: 'Artist / Creative',
    description: 'Vibrant colors with asymmetric layout',
    colors: { primary: '#ff6b6b', secondary: '#feca57', accent: '#48dbfb', bg: '#2d3436' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#fafafa', selectable: false, evented: false, _isBackground: true },
        { type: 'rect', left: 0, top: 0, width: w * 0.4, height: h, fill: '#2d3436' },
        { type: 'circle', left: w * 0.2 - 70, top: 80, radius: 70, fill: '#ff6b6b', stroke: '#feca57', strokeWidth: 4 },
        { type: 'textbox', left: 20, top: 240, width: w * 0.4 - 40, text: 'YOUR\nNAME', fontSize: 32, fontFamily: 'Outfit', fontWeight: '800', fill: '#ffffff', lineHeight: 1.2 },
        { type: 'textbox', left: 20, top: 330, width: w * 0.4 - 40, text: 'Creative Director', fontSize: 14, fontFamily: 'Inter', fill: '#ff6b6b', fontWeight: '600' },
        { type: 'rect', left: 20, top: 360, width: 50, height: 3, fill: '#feca57' },
        { type: 'textbox', left: 20, top: 390, width: w * 0.4 - 40, text: '✉ hello@email.com\n📱 +84 123 456 789\n📍 Ho Chi Minh City\n🔗 behance.net/you', fontSize: 11, fontFamily: 'Inter', fill: '#b2bec3', lineHeight: 2 },
        { type: 'textbox', left: 20, top: 550, width: w * 0.4 - 40, text: 'SKILLS', fontSize: 11, fontFamily: 'Inter', fontWeight: '700', fill: '#feca57', letterSpacing: 3 },
        { type: 'textbox', left: 20, top: 580, width: w * 0.4 - 40, text: 'UI/UX Design\nBrand Identity\nMotion Graphics\nIllustration\nPhotography', fontSize: 11, fontFamily: 'Inter', fill: '#dfe6e9', lineHeight: 2 },
        // Right side
        { type: 'textbox', left: w * 0.4 + 40, top: 60, width: w * 0.6 - 80, text: 'ABOUT ME', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#2d3436', letterSpacing: 3 },
        { type: 'rect', left: w * 0.4 + 40, top: 82, width: 50, height: 3, fill: '#ff6b6b' },
        { type: 'textbox', left: w * 0.4 + 40, top: 100, width: w * 0.6 - 80, text: 'I am a passionate creative director with over 8 years of experience creating stunning visual experiences for brands worldwide.', fontSize: 12, fontFamily: 'Inter', fill: '#636e72', lineHeight: 1.7 },
        { type: 'textbox', left: w * 0.4 + 40, top: 200, width: w * 0.6 - 80, text: 'EXPERIENCE', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#2d3436', letterSpacing: 3 },
        { type: 'rect', left: w * 0.4 + 40, top: 222, width: 50, height: 3, fill: '#ff6b6b' },
        { type: 'textbox', left: w * 0.4 + 40, top: 240, width: w * 0.6 - 80, text: 'Creative Director — Design Studio\n2021 - Present\nLeading creative vision for major brand campaigns.\n\nSenior Designer — Agency X\n2018 - 2021\nDesigned visual identities for Fortune 500 clients.\n\nJunior Designer — StartupY\n2016 - 2018\nCreated marketing materials and social media assets.', fontSize: 11, fontFamily: 'Inter', fill: '#636e72', lineHeight: 1.7 },
        { type: 'textbox', left: w * 0.4 + 40, top: 520, width: w * 0.6 - 80, text: 'EDUCATION', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#2d3436', letterSpacing: 3 },
        { type: 'rect', left: w * 0.4 + 40, top: 542, width: 50, height: 3, fill: '#ff6b6b' },
        { type: 'textbox', left: w * 0.4 + 40, top: 560, width: w * 0.6 - 80, text: 'Bachelor of Fine Arts\nUniversity of Arts — 2016\n\nMaster of Design\nCreative Academy — 2018', fontSize: 11, fontFamily: 'Inter', fill: '#636e72', lineHeight: 1.7 },
      ];
    }
  },

  // ---- 3. Corporate Classic ----
  {
    id: 'corporate-classic',
    name: 'Corporate Classic',
    category: 'Business / Manager',
    description: 'Professional and formal with navy tones',
    colors: { primary: '#0c2461', secondary: '#1e3799', accent: '#4a69bd', bg: '#ffffff' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#ffffff', selectable: false, evented: false, _isBackground: true },
        { type: 'rect', left: 0, top: 0, width: w, height: 100, fill: '#0c2461' },
        { type: 'rect', left: 0, top: 100, width: w, height: 4, fill: '#e58e26' },
        { type: 'textbox', left: 60, top: 30, width: w - 120, text: 'JOHN DOE', fontSize: 32, fontFamily: 'Outfit', fontWeight: '800', fill: '#ffffff', letterSpacing: 2 },
        { type: 'textbox', left: 60, top: 70, width: w - 120, text: 'Business Development Manager', fontSize: 13, fontFamily: 'Inter', fill: '#e58e26', fontWeight: '500' },
        // Contact bar
        { type: 'rect', left: 0, top: 104, width: w, height: 40, fill: '#f8f9fa' },
        { type: 'textbox', left: 60, top: 114, width: w - 120, text: '✉ john@company.com   |   📱 +84 123 456 789   |   📍 Hanoi, Vietnam   |   🔗 linkedin.com/in/johndoe', fontSize: 10, fontFamily: 'Inter', fill: '#666666', textAlign: 'center' },
        // Profile
        { type: 'textbox', left: 60, top: 175, width: w - 120, text: 'PROFESSIONAL SUMMARY', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#0c2461', letterSpacing: 2 },
        { type: 'rect', left: 60, top: 197, width: w - 120, height: 2, fill: '#e8e8e8' },
        { type: 'rect', left: 60, top: 197, width: 80, height: 2, fill: '#0c2461' },
        { type: 'textbox', left: 60, top: 210, width: w - 120, text: 'Results-driven business development manager with 10+ years of experience driving revenue growth and building strategic partnerships across APAC markets.', fontSize: 12, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.7 },
        // Experience
        { type: 'textbox', left: 60, top: 300, width: w - 120, text: 'WORK EXPERIENCE', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#0c2461', letterSpacing: 2 },
        { type: 'rect', left: 60, top: 322, width: w - 120, height: 2, fill: '#e8e8e8' },
        { type: 'rect', left: 60, top: 322, width: 80, height: 2, fill: '#0c2461' },
        { type: 'textbox', left: 60, top: 340, width: w - 120, text: 'Regional Director — TechCorp Asia Pacific\nJanuary 2021 - Present\n• Increased regional revenue by 45% year-over-year\n• Managed a team of 25 sales professionals\n• Established partnerships with 30+ enterprise clients', fontSize: 11, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.8 },
        { type: 'textbox', left: 60, top: 480, width: w - 120, text: 'Business Development Lead — Global Solutions Inc.\nMarch 2017 - December 2020\n• Drove $5M+ in new business annually\n• Developed go-to-market strategies for 3 new products\n• Built and mentored high-performing sales team', fontSize: 11, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.8 },
        // Education & Skills side by side
        { type: 'textbox', left: 60, top: 640, width: (w-140)/2, text: 'EDUCATION', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#0c2461', letterSpacing: 2 },
        { type: 'rect', left: 60, top: 662, width: (w-140)/2, height: 2, fill: '#e8e8e8' },
        { type: 'rect', left: 60, top: 662, width: 60, height: 2, fill: '#0c2461' },
        { type: 'textbox', left: 60, top: 680, width: (w-140)/2, text: 'MBA, Business Administration\nHarvard Business School — 2017\n\nBSc, Economics\nNational University — 2013', fontSize: 11, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.7 },
        { type: 'textbox', left: w/2 + 10, top: 640, width: (w-140)/2, text: 'KEY SKILLS', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', fill: '#0c2461', letterSpacing: 2 },
        { type: 'rect', left: w/2 + 10, top: 662, width: (w-140)/2, height: 2, fill: '#e8e8e8' },
        { type: 'rect', left: w/2 + 10, top: 662, width: 60, height: 2, fill: '#0c2461' },
        { type: 'textbox', left: w/2 + 10, top: 680, width: (w-140)/2, text: '• Strategic Planning\n• Revenue Growth\n• Team Leadership\n• Partnership Development\n• Market Analysis\n• CRM & Analytics', fontSize: 11, fontFamily: 'Inter', fill: '#444444', lineHeight: 1.7 },
      ];
    }
  },

  // ---- 4. Gradient Wave ----
  {
    id: 'gradient-wave',
    name: 'Gradient Wave',
    category: 'Freelancer / Startup',
    description: 'Modern gradients with curved sections',
    colors: { primary: '#6c5ce7', secondary: '#a29bfe', accent: '#fd79a8', bg: '#f8f9ff' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#f8f9ff', selectable: false, evented: false, _isBackground: true },
        // Gradient header area
        { type: 'rect', left: 0, top: 0, width: w, height: 280, fill: '#6c5ce7', rx: 0, ry: 0 },
        { type: 'rect', left: 0, top: 200, width: w, height: 120, fill: '#7c6cf7', angle: -3, scaleX: 1.2 },
        { type: 'circle', left: w/2 - 60, top: 180, radius: 60, fill: '#ffffff', stroke: '#a29bfe', strokeWidth: 4 },
        { type: 'textbox', left: 40, top: 40, width: w - 80, text: 'Hello, I\'m', fontSize: 16, fontFamily: 'Inter', fill: 'rgba(255,255,255,0.7)' },
        { type: 'textbox', left: 40, top: 65, width: w - 80, text: 'Creative Developer', fontSize: 34, fontFamily: 'Outfit', fontWeight: '800', fill: '#ffffff' },
        { type: 'textbox', left: 40, top: 110, width: w/2 - 60, text: 'I build beautiful digital experiences that delight users and drive business growth.', fontSize: 12, fontFamily: 'Inter', fill: 'rgba(255,255,255,0.8)', lineHeight: 1.7 },
        // Stats row
        { type: 'rect', left: 40, top: 320, width: (w-100)/3, height: 70, fill: '#ffffff', rx: 12, ry: 12, shadow: new fabric.Shadow({color:'rgba(0,0,0,0.08)', blur: 15, offsetY: 4}) },
        { type: 'textbox', left: 55, top: 335, width: 80, text: '50+', fontSize: 24, fontFamily: 'Outfit', fontWeight: '800', fill: '#6c5ce7' },
        { type: 'textbox', left: 55, top: 365, width: 80, text: 'Projects', fontSize: 10, fontFamily: 'Inter', fill: '#888888' },
        { type: 'rect', left: 40 + (w-100)/3 + 10, top: 320, width: (w-100)/3, height: 70, fill: '#ffffff', rx: 12, ry: 12, shadow: new fabric.Shadow({color:'rgba(0,0,0,0.08)', blur: 15, offsetY: 4}) },
        { type: 'textbox', left: 55 + (w-100)/3 + 10, top: 335, width: 80, text: '5+', fontSize: 24, fontFamily: 'Outfit', fontWeight: '800', fill: '#fd79a8' },
        { type: 'textbox', left: 55 + (w-100)/3 + 10, top: 365, width: 80, text: 'Years Exp', fontSize: 10, fontFamily: 'Inter', fill: '#888888' },
        { type: 'rect', left: 40 + 2*((w-100)/3 + 10), top: 320, width: (w-100)/3, height: 70, fill: '#ffffff', rx: 12, ry: 12, shadow: new fabric.Shadow({color:'rgba(0,0,0,0.08)', blur: 15, offsetY: 4}) },
        { type: 'textbox', left: 55 + 2*((w-100)/3 + 10), top: 335, width: 80, text: '30+', fontSize: 24, fontFamily: 'Outfit', fontWeight: '800', fill: '#a29bfe' },
        { type: 'textbox', left: 55 + 2*((w-100)/3 + 10), top: 365, width: 80, text: 'Clients', fontSize: 10, fontFamily: 'Inter', fill: '#888888' },
        // About
        { type: 'textbox', left: 40, top: 430, width: w - 80, text: 'About Me', fontSize: 20, fontFamily: 'Outfit', fontWeight: '700', fill: '#2d3436' },
        { type: 'rect', left: 40, top: 458, width: 40, height: 3, fill: '#6c5ce7' },
        { type: 'textbox', left: 40, top: 475, width: w - 80, text: 'Passionate full-stack developer specializing in React, Node.js, and cloud architecture. I love turning complex problems into simple, beautiful designs.', fontSize: 12, fontFamily: 'Inter', fill: '#636e72', lineHeight: 1.7 },
        // Skills
        { type: 'textbox', left: 40, top: 560, width: w - 80, text: 'Skills & Technologies', fontSize: 20, fontFamily: 'Outfit', fontWeight: '700', fill: '#2d3436' },
        { type: 'rect', left: 40, top: 588, width: 40, height: 3, fill: '#6c5ce7' },
        { type: 'textbox', left: 40, top: 610, width: w - 80, text: 'React  •  Vue.js  •  Node.js  •  TypeScript  •  Python\nAWS  •  Docker  •  MongoDB  •  PostgreSQL  •  GraphQL', fontSize: 12, fontFamily: 'Inter', fill: '#636e72', lineHeight: 2 },
        // Contact
        { type: 'rect', left: 40, top: 710, width: w - 80, height: 80, fill: '#6c5ce7', rx: 12, ry: 12 },
        { type: 'textbox', left: 60, top: 725, width: w - 120, text: 'Let\'s work together!', fontSize: 16, fontFamily: 'Outfit', fontWeight: '700', fill: '#ffffff' },
        { type: 'textbox', left: 60, top: 755, width: w - 120, text: '✉ hello@creative.dev   •   📱 +84 123 456 789   •   🌐 creative.dev', fontSize: 11, fontFamily: 'Inter', fill: 'rgba(255,255,255,0.85)' },
      ];
    }
  },

  // ---- 5. Dark Elegance ----
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    category: 'Photographer / Luxury',
    description: 'Dark theme with gold accents',
    colors: { primary: '#0a0a0a', secondary: '#d4a574', accent: '#c9a96e', bg: '#0a0a0a' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#0f0f0f', selectable: false, evented: false, _isBackground: true },
        { type: 'rect', left: 0, top: 0, width: w, height: 2, fill: '#d4a574' },
        // Gold line accents
        { type: 'line', x1: 40, y1: 40, x2: 40, y2: h - 40, stroke: 'rgba(212,165,116,0.15)', strokeWidth: 1 },
        { type: 'line', x1: w - 40, y1: 40, x2: w - 40, y2: h - 40, stroke: 'rgba(212,165,116,0.15)', strokeWidth: 1 },
        { type: 'circle', left: w/2 - 70, top: 60, radius: 70, fill: '#1a1a1a', stroke: '#d4a574', strokeWidth: 2 },
        { type: 'textbox', left: 60, top: 220, width: w - 120, text: 'ALEXANDRA STONE', fontSize: 28, fontFamily: 'Outfit', fontWeight: '300', fill: '#f5f5f0', textAlign: 'center', letterSpacing: 5 },
        { type: 'textbox', left: 60, top: 260, width: w - 120, text: 'PHOTOGRAPHER & VISUAL ARTIST', fontSize: 11, fontFamily: 'Inter', fill: '#d4a574', textAlign: 'center', letterSpacing: 4 },
        { type: 'line', x1: w/2 - 40, y1: 295, x2: w/2 + 40, y2: 295, stroke: '#d4a574', strokeWidth: 1 },
        { type: 'textbox', left: 80, top: 320, width: w - 160, text: 'Capturing the extraordinary in everyday moments. Specializing in editorial, fashion, and fine art photography with a distinctive moody aesthetic.', fontSize: 12, fontFamily: 'Inter', fill: '#888888', textAlign: 'center', lineHeight: 1.8 },
        // Services
        { type: 'textbox', left: 60, top: 430, width: w - 120, text: 'SERVICES', fontSize: 11, fontFamily: 'Inter', fontWeight: '500', fill: '#d4a574', textAlign: 'center', letterSpacing: 4 },
        { type: 'textbox', left: 60, top: 460, width: (w-140)/2, text: '◆ Portrait Photography\n◆ Editorial Shoots\n◆ Fashion Campaigns', fontSize: 11, fontFamily: 'Inter', fill: '#999999', lineHeight: 2 },
        { type: 'textbox', left: w/2 + 10, top: 460, width: (w-140)/2, text: '◆ Event Coverage\n◆ Brand Photography\n◆ Fine Art Prints', fontSize: 11, fontFamily: 'Inter', fill: '#999999', lineHeight: 2 },
        // Experience
        { type: 'textbox', left: 60, top: 580, width: w - 120, text: 'EXPERIENCE', fontSize: 11, fontFamily: 'Inter', fontWeight: '500', fill: '#d4a574', textAlign: 'center', letterSpacing: 4 },
        { type: 'textbox', left: 60, top: 610, width: w - 120, text: 'Lead Photographer — Vogue Vietnam (2021 - Present)\nFreelance Photographer — International Clients (2018 - 2021)\nAssistant Photographer — Studio Lumiere (2016 - 2018)', fontSize: 11, fontFamily: 'Inter', fill: '#777777', textAlign: 'center', lineHeight: 2 },
        // Contact
        { type: 'line', x1: w/2 - 40, y1: 740, x2: w/2 + 40, y2: 740, stroke: '#d4a574', strokeWidth: 1 },
        { type: 'textbox', left: 60, top: 760, width: w - 120, text: 'hello@alexandrastone.com  •  @alexandrastone  •  +84 123 456 789', fontSize: 10, fontFamily: 'Inter', fill: '#666666', textAlign: 'center', letterSpacing: 1 },
        { type: 'rect', left: 0, top: h - 2, width: w, height: 2, fill: '#d4a574' },
      ];
    }
  },

  // ---- 6. Infographic ----
  {
    id: 'infographic',
    name: 'Infographic',
    category: 'Student / Entry-level',
    description: 'Data-driven with icons and progress indicators',
    colors: { primary: '#2196f3', secondary: '#00bcd4', accent: '#ff9800', bg: '#ffffff' },
    build(w, h) {
      return [
        { type: 'rect', left: 0, top: 0, width: w, height: h, fill: '#ffffff', selectable: false, evented: false, _isBackground: true },
        // Colored sidebar
        { type: 'rect', left: 0, top: 0, width: 220, height: h, fill: '#1a237e' },
        // Avatar
        { type: 'circle', left: 110 - 55, top: 50, radius: 55, fill: '#3949ab', stroke: '#5c6bc0', strokeWidth: 3 },
        { type: 'textbox', left: 15, top: 175, width: 190, text: 'NGUYEN\nVAN A', fontSize: 24, fontFamily: 'Outfit', fontWeight: '800', fill: '#ffffff', textAlign: 'center', lineHeight: 1.2 },
        { type: 'textbox', left: 15, top: 240, width: 190, text: 'Computer Science Student', fontSize: 11, fontFamily: 'Inter', fill: '#90caf9', textAlign: 'center' },
        { type: 'rect', left: 60, top: 270, width: 100, height: 2, fill: '#5c6bc0' },
        // Contact on sidebar
        { type: 'textbox', left: 20, top: 295, width: 180, text: 'CONTACT', fontSize: 10, fontFamily: 'Inter', fontWeight: '700', fill: '#90caf9', letterSpacing: 3 },
        { type: 'textbox', left: 20, top: 320, width: 180, text: '✉ nguyenvana@email.com\n📱 +84 123 456 789\n📍 Da Nang, Vietnam\n🔗 github.com/nguyenvana', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb', lineHeight: 2.2 },
        // Skills with bars on sidebar
        { type: 'textbox', left: 20, top: 450, width: 180, text: 'SKILLS', fontSize: 10, fontFamily: 'Inter', fontWeight: '700', fill: '#90caf9', letterSpacing: 3 },
        // Skill bars
        { type: 'textbox', left: 20, top: 478, width: 120, text: 'JavaScript', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb' },
        { type: 'rect', left: 20, top: 495, width: 180, height: 6, fill: '#283593', rx: 3, ry: 3 },
        { type: 'rect', left: 20, top: 495, width: 160, height: 6, fill: '#42a5f5', rx: 3, ry: 3 },
        { type: 'textbox', left: 20, top: 510, width: 120, text: 'Python', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb' },
        { type: 'rect', left: 20, top: 527, width: 180, height: 6, fill: '#283593', rx: 3, ry: 3 },
        { type: 'rect', left: 20, top: 527, width: 140, height: 6, fill: '#66bb6a', rx: 3, ry: 3 },
        { type: 'textbox', left: 20, top: 542, width: 120, text: 'React', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb' },
        { type: 'rect', left: 20, top: 559, width: 180, height: 6, fill: '#283593', rx: 3, ry: 3 },
        { type: 'rect', left: 20, top: 559, width: 130, height: 6, fill: '#26c6da', rx: 3, ry: 3 },
        { type: 'textbox', left: 20, top: 574, width: 120, text: 'Java', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb' },
        { type: 'rect', left: 20, top: 591, width: 180, height: 6, fill: '#283593', rx: 3, ry: 3 },
        { type: 'rect', left: 20, top: 591, width: 120, height: 6, fill: '#ffa726', rx: 3, ry: 3 },
        // Languages
        { type: 'textbox', left: 20, top: 630, width: 180, text: 'LANGUAGES', fontSize: 10, fontFamily: 'Inter', fontWeight: '700', fill: '#90caf9', letterSpacing: 3 },
        { type: 'textbox', left: 20, top: 658, width: 180, text: '🇻🇳 Vietnamese — Native\n🇬🇧 English — Fluent\n🇯🇵 Japanese — Basic', fontSize: 10, fontFamily: 'Inter', fill: '#bbdefb', lineHeight: 2 },
        // Right content
        { type: 'textbox', left: 250, top: 50, width: w - 290, text: 'ABOUT ME', fontSize: 13, fontFamily: 'Inter', fontWeight: '700', fill: '#1a237e', letterSpacing: 2 },
        { type: 'rect', left: 250, top: 72, width: 50, height: 3, fill: '#42a5f5' },
        { type: 'textbox', left: 250, top: 88, width: w - 290, text: 'Final-year Computer Science student passionate about web development and AI. Looking for opportunities to apply my skills in a dynamic team environment.', fontSize: 11, fontFamily: 'Inter', fill: '#555555', lineHeight: 1.7 },
        // Education
        { type: 'textbox', left: 250, top: 180, width: w - 290, text: 'EDUCATION', fontSize: 13, fontFamily: 'Inter', fontWeight: '700', fill: '#1a237e', letterSpacing: 2 },
        { type: 'rect', left: 250, top: 202, width: 50, height: 3, fill: '#42a5f5' },
        { type: 'textbox', left: 250, top: 218, width: w - 290, text: 'BSc Computer Science\nDa Nang University of Technology\n2022 - 2026  •  GPA: 3.6/4.0\n\nRelevant coursework: Data Structures, Web Development,\nMachine Learning, Database Systems', fontSize: 11, fontFamily: 'Inter', fill: '#555555', lineHeight: 1.7 },
        // Projects
        { type: 'textbox', left: 250, top: 380, width: w - 290, text: 'PROJECTS', fontSize: 13, fontFamily: 'Inter', fontWeight: '700', fill: '#1a237e', letterSpacing: 2 },
        { type: 'rect', left: 250, top: 402, width: 50, height: 3, fill: '#42a5f5' },
        { type: 'textbox', left: 250, top: 418, width: w - 290, text: '🚀 E-Commerce Platform\nFull-stack web app with React, Node.js, MongoDB\n\n📱 Fitness Tracker App\nMobile app built with React Native & Firebase\n\n🤖 Chatbot AI\nNLP-powered chatbot using Python & TensorFlow', fontSize: 11, fontFamily: 'Inter', fill: '#555555', lineHeight: 1.7 },
        // Certifications
        { type: 'textbox', left: 250, top: 620, width: w - 290, text: 'CERTIFICATIONS', fontSize: 13, fontFamily: 'Inter', fontWeight: '700', fill: '#1a237e', letterSpacing: 2 },
        { type: 'rect', left: 250, top: 642, width: 50, height: 3, fill: '#42a5f5' },
        { type: 'textbox', left: 250, top: 658, width: w - 290, text: '✓ AWS Cloud Practitioner — 2025\n✓ Meta Frontend Developer — 2024\n✓ Google Data Analytics — 2024', fontSize: 11, fontFamily: 'Inter', fill: '#555555', lineHeight: 1.8 },
      ];
    }
  }
];

// Canvas dimensions (A4 at 96 DPI)
const CANVAS_WIDTH = 794;
const CANVAS_HEIGHT = 1123;
