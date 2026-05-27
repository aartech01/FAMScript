function importJSON(jsonStr) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
  if (!data.nodes || !data.relations) {
    throw new Error('JSON must have "nodes" and "relations" arrays');
  }
  return {
    nodes: data.nodes,
    relations: data.relations,
    projectName: data.projectName || '',
    version: data.version || '1.0',
    settings: data.settings || {}
  };
}

function importMermaid(mermaidStr) {
  const nodes = [];
  const relations = [];
  const nodeSet = new Set();

  const EDGE_PATTERNS = [
    { re: /^(\w+)\s*-->\s*\|?"?([^"|]*)"?\|?\s*(\w+)/, type: 'PARENT_OF' },
    { re: /^(\w+)\s*<--\s*\|?"?([^"|]*)"?\|?\s*(\w+)/, type: 'CHILD_OF' },
    { re: /^(\w+)\s*===>\s*\|?"?([^"|]*)"?\|?\s*(\w+)/, type: 'CORE_COUPLE' },
    { re: /^(\w+)\s*---\s*\|?"?([^"|]*)"?\|?\s*(\w+)/, type: 'MARRIED_TO' },
    { re: /^(\w+)\s*-\.->\s*\|?"?([^"|]*)"?\|?\s*(\w+)/, type: 'STEP_RELATION' },
  ];

  for (const rawLine of mermaidStr.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('graph') || line.startsWith('subgraph') ||
        line === 'end' || line.startsWith('style') || line.startsWith('%') ||
        line.startsWith('classDef') || line.startsWith('class ')) continue;

    // Node with label: ID["label"] or ID("label")
    const nodeMatch = line.match(/^(\w+)\[["'](.+?)["']\]$/) ||
                      line.match(/^(\w+)\(["'](.+?)["']\)$/);
    if (nodeMatch && !line.includes('-->') && !line.includes('---') && !line.includes('==>') && !line.includes('-.-')) {
      const id = nodeMatch[1];
      if (!nodeSet.has(id)) {
        nodeSet.add(id);
        nodes.push({ id, name: nodeMatch[2], age: null, gender: '', generation: '', status: '' });
      }
      continue;
    }

    // Edges
    for (const { re, type } of EDGE_PATTERNS) {
      const m = line.match(re);
      if (m) {
        relations.push({ from: m[1], to: m[3], type });
        // Auto-register unknown nodes
        for (const id of [m[1], m[3]]) {
          if (!nodeSet.has(id)) {
            nodeSet.add(id);
            nodes.push({ id, name: id, age: null, gender: '', generation: '', status: '' });
          }
        }
        break;
      }
    }
  }

  return { nodes, relations };
}
