/* ============================================
   EXPORT SYSTEM - PNG, JPG, PDF, SVG
   ============================================ */

class ExportManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.selectedFormat = 'png';
    this.quality = 2; // multiplier
  }

  // Export as PNG
  exportPNG(multiplier = 2) {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      multiplier: multiplier,
      quality: 1
    });
    this._download(dataURL, 'profile.png');
  }

  // Export as JPG
  exportJPG(quality = 0.92, multiplier = 2) {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    const dataURL = this.canvas.toDataURL({
      format: 'jpeg',
      multiplier: multiplier,
      quality: quality
    });
    this._download(dataURL, 'profile.jpg');
  }

  // Export as SVG
  exportSVG() {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    const svg = this.canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    this._download(url, 'profile.svg');
    URL.revokeObjectURL(url);
  }

  // Export as PDF using jsPDF
  async exportPDF() {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();

    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
      // Load jsPDF dynamically
      await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js');
    }

    const { jsPDF } = window.jspdf;
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgData = this.canvas.toDataURL({
      format: 'png',
      multiplier: 3,
      quality: 1
    });

    const pdf = new jsPDF({
      orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save('profile.pdf');
  }

  // Generic export based on format
  export(format, options = {}) {
    switch (format) {
      case 'png': this.exportPNG(options.multiplier || 2); break;
      case 'jpg': this.exportJPG(options.quality || 0.92, options.multiplier || 2); break;
      case 'svg': this.exportSVG(); break;
      case 'pdf': this.exportPDF(); break;
    }
  }

  // Get preview data URL
  getPreview(maxWidth = 400) {
    const ratio = maxWidth / this.canvas.getWidth();
    return this.canvas.toDataURL({
      format: 'png',
      multiplier: ratio,
      quality: 0.8
    });
  }

  _download(dataURL, filename) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
