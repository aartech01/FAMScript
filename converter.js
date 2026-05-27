/* ═══════════════════════════════════════════════════════════
   CONVERTER — JSON ↔ Mermaid
   ═══════════════════════════════════════════════════════════ */

/* ── Normalise text: strip BOM, unify line endings ── */
function _normalise(text) {
  return text
    .replace(/^﻿/, '')        // strip BOM
    .replace(/\r\n/g, '\n')        // CRLF → LF
    .replace(/\r/g, '\n')          // stray CR → LF
    .trim();
}

/* ── Parse JSON input → Mermaid string ── */
function parseJsonToMermaid(text) {
  const obj = JSON.parse(text);

  // v2.0 format: { mermaid: "graph TB..." }
  if (typeof obj.mermaid === 'string' && obj.mermaid.trim()) {
    return obj.mermaid.trim();
  }

  // dual/wedding v2.0: { groom: "graph TB...", bride: "graph TB..." }
  if (typeof obj.groom === 'string' && obj.groom.trim()) {
    return '%% GROOM\'S SIDE\n' + obj.groom.trim() +
           '\n\n%% BRIDE\'S SIDE\n' + (obj.bride || '').trim();
  }

  // v1.0 legacy format: { nodes: [...], relations: [...] }
  if (Array.isArray(obj.nodes)) {
    return generateMermaid(obj);
  }

  throw new Error('Unrecognised JSON format. Expected {mermaid:...}, {groom:...,bride:...}, or {nodes:[...],relations:[...]}.');
}

/* ── Mermaid graph TB → JSON v1.0 (nodes + relations) ── */
function parseMermaidToJson(text) {
  var code = text.trim();

  // Strip markdown fence if present
  var fenceMatch = code.match(/```(?:mermaid)?\s*\n([\s\S]*?)\n[ \t]*```/);
  if (fenceMatch) {
    code = fenceMatch[1].trim();
  } else if (code.startsWith('```')) {
    code = code.replace(/^```(?:mermaid)?\s*\n?/, '').replace(/\n?[ \t]*```\s*$/, '').trim();
  }

  if (!code.match(/^graph\s+/i)) {
    throw new Error('Input must start with "graph TB" (or graph LR / TD).');
  }

  var lines  = code.split('\n').map(function(l) { return l.trim(); });
  var nodes  = {};   // id → node object (ordered by insertion)
  var rels   = [];
  var curGen = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.startsWith('%%') || line.startsWith('//')) continue;
    if (/^graph\s+/i.test(line)) continue;

    // subgraph GEN_P2["GEN +2 · Grandparents"]
    var sgm = line.match(/^subgraph\s+(\w+)(?:\s*\[["']?([^"'\]]+)["']?\])?/);
    if (sgm) { curGen = _subgraphToGen(sgm[1], sgm[2] || ''); continue; }
    if (line === 'end') { curGen = null; continue; }

    // style ID fill:#3b82f6,... → infer gender from fill colour
    var stm = line.match(/^style\s+(\w+)\s+fill:(#[0-9a-fA-F]{6})/i);
    if (stm) {
      var fill = stm[2].toLowerCase();
      if (nodes[stm[1]] && !nodes[stm[1]].gender) {
        nodes[stm[1]].gender = (fill === '#3b82f6') ? 'M' : (fill === '#ec4899') ? 'F' : '';
      }
      continue;
    }

    // Edge line
    if (/-->|---|==>|-\.->/.test(line)) {
      var em = _parseEdge(line);
      if (em) {
        rels.push({ from: em.from, to: em.to, type: em.type });
        if (!nodes[em.from]) nodes[em.from] = { id: em.from, name: em.from, age: 0, gender: '', generation: curGen || '', status: '' };
        if (!nodes[em.to])   nodes[em.to]   = { id: em.to,   name: em.to,   age: 0, gender: '', generation: curGen || '', status: '' };
      }
      continue;
    }

    // Node definition: ID["Name, Age (G)"]
    var nm = line.match(/^(\w+)\s*\[["']([^"']+)["']\]/);
    if (nm && !nodes[nm[1]]) {
      nodes[nm[1]] = _makeNode(nm[1], nm[2], curGen);
    }
  }

  // Fill missing generations from ID naming convention
  Object.keys(nodes).forEach(function(id) {
    if (!nodes[id].generation) nodes[id].generation = _genFromId(id);
  });

  if (Object.keys(nodes).length === 0 && rels.length === 0) {
    throw new Error('No nodes or edges found. Paste a valid family tree Mermaid diagram.');
  }

  return JSON.stringify({
    projectName: 'Family Tree',
    event: 'custom',
    version: '1.0',
    nodes: Object.keys(nodes).map(function(k) { return nodes[k]; }),
    relations: rels,
    settings: { theme: 'dark' }
  }, null, 2);
}

/* ── helpers ── */
function _subgraphToGen(id, label) {
  // id: GEN_P2, GEN_P1, GEN_P0, GEN_N1 …
  var m = id.match(/GEN_([PN])(\d)/i);
  if (m) {
    var n = parseInt(m[2]);
    if (n === 0) return 'G0';
    return m[1].toUpperCase() === 'P' ? 'G+' + n : 'G-' + n;
  }
  // label: "GEN +2 · Grandparents"
  var lm = label.match(/GEN\s*([+-]?\d+)/i);
  if (lm) {
    var v = parseInt(lm[1]);
    if (v === 0) return 'G0';
    return v > 0 ? 'G+' + v : 'G' + v;
  }
  return null;
}

function _makeNode(id, label, gen) {
  var name = label, age = 0, gender = '';
  // "Name, Age (G)"
  var m1 = label.match(/^(.+?),\s*(\d+)\s*\(([MF?])\)$/);
  if (m1) {
    name = m1[1].trim(); age = parseInt(m1[2]);
    gender = m1[3] === '?' ? '' : m1[3];
  } else {
    // "Name (G)"
    var m2 = label.match(/^(.+?)\s*\(([MF?])\)$/);
    if (m2) { name = m2[1].trim(); gender = m2[2] === '?' ? '' : m2[2]; }
    else    { name = label.trim(); }
  }
  return { id: id, name: name, age: age, gender: gender, generation: gen || '', status: '' };
}

function _parseEdge(line) {
  var id  = '(\\w+)';
  var lbl = '(?:\\|"?([^"|]*)"?\\|)?';
  var patterns = [
    { re: new RegExp('^' + id + '\\s*==>\\s*'   + lbl + '\\s*' + id + '$'), edge: 'thick'  },
    { re: new RegExp('^' + id + '\\s*-\\.->\\s*' + lbl + '\\s*' + id + '$'), edge: 'dashed' },
    { re: new RegExp('^' + id + '\\s*-->\\s*'   + lbl + '\\s*' + id + '$'), edge: 'arrow'  },
    { re: new RegExp('^' + id + '\\s*---\\s*'   + lbl + '\\s*' + id + '$'), edge: 'line'   },
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = line.match(patterns[i].re);
    if (m) return { from: m[1], to: m[3], type: _relType((m[2] || '').trim(), patterns[i].edge) };
  }
  return null;
}

function _relType(label, edge) {
  var map = {
    father: 'FATHER_OF', mother: 'MOTHER_OF', parent: 'PARENT_OF',
    child: 'CHILD_OF', son: 'SON_OF', daughter: 'DAUGHTER_OF',
    married: 'MARRIED_TO', couple: 'CORE_COUPLE',
    sibling: 'SIBLING_OF', brother: 'BROTHER_OF', sister: 'SISTER_OF',
    cousin: 'COUSIN_OF', step: 'STEP_PARENT', adoptive: 'ADOPTIVE_PARENT'
  };
  var l = label.toLowerCase();
  if (map[l]) return map[l];
  if (edge === 'thick')  return 'CORE_COUPLE';
  if (edge === 'dashed') return 'STEP_PARENT';
  if (edge === 'line')   return 'MARRIED_TO';
  return 'PARENT_OF';
}

function _genFromId(id) {
  var m;
  m = id.match(/_G0_/i);    if (m) return 'G0';
  m = id.match(/_P(\d)_/i); if (m) return parseInt(m[1]) === 0 ? 'G0' : 'G+' + m[1];
  m = id.match(/_GM(\d)_/i); if (m) return 'G-' + m[1];
  m = id.match(/_N(\d)_/i);  if (m) return 'G-' + m[1];
  return '';
}

/* ══════════════════════════════════════════════════════════
   UI
   ══════════════════════════════════════════════════════════ */
(function () {
  const modal      = document.getElementById('converter-modal');
  const inputEl    = document.getElementById('conv-input');
  const outputEl   = document.getElementById('conv-output');
  const statusEl   = document.getElementById('conv-status');
  const inputLabel = document.getElementById('conv-input-label');

  var currentMode = 'json2mermaid';

  var MODE_META = {
    json2mermaid: {
      label:       'Input — JSON Project',
      placeholder: 'Paste exported JSON project here…',
      okMsg:       'Converted — Mermaid code ready to copy'
    },
    mermaid2json: {
      label:       'Input — Mermaid Code',
      placeholder: 'Paste Mermaid graph TB code here…',
      okMsg:       'Converted — JSON project ready to copy'
    }
  };

  /* ── open / close ── */
  document.getElementById('btn-converter').addEventListener('click', function () {
    modal.style.display = 'flex';
  });
  document.getElementById('conv-modal-close').addEventListener('click', _close);
  modal.addEventListener('click', function (e) { if (e.target === modal) _close(); });

  function _close() { modal.style.display = 'none'; }

  /* ── tab switching ── */
  document.querySelectorAll('.conv-tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.conv-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      var meta = MODE_META[currentMode];
      inputLabel.textContent    = meta.label;
      inputEl.placeholder       = meta.placeholder;
      inputEl.value             = '';
      outputEl.value            = '';
      statusEl.textContent      = '';
      statusEl.className        = 'conv-status';
    });
  });

  /* ── convert ── */
  document.getElementById('btn-conv-run').addEventListener('click', function () {
    var raw   = inputEl.value;
    var input = _normalise(raw);

    if (!input) { _setStatus('error', 'Input is empty.'); return; }

    try {
      var output;
      if (currentMode === 'json2mermaid') {
        output = parseJsonToMermaid(input);
      } else {
        output = parseMermaidToJson(input);
      }
      outputEl.value = output;
      _setStatus('ok', MODE_META[currentMode].okMsg);
    } catch (err) {
      _setStatus('error', err.message);
      outputEl.value = '';
    }
  });

  /* ── copy output ── */
  document.getElementById('btn-conv-copy').addEventListener('click', function () {
    if (!outputEl.value) return;
    var btn = document.getElementById('btn-conv-copy');
    navigator.clipboard.writeText(outputEl.value).then(function () {
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = 'Copy Output'; }, 2000);
    });
  });

  /* ── helpers ── */
  function _setStatus(type, msg) {
    statusEl.textContent = msg || '';
    statusEl.className   = 'conv-status conv-status-' + type;
  }
})();
