function parseGenNum(genStr) {
  if (!genStr) return NaN;
  const m = genStr.match(/^G([+-]?\d+)$/i);
  return m ? parseInt(m[1], 10) : NaN;
}

const PARENT_TYPES  = new Set(['PARENT_OF', 'FATHER_OF', 'MOTHER_OF']);
const CHILD_TYPES   = new Set(['CHILD_OF', 'SON_OF', 'DAUGHTER_OF']);
const MARRIAGE_TYPES = new Set(['MARRIED_TO', 'CORE_COUPLE']);

function validateFamScript(model) {
  const errors = [];
  const { nodes, relations } = model;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Duplicate ID
  const seen = new Set();
  for (const node of nodes) {
    if (seen.has(node.id)) {
      errors.push({ type: 'error', message: `Duplicate node ID: "${node.id}"` });
    }
    seen.add(node.id);
  }

  // Required fields
  for (const node of nodes) {
    if (!node.name)       errors.push({ type: 'warning', message: `${node.id}: missing NAME` });
    if (!node.gender)     errors.push({ type: 'warning', message: `${node.id}: missing GENDER` });
    if (!node.generation) errors.push({ type: 'warning', message: `${node.id}: missing GEN` });
  }

  // Relation rules
  for (const rel of relations) {
    const A = nodeMap.get(rel.from);
    const B = nodeMap.get(rel.to);

    if (!A) { errors.push({ type: 'error', message: `Unknown ID in RELATION: "${rel.from}"` }); continue; }
    if (!B) { errors.push({ type: 'error', message: `Unknown ID in RELATION: "${rel.to}"` });  continue; }

    const genA = parseGenNum(A.generation);
    const genB = parseGenNum(B.generation);

    if (PARENT_TYPES.has(rel.type)) {
      // Generation: parent must be exactly 1 higher than child
      if (!isNaN(genA) && !isNaN(genB) && genA !== genB + 1) {
        errors.push({ type: 'warning', message: `Generation mismatch: ${A.id} (${A.generation}) PARENT_OF ${B.id} (${B.generation}) — parent should be 1 gen above child` });
      }
      // Age: parent >= child + 15
      if (A.age !== null && B.age !== null && A.age < B.age + 15) {
        errors.push({ type: 'error', message: `Age rule: ${A.id} (age ${A.age}) must be ≥ ${B.id} (age ${B.age}) + 15` });
      }
      // Gender
      if (rel.type === 'FATHER_OF' && A.gender && A.gender !== 'M') {
        errors.push({ type: 'error', message: `Gender rule: ${A.id} declared FATHER_OF but GENDER is not M` });
      }
      if (rel.type === 'MOTHER_OF' && A.gender && A.gender !== 'F') {
        errors.push({ type: 'error', message: `Gender rule: ${A.id} declared MOTHER_OF but GENDER is not F` });
      }
    }

    if (CHILD_TYPES.has(rel.type)) {
      // A is child, B is parent → A gen = B gen - 1
      if (!isNaN(genA) && !isNaN(genB) && genA !== genB - 1) {
        errors.push({ type: 'warning', message: `Generation mismatch: ${A.id} (${A.generation}) CHILD_OF ${B.id} (${B.generation})` });
      }
      if (A.age !== null && B.age !== null && B.age < A.age + 15) {
        errors.push({ type: 'error', message: `Age rule: ${B.id} (age ${B.age}) parent of ${A.id} (age ${A.age}) must be ≥ child age + 15` });
      }
    }

    if (MARRIAGE_TYPES.has(rel.type)) {
      if (!isNaN(genA) && !isNaN(genB) && genA !== genB) {
        errors.push({ type: 'warning', message: `Marriage rule: ${A.id} (${A.generation}) and ${B.id} (${B.generation}) are in different generations` });
      }
    }
  }

  // Circular ancestry
  errors.push(...detectCircular(nodes, relations));

  return errors;
}

function detectCircular(nodes, relations) {
  const errors = [];
  const children = new Map(nodes.map(n => [n.id, []]));

  for (const rel of relations) {
    if (PARENT_TYPES.has(rel.type) && children.has(rel.from)) {
      children.get(rel.from).push(rel.to);
    }
    if (CHILD_TYPES.has(rel.type) && children.has(rel.to)) {
      children.get(rel.to).push(rel.from);
    }
  }

  const visited = new Set();
  const inStack = new Set();
  const reported = new Set();

  function dfs(id) {
    if (inStack.has(id) && !reported.has(id)) {
      reported.add(id);
      errors.push({ type: 'error', message: `Circular ancestry detected involving: "${id}"` });
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    inStack.add(id);
    for (const child of (children.get(id) || [])) dfs(child);
    inStack.delete(id);
  }

  for (const node of nodes) dfs(node.id);
  return errors;
}
