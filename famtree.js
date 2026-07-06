/* famtree.js — custom genealogy renderer for FamScript.
   Takes the same Mermaid-style `graph TB` script the editor already uses
   (person nodes ID["Label"], couple dots CP_X(( )), edges with role labels)
   and renders a classic family-tree chart instead of a Dagre flowchart:
   spouses sit side by side joined through a ring connector, generations
   line up on horizontal rows, and children hang from their parents' ring
   via orthogonal elbow lines. Returns an SVG string, or null when the
   input doesn't look like a family graph (caller falls back to Mermaid). */
(function (global) {
  'use strict';

  /* ── geometry constants ── */
  const CARD_H     = 50;    // person card height
  const EGO_H      = 60;    // highlighted (G0) card height
  const SPOUSE_GAP = 46;    // gap between spouse cards (ring lives here)
  const BLOCK_GAP  = 52;    // min gap between unrelated blocks on a row
  const RANK_GAP   = 110;   // vertical gap between generation rows
  const MARGIN     = 70;    // outer canvas margin

  /* ── palette (parchment / heritage style) ── */
  const C = {
    card:     '#FDFBF4',
    cardLine: '#E0D5BE',
    name:     '#3E382C',
    sub:      '#A5977C',
    egoCard:  '#1E4736',
    egoLine:  '#C9A24B',
    egoName:  '#F5EFDD',
    egoSub:   '#D8BF83',
    male:     '#2F5847',
    female:   '#A3573C',
    neutral:  '#857657',
    line:     '#D3C3A2',
    gold:     '#C9A24B',
  };

  const MALE_WORDS   = /\b(father|husband|son|brother|groom|grandfather|dada|nana|uncle|chacha|mama|nephew|boy|owner)\b/i;
  const FEMALE_WORDS = /\b(mother|wife|daughter|sister|bride|grandmother|dadi|nani|aunt|chachi|mami|niece|girl)\b/i;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ═══════════ 1. PARSE ═══════════ */
  function parse(code) {
    const persons = new Map();   // id -> { id, label, order }
    const cpIds   = new Set();
    const edges   = [];          // { from, to, label, arrow, dashed }
    let order = 0;

    const NODE_RE = /^(\w+)\s*\[\s*"([^"]*)"\s*\]\s*$/;
    const CP_RE   = /^(\w+)\s*\(\(\s*\)?\s*\)\s*\)?\s*$/;
    const EDGE_RE = /^(\w+)\s*(-\.+->|-->|---|==>|===)\s*(?:\|\s*"?([^|]*?)"?\s*\|\s*)?(\w+)\s*$/;

    for (const raw of String(code || '').split('\n')) {
      const t = raw.trim();
      if (!t || t.startsWith('%%') || t.startsWith('//')) continue;
      if (/^(graph|flowchart|classDef|class |style |linkStyle|subgraph|end\b|direction)/i.test(t)) continue;

      let m;
      if ((m = t.match(CP_RE)))   { cpIds.add(m[1]); continue; }
      if ((m = t.match(NODE_RE))) {
        if (!persons.has(m[1])) persons.set(m[1], { id: m[1], label: m[2].trim(), order: order++ });
        continue;
      }
      if ((m = t.match(EDGE_RE))) {
        edges.push({ from: m[1], to: m[4], label: (m[3] || '').trim(),
                     arrow: m[2].includes('>'), dashed: m[2].includes('.') });
      }
    }

    // implicit nodes referenced only in edges
    for (const e of edges) {
      for (const id of [e.from, e.to]) {
        if (cpIds.has(id) || persons.has(id)) continue;
        if (/^CP_/i.test(id)) cpIds.add(id);
        else persons.set(id, { id, label: id.replace(/_/g, ' '), order: order++ });
      }
    }

    if (persons.size < 2 || edges.length === 0) return null;

    /* unions: every couple dot is one; person→person edges become pseudo-unions */
    const unions = new Map();    // uid -> { id, partners:[], children:[{id,dashed}] }
    const getUnion = uid => {
      if (!unions.has(uid)) unions.set(uid, { id: uid, partners: [], children: [] });
      return unions.get(uid);
    };
    const partnerRole = new Map(); // personId -> role text ("father"…)
    const childRole   = new Map();

    for (const e of edges) {
      const fromCp = cpIds.has(e.from), toCp = cpIds.has(e.to);
      if (!fromCp && toCp) {
        const u = getUnion(e.to);
        if (!u.partners.includes(e.from)) u.partners.push(e.from);
        if (e.label && !partnerRole.has(e.from)) partnerRole.set(e.from, e.label);
      } else if (fromCp && !toCp) {
        const u = getUnion(e.from);
        if (!u.children.some(c => c.id === e.to)) u.children.push({ id: e.to, dashed: e.dashed });
        if (e.label && !childRole.has(e.to)) childRole.set(e.to, e.label);
      } else if (!fromCp && !toCp) {
        if (e.arrow) {
          // direct parent → child
          const u = getUnion('U_' + e.from);
          if (!u.partners.includes(e.from)) u.partners.push(e.from);
          if (!u.children.some(c => c.id === e.to)) u.children.push({ id: e.to, dashed: e.dashed });
          if (e.label && !childRole.has(e.to)) childRole.set(e.to, e.label);
        } else {
          // direct spouse line
          const u = getUnion('U_' + e.from + '_' + e.to);
          for (const id of [e.from, e.to]) if (!u.partners.includes(id)) u.partners.push(id);
        }
      }
      // cp→cp: ignored
    }

    // prune unions that reference no known persons
    for (const [uid, u] of unions) {
      u.partners = u.partners.filter(id => persons.has(id));
      u.children = u.children.filter(c => persons.has(c.id));
      if (u.partners.length === 0 && u.children.length === 0) unions.delete(uid);
    }
    if (unions.size === 0) return null;

    return { persons, unions, partnerRole, childRole };
  }

  /* ═══════════ 2. RANK (generation rows) ═══════════ */
  function assignRanks(model) {
    const { persons, unions } = model;
    const rank = new Map();
    const asPartner = new Map(), asChild = new Map();
    for (const u of unions.values()) {
      for (const p of u.partners) (asPartner.get(p) || asPartner.set(p, []).get(p)).push(u);
      for (const c of u.children) (asChild.get(c.id) || asChild.set(c.id, []).get(c.id)).push(u);
    }

    for (const seed of persons.keys()) {
      if (rank.has(seed)) continue;
      rank.set(seed, 0);
      const q = [seed];
      while (q.length) {
        const p = q.shift();
        const r = rank.get(p);
        for (const u of asPartner.get(p) || []) {
          for (const sp of u.partners) if (!rank.has(sp)) { rank.set(sp, r); q.push(sp); }
          for (const ch of u.children) if (!rank.has(ch.id)) { rank.set(ch.id, r + 1); q.push(ch.id); }
        }
        for (const u of asChild.get(p) || []) {
          for (const par of u.partners) if (!rank.has(par)) { rank.set(par, r - 1); q.push(par); }
          for (const sib of u.children) if (!rank.has(sib.id)) { rank.set(sib.id, r); q.push(sib.id); }
        }
      }
    }

    const min = Math.min(...rank.values());
    for (const [k, v] of rank) rank.set(k, v - min);
    model.rank = rank;
    model.asPartner = asPartner;
    model.asChild = asChild;
  }

  /* ═══════════ 3. PERSON STYLING METADATA ═══════════ */
  function isEgo(id) { return /^[^_]+_G0_\d+$/i.test(id); }

  function decorate(model) {
    const { persons, partnerRole, childRole } = model;
    for (const p of persons.values()) {
      // "Name, 32 (M)" → name / meta / gender
      let name = p.label, meta = '', gender = '';
      const gm = p.label.match(/\(\s*([MF])\s*\)/i);
      if (gm) gender = gm[1].toUpperCase();
      const cm = p.label.match(/^([^,]+),\s*(.+?)\s*(?:\(\s*[MF]\s*\))?\s*$/i);
      if (cm) { name = cm[1].trim(); meta = cm[2].trim(); }
      else name = p.label.replace(/\(\s*[MF]\s*\)/i, '').trim();

      const role = partnerRole.get(p.id) || childRole.get(p.id) || '';
      if (!gender) {
        const hint = role + ' ' + p.label;
        if (MALE_WORDS.test(hint) && !FEMALE_WORDS.test(hint)) gender = 'M';
        else if (FEMALE_WORDS.test(hint)) gender = 'F';
      }

      p.name   = name;
      p.ego    = isEgo(p.id);
      p.gender = gender;
      p.sub    = (p.ego && /^GROOM_/i.test(p.id)) ? 'The Groom'
               : (p.ego && /^BRIDE_/i.test(p.id)) ? 'The Bride'
               : (role || meta || '');
      p.initials = name.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
      p.h = p.ego ? EGO_H : CARD_H;
    }

    // uniform card width from the longest name so rows read as a tidy grid
    let maxLen = 0;
    for (const p of persons.values()) maxLen = Math.max(maxLen, p.name.length);
    const w = Math.max(160, Math.min(250, 64 + maxLen * 6.9));
    for (const p of persons.values()) p.w = p.ego ? Math.round(w * 1.08) : w;
  }

  /* ═══════════ 4. LAYOUT ═══════════ */
  function layout(model) {
    const { persons, unions, rank } = model;

    /* group persons per rank */
    const rows = new Map();
    for (const p of persons.values()) {
      const r = rank.get(p.id) ?? 0;
      (rows.get(r) || rows.set(r, []).get(r)).push(p);
    }

    /* blocks: chain spouses that share a union on the same rank */
    const linked = new Map(); // personId -> Set(partnerId)
    for (const u of unions.values()) {
      if (u.partners.length < 2) continue;
      for (let i = 0; i < u.partners.length - 1; i++) {
        const a = u.partners[i], b = u.partners[i + 1];
        if (rank.get(a) !== rank.get(b)) continue;
        (linked.get(a) || linked.set(a, new Set()).get(a)).add(b);
        (linked.get(b) || linked.set(b, new Set()).get(b)).add(a);
      }
    }

    const blocks = [];              // { members:[person], rank, x, w }
    const blockOf = new Map();
    for (const [r, list] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
      list.sort((a, b) => a.order - b.order);
      const seen = new Set();
      for (const p of list) {
        if (seen.has(p.id)) continue;
        // collect the spouse-chain component, keep source order
        const comp = [];
        const stack = [p.id];
        const compSet = new Set();
        while (stack.length) {
          const id = stack.pop();
          if (compSet.has(id)) continue;
          compSet.add(id);
          for (const nb of linked.get(id) || []) {
            if (rank.get(nb) === r && !compSet.has(nb)) stack.push(nb);
          }
        }
        for (const q of list) if (compSet.has(q.id)) { comp.push(q); seen.add(q.id); }
        const b = { members: comp, rank: r, x: 0, w: 0 };
        b.w = comp.reduce((s, m) => s + m.w, 0) + SPOUSE_GAP * (comp.length - 1);
        blocks.push(b);
        for (const m of comp) blockOf.set(m.id, b);
      }
    }

    const memberCx = (b, id) => {
      let x = b.x;
      for (const m of b.members) {
        if (m.id === id) return x + m.w / 2;
        x += m.w + SPOUSE_GAP;
      }
      return b.x + b.w / 2;
    };

    /* union anchor x: midpoint of its partners (ring position) */
    const unionX = u => {
      const xs = u.partners.map(id => blockOf.has(id) ? memberCx(blockOf.get(id), id) : null)
                           .filter(v => v != null);
      if (!xs.length) return null;
      return xs.reduce((s, v) => s + v, 0) / xs.length;
    };

    /* initial packing per rank, in source order */
    const byRank = new Map();
    for (const b of blocks) (byRank.get(b.rank) || byRank.set(b.rank, []).get(b.rank)).push(b);
    for (const list of byRank.values()) {
      let x = 0;
      for (const b of list) { b.x = x; x += b.w + BLOCK_GAP; }
    }

    const resolve = list => {
      for (let i = 1; i < list.length; i++) {
        const min = list[i - 1].x + list[i - 1].w + BLOCK_GAP;
        if (list[i].x < min) list[i].x = min;
      }
      for (let i = list.length - 2; i >= 0; i--) {
        const max = list[i + 1].x - BLOCK_GAP - list[i].w;
        if (list[i].x > max) list[i].x = max;
      }
    };

    /* relaxation: pull blocks toward children below and parent rings above */
    for (let iter = 0; iter < 120; iter++) {
      for (const b of blocks) {
        const anchors = [];
        for (const u of unions.values()) {
          // union owned by this block → pull toward its children's centre
          if (u.partners.length && u.partners.every(id => blockOf.get(id) === b)) {
            const cx = u.children.map(c => blockOf.has(c.id) ? memberCx(blockOf.get(c.id), c.id) : null)
                                 .filter(v => v != null);
            if (cx.length) {
              const target = cx.reduce((s, v) => s + v, 0) / cx.length;
              const own = unionX(u);
              if (own != null) anchors.push(b.x + (target - own));
            }
          }
          // block member is a child of union → pull under the parents' ring
          for (const c of u.children) {
            if (blockOf.get(c.id) !== b) continue;
            const px = unionX(u);
            if (px != null) anchors.push(b.x + (px - memberCx(b, c.id)));
          }
        }
        if (anchors.length) {
          const desired = anchors.reduce((s, v) => s + v, 0) / anchors.length;
          b.x += (desired - b.x) * 0.6;
        }
      }
      for (const list of byRank.values()) resolve(list);
    }

    /* final coordinates */
    let minX = Infinity;
    for (const b of blocks) minX = Math.min(minX, b.x);
    const ranksSorted = [...byRank.keys()].sort((a, b) => a - b);
    const rowY = new Map();
    let y = MARGIN;
    for (const r of ranksSorted) {
      const rowH = Math.max(...byRank.get(r).flatMap(b => b.members.map(m => m.h)));
      rowY.set(r, { y, h: rowH });
      y += rowH + RANK_GAP;
    }

    for (const b of blocks) {
      b.x += MARGIN - minX;
      const row = rowY.get(b.rank);
      let x = b.x;
      for (const m of b.members) {
        m.x = x;
        m.y = row.y + (row.h - m.h) / 2;
        x += m.w + SPOUSE_GAP;
      }
    }

    model.blocks = blocks;
    model.blockOf = blockOf;
    model.rowY = rowY;
    model.width  = Math.max(...blocks.map(b => b.x + b.w)) + MARGIN;
    model.height = y - RANK_GAP + MARGIN;
  }

  /* ═══════════ 5. DRAW ═══════════ */
  function draw(model) {
    const { persons, unions, rank, rowY } = model;
    const cx = p => p.x + p.w / 2;
    const cy = p => p.y + p.h / 2;

    const isGoldUnion = u =>
      u.partners.some(id => persons.get(id)?.ego) ||
      u.children.some(c => persons.get(c.id)?.ego);

    const lines = [];   // connectors under cards
    const rings = [];

    /* marriage lines + rings between adjacent spouses in a block */
    const ringAt = new Map(); // union id -> {x, y} anchor for child drops
    for (const u of unions.values()) {
      const ps = u.partners.map(id => persons.get(id)).filter(Boolean);
      if (ps.length >= 2 && rank.get(ps[0].id) === rank.get(ps[1].id)) {
        const [a, b] = ps.sort((m, n) => m.x - n.x);
        const midY = (cy(a) + cy(b)) / 2;
        const gold = isGoldUnion(u);
        const col  = gold ? C.gold : C.line;
        const sw   = gold ? 2 : 1.5;
        const mx   = (a.x + a.w + b.x) / 2;
        lines.push(`<line x1="${a.x + a.w}" y1="${midY}" x2="${b.x}" y2="${midY}" stroke="${col}" stroke-width="${sw}"/>`);
        const r = gold ? 9 : 6.5;
        rings.push(`<circle cx="${mx}" cy="${midY}" r="${r}" fill="${C.card}" stroke="${col}" stroke-width="${gold ? 2.4 : 1.8}"/>` +
                   `<circle cx="${mx}" cy="${midY}" r="${gold ? 3 : 2.2}" fill="${col}"/>`);
        ringAt.set(u.id, { x: mx, y: midY + r });
      } else if (ps.length === 1) {
        ringAt.set(u.id, { x: cx(ps[0]), y: ps[0].y + ps[0].h });
      } else if (ps.length >= 2) {
        // partners on different rows (unusual) — anchor below the upper one
        const top = ps.reduce((m, p) => (rank.get(p.id) < rank.get(m.id) ? p : m), ps[0]);
        ringAt.set(u.id, { x: cx(top), y: top.y + top.h });
        for (let i = 1; i < ps.length; i++) {
          lines.push(`<line x1="${cx(ps[0])}" y1="${cy(ps[0])}" x2="${cx(ps[i])}" y2="${cy(ps[i])}" stroke="${C.line}" stroke-width="1.5"/>`);
        }
      }
    }

    /* child drops: ring → bus → child top, orthogonal with rounded corners */
    const busIdx = new Map(); // rank -> counter for staggering bus lines
    for (const u of unions.values()) {
      const a = ringAt.get(u.id);
      if (!a || !u.children.length) continue;
      const pr = u.partners.length ? rank.get(u.partners[0]) : null;
      const row = pr != null ? rowY.get(pr) : null;
      const rowBottom = row ? row.y + row.h : a.y;
      const n = (busIdx.get(pr) || 0); busIdx.set(pr, n + 1);
      const busY = rowBottom + RANK_GAP * 0.5 + ((n % 3) - 1) * 12;
      const gold = isGoldUnion(u);

      for (const c of u.children) {
        const ch = persons.get(c.id);
        if (!ch) continue;
        const tx = cx(ch), ty = ch.y;
        const col = (gold && ch.ego) || (gold && u.partners.some(id => persons.get(id)?.ego)) ? C.gold : C.line;
        const sw  = col === C.gold ? 2 : 1.5;
        const dash = c.dashed ? ' stroke-dasharray="5 4"' : '';
        let d;
        if (Math.abs(tx - a.x) < 16) {
          // near-vertical: a full elbow would render as an ugly 2-px jog
          d = `M ${a.x} ${a.y} L ${tx} ${ty}`;
        } else {
          const dir = tx > a.x ? 1 : -1;
          const r = Math.min(8, Math.abs(tx - a.x) / 2);
          d = `M ${a.x} ${a.y} L ${a.x} ${busY - r}` +
              ` Q ${a.x} ${busY} ${a.x + r * dir} ${busY}` +
              ` L ${tx - r * dir} ${busY}` +
              ` Q ${tx} ${busY} ${tx} ${busY + r}` +
              ` L ${tx} ${ty}`;
        }
        lines.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}"${dash}/>`);
      }
    }

    /* person cards */
    const cards = [];
    for (const p of persons.values()) {
      const ego  = p.ego;
      const fill = ego ? C.egoCard : C.card;
      const strk = ego ? C.egoLine : C.cardLine;
      const rx   = p.h / 2 - 3;
      const avR  = ego ? 18 : 15;
      const avX  = p.x + avR + 10;
      const avY  = p.y + p.h / 2;
      const avFill = ego ? C.gold : (p.gender === 'M' ? C.male : p.gender === 'F' ? C.female : C.neutral);
      const txX  = avX + avR + 10;
      const hasSub = !!p.sub;
      const nameY = hasSub ? avY - 3 : avY + 4.5;

      cards.push(
        `<g>` +
        `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}" fill="${fill}" stroke="${strk}" stroke-width="${ego ? 2 : 1.4}"/>` +
        `<circle cx="${avX}" cy="${avY}" r="${avR}" fill="${avFill}"/>` +
        `<text x="${avX}" y="${avY + 3.5}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${ego ? 12 : 10.5}" font-weight="bold" fill="${ego ? C.egoCard : '#F7F2E6'}">${esc(p.initials)}</text>` +
        `<text x="${txX}" y="${nameY}" font-family="Georgia,'Times New Roman',serif" font-size="${ego ? 14 : 12.5}" font-weight="${ego ? 'bold' : 'normal'}" fill="${ego ? C.egoName : C.name}">${esc(p.name)}</text>` +
        (hasSub
          ? `<text x="${txX}" y="${avY + 13}" font-family="Georgia,'Times New Roman',serif" font-size="8" letter-spacing="1.4" fill="${ego ? C.egoSub : C.sub}">${esc(p.sub.toUpperCase())}</text>`
          : '') +
        `</g>`
      );
    }

    // No background rect — the canvas keeps the app's own background,
    // exactly like the Mermaid renderer did.
    const W = Math.round(model.width), H = Math.round(model.height);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Georgia,serif">` +
      lines.join('') + rings.join('') + cards.join('') +
      `</svg>`
    );
  }

  /* ═══════════ PUBLIC API ═══════════ */
  function render(code) {
    const model = parse(code);
    if (!model) return null;
    assignRanks(model);
    decorate(model);
    layout(model);
    return draw(model);
  }

  global.FamTree = { render };
})(typeof window !== 'undefined' ? window : globalThis);
