class CanvasController {
  constructor(viewport) {
    this.vp      = viewport;
    this.s       = 1;
    this.tx      = 0;
    this.ty      = 0;
    this.MIN_S   = 0.05;
    this.MAX_S   = 10;
    this.dragging = false;
    this.lx = 0; this.ly = 0;
    this._bindViewport();
    this._bindControls();
  }

  get inner() { return this.vp.querySelector('.canvas-inner'); }
  get label() { return this.vp.querySelector('.zoom-label'); }

  /* ── transform ── */
  apply() {
    const el = this.inner;
    if (!el) return;
    el.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.s})`;
    if (this.label) this.label.textContent = Math.round(this.s * 100) + '%';
  }

  /* zoom toward a viewport-relative point */
  zoomAt(factor, cx, cy) {
    const newS = Math.min(this.MAX_S, Math.max(this.MIN_S, this.s * factor));
    const ratio = newS / this.s;
    this.tx = cx - ratio * (cx - this.tx);
    this.ty = cy - ratio * (cy - this.ty);
    this.s  = newS;
    this.apply();
  }

  zoomCenter(factor) {
    const r = this.vp.getBoundingClientRect();
    this.zoomAt(factor, r.width / 2, r.height / 2);
  }

  reset() { this.s = 1; this.tx = 0; this.ty = 0; this.apply(); }

  fit() {
    const inner = this.inner;
    if (!inner) return;
    const svgEl = inner.querySelector('svg');
    if (!svgEl) return;

    const vr  = this.vp.getBoundingClientRect();
    const vb  = svgEl.viewBox?.baseVal;
    let natW  = (vb && vb.width  > 0) ? vb.width  : svgEl.getBoundingClientRect().width  / this.s;
    let natH  = (vb && vb.height > 0) ? vb.height : svgEl.getBoundingClientRect().height / this.s;
    if (!natW || !natH) return;

    const pad = 40;
    this.s  = Math.max(this.MIN_S, Math.min(2, (vr.width - pad) / natW, (vr.height - pad) / natH));
    this.tx = (vr.width  - natW * this.s) / 2;
    this.ty = (vr.height - natH * this.s) / 2;
    this.apply();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.vp.requestFullscreen().catch(() => {});
      document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement === this.vp) setTimeout(() => this.fit(), 150);
        else setTimeout(() => this.fit(), 150);
      }, { once: true });
    } else {
      document.exitFullscreen();
    }
  }

  /* called by app.js after every render */
  afterRender() {
    this.s = 1; this.tx = 0; this.ty = 0;
    this.apply();
    setTimeout(() => this.fit(), 120);
  }

  /* ── events ── */
  _bindViewport() {
    this.vp.style.cursor = 'grab';

    /* wheel → zoom toward cursor */
    this.vp.addEventListener('wheel', e => {
      e.preventDefault();
      if (!this.inner) return;
      const r  = this.vp.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      this.zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, cx, cy);
    }, { passive: false });

    /* mouse drag */
    this.vp.addEventListener('mousedown', e => {
      if (e.button !== 0 || !this.inner) return;
      this.dragging = true;
      this.lx = e.clientX; this.ly = e.clientY;
      this.vp.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!this.dragging) return;
      this.tx += e.clientX - this.lx;
      this.ty += e.clientY - this.ly;
      this.lx = e.clientX; this.ly = e.clientY;
      this.apply();
    });
    window.addEventListener('mouseup', () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.vp.style.cursor = 'grab';
    });

    /* touch: pinch zoom + one-finger pan */
    let lastDist = 0, lastTx = 0, lastTy = 0;
    this.vp.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1) {
        lastTx = e.touches[0].clientX; lastTy = e.touches[0].clientY;
      }
    }, { passive: true });

    this.vp.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const r  = this.vp.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        if (lastDist > 0) this.zoomAt(dist / lastDist, cx, cy);
        lastDist = dist;
      } else if (e.touches.length === 1) {
        this.tx += e.touches[0].clientX - lastTx;
        this.ty += e.touches[0].clientY - lastTy;
        lastTx = e.touches[0].clientX; lastTy = e.touches[0].clientY;
        this.apply();
      }
    }, { passive: true });
  }

  _bindControls() {
    this.vp.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        switch (btn.dataset.action) {
          case 'zoom-in':    this.zoomCenter(1.3);   break;
          case 'zoom-out':   this.zoomCenter(1/1.3); break;
          case 'fit':        this.fit();              break;
          case 'reset':      this.reset();            break;
          case 'fullscreen': this.toggleFullscreen(); break;
        }
      });
    });
  }
}
