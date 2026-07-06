/* ═══════════════════════════════════════════════════════════════
   editor.js — CodeMirror 6 powered Mermaid editor for FamScript
   Loaded as an ES module (via CDN, no build step). Exposes a single
   global factory, window.createFamScriptEditor(container, opts),
   that returns a plain object shaped like the <textarea> it replaces
   (.value getter/setter, .addEventListener('input', cb), .focus())
   plus extra methods app.js uses for diagnostics and navigation.
   ═══════════════════════════════════════════════════════════════ */

/* Loaded from esm.sh (NOT jsdelivr's +esm — jsdelivr bakes absolute URLs into
   each package's bundle instead of bare specifiers, and each package
   independently re-resolves shared deps like @codemirror/state against the
   live npm registry, so different CM6 packages silently end up bundling
   DIFFERENT @codemirror/state instances; confirmed by direct testing this
   throws "Unrecognized extension value... multiple instances of
   @codemirror/state are loaded" even using CodeMirror's own official
   meta-package + basicSetup, with zero custom code involved).

   esm.sh supports a `?deps=` query param that forces a package's internal
   imports of the listed packages to resolve to those exact versions (it
   encodes the pin into the resulting URL, so every package that requests the
   same deps= combo shares the identical cached module) — this is the
   documented, correct fix, not the import-map approach tried earlier.
   NOTE: esm.sh's OWN build service currently fails outright for
   @codemirror/view >= ~6.37 (verified directly: the request hangs
   indefinitely) and @codemirror/lint >= ~6.9 assumes newer @codemirror/view
   APIs (e.g. `activateHover`) than 6.36.x exports — so this specific
   combination is pinned to a mutually-compatible, same-era vintage of every
   package, each carrying the identical deps= pin, and was verified
   end-to-end (EditorView actually constructs with no console/page errors)
   before being wired into the app. Do not bump individual package versions
   here without re-verifying the whole combo the same way — newer patches
   changed which versions esm.sh can even build, let alone agree on. */
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightSpecialChars,
} from 'https://esm.sh/@codemirror/view@6.36.5?deps=@codemirror/state@6.5.2';
import { EditorState, Compartment } from 'https://esm.sh/@codemirror/state@6.5.2';
import { defaultKeymap, history, historyKeymap, indentWithTab } from 'https://esm.sh/@codemirror/commands@6.8.1?deps=@codemirror/state@6.5.2,@codemirror/view@6.36.5';
import {
  StreamLanguage, LanguageSupport, syntaxHighlighting, HighlightStyle,
  indentOnInput, bracketMatching, foldGutter, foldKeymap,
} from 'https://esm.sh/@codemirror/language@6.11.1?deps=@codemirror/state@6.5.2,@codemirror/view@6.36.5';
import { linter, lintGutter, lintKeymap, forceLinting } from 'https://esm.sh/@codemirror/lint@6.8.5?deps=@codemirror/state@6.5.2,@codemirror/view@6.36.5';
import { searchKeymap, highlightSelectionMatches, openSearchPanel } from 'https://esm.sh/@codemirror/search@6.5.10?deps=@codemirror/state@6.5.2,@codemirror/view@6.36.5';
import {
  closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap,
} from 'https://esm.sh/@codemirror/autocomplete@6.18.6?deps=@codemirror/state@6.5.2,@codemirror/view@6.36.5';
import { tags as t } from 'https://esm.sh/@lezer/highlight@1.2.3';

/* ── Mermaid-ish syntax highlighting (StreamLanguage: legacy CM5-style tokenizer) ── */
const KEYWORDS = /^(graph|flowchart|subgraph|end|classDef|class|style|direction|click|linkStyle|TB|TD|LR|RL|BT)\b/;

const mermaidStream = {
  token(stream) {
    if (stream.match(/^%%.*/)) return 'comment';
    if (stream.match(/^\/\/.*/)) return 'comment';
    if (stream.sol() && stream.match(/^#.*/)) return 'comment';
    if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return 'string';
    if (stream.match(KEYWORDS)) return 'keyword';
    if (stream.match(/^(-{2,3}>|={2,3}>|-\.->|-{2,3}|={2,3})/)) return 'operator';
    if (stream.match(/^\|/)) return 'punctuation';
    if (stream.match(/^[\[\](){}]/)) return 'bracket';
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) return 'variable';
    if (stream.match(/^\d+/)) return 'number';
    stream.next();
    return null;
  },
};
const mermaidLanguage = StreamLanguage.define(mermaidStream);

const vscodeHighlight = HighlightStyle.define([
  { tag: t.keyword,      color: '#569cd6' },
  { tag: t.comment,      color: '#6a9955', fontStyle: 'italic' },
  { tag: t.string,       color: '#ce9178' },
  { tag: t.number,       color: '#b5cea8' },
  { tag: t.operator,     color: '#d4d4d4' },
  { tag: t.variableName, color: '#9cdcfe' },
  { tag: t.bracket,      color: '#ffd700' },
  { tag: t.punctuation,  color: '#d4d4d4' },
]);

const baseTheme = EditorView.theme({
  '&': { color: '#d4d4d4', backgroundColor: '#1e1e1e', height: '100%' },
  '.cm-content': { caretColor: '#aeafad' },
  '.cm-line': { padding: '0 4px' },
}, { dark: true });

/* ── Lightweight structural pre-lint (runs live, no mermaid.render needed) ── */
function structuralDiagnostics(view) {
  const diags = [];
  const doc = view.state.doc;
  const text = doc.toString();

  // Bracket balance across the whole document
  const stack = [];
  const pairs = { '[': ']', '(': ')', '{': '}' };
  const closers = { ']': '[', ')': '(', '}': '{' };
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && text[i - 1] !== '\\') inString = !inString;
    if (inString) continue;
    if (pairs[c]) stack.push({ c, pos: i });
    else if (closers[c]) {
      if (stack.length && stack[stack.length - 1].c === closers[c]) stack.pop();
      else diags.push({ from: i, to: i + 1, severity: 'error', message: `Unmatched "${c}"` });
    }
  }
  for (const open of stack) {
    diags.push({ from: open.pos, to: open.pos + 1, severity: 'error', message: `Unmatched "${open.c}" — missing closing "${pairs[open.c]}"` });
  }

  // Duplicate node IDs on pure node-definition lines: ID[...] / ID(...)
  const seen = new Map();
  for (let ln = 1; ln <= doc.lines; ln++) {
    const line = doc.line(ln);
    const t = line.text.trim();
    if (!t || t.startsWith('%%') || t.startsWith('//')) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*[\[(]/);
    if (!m) continue;
    const id = m[1];
    if (seen.has(id)) {
      const from = line.from + line.text.indexOf(id);
      diags.push({ from, to: from + id.length, severity: 'warning', message: `Duplicate node ID "${id}" (first defined on line ${seen.get(id)})` });
    } else {
      seen.set(id, ln);
    }
  }

  return diags;
}

/* ── Factory ── */
export function createFamScriptEditor(container, opts = {}) {
  let mermaidDiagnostics = [];
  const inputListeners = [];

  const wordWrapComp    = new Compartment();
  const fontSizeComp    = new Compartment();
  const tabSizeComp     = new Compartment();
  const lineNumbersComp = new Compartment();
  const activeLineComp  = new Compartment();

  const combinedLinter = linter(view => {
    console.log('[DEBUG linter source called] mermaidDiagnostics.length=', mermaidDiagnostics.length);
    try {
      const struct = structuralDiagnostics(view);
      console.log('[DEBUG structuralDiagnostics]', JSON.stringify(struct));
      return [...struct, ...mermaidDiagnostics];
    }
    catch (e) { console.log('[DEBUG structuralDiagnostics threw]', e.message); return mermaidDiagnostics; }
  }, { delay: 300 });

  const updateListener = EditorView.updateListener.of(update => {
    if (update.docChanged) {
      const isUserEdit = update.transactions.some(tr =>
        tr.isUserEvent('input') || tr.isUserEvent('delete') || tr.isUserEvent('move'));
      if (isUserEdit) inputListeners.forEach(cb => cb());
    }
    if (opts.onCursorActivity && (update.docChanged || update.selectionSet)) {
      opts.onCursorActivity(cursorInfo());
    }
  });

  function cursorInfo() {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    return { line: line.number, col: pos - line.from + 1 };
  }

  const state = EditorState.create({
    doc: opts.initialValue || '',
    extensions: [
      lineNumbersComp.of([lineNumbers()]),
      history(),
      drawSelection(),
      dropCursor(),
      highlightSpecialChars(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      foldGutter(),
      activeLineComp.of([highlightActiveLine(), highlightActiveLineGutter()]),
      highlightSelectionMatches(),
      syntaxHighlighting(vscodeHighlight),
      new LanguageSupport(mermaidLanguage),
      lintGutter(),
      combinedLinter,
      wordWrapComp.of([]),
      fontSizeComp.of(EditorView.theme({ '&': { fontSize: '13px' }, '.cm-content': { fontFamily: 'var(--font-mono)' } })),
      tabSizeComp.of(EditorState.tabSize.of(2)),
      keymap.of([
        ...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap,
        ...historyKeymap, ...foldKeymap, ...completionKeymap, ...lintKeymap,
        indentWithTab,
      ]),
      updateListener,
      baseTheme,
    ],
  });

  const view = new EditorView({ state, parent: container });

  function posFromLineCol(line, col) {
    const clamped = Math.min(Math.max(1, line), view.state.doc.lines);
    const ln = view.state.doc.line(clamped);
    const c = col ? Math.min(Math.max(0, col - 1), ln.length) : 0;
    return ln.from + c;
  }

  return {
    view,

    get value() { return view.state.doc.toString(); },
    set value(v) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v ?? '' } });
    },

    addEventListener(evt, cb) { if (evt === 'input') inputListeners.push(cb); },

    focus() { view.focus(); },

    /* diags: [{ line, col?, length?, severity: 'error'|'warning', message }] */
    setDiagnostics(diags) {
      mermaidDiagnostics = (diags || []).map(d => {
        const from = posFromLineCol(d.line, d.col);
        const to = Math.min(from + (d.length || Math.max(1, (view.state.doc.line(Math.min(Math.max(1, d.line), view.state.doc.lines)).length))), view.state.doc.length);
        return { from, to: Math.max(to, from + 1), severity: d.severity || 'error', message: d.message };
      });
      console.log('[DEBUG setDiagnostics]', JSON.stringify(mermaidDiagnostics));
      forceLinting(view);
      console.log('[DEBUG after forceLinting] doc length', view.state.doc.length);
    },
    clearDiagnostics() { mermaidDiagnostics = []; forceLinting(view); },

    gotoLine(n, col) {
      const pos = posFromLineCol(n, col);
      view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
      view.focus();
    },

    openSearch() { openSearchPanel(view); },

    getCursor: cursorInfo,

    setWordWrap(on) { view.dispatch({ effects: wordWrapComp.reconfigure(on ? EditorView.lineWrapping : []) }); },
    setFontSize(px) { view.dispatch({ effects: fontSizeComp.reconfigure(EditorView.theme({ '&': { fontSize: px + 'px' }, '.cm-content': { fontFamily: 'var(--font-mono)' } })) }); },
    setTabSize(n) { view.dispatch({ effects: tabSizeComp.reconfigure(EditorState.tabSize.of(n)) }); },
    setLineNumbers(on) { view.dispatch({ effects: lineNumbersComp.reconfigure(on ? [lineNumbers()] : []) }); },
    setActiveLineHighlight(on) { view.dispatch({ effects: activeLineComp.reconfigure(on ? [highlightActiveLine(), highlightActiveLineGutter()] : []) }); },
  };
}
