/* app.js's whole body is wrapped and gated on the CM6 editor module resolving
   (see the dynamic import() bootstrap near the top of index.html) — CodeMirror
   loads asynchronously via ESM, so nothing here can run until it's ready. */
async function __famscriptBoot() {

/* ═══════════════ EVENT DEFINITIONS ═══════════════ */
const EVENTS = {
  wedding:     { name: 'Wedding (विवाह)',                    color: '#C8FF3E', ecLight: 'rgba(200,255,62,0.07)',   dual: false, desc: 'Build the combined family tree for the wedding ceremony' },
  mundan:      { name: 'First Haircut (मुंडन)',              color: '#38bdf8', ecLight: 'rgba(56,189,248,0.07)',  dual: false, desc: "Build the child's family tree for the Mundan ceremony" },
  namkaran:    { name: 'Naming Ceremony (नामकरण)',           color: '#60a5fa', ecLight: 'rgba(96,165,250,0.07)',  dual: false, desc: "Build the naming ceremony family tree" },
  annaprashan: { name: 'First Rice Feeding (अन्नप्राशन)',     color: '#fb923c', ecLight: 'rgba(251,146,60,0.07)',  dual: false, desc: 'Build the family tree for the first-rice feeding ceremony' },
  vastu:       { name: 'House Warming (वास्तु पूजा)',         color: '#34d399', ecLight: 'rgba(52,211,153,0.07)',  dual: false, desc: 'Build the household family tree for the Vastu Puja' },
  upanayana:   { name: 'Sacred Thread Ceremony (उपनयन)',     color: '#818cf8', ecLight: 'rgba(129,140,248,0.07)', dual: false, desc: 'Build the family tree for the sacred thread ceremony' },
  godhbharai:  { name: 'Baby Shower (गोद भराई)',             color: '#e879f9', ecLight: 'rgba(232,121,249,0.07)', dual: false, desc: 'Build the family tree for the baby shower ceremony' },
  birthday:    { name: 'Birthday (जन्मदिन)',                 color: '#fbbf24', ecLight: 'rgba(251,191,36,0.07)',  dual: false, desc: 'Build the family tree for the birthday celebration' },
  custom:      { name: 'Custom Event',                        color: '#94a3b8', ecLight: 'rgba(148,163,184,0.07)', dual: false, desc: 'Build a family tree for your custom ceremony or event' },
};

/* ═══════════════ SAMPLES ═══════════════ */
/* All samples use the same flat, box-free pattern: a married couple is joined
   through a small junction dot ( CP_xxx(( )) ), and the dot fans out to their
   children. This keeps every generation on one aligned row and avoids the edge
   crossings you get when two parents both point at two children directly. */
const SAMPLES = {

  // ── Wedding (combined) ───────────────────────────────────
  wedding: `graph TB

  GROOM_PGF_P2_001["Groom father's Father"]
  GROOM_PGM_P2_001["Groom father's Mother"]
  GROOM_MGF_P2_002["Groom Mother's Father"]
  GROOM_MGM_P2_002["Groom Mother's Mother"]
  GROOM_DAD_P1_001["Groom Father"]
  GROOM_MOM_P1_001["Groom Mother"]
  GROOM_BRO_G0_002["Groom's Brother"]
  GROOM_G0_001["Groom"]
  CP_GROOM_PG(( ))
  CP_GROOM_MG(( ))
  CP_GROOM_DM(( ))

  GROOM_PGF_P2_001 ---|"father"| CP_GROOM_PG
  GROOM_PGM_P2_001 ---|"mother"| CP_GROOM_PG
  CP_GROOM_PG -->|"son"| GROOM_DAD_P1_001
  GROOM_MGF_P2_002 ---|"father"| CP_GROOM_MG
  GROOM_MGM_P2_002 ---|"mother"| CP_GROOM_MG
  CP_GROOM_MG -->|"daughter"| GROOM_MOM_P1_001
  GROOM_DAD_P1_001 ---|"father"| CP_GROOM_DM
  GROOM_MOM_P1_001 ---|"mother"| CP_GROOM_DM
  CP_GROOM_DM -->|"son"| GROOM_BRO_G0_002
  CP_GROOM_DM -->|"son"| GROOM_G0_001

  BRIDE_PGF_P2_001["Bride father's father"]
  BRIDE_PGM_P2_001["Bride father's mother"]
  BRIDE_MGF_P2_002["Bride Mother's father"]
  BRIDE_MGM_P2_002["Bride Mother's mother"]
  BRIDE_DAD_P1_001["Bride Father"]
  BRIDE_MOM_P1_001["Bride Mother"]
  BRIDE_SIS_G0_002["Bride's Sister"]
  BRIDE_G0_001["Bride"]
  CP_BRIDE_PG(( ))
  CP_BRIDE_MG(( ))
  CP_BRIDE_DM(( ))

  BRIDE_PGF_P2_001 ---|"father"| CP_BRIDE_PG
  BRIDE_PGM_P2_001 ---|"mother"| CP_BRIDE_PG
  CP_BRIDE_PG -->|"son"| BRIDE_DAD_P1_001
  BRIDE_MGF_P2_002 ---|"father"| CP_BRIDE_MG
  BRIDE_MGM_P2_002 ---|"mother"| CP_BRIDE_MG
  CP_BRIDE_MG -->|"daughter"| BRIDE_MOM_P1_001
  BRIDE_DAD_P1_001 ---|"father"| CP_BRIDE_DM
  BRIDE_MOM_P1_001 ---|"mother"| CP_BRIDE_DM
  CP_BRIDE_DM -->|"daughter"| BRIDE_SIS_G0_002
  CP_BRIDE_DM -->|"daughter"| BRIDE_G0_001

  CP_WED_COUPLE(( ))
  WED_CHILD_N1_001["Son or Daughter"]
  GROOM_G0_001 ---|"husband"| CP_WED_COUPLE
  BRIDE_G0_001 ---|"wife"| CP_WED_COUPLE
  CP_WED_COUPLE -->|"child"| WED_CHILD_N1_001`,

  // ── Wedding individual (kept for reference) ──────────────
  groom: `graph TB

  GROOM_PGF_P2_001["Groom father's Father"]
  GROOM_PGM_P2_001["Groom father's Mother"]
  GROOM_MGF_P2_002["Groom Mother's Father"]
  GROOM_MGM_P2_002["Groom Mother's Mother"]
  GROOM_DAD_P1_001["Groom Father"]
  GROOM_MOM_P1_001["Groom Mother"]
  GROOM_BRO_G0_002["Groom's brother"]
  GROOM_FRND_G0_003["Groom's friend"]
  GROOM_G0_001["Groom"]
  GROOM_BRO_CHILD_N1_002["Son or Daughter"]
  CP_GROOM_PG(( ))
  CP_GROOM_MG(( ))
  CP_GROOM_DM(( ))
  CP_GROOM_BRO(( ))

  GROOM_PGF_P2_001 ---|"father"| CP_GROOM_PG
  GROOM_PGM_P2_001 ---|"mother"| CP_GROOM_PG
  CP_GROOM_PG -->|"son"| GROOM_DAD_P1_001
  GROOM_MGF_P2_002 ---|"father"| CP_GROOM_MG
  GROOM_MGM_P2_002 ---|"mother"| CP_GROOM_MG
  CP_GROOM_MG -->|"daughter"| GROOM_MOM_P1_001
  GROOM_DAD_P1_001 ---|"father"| CP_GROOM_DM
  GROOM_MOM_P1_001 ---|"mother"| CP_GROOM_DM
  CP_GROOM_DM -.->|"nephew"| GROOM_FRND_G0_003
  CP_GROOM_DM -->|"son"| GROOM_BRO_G0_002
  CP_GROOM_DM -->|"son"| GROOM_G0_001
  GROOM_BRO_G0_002 ---|"parent"| CP_GROOM_BRO
  CP_GROOM_BRO -->|"child"| GROOM_BRO_CHILD_N1_002`,

  bride: `graph TB

  BRIDE_PGF_P2_001["Bride father's father"]
  BRIDE_PGM_P2_001["Bride father's mother"]
  BRIDE_MGF_P2_002["Bride mother's father"]
  BRIDE_MGM_P2_002["Bride mother's mother"]
  BRIDE_DAD_P1_001["Bride Father"]
  BRIDE_MOM_P1_001["Bride Mother"]
  BRIDE_FRND_G0_003["Bride's friend"]
  BRIDE_G0_001["Bride"]
  BRIDE_FRND_CHILD_N1_003["Son or Daughter"]
  CP_BRIDE_PG(( ))
  CP_BRIDE_MG(( ))
  CP_BRIDE_DM(( ))
  CP_BRIDE_FR(( ))

  BRIDE_PGF_P2_001 ---|"father"| CP_BRIDE_PG
  BRIDE_PGM_P2_001 ---|"mother"| CP_BRIDE_PG
  CP_BRIDE_PG -->|"son"| BRIDE_DAD_P1_001
  BRIDE_MGF_P2_002 ---|"father"| CP_BRIDE_MG
  BRIDE_MGM_P2_002 ---|"mother"| CP_BRIDE_MG
  CP_BRIDE_MG -->|"daughter"| BRIDE_MOM_P1_001
  BRIDE_DAD_P1_001 ---|"father"| CP_BRIDE_DM
  BRIDE_MOM_P1_001 ---|"mother"| CP_BRIDE_DM
  CP_BRIDE_DM -->|"daughter"| BRIDE_G0_001
  CP_BRIDE_DM -.->|"nephew"| BRIDE_FRND_G0_003
  BRIDE_FRND_G0_003 ---|"parent"| CP_BRIDE_FR
  CP_BRIDE_FR -->|"child"| BRIDE_FRND_CHILD_N1_003`,

  // ── Mundan (First Haircut) ───────────────────────────────
  mundan: `graph TB

  DADA_P2_001["Ramesh Sharma, 60 (M)"]
  DADI_P2_001["Kamla Sharma, 57 (F)"]
  NANA_P2_002["Mohan Verma, 62 (M)"]
  NANI_P2_002["Sunita Verma, 59 (F)"]
  DAD_P1_001["Deepak Sharma, 32 (M)"]
  MOM_P1_001["Pooja Sharma, 29 (F)"]
  CHILD_G0_001["Aryan Sharma, 2 (M)"]
  CP_DADA_DADI(( ))
  CP_NANA_NANI(( ))
  CP_DAD_MOM(( ))

  DADA_P2_001 ---|"father"| CP_DADA_DADI
  DADI_P2_001 ---|"mother"| CP_DADA_DADI
  CP_DADA_DADI -->|"son"| DAD_P1_001
  NANA_P2_002 ---|"father"| CP_NANA_NANI
  NANI_P2_002 ---|"mother"| CP_NANA_NANI
  CP_NANA_NANI -->|"daughter"| MOM_P1_001
  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| CHILD_G0_001`,

  // ── Namkaran (Baby Naming) ───────────────────────────────
  namkaran: `graph TB

  DADA_P2_001["Vinod Joshi, 58 (M)"]
  DADI_P2_001["Savita Joshi, 55 (F)"]
  DAD_P1_001["Amit Joshi, 31 (M)"]
  CHACHA_P1_001["Rahul Joshi, 27 (M)"]
  MOM_P1_001["Neha Joshi, 28 (F)"]
  BABY_G0_001["Riya Joshi, 1 (F)"]
  CP_DADA_DADI(( ))
  CP_DAD_MOM(( ))

  DADA_P2_001 ---|"father"| CP_DADA_DADI
  DADI_P2_001 ---|"mother"| CP_DADA_DADI
  CP_DADA_DADI -->|"son"| DAD_P1_001
  CP_DADA_DADI -->|"son"| CHACHA_P1_001
  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"daughter"| BABY_G0_001`,

  // ── Annaprashan (First Rice Feeding) ─────────────────────
  annaprashan: `graph TB

  DADA_P2_001["Gurdev Singh, 62 (M)"]
  DADI_P2_001["Kulwant Singh, 59 (F)"]
  NANA_P2_002["Tejinder Bains, 64 (M)"]
  NANI_P2_002["Harjit Bains, 61 (F)"]
  DAD_P1_001["Harpreet Singh, 33 (M)"]
  MOM_P1_001["Manpreet Singh, 30 (F)"]
  MAMA_P1_001["Rajdeep Bains, 28 (M)"]
  BABY_G0_001["Kabir Singh, 1 (M)"]
  CP_DADA_DADI(( ))
  CP_NANA_NANI(( ))
  CP_DAD_MOM(( ))

  DADA_P2_001 ---|"father"| CP_DADA_DADI
  DADI_P2_001 ---|"mother"| CP_DADA_DADI
  CP_DADA_DADI -->|"son"| DAD_P1_001
  NANA_P2_002 ---|"father"| CP_NANA_NANI
  NANI_P2_002 ---|"mother"| CP_NANA_NANI
  CP_NANA_NANI -->|"daughter"| MOM_P1_001
  CP_NANA_NANI -->|"son"| MAMA_P1_001
  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| BABY_G0_001`,

  // ── Vastu Puja (House Warming) ───────────────────────────
  vastu: `graph TB

  DAD_P1_001["Krishnan Nair, 62 (M)"]
  MOM_P1_001["Leela Nair, 58 (F)"]
  FIL_P1_001["Suresh Menon, 60 (M)"]
  MIL_P1_001["Geetha Menon, 57 (F)"]
  OWNER_G0_001["Vikram Nair, 35 (M)"]
  WIFE_G0_001["Divya Nair, 32 (F)"]
  SON_GM1_001["Arjun Nair, 7 (M)"]
  CP_DAD_MOM(( ))
  CP_FIL_MIL(( ))
  CP_OWNER_WIFE(( ))

  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| OWNER_G0_001
  FIL_P1_001 ---|"father"| CP_FIL_MIL
  MIL_P1_001 ---|"mother"| CP_FIL_MIL
  CP_FIL_MIL -->|"daughter"| WIFE_G0_001
  OWNER_G0_001 ---|"husband"| CP_OWNER_WIFE
  WIFE_G0_001 ---|"wife"| CP_OWNER_WIFE
  CP_OWNER_WIFE -->|"son"| SON_GM1_001`,

  // ── Upanayana (Sacred Thread) ────────────────────────────
  upanayana: `graph TB

  DADA_P2_001["Venkat Iyer, 68 (M)"]
  DADI_P2_001["Saraswati Iyer, 65 (F)"]
  NANA_P2_002["Raghav Sharma, 66 (M)"]
  NANI_P2_002["Padma Sharma, 63 (F)"]
  DAD_P1_001["Srikanth Iyer, 40 (M)"]
  MOM_P1_001["Lakshmi Iyer, 37 (F)"]
  MAMA_P1_001["Rajan Sharma, 35 (M)"]
  BOY_G0_001["Vedant Iyer, 10 (M)"]
  CP_DADA_DADI(( ))
  CP_NANA_NANI(( ))
  CP_DAD_MOM(( ))

  DADA_P2_001 ---|"father"| CP_DADA_DADI
  DADI_P2_001 ---|"mother"| CP_DADA_DADI
  CP_DADA_DADI -->|"son"| DAD_P1_001
  NANA_P2_002 ---|"father"| CP_NANA_NANI
  NANI_P2_002 ---|"mother"| CP_NANA_NANI
  CP_NANA_NANI -->|"daughter"| MOM_P1_001
  CP_NANA_NANI -->|"son"| MAMA_P1_001
  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| BOY_G0_001`,

  // ── Godh Bharai (Baby Shower) ────────────────────────────
  godhbharai: `graph TB

  MFATH_P1_001["Sanjay Gupta, 55 (M)"]
  MMOTH_P1_001["Asha Gupta, 52 (F)"]
  FFATH_P1_001["Rakesh Agarwal, 57 (M)"]
  FMOTH_P1_001["Meena Agarwal, 54 (F)"]
  DAD_G0_001["Ankit Agarwal, 30 (M)"]
  MOM_G0_001["Prerna Agarwal, 27 (F)"]
  SIS_G0_001["Shruti Gupta, 24 (F)"]
  BABY_GM1_001["Baby (expected)"]
  CP_MFATH_MMOTH(( ))
  CP_FFATH_FMOTH(( ))
  CP_DAD_MOM(( ))

  MFATH_P1_001 ---|"father"| CP_MFATH_MMOTH
  MMOTH_P1_001 ---|"mother"| CP_MFATH_MMOTH
  CP_MFATH_MMOTH -->|"daughter"| MOM_G0_001
  CP_MFATH_MMOTH -->|"daughter"| SIS_G0_001
  FFATH_P1_001 ---|"father"| CP_FFATH_FMOTH
  FMOTH_P1_001 ---|"mother"| CP_FFATH_FMOTH
  CP_FFATH_FMOTH -->|"son"| DAD_G0_001
  DAD_G0_001 ---|"husband"| CP_DAD_MOM
  MOM_G0_001 ---|"wife"| CP_DAD_MOM
  CP_DAD_MOM -.->|"expecting"| BABY_GM1_001`,

  // ── Birthday ─────────────────────────────────────────────
  birthday: `graph TB

  DADA_P2_001["Ashok Malhotra, 65 (M)"]
  DADI_P2_001["Sudha Malhotra, 62 (F)"]
  DAD_P1_001["Rohit Malhotra, 38 (M)"]
  MOM_P1_001["Anjali Malhotra, 35 (F)"]
  BDAY_G0_001["Ishaan Malhotra, 8 (M)"]
  SIS_G0_001["Anika Malhotra, 12 (F)"]
  CP_DADA_DADI(( ))
  CP_DAD_MOM(( ))

  DADA_P2_001 ---|"father"| CP_DADA_DADI
  DADI_P2_001 ---|"mother"| CP_DADA_DADI
  CP_DADA_DADI -->|"son"| DAD_P1_001
  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| BDAY_G0_001
  CP_DAD_MOM -->|"daughter"| SIS_G0_001`,

  // ── Custom / Generic ─────────────────────────────────────
  single: `graph TB

  GDF_P2_001["Harish Gupta, 78 (M)"]
  GDM_P2_001["Asha Gupta, 75 (F)"]
  FATHER_P1_001["Ramesh Gupta, 55 (M)"]
  MOTHER_P1_001["Sita Gupta, 52 (F)"]
  SELF_G0_001["Rohan Gupta, 28 (M)"]
  SIS_G0_001["Priya Gupta, 25 (F)"]
  CP_GDF_GDM(( ))
  CP_FATHER_MOTHER(( ))

  GDF_P2_001 ---|"father"| CP_GDF_GDM
  GDM_P2_001 ---|"mother"| CP_GDF_GDM
  CP_GDF_GDM -->|"son"| FATHER_P1_001
  FATHER_P1_001 ---|"father"| CP_FATHER_MOTHER
  MOTHER_P1_001 ---|"mother"| CP_FATHER_MOTHER
  CP_FATHER_MOTHER -->|"son"| SELF_G0_001
  CP_FATHER_MOTHER -->|"daughter"| SIS_G0_001`,
};

/* ═══════════════ STATE ═══════════════ */
let currentEvent  = 'wedding';
let activeSide    = 'groom';
const MERMAID_THEME = 'dark';
let renderCounter = 0;

const scripts  = { single: '', groom: '',  bride: '' };
const mermaids = { single: '',   groom: '',   bride: '' };

/* ═══════════════ ELEMENTS ═══════════════ */
const sbPosition  = document.getElementById('sb-position');
const editor      = createFamScriptEditor(document.getElementById('editor-host'), {
  onCursorActivity: ({ line, col }) => { if (sbPosition) sbPosition.textContent = `Ln ${line}, Col ${col}`; },
});
const vpSingle    = document.getElementById('vp-single');
const consoleEl   = document.getElementById('console-panel');
const eventSelect = document.getElementById('event-select');
const projName    = document.getElementById('project-name');
const statusBadge = document.getElementById('status-badge');

/* ═══════════════ CANVAS CONTROLLERS ═══════════════ */
const ctrlSingle = new CanvasController(vpSingle);

/* ═══════════════ MEMBER TABLE VIEW ═══════════════ */
const tableViewEl   = document.getElementById('table-view');
const tableBodyEl   = document.getElementById('member-table-body');
const tableCountEl  = document.getElementById('table-count');
const tableSearchEl = document.getElementById('table-search');
const canvasHintEl  = document.getElementById('canvas-hint');
let currentMembers = [];

function genLabel(g) {
  if (!g) return 'Gen 0';
  return g > 0 ? `Gen +${g}` : `Gen ${g}`;
}

function renderMemberTable() {
  currentMembers = (window.FamTree && mermaids.single) ? (window.FamTree.listPersons(mermaids.single) || []) : [];
  applyMemberFilter();
}

function applyMemberFilter() {
  const q = (tableSearchEl?.value || '').trim().toLowerCase();
  const rows = !q ? currentMembers : currentMembers.filter(m =>
    m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q)
  );

  tableBodyEl.innerHTML = rows.length ? rows.map((m, i) => `
    <tr class="${m.ego ? 'member-ego' : ''}">
      <td>${i + 1}</td>
      <td><code>${escHtml(m.id)}</code></td>
      <td>${escHtml(m.name)}${m.ego ? '<span class="ego-badge">SELF</span>' : ''}</td>
      <td>${m.age !== '' ? escHtml(String(m.age)) : '—'}</td>
      <td>${m.gender || '—'}</td>
      <td>${escHtml(m.role || '—')}</td>
      <td>${genLabel(m.generation)}</td>
    </tr>`).join('') : `<tr><td colspan="7" class="table-empty">${currentMembers.length ? 'No members match your search.' : 'No family members yet — compile a tree first.'}</td></tr>`;

  if (tableCountEl) tableCountEl.textContent = `${rows.length} member${rows.length === 1 ? '' : 's'}`;
}

tableSearchEl?.addEventListener('input', applyMemberFilter);

document.querySelectorAll('.view-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const isTable = btn.dataset.view === 'table';
    vpSingle.hidden    = isTable;
    tableViewEl.hidden = !isTable;
    if (canvasHintEl) canvasHintEl.style.visibility = isTable ? 'hidden' : '';
    if (isTable) renderMemberTable();
  });
});

/* ═══════════════ MERMAID INIT ═══════════════ */
mermaid.initialize({ startOnLoad: false, theme: MERMAID_THEME, securityLevel: 'loose' });

/* ═══════════════ EVENT SWITCHING ═══════════════ */
function switchEvent(key) {
  saveCurrentScript();

  currentEvent = key;
  const ev = EVENTS[key];

  document.body.style.setProperty('--ec',      ev.color);
  document.body.style.setProperty('--ec-light', ev.ecLight);

  editor.value = scripts.single;

  resetPreviews();
}

function resetPreviews() {
  _restoreEmptyState(vpSingle, 'Write Mermaid code and press <strong>&#9654; Compile</strong>,<br>or click <strong>Load Sample</strong> to get started.');
  mermaids.single = '';
  renderMemberTable();
  setStatus('idle');
}

function _restoreEmptyState(vp, html) {
  const inner = vp.querySelector('.canvas-inner');
  if (inner) inner.remove();
  let es = vp.querySelector('.empty-state');
  if (!es) {
    es = document.createElement('div');
    es.className = 'empty-state';
    vp.insertBefore(es, vp.querySelector('.canvas-controls'));
  }
  es.innerHTML = html;
}

function saveCurrentScript() {
  if (EVENTS[currentEvent]?.dual) {
    scripts[activeSide] = editor.value;
  } else {
    scripts.single = editor.value;
  }
}

/* ═══════════════ TAB SWITCHING (wedding) ═══════════════ */
function setActiveTab(side) {
  activeSide = side;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === side);
  });
  document.getElementById('editor-label').textContent =
    side === 'groom' ? "Groom's Mermaid" : "Bride's Mermaid";
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    saveCurrentScript();
    setActiveTab(btn.dataset.side);
    editor.value = scripts[btn.dataset.side] || '';
    editor.focus();
  });
});

/* ═══════════════ COMPILE ═══════════════ */
async function compile() {
  saveCurrentScript();
  setStatus('compiling');

  const ev = EVENTS[currentEvent];
  if (ev?.dual && ev?.combined) {
    await compileWeddingCombined();
  } else if (ev?.dual) {
    await compileWedding();
  } else {
    await compileSingle();
  }
}

async function compileSingle() {
  // Pass the RAW (untrimmed) text through — _preprocessMermaidWithMap needs the
  // original line offsets intact to build an accurate lineMap.
  if (!scripts.single.trim()) {
    log([{ type: 'info', message: 'Editor is empty — load a sample or start writing Mermaid code.' }]);
    setStatus('idle'); return;
  }

  const { code, lineMap } = _preprocessMermaidWithMap(scripts.single);
  if (!code) {
    log([{ type: 'error', message: 'No valid Mermaid code found after stripping comments.' }]);
    setStatus('error'); return;
  }

  mermaids.single = code;
  try {
    await renderInto(vpSingle, code, ctrlSingle);
    editor.clearDiagnostics();
    renderMemberTable();
    log([{ type: 'success', message: 'Rendered successfully.' }]);
    setStatus('ok');
  } catch (e) {
    // Mermaid v10 syntax errors typically read "Parse error on line N: ...".
    // Best-effort: map that back through lineMap to the real editor line.
    // If the message doesn't match (some error classes phrase it differently),
    // fall back to a message-only entry — never let this throw.
    let origLine = null;
    const m = /line\s+(\d+)/i.exec(e.message);
    if (m) {
      const idx = Number(m[1]) - 1;
      if (idx >= 0 && idx < lineMap.length && lineMap[idx] != null) origLine = lineMap[idx] + 1;
    }
    if (origLine != null) editor.setDiagnostics([{ line: origLine, message: e.message, severity: 'error' }]);
    log([{ type: 'error', message: 'Render failed: ' + e.message, line: origLine }]);
    setStatus('error');
  }
}

async function compileWedding() {
  const groomText = scripts.groom.trim();
  const brideText = scripts.bride.trim();
  const allLogs = [];
  let hasError = false;

  if (groomText) {
    const code = _preprocessMermaid(groomText);
    mermaids.groom = code;
    try {
      await renderInto(vpGroom, code, ctrlGroom);
      allLogs.unshift({ type: 'success', message: "Groom's side rendered successfully." });
    } catch (e) {
      allLogs.push({ type: 'error', message: '[Groom] Render failed: ' + e.message });
      hasError = true;
    }
  } else {
    _restoreEmptyState(vpGroom, 'Groom\'s family tree will appear here');
  }

  if (brideText) {
    const code = _preprocessMermaid(brideText);
    mermaids.bride = code;
    try {
      await renderInto(vpBride, code, ctrlBride);
      allLogs.push({ type: 'success', message: "Bride's side rendered successfully." });
    } catch (e) {
      allLogs.push({ type: 'error', message: '[Bride] Render failed: ' + e.message });
      hasError = true;
    }
  } else {
    _restoreEmptyState(vpBride, 'Bride\'s family tree will appear here');
  }

  if (!groomText && !brideText) {
    log([{ type: 'info', message: 'Both panels are empty — load a sample or start writing Mermaid code.' }]);
    setStatus('idle'); return;
  }

  log(allLogs);
  setStatus(hasError ? 'error' : 'ok');
}

/* Merge groom + bride Mermaid into one combined TB diagram.
   Both sides are flat, box-free graphs. We concatenate them, then join the groom
   and bride through a marriage junction dot (CP_WED_COUPLE) that descends to a
   single shared child. Routing the spouses through a dot — rather than a direct
   groom --- bride line — keeps them on the same generation row (a direct line
   would force one spouse down a rank since both are already anchored by their
   own parents at GEN 0). */
function combineWeddingMermaid(groomCode, brideCode) {
  if (!groomCode && !brideCode) return '';
  if (!groomCode) return brideCode;
  if (!brideCode) return groomCode;

  const stripHeader = s => s.replace(/^graph\s+TB\s*/im, '').trim();
  // Strip class/style/comment lines — _preprocessMermaid re-adds managed styling.
  const isNoise = t => !t || t.startsWith('%%') || /^(classDef|class |style |subgraph|end\b|direction)\b/.test(t);
  // Safety: namespace any bride junction dots so they can't collide with groom's.
  const prefixBrideCp = code => code.replace(/\bCP_(?!BRIDE_)/g, 'CP_BRIDE_');

  const groomBody = stripHeader(groomCode).split('\n').filter(l => !isNoise(l.trim())).join('\n');
  const brideBody = prefixBrideCp(stripHeader(brideCode).split('\n').filter(l => !isNoise(l.trim())).join('\n'));

  let out = 'graph TB\n\n';
  out += groomBody + '\n\n' + brideBody + '\n';

  // Join the couple if both sides expose a GEN-0 ego node (ROLE_G0_NNN).
  const findG0 = code => { const m = code.match(/\b([A-Z][A-Z0-9]*_G0_\d+)\b/); return m ? m[1] : null; };
  const groomG0 = findG0(groomBody);
  const brideG0 = findG0(brideBody);
  if (groomG0 && brideG0) {
    out += `\n  CP_WED_COUPLE(( ))\n`;
    out += `  WED_CHILD_N1_001["Son or Daughter"]\n`;
    out += `  ${groomG0} ---|"husband"| CP_WED_COUPLE\n`;
    out += `  ${brideG0} ---|"wife"| CP_WED_COUPLE\n`;
    out += `  CP_WED_COUPLE -->|"child"| WED_CHILD_N1_001\n`;
  }

  return out;
}

async function compileWeddingCombined() {
  const groomText = scripts.groom.trim();
  const brideText = scripts.bride.trim();

  if (!groomText && !brideText) {
    log([{ type: 'info', message: 'Both panels are empty — load a sample or start writing Mermaid code.' }]);
    setStatus('idle'); return;
  }

  const raw  = combineWeddingMermaid(groomText, brideText);
  const code = _preprocessMermaid(raw);
  mermaids.single = code;

  try {
    await renderInto(vpSingle, code, ctrlSingle);
    renderMemberTable();
    log([{ type: 'success', message: 'Wedding tree rendered — groom left · bride right.' }]);
    setStatus('ok');
  } catch (e) {
    log([{ type: 'error', message: 'Render failed: ' + e.message }]);
    setStatus('error');
  }
}

/* ═══════════════ RENDER ═══════════════ */
async function renderInto(vp, code, ctrl) {
  mermaid.initialize({
    startOnLoad: false, theme: MERMAID_THEME, securityLevel: 'loose',
    flowchart: { curve: 'linear', nodeSpacing: 80, rankSpacing: 110, padding: 30 }
  });
  const uid = 'mmd_' + (++renderCounter) + '_' + Date.now();

  // remove empty state
  const es = vp.querySelector('.empty-state');
  if (es) es.remove();

  // get or create inner container (inserted before the controls overlay)
  let inner = vp.querySelector('.canvas-inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'canvas-inner';
    vp.insertBefore(inner, vp.querySelector('.canvas-controls'));
  }

  try {
    // Prefer the custom genealogy renderer (spouses side-by-side with ring
    // connectors, generation rows). It returns null for anything that isn't
    // a recognisable family graph — those fall through to plain Mermaid.
    let svg = null;
    try { if (window.FamTree) svg = window.FamTree.render(code); }
    catch (_) { svg = null; }
    if (!svg) ({ svg } = await mermaid.render(uid, code));
    inner.innerHTML = svg;

    // set explicit px size so canvas-inner (absolute-positioned) renders the SVG at natural dimensions
    const svgEl = inner.querySelector('svg');
    if (svgEl) {
      const vb = svgEl.viewBox?.baseVal;
      if (vb && vb.width > 0 && vb.height > 0) {
        svgEl.style.width  = vb.width  + 'px';
        svgEl.style.height = vb.height + 'px';
      } else {
        const w = parseFloat(svgEl.getAttribute('width'));
        const h = parseFloat(svgEl.getAttribute('height'));
        if (w && h) {
          svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
          svgEl.style.width  = w + 'px';
          svgEl.style.height = h + 'px';
        }
      }
      svgEl.style.maxWidth = 'none';
    }

    if (ctrl) ctrl.afterRender();
  } catch (err) {
    inner.innerHTML = `<div class="render-error"><strong>Mermaid error:</strong><br>${escHtml(err.message)}<br><pre>${escHtml(code.slice(0, 400))}</pre></div>`;
    throw err;
  } finally {
    // Mermaid 10 leaves a temporary <div id="d{uid}"> in the body — remove it
    const tmp = document.getElementById('d' + uid);
    if (tmp) tmp.remove();
    // Also purge any other stray Mermaid error/temp nodes appended to body
    document.querySelectorAll('body > [id^="dmmd_"]').forEach(el => el.remove());
  }
}

/* ═══════════════ HELPERS ═══════════════ */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _preprocessMermaid(raw) {
  return _preprocessMermaidWithMap(raw).code;
}

/* Same as _preprocessMermaid but also returns lineMap: for each line of the
   returned code, the corresponding 0-based line index in the original raw
   text (or null for lines FamScript injected itself, e.g. classDef/class).
   Used to translate Mermaid's "Parse error on line N" back to the right
   line in the editor. Pass the RAW, untrimmed editor content — trimming
   beforehand would shift the line offsets this depends on. */
function _preprocessMermaidWithMap(raw) {
  const original = String(raw ?? '');
  let text = original.trim();
  // Extract Mermaid code from inside ```mermaid ... ``` fence
  const fenceMatch = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)\n[ \t]*```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```(?:mermaid)?\s*\n?/, '').replace(/\n?[ \t]*```\s*$/, '').trim();
  }

  // `text` is always a verbatim substring of `original` (trim/fence-strip only
  // remove from the ends), so indexOf reliably locates where it starts.
  const idx = original.indexOf(text);
  const baseLine = idx >= 0 ? original.slice(0, idx).split('\n').length - 1 : 0;

  const nodeIds   = [];
  const coupleIds = [];
  const lineMap   = []; // output line index (0-based) -> original line index, or null
  const cleanLines = [];
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('//')) return;
    // Strip auto-generated coloured fill lines
    if (/^style\s+\w+\s+fill:#(?:3b82f6|ec4899|6b7280|2563eb|e11d48|C8FF3E)/i.test(t)) return;
    // Strip our managed classDef/class lines — we re-add fresh below
    if (/^classDef\s+(?:personNode|mainChar|groomNode|brideNode|coupleNode)\b/.test(t)) return;
    if (/^class\s+[\w,\s]+(?:personNode|mainChar|groomNode|brideNode|coupleNode)\s*$/.test(t)) return;
    // Strip direction overrides and invisible-link lines — both cause Dagre edge routing chaos
    if (/^direction\s+(LR|RL|BT|TB)\s*$/i.test(t)) return;
    if (t.includes('~~~')) return;
    // Collect couple junction node IDs: ID(( ))
    const cm = t.match(/^(\w+)\s*\(\(\s*\)\s*\)/);
    if (cm) {
      coupleIds.push(cm[1]);
      cleanLines.push(line); lineMap.push(baseLine + i);
      return;
    }
    // Collect person node IDs from pure node-definition lines: ID["..."]
    if (/^\w+\s*\["/.test(t) &&
        !t.includes('-->') && !t.includes('---') && !t.includes('==>') &&
        !t.includes('-.->') &&
        !t.startsWith('subgraph') && !t.startsWith('style') && !t.startsWith('class')) {
      const m = t.match(/^(\w+)\s*\[/);
      if (m) nodeIds.push(m[1]);
    }
    cleanLines.push(line); lineMap.push(baseLine + i);
  });

  // Drop leading/trailing blank lines by line, not by character — a character-level
  // .trim() on the joined string would silently desync lineMap from result.split('\n').
  while (cleanLines.length && cleanLines[0].trim() === '') { cleanLines.shift(); lineMap.shift(); }
  while (cleanLines.length && cleanLines[cleanLines.length - 1].trim() === '') { cleanLines.pop(); lineMap.pop(); }

  let result = cleanLines.join('\n');

  if (nodeIds.length > 0 || coupleIds.length > 0) {
    // Main characters: all G0 nodes matching ROLE_G0_NNN
    const mainIds    = nodeIds.filter(id => /^[^_]+_G0_\d+$/.test(id));
    const regularIds = nodeIds.filter(id => !mainIds.includes(id));

    // Separate groom / bride G0 nodes for wedding styling
    const groomG0Ids = mainIds.filter(id => id.startsWith('GROOM_'));
    const brideG0Ids = mainIds.filter(id => id.startsWith('BRIDE_'));
    const otherG0Ids = mainIds.filter(id => !id.startsWith('GROOM_') && !id.startsWith('BRIDE_'));
    const isWeddingPair = groomG0Ids.length > 0 && brideG0Ids.length > 0;

    result += '\n\n  classDef personNode fill:#fff,color:#1a1a1a,stroke:#555,stroke-width:1.5px\n';
    result +=   '  classDef mainChar fill:#C8FF3E,color:#08080e,stroke:#8dc400,stroke-width:3.5px\n';
    result +=   '  classDef groomNode fill:#2563eb,color:#fff,stroke:#1e3a8a,stroke-width:4px\n';
    result +=   '  classDef brideNode fill:#e11d48,color:#fff,stroke:#881337,stroke-width:4px\n';
    result +=   '  classDef coupleNode fill:#555,stroke:#444,stroke-width:1.5px\n';

    if (regularIds.length > 0) result += '  class ' + regularIds.join(',') + ' personNode\n';

    if (isWeddingPair) {
      result += '  class ' + groomG0Ids.join(',') + ' groomNode\n';
      result += '  class ' + brideG0Ids.join(',') + ' brideNode\n';
      if (otherG0Ids.length > 0) result += '  class ' + otherG0Ids.join(',') + ' mainChar\n';
    } else {
      if (mainIds.length > 0) result += '  class ' + mainIds.join(',') + ' mainChar\n';
    }

    if (coupleIds.length > 0) result += '  class ' + coupleIds.join(',') + ' coupleNode';
    else                       result  = result.trimEnd();
  }

  // Pad the map for every appended (generated) line — these have no source line.
  const finalLineCount = result.split('\n').length;
  while (lineMap.length < finalLineCount) lineMap.push(null);

  return { code: result, lineMap };
}

function log(entries) {
  consoleEl.innerHTML = entries.map(e => {
    const icon = { error:'✗', warning:'⚠', success:'✓', info:'ℹ' }[e.type] || 'ℹ';
    const clickable = e.line != null;
    const loc = clickable ? `<span class="log-loc">Ln ${e.line}</span>` : '';
    return `<div class="log-line log-${e.type || 'info'}${clickable ? ' clickable' : ''}"${clickable ? ` data-line="${e.line}"` : ''}>${icon} ${escHtml(e.message)}${loc}</div>`;
  }).join('');

  const errCount  = entries.filter(e => e.type === 'error').length;
  const warnCount = entries.filter(e => e.type === 'warning').length;
  const cntErr  = document.getElementById('cnt-err');
  const cntWarn = document.getElementById('cnt-warn');
  if (cntErr)  { cntErr.hidden  = errCount  === 0; cntErr.textContent  = `${errCount} error${errCount  === 1 ? '' : 's'}`; }
  if (cntWarn) { cntWarn.hidden = warnCount === 0; cntWarn.textContent = `${warnCount} warning${warnCount === 1 ? '' : 's'}`; }
  const sbErr  = document.getElementById('sb-err-count');
  const sbWarn = document.getElementById('sb-warn-count');
  if (sbErr)  sbErr.textContent  = errCount;
  if (sbWarn) sbWarn.textContent = warnCount;
}

consoleEl.addEventListener('click', e => {
  const row = e.target.closest('.log-line.clickable');
  if (!row) return;
  editor.gotoLine(Number(row.dataset.line));
});

function setStatus(state) {
  const labels = { ok:'OK', warning:'Warnings', error:'Error', compiling:'Compiling…', idle:'Ready' };
  statusBadge.textContent = labels[state] || state;
  statusBadge.className   = `status-badge status-${state}`;
}

function getSvg(vp) {
  const svg = vp.querySelector('svg');
  if (!svg) { alert('No tree rendered in this panel yet.'); return null; }
  return svg;
}

/* ═══════════════ EVENT LISTENERS ═══════════════ */
editor.addEventListener('input', () => { setStatus('idle'); editor.clearDiagnostics(); });

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); compile(); }
});

eventSelect.addEventListener('change', () => switchEvent(eventSelect.value));

document.getElementById('btn-compile').addEventListener('click', compile);

document.getElementById('btn-sample').addEventListener('click', () => {
  const ev = EVENTS[currentEvent];
  if (ev?.dual) {
    // Set both sides first, then compile — do NOT call saveCurrentScript() after this
    scripts.groom = SAMPLES.groom;
    scripts.bride = SAMPLES.bride;
    editor.value  = activeSide === 'groom' ? SAMPLES.groom : SAMPLES.bride;
    setStatus('compiling');
    if (ev.combined) { compileWeddingCombined(); } else { compileWedding(); }
  } else {
    const key = SAMPLES[currentEvent] ? currentEvent : 'single';
    scripts.single = SAMPLES[key];
    editor.value   = SAMPLES[key];
    compile();
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Clear editor content?')) return;
  const isDual = EVENTS[currentEvent]?.dual;
  if (isDual) { scripts.groom = ''; scripts.bride = ''; }
  else { scripts.single = ''; }
  editor.value = '';
  resetPreviews();
  consoleEl.innerHTML = '';
});

/* ── export ── */
document.getElementById('btn-export-svg').addEventListener('click', () => { const s = getSvg(vpSingle); if (s) exportSVG(s); });
document.getElementById('btn-export-png').addEventListener('click', () => { const s = getSvg(vpSingle); if (s) exportPNG(s); });
document.getElementById('btn-export-jpg').addEventListener('click', () => { const s = getSvg(vpSingle); if (s) exportJPG(s); });
document.getElementById('btn-export-md').addEventListener('click',  () => { mermaids.single ? exportMarkdown(mermaids.single, projName.value) : alert('Compile the tree first.'); });


document.getElementById('btn-export-json').addEventListener('click', () => {
  const payload = { projectName: projName.value, event: currentEvent, version: '2.0',
                    mermaid: mermaids.single || '',
                    settings: { theme: MERMAID_THEME } };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'family-tree.json');
});

/* ── import ── */
document.getElementById('btn-import-json').addEventListener('click', () => {
  const f = document.getElementById('import-file'); f.accept = '.json'; f.click();
});
document.getElementById('btn-import-mermaid').addEventListener('click', () => {
  const f = document.getElementById('import-file'); f.accept = '.md,.mmd,.txt'; f.click();
});
document.getElementById('import-file').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    // Open JSON editor modal for inspection before rendering
    const jsonInput = document.getElementById('json-editor-input');
    const jsonStatus = document.getElementById('json-editor-status');
    jsonInput.value = text;
    jsonStatus.textContent = `Loaded: ${file.name}`;
    jsonStatus.className = 'conv-status';
    document.getElementById('json-editor-modal').style.display = 'flex';
  } else {
    // Mermaid / text file — render directly
    try {
      const code = text.trim();
      if (!code) throw new Error('File is empty.');
      const ev2 = EVENTS[currentEvent];
      const isComb = ev2?.dual && ev2?.combined;
      if (isComb) {
        scripts[activeSide] = code;
        editor.value = code;
        const raw = combineWeddingMermaid(scripts.groom, scripts.bride);
        const processed = _preprocessMermaid(raw);
        mermaids.single = processed;
        await renderInto(vpSingle, processed, ctrlSingle);
      } else if (ev2?.dual) {
        const processed = _preprocessMermaid(code);
        scripts[activeSide] = code; mermaids[activeSide] = processed;
        editor.value = code;
        await renderInto(activeSide === 'groom' ? vpGroom : vpBride, processed, activeSide === 'groom' ? ctrlGroom : ctrlBride);
      } else {
        const processed = _preprocessMermaid(code);
        scripts.single = code; mermaids.single = processed;
        editor.value = code;
        await renderInto(vpSingle, processed, ctrlSingle);
      }
      log([{ type: 'success', message: `Imported "${file.name}" successfully.` }]);
      setStatus('ok');
    } catch (err) {
      log([{ type: 'error', message: 'Import error: ' + err.message }]); setStatus('error');
    }
  }
  e.target.value = '';
});

/* ── JSON Editor Modal ── */
async function _applyJsonImport(jsonText) {
  const data = JSON.parse(jsonText);
  const ev = EVENTS[currentEvent];
  const isCombined = ev?.dual && ev?.combined;
  const isDualOnly = ev?.dual && !ev?.combined;
  let code, format, side;

  // Combined wedding: if JSON has both groom + bride, load both and compile together
  if (isCombined && typeof data.groom === 'string') {
    scripts.groom = data.groom || '';
    scripts.bride = data.bride || '';
    editor.value  = activeSide === 'groom' ? scripts.groom : scripts.bride;
    const raw  = combineWeddingMermaid(scripts.groom, scripts.bride);
    const processed = _preprocessMermaid(raw);
    mermaids.single = processed;
    const lines = processed.split('\n').filter(l => l.trim()).length;
    await renderInto(vpSingle, processed, ctrlSingle);
    return {
      summary:    `Rendered ${lines} lines · wedding combined`,
      logMessage: `JSON imported — wedding combined (groom + bride) · ${lines} Mermaid lines rendered`,
    };
  }

  if (typeof data.mermaid === 'string' && data.mermaid.trim()) {
    code   = data.mermaid;
    format = 'v2.0';
    side   = (isDualOnly || isCombined) ? activeSide : 'single';
  } else if (typeof data.groom === 'string') {
    code   = (isDualOnly ? data[activeSide] : data.groom) || data.groom || '';
    format = 'dual';
    side   = isDualOnly ? activeSide : 'groom';
  } else if (Array.isArray(data.nodes)) {
    code   = generateMermaid(data);
    format = 'v1.0 (legacy)';
    side   = (isDualOnly || isCombined) ? activeSide : 'single';
  } else {
    throw new Error('Unrecognised JSON format. Expected {mermaid:…}, {groom:…,bride:…}, or {nodes:[…]}.');
  }

  if (!code.trim()) throw new Error('JSON produced no Mermaid content.');

  if (isCombined) {
    // Load into active side and recompile combined
    scripts[activeSide] = code;
    editor.value = code;
    const raw = combineWeddingMermaid(scripts.groom, scripts.bride);
    const processed = _preprocessMermaid(raw);
    mermaids.single = processed;
    const lines = processed.split('\n').filter(l => l.trim()).length;
    await renderInto(vpSingle, processed, ctrlSingle);
    return {
      summary:    `Rendered ${lines} lines · format ${format} · ${activeSide}'s side`,
      logMessage: `JSON imported into ${activeSide}'s side — combined and rendered · ${lines} lines`,
    };
  }

  const processed = _preprocessMermaid(code);
  const lines = processed.split('\n').filter(l => l.trim()).length;

  if (isDualOnly) {
    scripts[activeSide]  = code;
    mermaids[activeSide] = processed;
    editor.value = code;
    await renderInto(activeSide === 'groom' ? vpGroom : vpBride, processed, activeSide === 'groom' ? ctrlGroom : ctrlBride);
  } else {
    scripts.single  = code;
    mermaids.single = processed;
    editor.value = code;
    await renderInto(vpSingle, processed, ctrlSingle);
  }

  return {
    summary:    `Rendered ${lines} lines · format ${format}${isDualOnly ? ' · ' + side + "'s side" : ''}`,
    logMessage: `JSON imported — format: ${format}${isDualOnly ? ', loaded into ' + side + "'s canvas" : ''} · ${lines} Mermaid lines rendered`,
  };
}

document.getElementById('btn-json-render').addEventListener('click', async () => {
  const jsonText = document.getElementById('json-editor-input').value.trim();
  const statusEl = document.getElementById('json-editor-status');
  const btn      = document.getElementById('btn-json-render');

  if (!jsonText) {
    statusEl.textContent = 'Input is empty.';
    statusEl.className   = 'conv-status conv-status-error';
    return;
  }

  btn.textContent = 'Rendering…';
  btn.disabled    = true;
  statusEl.textContent = 'Rendering…';
  statusEl.className   = 'conv-status';

  try {
    const info = await _applyJsonImport(jsonText);
    statusEl.textContent = '✓ ' + info.summary;
    statusEl.className   = 'conv-status conv-status-ok';
    setStatus('ok');
    // Brief success flash so the user sees confirmation before the modal closes
    setTimeout(() => {
      document.getElementById('json-editor-modal').style.display = 'none';
      log([{ type: 'success', message: info.logMessage }]);
    }, 500);
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.className   = 'conv-status conv-status-error';
    setStatus('error');
    log([{ type: 'error', message: 'JSON import failed: ' + err.message }]);
  } finally {
    btn.textContent = '▶ Render Tree';
    btn.disabled    = false;
  }
});

document.getElementById('json-editor-close').addEventListener('click', () => {
  document.getElementById('json-editor-modal').style.display = 'none';
});
document.getElementById('json-editor-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('json-editor-modal')) document.getElementById('json-editor-modal').style.display = 'none';
});
document.getElementById('btn-json-copy').addEventListener('click', () => {
  const text = document.getElementById('json-editor-input').value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const b = document.getElementById('btn-json-copy');
    b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy', 2000);
  });
});

/* ── view mermaid code ── */
document.getElementById('btn-view-mermaid').addEventListener('click', () => {
  const ev = EVENTS[currentEvent];
  const code = mermaids.single || '';
  if (!code.trim()) { alert('Compile a tree first.'); return; }
  document.getElementById('mermaid-code-view').textContent = code;
  document.getElementById('mermaid-modal').style.display = 'flex';
});

document.getElementById('modal-close').addEventListener('click', () => document.getElementById('mermaid-modal').style.display = 'none');
document.getElementById('mermaid-modal').addEventListener('click', e => { if (e.target === document.getElementById('mermaid-modal')) document.getElementById('mermaid-modal').style.display = 'none'; });

document.getElementById('btn-copy-mermaid').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('mermaid-code-view').textContent).then(() => {
    const b = document.getElementById('btn-copy-mermaid');
    b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy', 2000);
  });
});

/* ── help modal ── */
document.getElementById('btn-help').addEventListener('click', () => document.getElementById('help-modal').style.display = 'flex');
document.getElementById('help-modal-close').addEventListener('click', () => document.getElementById('help-modal').style.display = 'none');
document.getElementById('help-modal').addEventListener('click', e => { if (e.target === document.getElementById('help-modal')) document.getElementById('help-modal').style.display = 'none'; });

/* ── help nav tabs ── */
document.querySelectorAll('.help-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.help-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ── help copy ── */
document.getElementById('btn-copy-help').addEventListener('click', () => {
  const text = buildHelpText();
  navigator.clipboard.writeText(text).then(() => {
    const b = document.getElementById('btn-copy-help');
    b.textContent = 'Copied!';
    setTimeout(() => b.textContent = 'Copy Text', 2000);
  });
});

/* ── help PDF ── */
document.getElementById('btn-pdf-help').addEventListener('click', () => {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Allow pop-ups for this page to download the PDF.'); return; }
  win.document.write(buildHelpPrintDoc());
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
});

/* ── help text builder (for copy) ── */
function buildHelpText() {
  return `MERMAID FAMILY TREE — REFERENCE GUIDE
=======================================

Write Mermaid graph TB code directly in the editor. The tool renders it
instantly into a zoomable, pannable family tree diagram.

KEYBOARD SHORTCUTS
------------------
Ctrl + Enter    Render / re-render the tree
Scroll on canvas  Zoom toward cursor
Click + drag    Pan the tree

HOW IT WORKS
------------
1. Write Mermaid code (graph TB with nodes and edges)
2. Click Compile or press Ctrl+Enter
3. Visual tree renders with zoom, pan, and fullscreen controls
4. Export as SVG, PNG, JPG, Markdown, or JSON

MERMAID NODE SYNTAX
-------------------
graph TB
  ID["Label text"]

  %% Couples are joined through a small junction dot, which then
  %% points to their children. This keeps every generation on one
  %% aligned row and avoids crossing connector lines:
  DAD_P1_001["Rajesh Kumar, 55 (M)"]
  MOM_P1_001["Sunita Kumar, 52 (F)"]
  CHILD_G0_001["Arjun Kumar, 28 (M)"]
  CP_DAD_MOM(( ))

  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| CHILD_G0_001

EDGE TYPES
----------
Parent → couple dot (line):  A ---|"father"| CP_X
Couple dot → child (arrow):  CP_X -->|"son"| B
Other / step / nephew:       A -.->|"nephew"| B

WHY THE JUNCTION DOT?
---------------------
Pointing two parents at two children directly forms a crossing
pair of lines that Dagre cannot untangle. Routing both parents
through one dot, then fanning the dot out to the children, removes
the crossing and lines every generation up on the same row.

EVENT MODES
-----------
Wedding   - Combined single canvas (groom left · bride right)
First Haircut (Mundan)
Naming Ceremony (Namkaran)
First Rice Feeding (Annaprashan)
House Warming (Vastu Puja)
Sacred Thread Ceremony (Upanayana)
Baby Shower (Godh Bharai)
Birthday
Custom Event

CANVAS CONTROLS
---------------
-      Zoom out (77% per click)
+      Zoom in  (130% per click)
Fit    Auto-scale tree to fill canvas
1:1    Reset to 100% zoom
[ ]    Toggle fullscreen

Mouse: Scroll to zoom toward cursor | Drag to pan
Touch: One-finger drag to pan | Two-finger pinch to zoom

EXPORT FORMATS
--------------
SVG       - Lossless vector, scales to any size
PNG       - Raster at 2x resolution (retina quality)
JPG       - Compressed with white background fill
Markdown  - Mermaid code in a fenced code block
JSON      - Full project with Mermaid code, re-importable

ID NAMING CONVENTION
--------------------
Format: ROLE_GEN_NNN (recommended, but any unique ID works)
Examples:
  GROOM_G0_001      - Groom, generation 0, person 1
  GROOM_DAD_P1_001  - Groom's father, generation +1
  BRIDE_SIS_G0_002  - Bride's sister, generation 0, person 2

COMPLETE EXAMPLE
----------------
graph TB

  GROOM_DAD_P1_001["Rajesh Kumar, 55 (M)"]
  GROOM_MOM_P1_001["Sunita Kumar, 52 (F)"]
  GROOM_G0_001["Arjun Kumar, 28 (M)"]
  GROOM_SIS_G0_002["Priya Kumar, 25 (F)"]
  CP_DAD_MOM(( ))

  GROOM_DAD_P1_001 ---|"father"| CP_DAD_MOM
  GROOM_MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"| GROOM_G0_001
  CP_DAD_MOM -->|"daughter"| GROOM_SIS_G0_002

Notes:
- A couple dot is written as  CP_NAME(( ))  — empty double parens.
- The G0 "self/ego" node (ROLE_G0_NNN) is auto-highlighted in blue.
- No subgraphs or style lines needed — colours and dots are applied
  automatically when you compile.

---
FamScript
`;
}

/* ── help PDF document builder ── */
function buildHelpPrintDoc() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Mermaid Family Tree — Reference Guide</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; line-height: 1.65;
    color: #111827; background: #fff;
    padding: 40px 48px;
  }
  h1 { font-size: 26px; font-weight: 800; color: #08080E; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
  .accent { color: #5a8a00; }
  h2 {
    font-size: 11px; font-weight: 800; color: #6b7280;
    text-transform: uppercase; letter-spacing: 1px;
    margin: 26px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #e5e7eb;
  }
  h2:first-of-type { margin-top: 0; }
  p { margin-bottom: 10px; color: #374151; }
  pre {
    font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.65;
    background: #f8f9fc; border: 1px solid #e5e7eb;
    border-left: 3px solid #8dc400;
    border-radius: 6px; padding: 12px 14px;
    margin-bottom: 12px; white-space: pre-wrap;
    word-break: break-all;
  }
  code {
    font-family: 'Courier New', monospace; font-size: 12px;
    background: #f0f7e0; padding: 1px 5px;
    border-radius: 3px; color: #4a7200;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12.5px; }
  th {
    background: #f3f4f6; color: #6b7280;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .4px;
    padding: 7px 10px; text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  tr:last-child td { border-bottom: none; }
  .tip {
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 6px; padding: 8px 12px;
    font-size: 12px; color: #1e40af; margin-bottom: 12px;
  }
  .tip::before { content: 'Tip  '; font-weight: 700; }
  .intro-box {
    background: #f8fff0; border-left: 4px solid #8dc400;
    border-radius: 0 6px 6px 0; padding: 12px 16px;
    margin-bottom: 20px; font-size: 13.5px; color: #1f2937;
  }
  ol, ul { padding-left: 20px; margin-bottom: 12px; color: #374151; }
  ol li, ul li { margin-bottom: 4px; }
  .badge {
    display: inline-block; font-size: 9px; font-weight: 700;
    padding: 1px 7px; border-radius: 10px;
    text-transform: uppercase; letter-spacing: .5px;
    vertical-align: middle; margin-left: 6px;
  }
  .badge-err  { background: #fef2f2; color: #dc2626; }
  .badge-warn { background: #fffbeb; color: #d97706; }
  .page-break { page-break-before: always; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .flow { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
  .flow-step {
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 120px;
    text-align: center;
  }
  .flow-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    background: #8dc400; color: #fff;
    font-size: 10px; font-weight: 800; margin-bottom: 4px;
  }
  .flow-label { font-size: 12px; font-weight: 700; display: block; }
  .flow-desc  { font-size: 11px; color: #6b7280; display: block; }
  .flow-arrow { font-size: 18px; color: #9ca3af; }
  footer {
    margin-top: 40px; padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px; color: #9ca3af; text-align: center;
  }
  @media print {
    body { padding: 24px 32px; }
    h2 { break-after: avoid; }
    pre, table { break-inside: avoid; }
  }
</style>
</head>
<body>

<h1>Mermaid Family Tree <span class="accent">Reference Guide</span></h1>
<div class="subtitle">FamScript &mdash; Visual family tree builder for Indian ceremonies</div>

<div class="intro-box">
  Write <strong>Mermaid graph TB</strong> code directly in the editor &mdash; the tool renders it instantly into a colour-coded, zoomable family tree diagram. No drawing, no dragging, no account required. Everything runs in the browser.
</div>

<h2>How It Works</h2>
<div class="flow">
  <div class="flow-step"><span class="flow-num">1</span><span class="flow-label">Write Mermaid</span><span class="flow-desc">graph TB code in the editor</span></div>
  <span class="flow-arrow">&rarr;</span>
  <div class="flow-step"><span class="flow-num">2</span><span class="flow-label">Compile</span><span class="flow-desc">Click Compile or Ctrl+Enter</span></div>
  <span class="flow-arrow">&rarr;</span>
  <div class="flow-step"><span class="flow-num">3</span><span class="flow-label">Visual Tree</span><span class="flow-desc">Rendered with zoom &amp; pan</span></div>
  <span class="flow-arrow">&rarr;</span>
  <div class="flow-step"><span class="flow-num">4</span><span class="flow-label">Export</span><span class="flow-desc">SVG, PNG, JPG, MD, JSON</span></div>
</div>

<h2>Quick Start</h2>
<ol>
  <li>Select a ceremony from the event dropdown (e.g. <strong>Wedding</strong>).</li>
  <li>Click <strong>Load Sample</strong> in the sidebar to see a working example.</li>
  <li>Press <strong>Ctrl+Enter</strong> to render. The tree appears immediately.</li>
  <li>Edit names and edges. Press <strong>Ctrl+Enter</strong> to re-render.</li>
  <li>Check the <strong>Console</strong> at the bottom for errors.</li>
  <li>Use the sidebar to export as SVG, PNG, or JSON.</li>
</ol>

<h2>Keyboard Shortcuts</h2>
<table>
  <tr><th>Shortcut</th><th>Action</th></tr>
  <tr><td><code>Ctrl + Enter</code></td><td>Compile / re-render the tree</td></tr>
  <tr><td>Scroll on canvas</td><td>Zoom toward cursor position</td></tr>
  <tr><td>Click + drag on canvas</td><td>Pan the tree</td></tr>
</table>

<h2>Node Syntax &amp; the Couple Dot</h2>
<pre>graph TB
  DAD_P1_001["Rajesh Kumar, 55 (M)"]
  MOM_P1_001["Sunita Kumar, 52 (F)"]
  SELF_G0_001["Arjun Kumar, 28 (M)"]
  CP_DAD_MOM(( ))          %% couple junction dot

  DAD_P1_001 ---|"father"| CP_DAD_MOM
  MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM -->|"son"|    SELF_G0_001</pre>
<table>
  <tr><th>Pattern</th><th>Effect</th></tr>
  <tr><td><code>ID["Label"]</code></td><td>Rectangle person node with label</td></tr>
  <tr><td><code>CP_NAME(( ))</code></td><td>Couple junction dot — both spouses connect to it, then it points to the children</td></tr>
  <tr><td><code>%% comment</code></td><td>Comment line (ignored by renderer)</td></tr>
</table>
<div class="tip">Routing a couple through one dot (instead of pointing both parents straight at the children) is what keeps every generation on a single aligned row and stops the connector lines from crossing. No <code>subgraph</code> blocks are needed.</div>

<h2>Edge Types</h2>
<table>
  <tr><th>Syntax</th><th>Meaning</th><th>Renders as</th></tr>
  <tr><td><code>A ---|"father"| CP_X</code></td><td>Spouse &rarr; couple dot</td><td>Solid line (no arrow)</td></tr>
  <tr><td><code>CP_X --&gt;|"son"| B</code></td><td>Couple dot &rarr; child</td><td>Solid arrow</td></tr>
  <tr><td><code>A --&gt;|"father"| B</code></td><td>Direct parent &rarr; child</td><td>Solid arrow</td></tr>
  <tr><td><code>A -.-&gt;|"nephew"| B</code></td><td>Step / cousin / nephew / other</td><td>Dashed arrow</td></tr>
</table>

<h2>Colours (Applied Automatically)</h2>
<p>You do not write <code>style</code> lines. When you compile, FamScript styles the diagram for you:</p>
<table>
  <tr><th>Node</th><th>Appearance</th></tr>
  <tr><td>The G0 self/ego node (<code>ROLE_G0_NNN</code>)</td><td>Highlighted blue — the person the tree is centred on</td></tr>
  <tr><td>Every other person node</td><td>White card with a grey border</td></tr>
  <tr><td>Couple dots (<code>CP_*(( ))</code>)</td><td>Small filled connector circle</td></tr>
</table>

<div class="page-break"></div>
<h2>Event Modes</h2>
<table>
  <tr><th>Event</th><th>Canvas</th><th>Description</th></tr>
  <tr><td><strong>Wedding</strong></td><td>Combined</td><td>Groom's and bride's trees merged on one canvas — groom left, bride right</td></tr>
  <tr><td>First Haircut (Mundan)</td><td>Single</td><td>Child's first haircut ceremony</td></tr>
  <tr><td>Naming Ceremony (Namkaran)</td><td>Single</td><td>Baby naming ceremony</td></tr>
  <tr><td>First Rice Feeding (Annaprashan)</td><td>Single</td><td>First rice-feeding ceremony</td></tr>
  <tr><td>House Warming (Vastu Puja)</td><td>Single</td><td>House-warming ceremony</td></tr>
  <tr><td>Sacred Thread Ceremony (Upanayana)</td><td>Single</td><td>Sacred thread / Janeu ceremony</td></tr>
  <tr><td>Baby Shower (Godh Bharai)</td><td>Single</td><td>Baby shower</td></tr>
  <tr><td>Birthday</td><td>Single</td><td>Birthday celebration</td></tr>
  <tr><td>Custom Event</td><td>Single</td><td>Any other ceremony</td></tr>
</table>

<h2>Canvas Controls</h2>
<table>
  <tr><th>Control</th><th>Action</th></tr>
  <tr><td>&minus; button</td><td>Zoom out (77% per click)</td></tr>
  <tr><td>+ button</td><td>Zoom in (130% per click)</td></tr>
  <tr><td>Fit button</td><td>Auto-scale the tree to fill the canvas and centre it</td></tr>
  <tr><td>1:1 button</td><td>Reset to 100% zoom</td></tr>
  <tr><td>[ ] button</td><td>Toggle fullscreen (Esc to exit)</td></tr>
  <tr><td>Scroll wheel</td><td>Zoom toward the cursor position</td></tr>
  <tr><td>Click + drag</td><td>Pan the canvas freely</td></tr>
  <tr><td>Two-finger pinch</td><td>Pinch to zoom on touch screens</td></tr>
</table>

<h2>Export &amp; Import Formats</h2>
<table>
  <tr><th>Format</th><th>Direction</th><th>Best For</th></tr>
  <tr><td>SVG</td><td>Export</td><td>Lossless vector; embeds in web, Word, PowerPoint</td></tr>
  <tr><td>PNG</td><td>Export</td><td>Raster at 2&times; resolution (retina quality); WhatsApp, email</td></tr>
  <tr><td>JPG</td><td>Export</td><td>Compressed; smaller file size, white background</td></tr>
  <tr><td>Markdown (.md)</td><td>Export</td><td>Mermaid fence block; GitHub README, Notion, Obsidian</td></tr>
  <tr><td>JSON Project</td><td>Export / Import</td><td>Full project with Mermaid code; re-importable</td></tr>
  <tr><td>Mermaid File</td><td>Import</td><td>Import .mmd / .md / .txt from any Mermaid-compatible tool</td></tr>
</table>

<h2>ID Naming Convention</h2>
<p>IDs must be unique. Recommended format: <code>ROLE_GEN_NNN</code></p>
<table>
  <tr><th>Example ID</th><th>Meaning</th></tr>
  <tr><td><code>GROOM_G0_001</code></td><td>Groom, generation 0</td></tr>
  <tr><td><code>GROOM_DAD_P1_001</code></td><td>Groom's father, generation +1</td></tr>
  <tr><td><code>BRIDE_SIS_G0_002</code></td><td>Bride's sister, generation 0, person 2</td></tr>
  <tr><td><code>BRIDE_GDM_P2_001</code></td><td>Bride's grandmother, generation +2</td></tr>
</table>
<div class="tip">Self-documenting IDs make large trees readable at a glance.</div>

<h2>Complete Example &mdash; 3-Generation Wedding (Groom's Side)</h2>
<pre>graph TB

  GROOM_GDF_P2_001["Mohan Kumar, 78 (M)"]
  GROOM_GDM_P2_001["Kamla Kumar, 75 (F)"]
  GROOM_DAD_P1_001["Rajesh Kumar, 55 (M)"]
  GROOM_MOM_P1_001["Sunita Kumar, 52 (F)"]
  GROOM_G0_001["Arjun Kumar, 28 (M)"]
  CP_GD(( ))
  CP_DAD_MOM(( ))

  GROOM_GDF_P2_001 ---|"father"| CP_GD
  GROOM_GDM_P2_001 ---|"mother"| CP_GD
  CP_GD --&gt;|"son"| GROOM_DAD_P1_001
  GROOM_DAD_P1_001 ---|"father"| CP_DAD_MOM
  GROOM_MOM_P1_001 ---|"mother"| CP_DAD_MOM
  CP_DAD_MOM --&gt;|"son"| GROOM_G0_001</pre>

<div class="tip">Paste the code above into the Groom's Mermaid tab, select Wedding from the dropdown, and press Ctrl+Enter to render instantly. In Wedding mode the groom and bride trees are joined automatically through a marriage dot and a shared child.</div>

<footer>
  FamScript &mdash; Family tree builder for Indian ceremonies &mdash; All processing is done locally in your browser. No data is sent to any server.
</footer>

</body>
</html>`;
}

/* ── mobile sidebar toggle ── */
document.getElementById('btn-menu').addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
document.getElementById('sidebar-overlay').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
document.querySelector('.sidebar').addEventListener('click', e => {
  if (window.innerWidth <= 768 && e.target.tagName === 'BUTTON') {
    document.body.classList.remove('sidebar-open');
  }
});

/* ═══════════════ EDITOR SETTINGS ═══════════════ */
const SETTINGS_KEY = 'famscript.editorSettings';
const DEFAULT_SETTINGS = { fontSize: 13, wordWrap: false, tabSize: 2, lineNumbers: true, activeLine: true };

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

let editorSettings = loadSettings();

function applySettings(s) {
  editor.setFontSize(s.fontSize);
  editor.setWordWrap(s.wordWrap);
  editor.setTabSize(s.tabSize);
  editor.setLineNumbers(s.lineNumbers);
  editor.setActiveLineHighlight(s.activeLine);

  document.getElementById('set-fontsize-val').textContent = s.fontSize;
  document.getElementById('set-wordwrap').checked = s.wordWrap;
  document.getElementById('set-tabsize').value = String(s.tabSize);
  document.getElementById('set-linenumbers').checked = s.lineNumbers;
  document.getElementById('set-activeline').checked = s.activeLine;
  const sbTab = document.getElementById('sb-tabsize');
  if (sbTab) sbTab.textContent = `Spaces: ${s.tabSize}`;
}

applySettings(editorSettings);

const btnSettings     = document.getElementById('btn-settings');
const settingsPopover = document.getElementById('settings-popover');
btnSettings.addEventListener('click', e => {
  e.stopPropagation();
  settingsPopover.hidden = !settingsPopover.hidden;
});
document.addEventListener('click', e => {
  if (!settingsPopover.hidden && !settingsPopover.contains(e.target) && e.target !== btnSettings) {
    settingsPopover.hidden = true;
  }
});

document.getElementById('set-fontsize-dec').addEventListener('click', () => {
  editorSettings.fontSize = Math.max(10, editorSettings.fontSize - 1);
  applySettings(editorSettings); saveSettings(editorSettings);
});
document.getElementById('set-fontsize-inc').addEventListener('click', () => {
  editorSettings.fontSize = Math.min(24, editorSettings.fontSize + 1);
  applySettings(editorSettings); saveSettings(editorSettings);
});
document.getElementById('set-wordwrap').addEventListener('change', e => {
  editorSettings.wordWrap = e.target.checked;
  applySettings(editorSettings); saveSettings(editorSettings);
});
document.getElementById('set-tabsize').addEventListener('change', e => {
  editorSettings.tabSize = Number(e.target.value);
  applySettings(editorSettings); saveSettings(editorSettings);
});
document.getElementById('set-linenumbers').addEventListener('change', e => {
  editorSettings.lineNumbers = e.target.checked;
  applySettings(editorSettings); saveSettings(editorSettings);
});
document.getElementById('set-activeline').addEventListener('change', e => {
  editorSettings.activeLine = e.target.checked;
  applySettings(editorSettings); saveSettings(editorSettings);
});

/* ═══════════════ COMMAND PALETTE (Ctrl+Shift+P) ═══════════════ */
function clickCanvasAction(action) {
  const btn = document.querySelector(`#vp-single [data-action="${action}"]`);
  if (btn) btn.click();
}

const COMMANDS = [
  { id: 'compile',        label: 'Compile',                    shortcut: 'Ctrl+Enter',  run: () => compile() },
  { id: 'find',           label: 'Find in Editor',              shortcut: 'Ctrl+F',      run: () => editor.openSearch() },
  { id: 'sample',         label: 'Load Sample',                                          run: () => document.getElementById('btn-sample').click() },
  { id: 'clear',          label: 'Clear Editor',                                         run: () => document.getElementById('btn-clear').click() },
  { id: 'export-svg',     label: 'Export: SVG',                                          run: () => document.getElementById('btn-export-svg').click() },
  { id: 'export-png',     label: 'Export: PNG',                                          run: () => document.getElementById('btn-export-png').click() },
  { id: 'export-jpg',     label: 'Export: JPG',                                          run: () => document.getElementById('btn-export-jpg').click() },
  { id: 'export-md',      label: 'Export: Mermaid (.md)',                                run: () => document.getElementById('btn-export-md').click() },
  { id: 'export-json',    label: 'Export: JSON Project',                                 run: () => document.getElementById('btn-export-json').click() },
  { id: 'import-json',    label: 'Import: JSON File',                                    run: () => document.getElementById('btn-import-json').click() },
  { id: 'import-mermaid', label: 'Import: Mermaid File',                                 run: () => document.getElementById('btn-import-mermaid').click() },
  { id: 'view-mermaid',   label: 'View Generated Mermaid Code',                          run: () => document.getElementById('btn-view-mermaid').click() },
  { id: 'converter',      label: 'Open Syntax Converter',                                run: () => document.getElementById('btn-converter').click() },
  { id: 'help',           label: 'Open Help',                                            run: () => document.getElementById('btn-help').click() },
  { id: 'settings',       label: 'Open Editor Settings',                                 run: () => { settingsPopover.hidden = false; } },
  { id: 'wordwrap',       label: 'Toggle Word Wrap',                                     run: () => document.getElementById('set-wordwrap').click() },
  { id: 'linenumbers',    label: 'Toggle Line Numbers',                                  run: () => document.getElementById('set-linenumbers').click() },
  { id: 'font-inc',       label: 'Increase Editor Font Size',                            run: () => document.getElementById('set-fontsize-inc').click() },
  { id: 'font-dec',       label: 'Decrease Editor Font Size',                            run: () => document.getElementById('set-fontsize-dec').click() },
  { id: 'zoom-in',        label: 'Canvas: Zoom In',                                      run: () => clickCanvasAction('zoom-in') },
  { id: 'zoom-out',       label: 'Canvas: Zoom Out',                                     run: () => clickCanvasAction('zoom-out') },
  { id: 'zoom-fit',       label: 'Canvas: Fit to Screen',                                run: () => clickCanvasAction('fit') },
  { id: 'zoom-reset',     label: 'Canvas: Reset Zoom (1:1)',                             run: () => clickCanvasAction('reset') },
  { id: 'fullscreen',     label: 'Canvas: Toggle Fullscreen',                            run: () => clickCanvasAction('fullscreen') },
];

const cmdkOverlay = document.getElementById('cmdk-overlay');
const cmdkInput   = document.getElementById('cmdk-input');
const cmdkList    = document.getElementById('cmdk-list');
let cmdkActiveIndex = 0;
let cmdkFiltered = COMMANDS;

function openCommandPalette() {
  cmdkOverlay.style.display = 'flex';
  cmdkInput.value = '';
  cmdkFiltered = COMMANDS;
  cmdkActiveIndex = 0;
  renderCmdkList();
  cmdkInput.focus();
}
function closeCommandPalette() { cmdkOverlay.style.display = 'none'; }

function renderCmdkList() {
  if (cmdkFiltered.length === 0) {
    cmdkList.innerHTML = '<div class="cmdk-empty">No matching commands</div>';
    return;
  }
  cmdkList.innerHTML = cmdkFiltered.map((c, i) => `
    <div class="cmdk-item${i === cmdkActiveIndex ? ' active' : ''}" data-idx="${i}">
      <span>${escHtml(c.label)}</span>
      ${c.shortcut ? `<span class="cmdk-kbd">${escHtml(c.shortcut)}</span>` : ''}
    </div>`).join('');
}
function runActive() {
  const cmd = cmdkFiltered[cmdkActiveIndex];
  if (!cmd) return;
  closeCommandPalette();
  cmd.run();
}

cmdkInput.addEventListener('input', () => {
  const q = cmdkInput.value.trim().toLowerCase();
  cmdkFiltered = !q ? COMMANDS : COMMANDS.filter(c => c.label.toLowerCase().includes(q));
  cmdkActiveIndex = 0;
  renderCmdkList();
});
cmdkInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown')      { e.preventDefault(); cmdkActiveIndex = Math.min(cmdkActiveIndex + 1, cmdkFiltered.length - 1); renderCmdkList(); }
  else if (e.key === 'ArrowUp')   { e.preventDefault(); cmdkActiveIndex = Math.max(cmdkActiveIndex - 1, 0); renderCmdkList(); }
  else if (e.key === 'Enter')     { e.preventDefault(); runActive(); }
  else if (e.key === 'Escape')    { e.preventDefault(); closeCommandPalette(); }
});
cmdkList.addEventListener('click', e => {
  const item = e.target.closest('.cmdk-item');
  if (!item) return;
  cmdkActiveIndex = Number(item.dataset.idx);
  runActive();
});
cmdkOverlay.addEventListener('click', e => { if (e.target === cmdkOverlay) closeCommandPalette(); });

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    openCommandPalette();
  }
});

/* ═══════════════ BOOT ═══════════════ */
switchEvent('wedding');
scripts.single = SAMPLES.wedding;
editor.value   = SAMPLES.wedding;
setStatus('compiling');
compile();

} // end __famscriptBoot

(async () => {
  await window.__famScriptEditorReady;
  if (window.__famScriptEditorLoadError) {
    const host = document.getElementById('editor-host');
    if (host) host.innerHTML = '<div style="padding:16px;color:#f14c4c;font-family:sans-serif;font-size:13px">Code editor failed to load (offline or CDN blocked). Reload the page to try again.</div>';
    return;
  }
  __famscriptBoot();
})();
