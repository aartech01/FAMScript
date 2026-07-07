/* resizer.js — drag-to-resize for the sidebar (width) and console (height).
   Runs standalone (no dependency on editor.js / app.js) so layout dragging
   still works even if the CodeMirror module fails to load. Preferences are
   persisted to localStorage and re-applied on next load. */
(function () {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'famscript.layout';
  const MOBILE_BREAKPOINT = 768;

  function loadLayout() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveLayout(layout) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch {}
  }

  const layout = loadLayout();
  // Only re-apply a saved sidebar width on desktop — on mobile the sidebar
  // becomes a fixed slide-in drawer, and reusing a desktop width there would
  // make the drawer too wide.
  if (layout.sidebarW && window.innerWidth > MOBILE_BREAKPOINT) {
    root.style.setProperty('--sidebar-w', layout.sidebarW + 'px');
  }
  if (layout.editorW && window.innerWidth > MOBILE_BREAKPOINT) {
    root.style.setProperty('--editor-w', layout.editorW + 'px');
  }
  if (layout.consoleH) {
    root.style.setProperty('--console-h', layout.consoleH + 'px');
  }

  function makeResizer(handle, { axis, cssVar, layoutKey, min, max, onEnd }) {
    if (!handle) return;
    let dragging  = false;
    let startPos  = 0;
    let startSize = 0;

    function currentSize() {
      return parseFloat(getComputedStyle(root).getPropertyValue(cssVar)) || 0;
    }

    function applyDelta(pos) {
      const delta = axis === 'x' ? (pos - startPos) : (startPos - pos);
      const size  = Math.max(min, Math.min(max(), startSize + delta));
      root.style.setProperty(cssVar, size + 'px');
    }

    function onMouseMove(e) { if (dragging) applyDelta(axis === 'x' ? e.clientX : e.clientY); }
    function onTouchMove(e) {
      if (!dragging || !e.touches.length) return;
      const t = e.touches[0];
      applyDelta(axis === 'x' ? t.clientX : t.clientY);
    }
    function stopDragging() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stopDragging);
      onEnd(currentSize());
    }
    function startDragging(pos) {
      dragging  = true;
      startPos  = pos;
      startSize = currentSize();
      handle.classList.add('resizing');
      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', stopDragging);
    }

    handle.addEventListener('mousedown', e => { e.preventDefault(); startDragging(axis === 'x' ? e.clientX : e.clientY); });
    handle.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      startDragging(axis === 'x' ? t.clientX : t.clientY);
    }, { passive: true });
    handle.addEventListener('dblclick', () => {
      // double-click resets to the CSS default for the current breakpoint
      root.style.removeProperty(cssVar);
      delete layout[layoutKey];
      saveLayout(layout);
    });
  }

  makeResizer(document.getElementById('sidebar-resizer'), {
    axis: 'x',
    cssVar: '--sidebar-w',
    layoutKey: 'sidebarW',
    min: 150,
    max: () => Math.min(420, Math.round(window.innerWidth * 0.5)),
    onEnd: size => { layout.sidebarW = Math.round(size); saveLayout(layout); },
  });

  makeResizer(document.getElementById('editor-resizer'), {
    axis: 'x',
    cssVar: '--editor-w',
    layoutKey: 'editorW',
    min: 240,
    max: () => Math.round(window.innerWidth * 0.7),
    onEnd: size => { layout.editorW = Math.round(size); saveLayout(layout); },
  });

  makeResizer(document.getElementById('console-resizer'), {
    axis: 'y',
    cssVar: '--console-h',
    layoutKey: 'consoleH',
    min: 60,
    max: () => Math.round(window.innerHeight * 0.7),
    onEnd: size => { layout.consoleH = Math.round(size); saveLayout(layout); },
  });
})();
