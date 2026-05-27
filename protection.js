(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
     1. BLOCK KEYBOARD SHORTCUTS
     Prevents F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
  ══════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    const ctrl = e.ctrlKey || e.metaKey;

    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return; }

    if (ctrl && e.shiftKey && /^[iIjJcC]$/.test(e.key)) {
      e.preventDefault(); e.stopPropagation(); return;
    }

    if (ctrl && /^[uUsS]$/.test(e.key)) {
      e.preventDefault(); e.stopPropagation(); return;
    }
  }, true);

  /* ══════════════════════════════════════════════════
     2. DISABLE RIGHT-CLICK CONTEXT MENU
  ══════════════════════════════════════════════════ */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  /* ══════════════════════════════════════════════════
     3. BLOCKING OVERLAY
  ══════════════════════════════════════════════════ */
  var overlay = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647',
      'background:#08080E',
      'display:none',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'gap:16px',
      'user-select:none',
      'pointer-events:all',
    ].join(';');
    overlay.innerHTML =
      '<div style="width:46px;height:46px;background:#C8FF3E;border-radius:10px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-size:14px;font-weight:900;color:#08080E;font-family:sans-serif;letter-spacing:-.3px;">FS</div>' +
      '<div style="color:#C8FF3E;font-size:17px;font-weight:700;font-family:sans-serif;">Access Restricted</div>' +
      '<div style="color:#eaeaf5;font-size:13px;font-family:sans-serif;text-align:center;' +
        'max-width:320px;line-height:1.65;opacity:.7;">' +
        'Developer tools are not permitted on this page.<br>' +
        'Please close DevTools to continue.' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function showOverlay() {
    var el = ensureOverlay();
    el.style.display = 'flex';
  }

  function hideOverlay() {
    if (overlay) overlay.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════
     4. DEVTOOLS SIZE DETECTION
     When DevTools is docked, innerWidth/innerHeight shrinks.
     Threshold 160px covers most docked panel sizes.
  ══════════════════════════════════════════════════ */
  var SIZE_THRESHOLD = 160;

  function isSizeDetected() {
    return (
      window.outerWidth  - window.innerWidth  > SIZE_THRESHOLD ||
      window.outerHeight - window.innerHeight > SIZE_THRESHOLD
    );
  }

  /* ══════════════════════════════════════════════════
     5. DEBUGGER TRAP
     Continuously fires a debugger statement. When DevTools
     is open and breakpoints are active (default), the page
     pauses every few seconds, making DevTools unusable.
     The timing check also catches when DevTools was open.
  ══════════════════════════════════════════════════ */
  function debuggerTrap() {
    var t = performance.now();
    /* eslint-disable no-debugger */
    debugger;
    /* eslint-enable no-debugger */
    if (performance.now() - t > 80) {
      showOverlay();
    }
  }

  /* ══════════════════════════════════════════════════
     6. CONSOLE SUPPRESSION
     Replaces the global console with no-ops so that
     inspect/console output is silenced.
  ══════════════════════════════════════════════════ */
  var noop = function () {};
  var fakeConsole = {
    log: noop, warn: noop, error: noop, info: noop,
    debug: noop, table: noop, dir: noop, dirxml: noop,
    group: noop, groupEnd: noop, groupCollapsed: noop,
    time: noop, timeEnd: noop, timeLog: noop,
    assert: noop, clear: noop, count: noop, countReset: noop,
    trace: noop, profile: noop, profileEnd: noop,
  };
  try {
    Object.defineProperty(window, 'console', {
      get: function () { return fakeConsole; },
      set: noop,
      configurable: false,
    });
  } catch (_) {}

  /* ══════════════════════════════════════════════════
     7. POLLING LOOP — runs all checks every second
  ══════════════════════════════════════════════════ */
  function runChecks() {
    if (isSizeDetected()) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }

  function start() {
    runChecks();
    setInterval(runChecks, 1000);
    setInterval(debuggerTrap, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
