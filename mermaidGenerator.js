const GEN_LABELS = {
  4:  'GEN +4 · Great-Great Grandparents',
  3:  'GEN +3 · Great Grandparents',
  2:  'GEN +2 · Grandparents',
  1:  'GEN +1 · Parents',
  0:  'GEN 0 · Self',
  '-1': 'GEN -1 · Children',
  '-2': 'GEN -2 · Grandchildren',
  '-3': 'GEN -3 · Great Grandchildren',
};

const EDGE_MAP = {
  PARENT_OF:       '-->', FATHER_OF:    '-->',  MOTHER_OF:  '-->',
  CHILD_OF:        '<--', SON_OF:       '<--',  DAUGHTER_OF:'<--',
  MARRIED_TO:      '---', CORE_COUPLE:  '==>',
  SIBLING_OF:      '-.->', BROTHER_OF:  '-.->', SISTER_OF:  '-.->',
  COUSIN_OF:       '-.->', HALF_SIBLING:'-.->', STEP_PARENT:'-.->', STEP_CHILD: '-.->',
  ADOPTIVE_PARENT: '-.->', ADOPTED_BY:  '-.->', GODPARENT_OF:'-.->',GODCHILD_OF:'-.->',
};

const REL_LABELS = {
  PARENT_OF:'parent', FATHER_OF:'father', MOTHER_OF:'mother',
  CHILD_OF:'child',   SON_OF:'son',       DAUGHTER_OF:'daughter',
  MARRIED_TO:'married', CORE_COUPLE:'partner',
  SIBLING_OF:'sibling', BROTHER_OF:'brother', SISTER_OF:'sister',
  COUSIN_OF:'cousin',   HALF_SIBLING:'half-sibling',
  STEP_PARENT:'step-parent', STEP_CHILD:'step-child',
  ADOPTIVE_PARENT:'adoptive', ADOPTED_BY:'adopted',
  GODPARENT_OF:'godparent',  GODCHILD_OF:'godchild',
};

function parseGenNum(genStr) {
  if (!genStr) return 0;
  const m = genStr.match(/^G([+-]?\d+)$/i);
  return m ? parseInt(m[1], 10) : 0;
}

function safeId(id) {
  return (id || '').replace(/[^a-zA-Z0-9_]/g, '_');
}

function safeLabel(text) {
  return (text || '').replace(/"/g, "'").replace(/\n/g, ' ');
}

function genSubgraphId(n) {
  return n < 0 ? `GEN_N${Math.abs(n)}` : `GEN_P${n}`;
}

function genLabel(n) {
  return GEN_LABELS[n] ?? `GEN ${n >= 0 ? '+' : ''}${n}`;
}

function generateMermaid(model) {
  const { nodes, relations } = model;

  if (!nodes || nodes.length === 0) {
    return 'graph TB\n  empty["No persons defined yet"]';
  }

  // Quick lookup: id → node (for gender)
  const nodeMap = {};
  for (const n of nodes) nodeMap[n.id] = n;

  // Group by generation number
  const groups = new Map();
  for (const node of nodes) {
    const g = parseGenNum(node.generation);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(node);
  }

  // Ancestors on top → sort descending
  const sortedGens = [...groups.keys()].sort((a, b) => b - a);

  // Build parent→children map
  const parentToChildren = new Map();
  for (const rel of relations) {
    if (['FATHER_OF', 'MOTHER_OF', 'PARENT_OF'].includes(rel.type)) {
      if (!parentToChildren.has(rel.from)) parentToChildren.set(rel.from, new Set());
      parentToChildren.get(rel.from).add(rel.to);
    }
  }

  // Detect couples with shared children → create CP junction nodes
  const cpNodes   = new Map();           // cpKey → { id, spouseA, spouseB, children, edgeType, gen }
  const handledParentEdges = new Set();  // "from→to" already routed via CP
  const handledCoupleKeys  = new Set();  // sorted cpKey strings

  for (const rel of relations) {
    if (!['MARRIED_TO', 'CORE_COUPLE'].includes(rel.type)) continue;
    const aId   = safeId(rel.from);
    const bId   = safeId(rel.to);
    const cpKey = [aId, bId].sort().join('_');
    if (cpNodes.has(cpKey)) continue;

    const aChildren = parentToChildren.get(rel.from) || new Set();
    const bChildren = parentToChildren.get(rel.to)   || new Set();
    const shared    = [...aChildren].filter(c => bChildren.has(c));

    if (shared.length > 0) {
      const spouseAGen = parseGenNum((nodeMap[rel.from] || {}).generation);
      cpNodes.set(cpKey, {
        id: 'CP_' + cpKey,
        spouseA: rel.from, spouseB: rel.to,
        children: new Set(shared),
        edgeType: rel.type,
        gen: spouseAGen,
      });
      handledCoupleKeys.add(cpKey);
      for (const c of shared) {
        handledParentEdges.add(rel.from + '→' + c);
        handledParentEdges.add(rel.to   + '→' + c);
      }
    }
  }

  // Build a lookup: generation → CP nodes that belong there
  const cpByGen = new Map();
  for (const cp of cpNodes.values()) {
    if (!cpByGen.has(cp.gen)) cpByGen.set(cp.gen, []);
    cpByGen.get(cp.gen).push(cp);
  }

  let out = 'graph TB\n';

  // Subgraph blocks — CP nodes placed inside their parent generation
  for (const g of sortedGens) {
    const sgId     = genSubgraphId(g);
    const sgLabel  = safeLabel(genLabel(g));
    const genNodes = groups.get(g);
    out += `\n  subgraph ${sgId}["${sgLabel}"]\n`;
    for (const node of genNodes) {
      const nid    = safeId(node.id);
      const name   = safeLabel(node.name || node.id);
      const age    = node.age > 0 ? `, ${node.age}` : '';
      const gender = node.gender ? ` (${node.gender})` : '';
      out += `    ${nid}["${name}${age}${gender}"]\n`;
    }
    // Emit CP junction nodes inside their generation's subgraph
    for (const cp of (cpByGen.get(g) || [])) {
      out += `    ${cp.id}(( ))\n`;
    }
    out += '  end\n';
  }

  out += '\n';

  // Emit couple→CP edges (labeled by gender role) and CP→children edges
  for (const cp of cpNodes.values()) {
    const aNode   = nodeMap[cp.spouseA] || {};
    const bNode   = nodeMap[cp.spouseB] || {};
    const aGender = (aNode.gender || '').toUpperCase();
    const bGender = (bNode.gender || '').toUpperCase();
    const aLabel  = aGender === 'M' ? 'father' : aGender === 'F' ? 'mother' : 'married';
    const bLabel  = bGender === 'M' ? 'father' : bGender === 'F' ? 'mother' : 'married';
    const aId     = safeId(cp.spouseA);
    const bId     = safeId(cp.spouseB);
    const edgeSym = cp.edgeType === 'CORE_COUPLE' ? '==>' : '---';

    out += `  ${aId} ${edgeSym}|"${aLabel}"| ${cp.id}\n`;
    out += `  ${bId} ${edgeSym}|"${bLabel}"| ${cp.id}\n`;
    for (const child of cp.children) {
      const cNode   = nodeMap[child] || {};
      const cGender = (cNode.gender || '').toUpperCase();
      const cLabel  = cGender === 'M' ? 'son' : cGender === 'F' ? 'daughter' : 'child';
      out += `  ${cp.id} -->|"${cLabel}"| ${safeId(child)}\n`;
    }
  }

  // Emit all remaining relations not handled via CP
  for (const rel of relations) {
    const fid = safeId(rel.from);
    const tid = safeId(rel.to);

    if (['FATHER_OF', 'MOTHER_OF', 'PARENT_OF'].includes(rel.type)) {
      if (handledParentEdges.has(rel.from + '→' + rel.to)) continue;
    }
    if (['MARRIED_TO', 'CORE_COUPLE'].includes(rel.type)) {
      const k = [fid, tid].sort().join('_');
      if (handledCoupleKeys.has(k)) continue;
    }

    const edge  = EDGE_MAP[rel.type] ?? '-.->';
    const label = REL_LABELS[rel.type] ?? rel.type.toLowerCase().replace(/_/g, ' ');
    out += `  ${fid} ${edge}|"${label}"| ${tid}\n`;
  }

  // Detect main character: G0 node with most incoming parent edges
  const g0Nodes = (groups.get(0) || []).map(n => safeId(n.id));
  let mainId = null;
  if (g0Nodes.length === 1) {
    mainId = g0Nodes[0];
  } else if (g0Nodes.length > 1) {
    const cnt = {};
    for (const rel of relations) {
      if (['FATHER_OF','MOTHER_OF','PARENT_OF'].includes(rel.type)) {
        const t = safeId(rel.to);
        if (g0Nodes.includes(t)) cnt[t] = (cnt[t] || 0) + 1;
      }
    }
    mainId = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || g0Nodes[0];
  }

  const allIds     = nodes.map(n => safeId(n.id));
  const coupleIds  = [...cpNodes.values()].map(cp => cp.id);
  const regularIds = mainId ? allIds.filter(id => id !== mainId) : allIds;

  out += '\n  classDef personNode fill:#fff,color:#1a1a1a,stroke:#555,stroke-width:1.5px\n';
  out += '  classDef mainChar fill:#dbeafe,color:#1a3a5c,stroke:#2563eb,stroke-width:2.5px\n';
  out += '  classDef coupleNode fill:#555,stroke:#444,stroke-width:1.5px\n';
  if (regularIds.length > 0) out += `  class ${regularIds.join(',')} personNode\n`;
  if (mainId)                 out += `  class ${mainId} mainChar\n`;
  if (coupleIds.length > 0)   out += `  class ${coupleIds.join(',')} coupleNode\n`;

  return out;
}
